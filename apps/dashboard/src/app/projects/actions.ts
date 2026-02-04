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
export async function publishProject(projectId: string): Promise<ActionState> {
    const supabase = await createAdminClient();

    // Update status to building
    const { error: updateError } = await supabase
        .from('projects')
        .update({ status: 'building' })
        .eq('id', projectId);

    if (updateError) {
        return { error: updateError.message };
    }

    // TODO: Trigger Cloudflare Pages deployment
    // For now, just mark as published after a delay simulation

    const { error: publishError } = await supabase
        .from('projects')
        .update({ status: 'published' })
        .eq('id', projectId);

    if (publishError) {
        return { error: publishError.message };
    }

    revalidatePath('/projects');
    revalidatePath(`/projects/${projectId}`);
    return { success: true };
}
