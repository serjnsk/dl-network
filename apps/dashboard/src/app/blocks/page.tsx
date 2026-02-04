import { DashboardLayout } from '@/components/layout';
import { createAdminClient } from '@/lib/supabase/server';
import { Blocks, LayoutTemplate } from 'lucide-react';
import Link from 'next/link';

// Описания типов блоков
const BLOCK_TYPE_INFO: Record<string, { label: string; icon: string; description: string }> = {
    hero: {
        label: 'Hero секция',
        icon: '🚀',
        description: 'Главный баннер с заголовком, подзаголовком и кнопкой'
    },
    features: {
        label: 'Преимущества',
        icon: '⭐',
        description: 'Сетка карточек с иконками и описанием'
    },
    cta: {
        label: 'Призыв к действию',
        icon: '📢',
        description: 'Блок с призывом и кнопкой действия'
    },
    footer: {
        label: 'Подвал',
        icon: '📋',
        description: 'Нижняя часть страницы с копирайтом'
    },
    gallery: {
        label: 'Галерея',
        icon: '🖼️',
        description: 'Сетка изображений'
    },
    testimonials: {
        label: 'Отзывы',
        icon: '💬',
        description: 'Карусель или сетка отзывов клиентов'
    },
    pricing: {
        label: 'Цены',
        icon: '💰',
        description: 'Таблица тарифов'
    },
    faq: {
        label: 'FAQ',
        icon: '❓',
        description: 'Часто задаваемые вопросы'
    },
    contact: {
        label: 'Контакты',
        icon: '📧',
        description: 'Контактная информация и форма'
    },
};

export default async function BlocksPage() {
    const supabase = await createAdminClient();

    const { data: blocks, error } = await supabase
        .from('template_blocks')
        .select(`
      id,
      block_type,
      block_order,
      default_content,
      created_at,
      templates (id, name, slug)
    `)
        .order('created_at', { ascending: false });

    // Группируем блоки по типу
    const blocksByType: Record<string, typeof blocks> = {};
    blocks?.forEach((block) => {
        if (!blocksByType[block.block_type]) {
            blocksByType[block.block_type] = [];
        }
        blocksByType[block.block_type]!.push(block);
    });

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Библиотека блоков
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Все блоки, используемые в шаблонах
                </p>
            </div>

            {error ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                    Ошибка загрузки: {error.message}
                </div>
            ) : Object.keys(blocksByType).length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-16 dark:border-gray-700">
                    <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
                        <Blocks className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                        Нет блоков
                    </h3>
                    <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                        Блоки создаются автоматически при добавлении в шаблоны
                    </p>
                    <Link
                        href="/templates"
                        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
                    >
                        <LayoutTemplate className="h-4 w-4" />
                        Перейти к шаблонам
                    </Link>
                </div>
            ) : (
                <div className="space-y-8">
                    {Object.entries(blocksByType).map(([blockType, typeBlocks]) => {
                        const info = BLOCK_TYPE_INFO[blockType] || {
                            label: blockType,
                            icon: '📦',
                            description: 'Пользовательский блок'
                        };

                        return (
                            <div key={blockType} className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
                                {/* Block Type Header */}
                                <div className="border-b border-gray-200 p-4 dark:border-gray-800">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{info.icon}</span>
                                        <div>
                                            <h2 className="font-semibold text-gray-900 dark:text-white">
                                                {info.label}
                                            </h2>
                                            <p className="text-sm text-gray-500">{info.description}</p>
                                        </div>
                                        <span className="ml-auto rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                                            {typeBlocks?.length} шт.
                                        </span>
                                    </div>
                                </div>

                                {/* Block Instances */}
                                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {typeBlocks?.map((block) => (
                                        <div
                                            key={block.id}
                                            className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-900"
                                        >
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <code className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                                        {block.block_type}
                                                    </code>
                                                    <span className="text-sm text-gray-500">
                                                        порядок: {block.block_order}
                                                    </span>
                                                </div>
                                                {block.templates && (
                                                    <Link
                                                        href={`/templates/${(block.templates as unknown as { id: string }).id}`}
                                                        className="mt-1 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                                                    >
                                                        <LayoutTemplate className="h-3 w-3" />
                                                        {(block.templates as unknown as { name: string }).name}
                                                    </Link>
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {new Date(block.created_at).toLocaleDateString('ru-RU')}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Available Block Types */}
            <div className="mt-12">
                <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                    Доступные типы блоков
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Object.entries(BLOCK_TYPE_INFO).map(([type, info]) => (
                        <div
                            key={type}
                            className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950"
                        >
                            <div className="mb-2 flex items-center gap-2">
                                <span className="text-xl">{info.icon}</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {info.label}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500">{info.description}</p>
                            <code className="mt-2 inline-block rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                {type}
                            </code>
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
