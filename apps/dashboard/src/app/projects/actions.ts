'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/server';

export type ActionState = {
    error?: string;
    success?: boolean;
};

// Create Project
export async function createProject(
    prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    const supabase = await createAdminClient();

    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const templateId = formData.get('template_id') as string | null;

    if (!name || !slug) {
        return { error: 'Название и slug обязательны' };
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug)) {
        return { error: 'Slug может содержать только строчные буквы, цифры и дефисы' };
    }

    const { data, error } = await supabase
        .from('projects')
        .insert({
            name,
            slug,
            template_id: templateId || null,
            status: 'draft',
        })
        .select()
        .single();

    if (error) {
        if (error.code === '23505') {
            return { error: 'Проект с таким slug уже существует' };
        }
        return { error: error.message };
    }

    revalidatePath('/projects');
    redirect(`/projects/${data.id}`);
}

// Update Project
export async function updateProject(
    projectId: string,
    prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    const supabase = await createAdminClient();

    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const templateId = formData.get('template_id') as string | null;

    if (!name || !slug) {
        return { error: 'Название и slug обязательны' };
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
        return { error: 'Slug может содержать только строчные буквы, цифры и дефисы' };
    }

    const { error } = await supabase
        .from('projects')
        .update({
            name,
            slug,
            template_id: templateId || null,
        })
        .eq('id', projectId);

    if (error) {
        if (error.code === '23505') {
            return { error: 'Проект с таким slug уже существует' };
        }
        return { error: error.message };
    }

    revalidatePath('/projects');
    revalidatePath(`/projects/${projectId}`);
    return { success: true };
}

// Delete Project
export async function deleteProject(projectId: string): Promise<ActionState> {
    const supabase = await createAdminClient();

    const { error } = await supabase.from('projects').delete().eq('id', projectId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/projects');
    redirect('/projects');
}

// Publish Project
export async function publishProject(projectId: string): Promise<ActionState & { deploymentUrl?: string }> {
    const { deployProject } = await import('@/lib/deploy');

    const result = await deployProject(projectId);

    if (!result.success) {
        return { error: result.error || 'Ошибка деплоя' };
    }

    revalidatePath('/projects');
    revalidatePath(`/projects/${projectId}`);
    return { success: true, deploymentUrl: result.projectUrl };
}

// Save Block Content
export async function saveBlockContent(
    projectId: string,
    blockType: string,
    content: Record<string, unknown>,
    pageSlug: string = 'home'
): Promise<ActionState> {
    const supabase = await createAdminClient();

    // Check if content already exists for this block
    const { data: existing } = await supabase
        .from('project_content')
        .select('id')
        .eq('project_id', projectId)
        .eq('block_type', blockType)
        .eq('page_slug', pageSlug)
        .single();

    if (existing) {
        // Update existing content
        const { error } = await supabase
            .from('project_content')
            .update({ content })
            .eq('id', existing.id);

        if (error) {
            return { error: error.message };
        }
    } else {
        // Get the next block order
        const { data: maxOrder } = await supabase
            .from('project_content')
            .select('block_order')
            .eq('project_id', projectId)
            .eq('page_slug', pageSlug)
            .order('block_order', { ascending: false })
            .limit(1)
            .single();

        const nextOrder = (maxOrder?.block_order ?? -1) + 1;

        // Insert new content
        const { error } = await supabase
            .from('project_content')
            .insert({
                project_id: projectId,
                block_type: blockType,
                page_slug: pageSlug,
                block_order: nextOrder,
                content,
            });

        if (error) {
            return { error: error.message };
        }
    }

    revalidatePath(`/projects/${projectId}`);
    return { success: true };
}

// Get Block Content
export async function getBlockContent(
    projectId: string,
    blockType: string,
    pageSlug: string = 'home'
): Promise<{ content: Record<string, unknown> | null; error?: string }> {
    const supabase = await createAdminClient();

    const { data, error } = await supabase
        .from('project_content')
        .select('content')
        .eq('project_id', projectId)
        .eq('block_type', blockType)
        .eq('page_slug', pageSlug)
        .single();

    if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows found (not an error in our case)
        return { content: null, error: error.message };
    }

    return { content: (data?.content as Record<string, unknown>) || null };
}

