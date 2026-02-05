'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/server';

export type ActionState = {
    error?: string;
    success?: boolean;
};

// Create Design File
export async function createDesignFile(
    prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    const supabase = await createAdminClient();

    const name = formData.get('name') as string;
    const cssContent = formData.get('css_content') as string;

    if (!name) {
        return { error: 'Название обязательно' };
    }

    if (!cssContent) {
        return { error: 'CSS контент обязателен' };
    }

    // Parse CSS variables from content
    const variables = parseCssVariables(cssContent);

    // Store CSS as a data URL for now (in production would upload to storage)
    const cssUrl = `data:text/css;base64,${Buffer.from(cssContent).toString('base64')}`;

    const { error } = await supabase.from('design_files').insert({
        name,
        css_url: cssUrl,
        variables,
    });

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/designs');
    redirect('/designs');
}

// Parse CSS variables from CSS content
function parseCssVariables(css: string): Record<string, string> {
    const variables: Record<string, string> = {};

    // Match CSS custom properties
    const regex = /--([\w-]+)\s*:\s*([^;]+)/g;
    let match;

    while ((match = regex.exec(css)) !== null) {
        const name = match[1].trim();
        const value = match[2].trim();
        variables[name] = value;
    }

    return variables;
}

// Delete Design File
export async function deleteDesignFile(id: string): Promise<ActionState> {
    const supabase = await createAdminClient();

    const { error } = await supabase.from('design_files').delete().eq('id', id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/designs');
    return { success: true };
}

// Attach Design to Template
export async function attachDesignToTemplate(
    templateId: string,
    designFileId: string | null
): Promise<ActionState> {
    const supabase = await createAdminClient();

    const { error } = await supabase
        .from('templates')
        .update({ design_file_id: designFileId })
        .eq('id', templateId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/templates');
    revalidatePath(`/templates/${templateId}`);
    return { success: true };
}
