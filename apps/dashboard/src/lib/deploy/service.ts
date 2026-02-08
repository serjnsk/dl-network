import { createAdminClient } from '@/lib/supabase/server';
import { getCloudflareClient } from '@/lib/cloudflare/client';

export interface DeployResult {
  success: boolean;
  error?: string;
  projectUrl?: string;
}

interface ProjectPage {
  id: string;
  slug: string;
  title: string;
  html_content: string;
  page_order: number;
}

interface ProjectWithPages {
  id: string;
  name: string;
  slug: string;
  global_head_code?: string | null;
  global_body_code?: string | null;
  project_pages?: ProjectPage[];
}

export async function deployProject(projectId: string): Promise<DeployResult> {
  const supabase = await createAdminClient();

  try {
    // 1. Fetch project with pages and domains from database
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select(`
        *,
        project_pages (
          id,
          slug,
          title,
          html_content,
          page_order
        ),
        project_domains (
          id,
          is_active,
          domains (
            id,
            domain_name
          )
        )
      `)
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return { success: false, error: 'Проект не найден' };
    }

    // Check if project has pages
    if (!project.project_pages || project.project_pages.length === 0) {
      return { success: false, error: 'Добавьте хотя бы одну страницу перед публикацией' };
    }

    // 2. Update status to building
    await supabase
      .from('projects')
      .update({ status: 'building' })
      .eq('id', projectId);

    const cfProjectName = `dl-${project.slug}`;
    const cfClient = getCloudflareClient();

    // 3. Generate files in memory (no filesystem needed)
    const files = generateStaticFiles(project as ProjectWithPages);

    // 4. Ensure project exists, create if not
    try {
      await cfClient.getProject(cfProjectName);
    } catch {
      // Project doesn't exist, create it
      await cfClient.createProject({
        name: cfProjectName,
        production_branch: 'main',
      });
    }

    // 5. Deploy using Cloudflare API (direct upload)
    const deployment = await cfClient.createDeployment(cfProjectName, files);

    // Get deployment URL
    const deploymentUrl = deployment.url || `https://${cfProjectName}.pages.dev`;

    // 6. Update project status and deployment URL
    await supabase
      .from('projects')
      .update({
        status: 'published',
        cf_project_id: cfProjectName,
      })
      .eq('id', projectId);

    // 7. Add custom domains to Cloudflare Pages project (only active domains)
    const projectDomains = project.project_domains as Array<{
      is_active?: boolean;
      domains?: { domain_name: string }
    }> | undefined;

    if (projectDomains && projectDomains.length > 0) {
      for (const pd of projectDomains) {
        if (pd.is_active !== false && pd.domains?.domain_name) {
          try {
            await cfClient.addCustomDomain(cfProjectName, pd.domains.domain_name);
          } catch {
            // Non-critical: domain might already be added
          }
        }
      }
    }

    return {
      success: true,
      projectUrl: deploymentUrl,
    };
  } catch (error) {
    // Update status to failed
    await supabase
      .from('projects')
      .update({ status: 'failed' })
      .eq('id', projectId);

    const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
    console.error('Deploy error:', error);

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Generate static files in memory
 * Returns: Record<path, content>
 */
function generateStaticFiles(project: ProjectWithPages): Record<string, string> {
  const files: Record<string, string> = {};
  const pages = project.project_pages || [];
  const globalHeadCode = project.global_head_code || '';
  const globalBodyCode = project.global_body_code || '';

  // Sort pages by order
  pages.sort((a, b) => a.page_order - b.page_order);

  for (const page of pages) {
    const processedHtml = injectGlobalCode(
      page.html_content,
      globalHeadCode,
      globalBodyCode
    );

    if (page.slug === 'index') {
      // Main page goes to root
      files['index.html'] = processedHtml;
    } else {
      // Other pages go to slug/index.html for clean URLs
      files[`${page.slug}/index.html`] = processedHtml;
    }
  }

  // Generate robots.txt
  files['robots.txt'] = `User-agent: *
Allow: /`;

  return files;
}

/**
 * Inject global code into HTML
 * - head code before </head>
 * - body code before </body>
 */
function injectGlobalCode(
  html: string,
  headCode: string,
  bodyCode: string
): string {
  let result = html;

  // Inject head code
  if (headCode) {
    if (result.includes('</head>')) {
      result = result.replace('</head>', `${headCode}\n</head>`);
    } else if (result.includes('<body>')) {
      result = result.replace('<body>', `${headCode}\n<body>`);
    }
  }

  // Inject body code
  if (bodyCode) {
    if (result.includes('</body>')) {
      result = result.replace('</body>', `${bodyCode}\n</body>`);
    } else {
      result = `${result}\n${bodyCode}`;
    }
  }

  return result;
}
