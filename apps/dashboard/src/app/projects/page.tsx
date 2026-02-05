import { DashboardLayout } from '@/components/layout';
import { createAdminClient } from '@/lib/supabase/server';
import { Plus, ExternalLink, Eye, Pencil, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

export default async function ProjectsPage() {
    const supabase = await createAdminClient();

    const { data: projects, error } = await supabase
        .from('projects')
        .select(`
      *,
      project_domains (
        domain_id,
        is_primary,
        domains (domain_name)
      )
    `)
        .order('created_at', { ascending: false });

    const statusLabels: Record<string, string> = {
        draft: 'Черновик',
        building: 'Сборка...',
        published: 'Опубликован',
        failed: 'Ошибка',
    };

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Проекты
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
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

            {/* Projects Table */}
            {error ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                    Ошибка загрузки проектов: {error.message}
                </div>
            ) : projects?.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-16">
                    <div className="mb-4 rounded-full bg-gray-100 p-4">
                        <Plus className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="mb-2 text-lg font-medium text-gray-900">
                        Нет проектов
                    </h3>
                    <p className="mb-4 text-sm text-gray-500">
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
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Название</th>
                                <th>Статус</th>
                                <th>Тестовый домен</th>
                                <th>Домен</th>
                                <th>Обновлён</th>
                                <th className="w-12"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects?.map((project) => {
                                const primaryDomain = project.project_domains?.find(
                                    (pd: { is_primary: boolean }) => pd.is_primary
                                );
                                const domainName = primaryDomain?.domains?.domain_name;

                                return (
                                    <tr key={project.id}>
                                        {/* Name */}
                                        <td>
                                            <Link
                                                href={`/projects/${project.id}`}
                                                className="font-medium text-gray-900 hover:text-blue-600"
                                            >
                                                {project.name}
                                            </Link>
                                            <p className="mt-0.5 text-xs text-gray-400">
                                                {project.slug}
                                            </p>
                                        </td>

                                        {/* Status */}
                                        <td>
                                            <span className={`badge badge-${project.status}`}>
                                                {statusLabels[project.status] || project.status}
                                            </span>
                                        </td>



                                        {/* Test Domain (Cloudflare Pages) */}
                                        <td>
                                            {project.status === 'published' && project.slug ? (
                                                <a
                                                    href={`https://${project.cf_project_id || `dl-${project.slug}`}.pages.dev`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 hover:underline"
                                                >
                                                    {project.cf_project_id || `dl-${project.slug}`}.pages.dev
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            ) : (
                                                <span className="text-sm text-gray-400">—</span>
                                            )}
                                        </td>

                                        {/* Domain */}
                                        <td>
                                            {domainName ? (
                                                <a
                                                    href={`https://${domainName}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                                                >
                                                    {domainName}
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            ) : (
                                                <span className="text-sm text-gray-400">—</span>
                                            )}
                                        </td>

                                        {/* Updated */}
                                        <td className="text-sm text-gray-500">
                                            {new Date(project.updated_at).toLocaleDateString('ru-RU', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </td>

                                        {/* Actions */}
                                        <td>
                                            <div className="flex items-center gap-1">
                                                <Link
                                                    href={`/projects/${project.id}`}
                                                    className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                                    title="Просмотр"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                                <Link
                                                    href={`/projects/${project.id}/edit`}
                                                    className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                                    title="Редактировать"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )
            }
        </DashboardLayout >
    );
}
