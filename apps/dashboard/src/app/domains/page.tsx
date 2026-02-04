import { DashboardLayout } from '@/components/layout';
import { createAdminClient } from '@/lib/supabase/server';
import { Globe, Plus, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { SyncDomainsButton } from './sync-button';

export default async function DomainsPage() {
    const supabase = await createAdminClient();

    const { data: domains, error } = await supabase
        .from('domains')
        .select('*, project_domains(project_id)')
        .order('created_at', { ascending: false });

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Домены
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Пул доменов для проектов
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <SyncDomainsButton />
                    <Link
                        href="/domains/new"
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                    >
                        <Plus className="h-4 w-4" />
                        Добавить домен
                    </Link>
                </div>
            </div>

            {error ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                    Ошибка загрузки: {error.message}
                </div>
            ) : domains?.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-16">
                    <div className="mb-4 rounded-full bg-gray-100 p-4">
                        <Globe className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="mb-2 text-lg font-medium text-gray-900">
                        Нет доменов
                    </h3>
                    <p className="mb-4 text-sm text-gray-500">
                        Синхронизируйте с Cloudflare или добавьте вручную
                    </p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Домен</th>
                                <th>Статус DNS</th>
                                <th>Проекты</th>
                                <th>Добавлен</th>
                            </tr>
                        </thead>
                        <tbody>
                            {domains?.map((domain) => (
                                <tr key={domain.id}>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-900">
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
                                    <td>
                                        <span
                                            className={`badge ${domain.dns_status === 'active'
                                                ? 'badge-published'
                                                : domain.dns_status === 'error'
                                                    ? 'badge-failed'
                                                    : 'badge-building'
                                                }`}
                                        >
                                            {domain.dns_status === 'active'
                                                ? 'Активен'
                                                : domain.dns_status === 'error'
                                                    ? 'Ошибка'
                                                    : 'Ожидание'}
                                        </span>
                                    </td>
                                    <td className="text-sm text-gray-500">
                                        {domain.project_domains?.length || 0}
                                    </td>
                                    <td className="text-sm text-gray-500">
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
