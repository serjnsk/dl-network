import { DashboardLayout } from '@/components/layout';
import { createAdminClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { EditForm } from './edit-form';

interface EditPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditTemplatePage({ params }: EditPageProps) {
    const { id } = await params;
    const supabase = await createAdminClient();

    const { data: template, error } = await supabase
        .from('templates')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !template) {
        notFound();
    }

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="mb-8">
                <Link
                    href={`/templates/${template.id}`}
                    className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Назад к шаблону
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Редактирование: {template.name}
                </h1>
            </div>

            {/* Form */}
            <div className="mx-auto max-w-2xl rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
                <EditForm template={template} />
            </div>
        </DashboardLayout>
    );
}
