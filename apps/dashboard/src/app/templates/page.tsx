import { DashboardLayout } from '@/components/layout';
import { createAdminClient } from '@/lib/supabase/server';
import { Plus, LayoutTemplate, Check, X } from 'lucide-react';
import Link from 'next/link';

export default async function TemplatesPage() {
    const supabase = await createAdminClient();

    const { data: templates, error } = await supabase
        .from('templates')
        .select(`
      *,
      template_blocks (id),
      projects (id)
    `)
        .order('created_at', { ascending: false });

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Шаблоны
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Готовые макеты для быстрого создания сайтов
                    </p>
                </div>
                <Link
                    href="/templates/new"
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                    <Plus className="h-4 w-4" />
                    Создать шаблон
                </Link>
            </div>

            {/* Templates Grid */}
            {error ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                    Ошибка загрузки: {error.message}
                </div>
            ) : templates?.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-16 dark:border-gray-700">
                    <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
                        <LayoutTemplate className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                        Нет шаблонов
                    </h3>
                    <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                        Создайте первый шаблон для использования в проектах
                    </p>
                    <Link
                        href="/templates/new"
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                    >
                        <Plus className="h-4 w-4" />
                        Создать шаблон
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {templates?.map((template) => (
                        <Link
                            key={template.id}
                            href={`/templates/${template.id}`}
                            className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-lg dark:border-gray-800 dark:bg-gray-950"
                        >
                            {/* Preview Image */}
                            <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                                {template.preview_image ? (
                                    <img
                                        src={template.preview_image}
                                        alt={template.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center">
                                        <LayoutTemplate className="h-12 w-12 text-gray-400" />
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <div className="mb-2 flex items-center justify-between">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                        {template.name}
                                    </h3>
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

                                {template.description && (
                                    <p className="mb-3 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                                        {template.description}
                                    </p>
                                )}

                                <div className="flex items-center gap-4 text-xs text-gray-400">
                                    <span>{template.template_blocks?.length || 0} блоков</span>
                                    <span>{template.projects?.length || 0} проектов</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}
