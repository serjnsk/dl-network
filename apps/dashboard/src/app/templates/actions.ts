'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/server';

export type ActionState = {
    error?: string;
    success?: boolean;
};

// Create Template
export async function createTemplate(
    prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    const supabase = await createAdminClient();

    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const description = formData.get('description') as string;
    const previewImage = formData.get('preview_image') as string;
    const isActive = formData.get('is_active') === 'true';

    if (!name || !slug) {
        return { error: 'Название и slug обязательны' };
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
        return { error: 'Slug может содержать только строчные буквы, цифры и дефисы' };
    }

    const { data, error } = await supabase
        .from('templates')
        .insert({
            name,
            slug,
            description: description || null,
            preview_image: previewImage || null,
            is_active: isActive,
        })
        .select()
        .single();

    if (error) {
        if (error.code === '23505') {
            return { error: 'Шаблон с таким slug уже существует' };
        }
        return { error: error.message };
    }

    revalidatePath('/templates');
    redirect(`/templates/${data.id}`);
}

// Update Template
export async function updateTemplate(
    templateId: string,
    prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    const supabase = await createAdminClient();

    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const description = formData.get('description') as string;
    const previewImage = formData.get('preview_image') as string;
    const isActive = formData.get('is_active') === 'true';

    if (!name || !slug) {
        return { error: 'Название и slug обязательны' };
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
        return { error: 'Slug может содержать только строчные буквы, цифры и дефисы' };
    }

    const { error } = await supabase
        .from('templates')
        .update({
            name,
            slug,
            description: description || null,
            preview_image: previewImage || null,
            is_active: isActive,
        })
        .eq('id', templateId);

    if (error) {
        if (error.code === '23505') {
            return { error: 'Шаблон с таким slug уже существует' };
        }
        return { error: error.message };
    }

    revalidatePath('/templates');
    revalidatePath(`/templates/${templateId}`);
    return { success: true };
}

// Delete Template
export async function deleteTemplate(templateId: string): Promise<ActionState> {
    const supabase = await createAdminClient();

    // Check if template is used by any projects
    const { count } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('template_id', templateId);

    if (count && count > 0) {
        return { error: `Нельзя удалить: шаблон используется в ${count} проектах` };
    }

    const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', templateId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/templates');
    redirect('/templates');
}

// Toggle Template Active Status
export async function toggleTemplateActive(
    templateId: string,
    isActive: boolean
): Promise<ActionState> {
    const supabase = await createAdminClient();

    const { error } = await supabase
        .from('templates')
        .update({ is_active: isActive })
        .eq('id', templateId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/templates');
    revalidatePath(`/templates/${templateId}`);
    return { success: true };
}

// Add Block to Template
export async function addTemplateBlock(
    templateId: string,
    blockType: string,
    defaultContent: Record<string, unknown>
): Promise<ActionState> {
    const supabase = await createAdminClient();

    // Get max block_order for this template
    const { data: existingBlocks } = await supabase
        .from('template_blocks')
        .select('block_order')
        .eq('template_id', templateId)
        .order('block_order', { ascending: false })
        .limit(1);

    const maxOrder = existingBlocks?.[0]?.block_order ?? -1;

    const { error } = await supabase.from('template_blocks').insert({
        template_id: templateId,
        block_type: blockType,
        block_order: maxOrder + 1,
        default_content: defaultContent,
    });

    if (error) {
        return { error: error.message };
    }

    revalidatePath(`/templates/${templateId}`);
    return { success: true };
}

// Remove Block from Template
export async function removeTemplateBlock(blockId: string): Promise<ActionState> {
    const supabase = await createAdminClient();

    // Get template_id before deleting
    const { data: block } = await supabase
        .from('template_blocks')
        .select('template_id')
        .eq('id', blockId)
        .single();

    const { error } = await supabase
        .from('template_blocks')
        .delete()
        .eq('id', blockId);

    if (error) {
        return { error: error.message };
    }

    if (block) {
        revalidatePath(`/templates/${block.template_id}`);
    }
    return { success: true };
}

// Reorder Template Blocks
export async function reorderTemplateBlocks(
    templateId: string,
    blockIds: string[]
): Promise<ActionState> {
    const supabase = await createAdminClient();

    // Update each block's order
    const updates = blockIds.map((id, index) =>
        supabase
            .from('template_blocks')
            .update({ block_order: index })
            .eq('id', id)
            .eq('template_id', templateId)
    );

    try {
        await Promise.all(updates);
    } catch (error) {
        return { error: error instanceof Error ? error.message : 'Ошибка сортировки' };
    }

    revalidatePath(`/templates/${templateId}`);
    return { success: true };
}
