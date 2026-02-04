import { DashboardLayout } from '@/components/layout';
import { createAdminClient } from '@/lib/supabase/server';
import { Globe, Plus, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default async function DomainsPage() {
    const supabase = await createAdminClient();

    const { data: domains, error } = await supabase
        .from('domains')
        .select('*, project_domains(project_id)')
        .order('created_at', { ascending: false });

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Домены
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Пул доменов для проектов
                    </p>
                </div>
                <Link
                    href="/domains/new"
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                    <Plus className="h-4 w-4" />
                    Добавить домен
                </Link>
            </div>

            {error ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                    Ошибка загрузки: {error.message}
                </div>
            ) : domains?.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-16 dark:border-gray-700">
                    <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
                        <Globe className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                        Нет доменов
                    </h3>
                    <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                        Добавьте первый домен для использования в проектах
                    </p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Домен
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Статус DNS
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Проекты
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Добавлен
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-950">
                            {domains?.map((domain) => (
                                <tr key={domain.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {domain.domain_name}
                                            </span>
                                            <a
                                                href={`https://${domain.domain_name}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-gray-400 hover:text-blue-600"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </a>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <span
                                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${domain.dns_status === 'active'
                                                    ? 'bg-green-100 text-green-700'
                                                    : domain.dns_status === 'error'
                                                        ? 'bg-red-100 text-red-700'
                                                        : 'bg-yellow-100 text-yellow-700'
                                                }`}
                                        >
                                            {domain.dns_status === 'active'
                                                ? 'Активен'
                                                : domain.dns_status === 'error'
                                                    ? 'Ошибка'
                                                    : 'Ожидание'}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                        {domain.project_domains?.length || 0}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                        {new Date(domain.created_at).toLocaleDateString('ru-RU')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </DashboardLayout>
    );
}
