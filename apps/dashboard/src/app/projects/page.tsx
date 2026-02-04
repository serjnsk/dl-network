import { DashboardLayout } from '@/components/layout';
import { createAdminClient } from '@/lib/supabase/server';
import { Plus, ExternalLink, MoreVertical } from 'lucide-react';
import Link from 'next/link';

export default async function ProjectsPage() {
    const supabase = await createAdminClient();

    const { data: projects, error } = await supabase
        .from('projects')
        .select(`
      *,
      templates (name),
      project_domains (
        domain_id,
        is_primary,
        domains (domain_name)
      )
    `)
        .order('created_at', { ascending: false });

    const statusColors = {
        draft: 'bg-gray-100 text-gray-600',
        building: 'bg-yellow-100 text-yellow-700',
        published: 'bg-green-100 text-green-700',
        failed: 'bg-red-100 text-red-700',
    };

    const statusLabels = {
        draft: 'Черновик',
        building: 'Сборка...',
        published: 'Опубликован',
        failed: 'Ошибка',
    };

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Проекты
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Управление всеми сайтами из одного места
                    </p>
                </div>
                <Link
                    href="/projects/new"
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                    <Plus className="h-4 w-4" />
                    Создать проект
                </Link>
            </div>

            {/* Projects Grid */}
            {error ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                    Ошибка загрузки проектов: {error.message}
                </div>
            ) : projects?.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-16 dark:border-gray-700">
                    <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
                        <Plus className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                        Нет проектов
                    </h3>
                    <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                        Создайте первый проект для начала работы
                    </p>
                    <Link
                        href="/projects/new"
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                    >
                        <Plus className="h-4 w-4" />
                        Создать проект
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {projects?.map((project) => {
                        const primaryDomain = project.project_domains?.find(
                            (pd: { is_primary: boolean }) => pd.is_primary
                        );
                        const domainName = primaryDomain?.domains?.domain_name;

                        return (
                            <div
                                key={project.id}
                                className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-lg dark:border-gray-800 dark:bg-gray-950"
                            >
                                {/* Status Badge */}
                                <div className="mb-3 flex items-center justify-between">
                                    <span
                                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[project.status as keyof typeof statusColors]
                                            }`}
                                    >
                                        {statusLabels[project.status as keyof typeof statusLabels]}
                                    </span>
                                    <button className="rounded p-1 opacity-0 transition-opacity hover:bg-gray-100 group-hover:opacity-100 dark:hover:bg-gray-800">
                                        <MoreVertical className="h-4 w-4 text-gray-400" />
                                    </button>
                                </div>

                                {/* Project Name */}
                                <Link href={`/projects/${project.id}`}>
                                    <h3 className="mb-1 text-lg font-semibold text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400">
                                        {project.name}
                                    </h3>
                                </Link>

                                {/* Template */}
                                {project.templates && (
                                    <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
                                        Шаблон: {project.templates.name}
                                    </p>
                                )}

                                {/* Domain */}
                                {domainName && (
                                    <a
                                        href={`https://${domainName}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline dark:text-blue-400"
                                    >
                                        {domainName}
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                )}

                                {/* Dates */}
                                <div className="mt-4 border-t border-gray-100 pt-3 text-xs text-gray-400 dark:border-gray-800">
                                    Обновлён:{' '}
                                    {new Date(project.updated_at).toLocaleDateString('ru-RU')}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </DashboardLayout>
    );
}
