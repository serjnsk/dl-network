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

export async function deployProject(projectId: string): Promise<DeployResult> {
  const supabase = await createAdminClient();
  let tempDir: string | null = null;

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

    const cfProjectName = `dl-${project.slug}`;

    // 3. Generate static files to temp directory
    tempDir = join(tmpdir(), `dl-deploy-${projectId}-${Date.now()}`);
    await mkdir(tempDir, { recursive: true });

    const files = generateStaticFiles(project);
    for (const [filename, content] of Object.entries(files)) {
      await writeFile(join(tempDir, filename), content, 'utf-8');
    }

    // 4. Deploy using Wrangler CLI
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    if (!accountId || !apiToken) {
      throw new Error('CLOUDFLARE_ACCOUNT_ID и CLOUDFLARE_API_TOKEN обязательны');
    }

    // Build wrangler command
    const wranglerCmd = `npx wrangler pages deploy "${tempDir}" --project-name="${cfProjectName}" --branch=main`;

    const { stdout, stderr } = await execAsync(wranglerCmd, {
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

function generateStaticFiles(
  project: ProjectWithContent
): Record<string, string> {
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
