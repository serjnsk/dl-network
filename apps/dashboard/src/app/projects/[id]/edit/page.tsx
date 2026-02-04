import { DashboardLayout } from '@/components/layout';
import { createAdminClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { EditForm } from './edit-form';

interface EditProjectPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
    const { id } = await params;
    const supabase = await createAdminClient();

    // Fetch project
    const { data: project, error } = await supabase
        .from('projects')
        .select('id, name, slug, template_id')
        .eq('id', id)
        .single();

    if (error || !project) {
        notFound();
    }

    // Fetch available templates
    const { data: templates } = await supabase
        .from('templates')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('name');

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="mb-8">
                <Link
                    href={`/projects/${id}`}
                    className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Назад к проекту
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Редактировать проект
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {project.name}
                </p>
            </div>

            {/* Form Card */}
            <div className="mx-auto max-w-2xl rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
                <EditForm project={project} templates={templates || []} />
            </div>
        </DashboardLayout>
    );
}
