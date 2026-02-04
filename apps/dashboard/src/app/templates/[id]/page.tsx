import { DashboardLayout } from '@/components/layout';
import { createAdminClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Pencil, Check, X, LayoutTemplate, Boxes } from 'lucide-react';
import { DeleteButton, ToggleActiveButton } from './buttons';
import { BlockList } from './block-list';

interface TemplatePageProps {
    params: Promise<{ id: string }>;
}

export default async function TemplatePage({ params }: TemplatePageProps) {
    const { id } = await params;
    const supabase = await createAdminClient();

    const { data: template, error } = await supabase
        .from('templates')
        .select(`
      *,
      template_blocks (
        id,
        block_type,
        block_order,
        default_content
      ),
      projects (id, name, slug)
    `)
        .eq('id', id)
        .single();

    if (error || !template) {
        notFound();
    }

    const blocks = template.template_blocks?.sort(
        (a: { block_order: number }, b: { block_order: number }) => a.block_order - b.block_order
    ) || [];

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="mb-8">
                <Link
                    href="/templates"
                    className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Назад к шаблонам
                </Link>

                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {template.name}
                        </h1>
                        {template.is_active ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                                <Check className="h-3 w-3" />
                                Активен
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                                <X className="h-3 w-3" />
                                Неактивен
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <ToggleActiveButton
                            templateId={template.id}
                            isActive={template.is_active}
                        />
                        <Link
                            href={`/templates/${template.id}/edit`}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                            <Pencil className="h-4 w-4" />
                            Редактировать
                        </Link>
                    </div>
                </div>

                {template.description && (
                    <p className="mt-2 text-gray-500 dark:text-gray-400">
                        {template.description}
                    </p>
                )}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content - Blocks */}
                <div className="lg:col-span-2">
                    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
                        <div className="mb-4 flex items-center gap-2">
                            <Boxes className="h-5 w-5 text-gray-400" />
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Блоки шаблона
                            </h2>
                        </div>

                        <BlockList templateId={template.id} blocks={blocks} />
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Info */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
                        <div className="mb-4 flex items-center gap-2">
                            <LayoutTemplate className="h-5 w-5 text-gray-400" />
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Информация
                            </h2>
                        </div>

                        <dl className="space-y-4 text-sm">
                            <div>
                                <dt className="text-gray-500 dark:text-gray-400">Slug</dt>
                                <dd className="font-mono text-gray-900 dark:text-white">
                                    {template.slug}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-gray-500 dark:text-gray-400">Создан</dt>
                                <dd className="text-gray-900 dark:text-white">
                                    {new Date(template.created_at).toLocaleString('ru-RU')}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-gray-500 dark:text-gray-400">
                                    Используется в проектах
                                </dt>
                                <dd className="text-gray-900 dark:text-white">
                                    {template.projects?.length || 0}
                                </dd>
                            </div>
                        </dl>
                    </div>

                    {/* Projects using this template */}
                    {template.projects && template.projects.length > 0 && (
                        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
                            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                                Проекты с этим шаблоном
                            </h2>
                            <ul className="space-y-2">
                                {template.projects.map((project: { id: string; name: string; slug: string }) => (
                                    <li key={project.id}>
                                        <Link
                                            href={`/projects/${project.id}`}
                                            className="text-sm text-blue-600 hover:underline"
                                        >
                                            {project.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Danger Zone */}
                    <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900/30 dark:bg-red-900/10">
                        <h2 className="mb-2 text-lg font-semibold text-red-700 dark:text-red-400">
                            Опасная зона
                        </h2>
                        <p className="mb-4 text-sm text-red-600 dark:text-red-400">
                            Удаление шаблона необратимо. Все данные будут потеряны.
                        </p>
                        <DeleteButton
                            templateId={template.id}
                            templateName={template.name}
                            hasProjects={(template.projects?.length || 0) > 0}
                        />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
