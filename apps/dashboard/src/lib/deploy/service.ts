import { getCloudflareClient } from '@/lib/cloudflare';
import { createAdminClient } from '@/lib/supabase/server';
import type { CloudflarePagesProject, CloudflareDeployment } from '@/lib/cloudflare/types';

export interface DeployResult {
    success: boolean;
    error?: string;
    deployment?: CloudflareDeployment;
    projectUrl?: string;
}

export async function deployProject(projectId: string): Promise<DeployResult> {
    const supabase = await createAdminClient();
    const cf = getCloudflareClient();

    try {
        // 1. Fetch project from database
        const { data: project, error: projectError } = await supabase
            .from('projects')
            .select(`
        *,
        templates (id, name, slug),
        project_content (page_slug, block_type, block_order, content)
      `)
            .eq('id', projectId)
            .single();

        if (projectError || !project) {
            return { success: false, error: 'Проект не найден' };
        }

        // 2. Update status to building
        await supabase
            .from('projects')
            .update({ status: 'building' })
            .eq('id', projectId);

        // 3. Check if CF project exists, create if not
        let cfProject: CloudflarePagesProject;
        const cfProjectName = `dl-${project.slug}`;

        try {
            cfProject = await cf.getProject(cfProjectName);
        } catch {
            // Project doesn't exist, create it
            cfProject = await cf.createProject({
                name: cfProjectName,
                production_branch: 'main',
            });

            // Save CF project ID to database
            await supabase
                .from('projects')
                .update({ cf_project_id: cfProject.id })
                .eq('id', projectId);
        }

        // 4. Generate static HTML files
        const files = await generateStaticFiles(project);

        // 5. Deploy to Cloudflare Pages
        const deployment = await cf.createDeployment(cfProjectName, files);

        // 6. Update project status and deployment URL
        await supabase
            .from('projects')
            .update({
                status: 'published',
                cf_project_id: cfProject.id,
            })
            .eq('id', projectId);

        // Update project_domains with deployment URL if exists
        const { data: projectDomains } = await supabase
            .from('project_domains')
            .select('id')
            .eq('project_id', projectId)
            .eq('is_primary', true)
            .single();

        if (projectDomains) {
            await supabase
                .from('project_domains')
                .update({ cf_deployment_url: deployment.url })
                .eq('id', projectDomains.id);
        }

        return {
            success: true,
            deployment,
            projectUrl: deployment.url,
        };
    } catch (error) {
        // Update status to failed
        await supabase
            .from('projects')
            .update({ status: 'failed' })
            .eq('id', projectId);

        return {
            success: false,
            error: error instanceof Error ? error.message : 'Неизвестная ошибка',
        };
    }
}

interface ProjectWithContent {
    id: string;
    name: string;
    slug: string;
    templates?: { name: string; slug: string } | null;
    project_content?: Array<{
        page_slug: string;
        block_type: string;
        block_order: number;
        content: Record<string, unknown>;
    }>;
}

async function generateStaticFiles(
    project: ProjectWithContent
): Promise<Record<string, string>> {
    const files: Record<string, string> = {};

    // Generate index.html
    files['index.html'] = generateIndexHtml(project);

    // Generate robots.txt
    files['robots.txt'] = `User-agent: *
Allow: /`;

    // Generate simple CSS
    files['styles.css'] = generateCss();

    return files;
}

function generateIndexHtml(project: ProjectWithContent): string {
    const content = project.project_content || [];
    const sortedContent = [...content].sort((a, b) => a.block_order - b.block_order);

    let blocksHtml = '';

    for (const block of sortedContent) {
        blocksHtml += renderBlock(block);
    }

    // If no content, show placeholder
    if (!blocksHtml) {
        blocksHtml = `
      <section class="hero">
        <h1>${project.name}</h1>
        <p>Добро пожаловать на наш сайт</p>
      </section>
    `;
    }

    return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project.name}</title>
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  ${blocksHtml}
</body>
</html>`;
}

function renderBlock(block: {
    block_type: string;
    content: Record<string, unknown>;
}): string {
    const { block_type, content } = block;

    switch (block_type) {
        case 'hero':
            return `
        <section class="hero">
          <h1>${content.title || 'Заголовок'}</h1>
          <p>${content.subtitle || ''}</p>
          ${content.button_text ? `<a href="${content.button_url || '#'}" class="btn">${content.button_text}</a>` : ''}
        </section>
      `;

        case 'features':
            const items = (content.items as Array<{ title: string; description: string; icon: string }>) || [];
            return `
        <section class="features">
          <h2>${content.title || 'Особенности'}</h2>
          <div class="features-grid">
            ${items.map(
                (item) => `
                <div class="feature-card">
                  <div class="feature-icon">${item.icon || '⭐'}</div>
                  <h3>${item.title || ''}</h3>
                  <p>${item.description || ''}</p>
                </div>
              `
            ).join('')}
          </div>
        </section>
      `;

        case 'cta':
            return `
        <section class="cta">
          <h2>${content.title || ''}</h2>
          <p>${content.description || ''}</p>
          ${content.button_text ? `<a href="${content.button_url || '#'}" class="btn btn-primary">${content.button_text}</a>` : ''}
        </section>
      `;

        case 'footer':
            return `
        <footer class="footer">
          <p>${content.copyright || `© ${new Date().getFullYear()}`}</p>
        </footer>
      `;

        default:
            return '';
    }
}

function generateCss(): string {
    return `
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #333;
}

.hero {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 4rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.hero p {
  font-size: 1.25rem;
  opacity: 0.9;
  max-width: 600px;
}

.btn {
  display: inline-block;
  margin-top: 2rem;
  padding: 1rem 2rem;
  background: white;
  color: #667eea;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: transform 0.2s;
}

.btn:hover {
  transform: translateY(-2px);
}

.btn-primary {
  background: #667eea;
  color: white;
}

.features {
  padding: 4rem 2rem;
  text-align: center;
}

.features h2 {
  font-size: 2rem;
  margin-bottom: 3rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  padding: 2rem;
  border-radius: 12px;
  background: #f8f9fa;
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  margin-bottom: 0.5rem;
}

.cta {
  padding: 4rem 2rem;
  text-align: center;
  background: #f8f9fa;
}

.cta h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.footer {
  padding: 2rem;
  text-align: center;
  background: #1a1a1a;
  color: #888;
}
`;
}
