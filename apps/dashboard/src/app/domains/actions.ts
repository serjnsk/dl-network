'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/server';
import { cloudflareClient, setupDnsCname, checkDnsStatus } from '@/lib/cloudflare';

export type ActionState = {
    error?: string;
    success?: boolean;
};

// Create Domain
export async function createDomain(
    prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    const supabase = await createAdminClient();

    const domainName = (formData.get('domain_name') as string)?.toLowerCase().trim();

    if (!domainName) {
        return { error: 'Доменное имя обязательно' };
    }

    // Validate domain format
    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/;
    if (!domainRegex.test(domainName)) {
        return { error: 'Неверный формат домена' };
    }

    const { error } = await supabase
        .from('domains')
        .insert({
            domain_name: domainName,
            dns_status: 'pending',
        });

    if (error) {
        if (error.code === '23505') {
            return { error: 'Домен уже добавлен' };
        }
        return { error: error.message };
    }

    revalidatePath('/domains');
    redirect('/domains');
}

// Delete Domain
export async function deleteDomain(domainId: string): Promise<ActionState> {
    const supabase = await createAdminClient();

    // Check if domain is linked to any projects
    const { count } = await supabase
        .from('project_domains')
        .select('*', { count: 'exact', head: true })
        .eq('domain_id', domainId);

    if (count && count > 0) {
        return { error: `Нельзя удалить: домен привязан к ${count} проектам` };
    }

    const { error } = await supabase
        .from('domains')
        .delete()
        .eq('id', domainId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/domains');
    return { success: true };
}

// Verify DNS Status
export async function verifyDnsStatus(domainId: string): Promise<ActionState> {
    const supabase = await createAdminClient();

    // Get domain and its linked project
    const { data: domain, error: fetchError } = await supabase
        .from('domains')
        .select(`
            *,
            project_domains (
                project_id,
                projects (slug, cf_project_id)
            )
        `)
        .eq('id', domainId)
        .single();

    if (fetchError || !domain) {
        return { error: 'Домен не найден' };
    }

    // Get expected CF Pages URL from linked project
    const projectDomain = domain.project_domains?.[0] as { projects: { slug: string; cf_project_id: string | null } } | undefined;
    const project = projectDomain?.projects;

    if (!project) {
        return { error: 'Домен не привязан к проекту' };
    }

    const cfPagesUrl = `${project.cf_project_id || `dl-${project.slug}`}.pages.dev`;

    // Check actual DNS status via Cloudflare
    const dnsStatus = await checkDnsStatus(domain.domain_name, cfPagesUrl);
    const newStatus = dnsStatus.active ? 'active' : 'pending';

    const { error } = await supabase
        .from('domains')
        .update({ dns_status: newStatus })
        .eq('id', domainId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/domains');
    return { success: true };
}

// Link Domain to Project
export async function linkDomainToProject(
    projectId: string,
    domainId: string,
    isPrimary: boolean = false
): Promise<ActionState> {
    const supabase = await createAdminClient();

    // Get domain and project info for DNS setup
    const [domainResult, projectResult] = await Promise.all([
        supabase.from('domains').select('domain_name').eq('id', domainId).single(),
        supabase.from('projects').select('slug, cf_project_id').eq('id', projectId).single(),
    ]);

    if (domainResult.error || !domainResult.data) {
        return { error: 'Домен не найден' };
    }
    if (projectResult.error || !projectResult.data) {
        return { error: 'Проект не найден' };
    }

    const domainName = domainResult.data.domain_name;
    const project = projectResult.data;
    const cfPagesUrl = `${project.cf_project_id || `dl-${project.slug}`}.pages.dev`;

    // If setting as primary, first unset any existing primary domain for this project
    if (isPrimary) {
        await supabase
            .from('project_domains')
            .update({ is_primary: false })
            .eq('project_id', projectId);
    }

    // Insert project_domain link
    const { error } = await supabase
        .from('project_domains')
        .insert({
            project_id: projectId,
            domain_id: domainId,
            is_primary: isPrimary,
            cf_deployment_url: cfPagesUrl,
        });

    if (error) {
        if (error.code === '23505') {
            return { error: 'Домен уже привязан к этому проекту' };
        }
        return { error: error.message };
    }

    // Try to setup DNS CNAME automatically
    const dnsResult = await setupDnsCname(domainName, cfPagesUrl);

    // Update domain DNS status based on result
    await supabase
        .from('domains')
        .update({
            dns_status: dnsResult.success ? 'active' : 'pending',
        })
        .eq('id', domainId);

    // Also add custom domain to Cloudflare Pages project
    try {
        const cfProjectName = project.cf_project_id || `dl-${project.slug}`;
        await cloudflareClient.addCustomDomain(cfProjectName, domainName);
    } catch {
        // Non-critical: domain will still work if DNS is set up
    }

    revalidatePath(`/projects/${projectId}`);
    revalidatePath('/domains');

    return {
        success: true,
        error: dnsResult.success ? undefined : `DNS настройка: ${dnsResult.error}`
    };
}

// Unlink Domain from Project
export async function unlinkDomainFromProject(
    projectDomainId: string
): Promise<ActionState> {
    const supabase = await createAdminClient();

    // Get project_id before deleting
    const { data: projectDomain } = await supabase
        .from('project_domains')
        .select('project_id')
        .eq('id', projectDomainId)
        .single();

    const { error } = await supabase
        .from('project_domains')
        .delete()
        .eq('id', projectDomainId);

    if (error) {
        return { error: error.message };
    }

    if (projectDomain) {
        revalidatePath(`/projects/${projectDomain.project_id}`);
    }
    revalidatePath('/domains');
    return { success: true };
}

// Set Primary Domain
export async function setPrimaryDomain(
    projectId: string,
    projectDomainId: string
): Promise<ActionState> {
    const supabase = await createAdminClient();

    // First unset all primary flags for this project
    await supabase
        .from('project_domains')
        .update({ is_primary: false })
        .eq('project_id', projectId);

    // Set the new primary
    const { error } = await supabase
        .from('project_domains')
        .update({ is_primary: true })
        .eq('id', projectDomainId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath(`/projects/${projectId}`);
    return { success: true };
}

// Add Custom Domain to Cloudflare Pages
export async function addCustomDomainToCloudflare(
    projectId: string,
    domainName: string
): Promise<ActionState> {
    const supabase = await createAdminClient();

    // Get project's CF project name
    const { data: project, error: fetchError } = await supabase
        .from('projects')
        .select('cf_project_id, slug')
        .eq('id', projectId)
        .single();

    if (fetchError || !project) {
        return { error: 'Проект не найден' };
    }

    const cfProjectName = project.cf_project_id || `dl-${project.slug}`;

    try {
        // Add custom domain via Cloudflare API
        await cloudflareClient.addCustomDomain(cfProjectName, domainName);
        return { success: true };
    } catch (err) {
        return { error: err instanceof Error ? err.message : 'Ошибка Cloudflare API' };
    }
}
