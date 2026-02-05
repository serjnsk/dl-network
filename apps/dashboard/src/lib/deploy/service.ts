import { createAdminClient } from '@/lib/supabase/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, mkdir, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

const execAsync = promisify(exec);

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
  let tempDir: string | null = null;

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

    // 3. Generate static files to temp directory
    tempDir = join(tmpdir(), `dl-deploy-${projectId}-${Date.now()}`);
    await mkdir(tempDir, { recursive: true });

    // Generate files for each page
    await generateStaticFiles(tempDir, project as ProjectWithPages);

    // 4. Deploy using Wrangler CLI
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    if (!accountId || !apiToken) {
      throw new Error('CLOUDFLARE_ACCOUNT_ID и CLOUDFLARE_API_TOKEN обязательны');
    }

    // Build wrangler command with --commit-dirty to allow auto-creation
    const wranglerCmd = `npx wrangler pages project create "${cfProjectName}" --production-branch=main 2>nul || echo "Project exists"`;

    // First, try to create the project (will fail silently if exists)
    try {
      await execAsync(wranglerCmd, {
        env: {
          ...process.env,
          CLOUDFLARE_ACCOUNT_ID: accountId,
          CLOUDFLARE_API_TOKEN: apiToken,
        },
        timeout: 30000,
      });
    } catch {
      // Ignore errors - project might already exist
    }

    // Now deploy
    const deployCmd = `npx wrangler pages deploy "${tempDir}" --project-name="${cfProjectName}" --branch=main --commit-dirty`;

    const { stdout, stderr } = await execAsync(deployCmd, {
      env: {
        ...process.env,
        CLOUDFLARE_ACCOUNT_ID: accountId,
        CLOUDFLARE_API_TOKEN: apiToken,
      },
      timeout: 120000, // 2 minutes timeout
    });

    // Parse deployment URL from output
    let deploymentUrl = '';
    const urlMatch = stdout.match(/https:\/\/[^\s]+\.pages\.dev/);
    if (urlMatch) {
      deploymentUrl = urlMatch[0];
    }

    // Also check for project URL in stderr (wrangler sometimes outputs there)
    if (!deploymentUrl && stderr) {
      const stderrUrlMatch = stderr.match(/https:\/\/[^\s]+\.pages\.dev/);
      if (stderrUrlMatch) {
        deploymentUrl = stderrUrlMatch[0];
      }
    }

    // Default URL if not found in output
    if (!deploymentUrl) {
      deploymentUrl = `https://${cfProjectName}.pages.dev`;
    }

    // 5. Update project status and deployment URL
    await supabase
      .from('projects')
      .update({
        status: 'published',
        cf_project_id: cfProjectName,
      })
      .eq('id', projectId);

    // 6. Add custom domains to Cloudflare Pages project
    const projectDomains = (project as { project_domains?: Array<{ domains?: { domain_name: string } }> }).project_domains;
    if (projectDomains && projectDomains.length > 0) {
      const { getCloudflareClient } = await import('@/lib/cloudflare/client');
      const cfClient = getCloudflareClient();

      for (const pd of projectDomains) {
        if (pd.domains?.domain_name) {
          try {
            await cfClient.addCustomDomain(cfProjectName, pd.domains.domain_name);
            console.log(`Added custom domain: ${pd.domains.domain_name}`);
          } catch (domainError) {
            // Non-critical: log but don't fail deployment
            console.warn(`Failed to add domain ${pd.domains.domain_name}:`, domainError);
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
  } finally {
    // Cleanup temp directory
    if (tempDir) {
      try {
        await rm(tempDir, { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors
      }
    }
  }
}

/**
 * Generate static files for all pages
 * Structure:
 * - index.html (main page, slug = 'index')
 * - about/index.html (other pages)
 * - robots.txt
 */
async function generateStaticFiles(
  tempDir: string,
  project: ProjectWithPages
): Promise<void> {
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
      await writeFile(join(tempDir, 'index.html'), processedHtml, 'utf-8');
    } else {
      // Other pages go to slug/index.html for clean URLs
      const pageDir = join(tempDir, page.slug);
      await mkdir(pageDir, { recursive: true });
      await writeFile(join(pageDir, 'index.html'), processedHtml, 'utf-8');
    }
  }

  // Generate robots.txt
  await writeFile(
    join(tempDir, 'robots.txt'),
    `User-agent: *
Allow: /`,
    'utf-8'
  );
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
      // If no </head>, inject before <body>
      result = result.replace('<body>', `${headCode}\n<body>`);
    }
  }

  // Inject body code
  if (bodyCode) {
    if (result.includes('</body>')) {
      result = result.replace('</body>', `${bodyCode}\n</body>`);
    } else {
      // If no </body>, append at the end
      result = `${result}\n${bodyCode}`;
    }
  }

  return result;
}
