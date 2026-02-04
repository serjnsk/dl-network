'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/server';
import { cloudflareClient } from '@/lib/cloudflare';

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

    // Get domain
    const { data: domain, error: fetchError } = await supabase
        .from('domains')
        .select('*')
        .eq('id', domainId)
        .single();

    if (fetchError || !domain) {
        return { error: 'Домен не найден' };
    }

    // TODO: Implement actual DNS verification via Cloudflare API
    // For now, we'll just mark it as active after first check
    const { error } = await supabase
        .from('domains')
        .update({ dns_status: 'active' })
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

    // If setting as primary, first unset any existing primary domain for this project
    if (isPrimary) {
        await supabase
            .from('project_domains')
            .update({ is_primary: false })
            .eq('project_id', projectId);
    }

    const { error } = await supabase
        .from('project_domains')
        .insert({
            project_id: projectId,
            domain_id: domainId,
            is_primary: isPrimary,
        });

    if (error) {
        if (error.code === '23505') {
            return { error: 'Домен уже привязан к этому проекту' };
        }
        return { error: error.message };
    }

    revalidatePath(`/projects/${projectId}`);
    revalidatePath('/domains');
    return { success: true };
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
