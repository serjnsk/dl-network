import { DashboardLayout } from '@/components/layout';
import { createAdminClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    ExternalLink,
    Settings,
    Globe,
    Trash2,
    Rocket,
    Pencil,
} from 'lucide-react';
import { DeleteButton, PublishButton } from './buttons';
import { DomainManager } from './domain-manager';

// Block type helpers
const BLOCK_CONFIG: Record<string, { label: string; icon: string }> = {
    hero: { label: 'Hero секция', icon: '🚀' },
    features: { label: 'Преимущества', icon: '⭐' },
    cta: { label: 'Призыв к действию', icon: '📢' },
    footer: { label: 'Подвал', icon: '📋' },
    gallery: { label: 'Галерея', icon: '🖼️' },
    testimonials: { label: 'Отзывы', icon: '💬' },
    pricing: { label: 'Цены', icon: '💰' },
    faq: { label: 'FAQ', icon: '❓' },
    contact: { label: 'Контакты', icon: '📧' },
};

function getBlockLabel(type: string): string {
    return BLOCK_CONFIG[type]?.label || type;
}

function getBlockIcon(type: string): string {
    return BLOCK_CONFIG[type]?.icon || '📦';
}

interface ProjectPageProps {
    params: Promise<{ id: string }>;
}


export default async function ProjectPage({ params }: ProjectPageProps) {
    const { id } = await params;
    const supabase = await createAdminClient();

    const { data: project, error } = await supabase
        .from('projects')
        .select(
            `
      *,
      templates (
        id, 
        name, 
        slug,
        template_blocks (
          id,
          block_type,
          block_order,
          default_content
        )
      ),
      project_domains (
        id,
        is_primary,
        canonical_domain,
        tracking_config,
        cf_deployment_url,
        domains (id, domain_name, dns_status)
      ),
      project_content (
        id,
        page_slug,
        block_type,
        block_order,
        content
      )
    `
        )
        .eq('id', id)
        .single();

    if (error || !project) {
        notFound();
    }

    // Sort template blocks by order
    if (project.templates?.template_blocks) {
        project.templates.template_blocks.sort(
            (a: { block_order: number }, b: { block_order: number }) => a.block_order - b.block_order
        );
    }

    // Load all domains for domain picker
    const { data: allDomains } = await supabase
        .from('domains')
        .select('id, domain_name, dns_status')
        .order('domain_name');

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

    const primaryDomain = project.project_domains?.find(
        (pd: { is_primary: boolean }) => pd.is_primary
    );
    const domainName = primaryDomain?.domains?.domain_name;

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="mb-8">
                <Link
                    href="/projects"
                    className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Назад к проектам
                </Link>

                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {project.name}
                            </h1>
                            <span
                                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[project.status as keyof typeof statusColors]
                                    }`}
                            >
                                {statusLabels[project.status as keyof typeof statusLabels]}
                            </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Slug: <code className="rounded bg-gray-100 px-1 dark:bg-gray-800">{project.slug}</code>
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <Link
                            href={`/projects/${id}/edit`}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <Pencil className="h-4 w-4" />
                            Редактировать
                        </Link>
                        <PublishButton projectId={id} status={project.status} />
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Template Info */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
                        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                            <Settings className="h-5 w-5" />
                            Настройки
                        </h2>
                        <dl className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Шаблон
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                                    {project.templates?.name || 'Не выбран'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    CF Project ID
                                </dt>
                                <dd className="mt-1 font-mono text-sm text-gray-900 dark:text-white">
                                    {project.cf_project_id || '—'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Создан
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                                    {new Date(project.created_at).toLocaleDateString('ru-RU', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Обновлён
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                                    {new Date(project.updated_at).toLocaleDateString('ru-RU', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </dd>
                            </div>
                        </dl>
                    </div>

                    {/* Content Blocks */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                            Контент
                        </h2>
                        {project.templates ? (
                            project.templates.template_blocks?.length > 0 ? (
                                <div className="space-y-3">
                                    {project.templates.template_blocks.map((block: {
                                        id: string;
                                        block_type: string;
                                        block_order: number;
                                        default_content: Record<string, unknown>;
                                    }) => {
                                        // Check if this block has custom content
                                        const customContent = project.project_content?.find(
                                            (c: { block_type: string }) => c.block_type === block.block_type
                                        );
                                        const hasContent = !!customContent;

                                        return (
                                            <div
                                                key={block.id}
                                                className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xl">
                                                        {getBlockIcon(block.block_type)}
                                                    </span>
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {getBlockLabel(block.block_type)}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {hasContent ? (
                                                                <span className="text-green-600">✓ Заполнено</span>
                                                            ) : (
                                                                <span className="text-gray-400">По умолчанию</span>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
                                                    Редактировать
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-sm text-gray-500 mb-2">
                                        Шаблон не содержит блоков
                                    </p>
                                    <Link
                                        href={`/templates/${project.templates.id}`}
                                        className="text-sm text-blue-600 hover:underline"
                                    >
                                        Добавить блоки в шаблон
                                    </Link>
                                </div>
                            )
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Контент пока не добавлен. Выберите шаблон для начала.
                            </p>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Domains */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
                        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                            <Globe className="h-5 w-5" />
                            Домены
                        </h2>
                        <DomainManager
                            projectId={id}
                            projectDomains={project.project_domains || []}
                            availableDomains={allDomains || []}
                        />
                    </div>

                    {/* Danger Zone */}
                    <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/30">
                        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-red-700 dark:text-red-400">
                            <Trash2 className="h-5 w-5" />
                            Опасная зона
                        </h2>
                        <p className="mb-4 text-sm text-red-600 dark:text-red-400">
                            Удаление проекта необратимо. Все данные будут потеряны.
                        </p>
                        <DeleteButton projectId={id} projectName={project.name} />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
