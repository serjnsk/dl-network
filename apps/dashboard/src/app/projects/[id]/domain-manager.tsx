'use client';

import { useState, useTransition } from 'react';
import { Plus, Trash2, Star, Loader2, X, Globe } from 'lucide-react';
import {
    linkDomainToProject,
    unlinkDomainFromProject,
    setPrimaryDomain
} from '@/app/domains/actions';

interface Domain {
    id: string;
    domain_name: string;
    dns_status: string;
}

interface ProjectDomain {
    id: string;
    is_primary: boolean;
    domains: Domain;
}

interface DomainManagerProps {
    projectId: string;
    projectDomains: ProjectDomain[];
    availableDomains: Domain[];
}

export function DomainManager({ projectId, projectDomains, availableDomains }: DomainManagerProps) {
    const [isPending, startTransition] = useTransition();
    const [showAddModal, setShowAddModal] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLink = (domainId: string) => {
        setError(null);
        startTransition(async () => {
            const result = await linkDomainToProject(projectId, domainId, projectDomains.length === 0);
            if (result.error) {
                setError(result.error);
            } else {
                setShowAddModal(false);
            }
        });
    };

    const handleUnlink = (projectDomainId: string) => {
        setError(null);
        startTransition(async () => {
            const result = await unlinkDomainFromProject(projectDomainId);
            if (result.error) {
                setError(result.error);
            }
        });
    };

    const handleSetPrimary = (projectDomainId: string) => {
        startTransition(async () => {
            await setPrimaryDomain(projectId, projectDomainId);
        });
    };

    // Filter out already linked domains
    const linkedDomainIds = projectDomains.map(pd => pd.domains.id);
    const unlinkedDomains = availableDomains.filter(d => !linkedDomainIds.includes(d.id));

    return (
        <div>
            {error && (
                <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            {projectDomains.length > 0 ? (
                <ul className="space-y-2">
                    {projectDomains.map((pd) => (
                        <li
                            key={pd.id}
                            className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-2 dark:border-gray-800 dark:bg-gray-900"
                        >
                            <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4 text-gray-400" />
                                <a
                                    href={`https://${pd.domains.domain_name}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm font-medium text-gray-900 hover:text-blue-600 dark:text-white"
                                >
                                    {pd.domains.domain_name}
                                </a>
                                {pd.is_primary && (
                                    <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-600">
                                        Основной
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-1">
                                {!pd.is_primary && (
                                    <button
                                        onClick={() => handleSetPrimary(pd.id)}
                                        disabled={isPending}
                                        className="rounded p-1 text-gray-400 hover:bg-yellow-100 hover:text-yellow-600 disabled:opacity-50"
                                        title="Сделать основным"
                                    >
                                        <Star className="h-4 w-4" />
                                    </button>
                                )}
                                <button
                                    onClick={() => handleUnlink(pd.id)}
                                    disabled={isPending}
                                    className="rounded p-1 text-gray-400 hover:bg-red-100 hover:text-red-600 disabled:opacity-50"
                                    title="Отвязать домен"
                                >
                                    {isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Домены не привязаны
                </p>
            )}

            {/* Add Domain Button */}
            <button
                onClick={() => setShowAddModal(true)}
                disabled={unlinkedDomains.length === 0}
                className="mt-4 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
                <Plus className="mr-1 inline h-4 w-4" />
                {unlinkedDomains.length > 0 ? 'Привязать домен' : 'Нет свободных доменов'}
            </button>

            {/* Add Domain Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Привязать домен
                            </h3>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="rounded p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {unlinkedDomains.length === 0 ? (
                            <p className="text-gray-500">Все домены уже привязаны</p>
                        ) : (
                            <ul className="max-h-64 overflow-y-auto space-y-2">
                                {unlinkedDomains.map((domain) => (
                                    <li key={domain.id}>
                                        <button
                                            onClick={() => handleLink(domain.id)}
                                            disabled={isPending}
                                            className="flex w-full items-center justify-between rounded-lg border border-gray-200 p-3 text-left transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
                                        >
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {domain.domain_name}
                                                </p>
                                                <p className={`text-xs ${domain.dns_status === 'active'
                                                        ? 'text-green-600'
                                                        : 'text-yellow-600'
                                                    }`}>
                                                    {domain.dns_status === 'active' ? 'DNS активен' : 'Ожидание DNS'}
                                                </p>
                                            </div>
                                            {isPending ? (
                                                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                                            ) : (
                                                <Plus className="h-5 w-5 text-blue-600" />
                                            )}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                            <a
                                href="/domains/new"
                                className="text-sm text-blue-600 hover:underline"
                            >
                                + Добавить новый домен
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
