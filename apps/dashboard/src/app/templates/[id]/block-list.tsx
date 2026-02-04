'use client';

import { useState, useTransition } from 'react';
import { Plus, Trash2, GripVertical, Loader2 } from 'lucide-react';
import { addTemplateBlock, removeTemplateBlock } from '../actions';

interface Block {
    id: string;
    block_type: string;
    block_order: number;
    default_content: Record<string, unknown>;
}

interface BlockListProps {
    templateId: string;
    blocks: Block[];
}

const AVAILABLE_BLOCKS = [
    { type: 'hero', label: 'Hero секция', icon: '🚀' },
    { type: 'features', label: 'Преимущества', icon: '⭐' },
    { type: 'cta', label: 'Призыв к действию', icon: '📢' },
    { type: 'footer', label: 'Подвал', icon: '📋' },
    { type: 'gallery', label: 'Галерея', icon: '🖼️' },
    { type: 'testimonials', label: 'Отзывы', icon: '💬' },
    { type: 'pricing', label: 'Цены', icon: '💰' },
    { type: 'faq', label: 'FAQ', icon: '❓' },
    { type: 'contact', label: 'Контакты', icon: '📧' },
];

const DEFAULT_CONTENT: Record<string, Record<string, unknown>> = {
    hero: {
        title: 'Заголовок',
        subtitle: 'Подзаголовок',
        button_text: 'Начать',
        button_url: '#',
    },
    features: {
        title: 'Наши преимущества',
        items: [
            { title: 'Быстрота', description: 'Работаем оперативно', icon: '⚡' },
            { title: 'Качество', description: 'Высокий стандарт', icon: '✨' },
            { title: 'Надёжность', description: 'Гарантия результата', icon: '🛡️' },
        ],
    },
    cta: {
        title: 'Готовы начать?',
        description: 'Свяжитесь с нами прямо сейчас',
        button_text: 'Связаться',
        button_url: '#contact',
    },
    footer: {
        copyright: `© ${new Date().getFullYear()} Все права защищены`,
    },
    gallery: {
        title: 'Галерея',
        images: [],
    },
    testimonials: {
        title: 'Отзывы клиентов',
        items: [],
    },
    pricing: {
        title: 'Тарифы',
        plans: [],
    },
    faq: {
        title: 'Частые вопросы',
        items: [],
    },
    contact: {
        title: 'Свяжитесь с нами',
        email: 'info@example.com',
        phone: '+7 (999) 123-45-67',
    },
};

export function BlockList({ templateId, blocks }: BlockListProps) {
    const [isPending, startTransition] = useTransition();
    const [showAddMenu, setShowAddMenu] = useState(false);

    const handleAddBlock = (blockType: string) => {
        setShowAddMenu(false);
        startTransition(async () => {
            await addTemplateBlock(templateId, blockType, DEFAULT_CONTENT[blockType] || {});
        });
    };

    const handleRemoveBlock = (blockId: string) => {
        startTransition(async () => {
            await removeTemplateBlock(blockId);
        });
    };

    const getBlockLabel = (type: string) => {
        return AVAILABLE_BLOCKS.find((b) => b.type === type)?.label || type;
    };

    const getBlockIcon = (type: string) => {
        return AVAILABLE_BLOCKS.find((b) => b.type === type)?.icon || '📦';
    };

    return (
        <div className="space-y-3">
            {blocks.length === 0 ? (
                <div className="rounded-lg border-2 border-dashed border-gray-300 py-8 text-center dark:border-gray-700">
                    <p className="mb-2 text-gray-500 dark:text-gray-400">
                        Блоки ещё не добавлены
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                        Добавьте блоки для формирования структуры шаблона
                    </p>
                </div>
            ) : (
                <ul className="space-y-2">
                    {blocks.map((block) => (
                        <li
                            key={block.id}
                            className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900"
                        >
                            <GripVertical className="h-4 w-4 cursor-grab text-gray-400" />
                            <span className="text-xl">{getBlockIcon(block.block_type)}</span>
                            <div className="flex-1">
                                <p className="font-medium text-gray-900 dark:text-white">
                                    {getBlockLabel(block.block_type)}
                                </p>
                                <p className="text-xs text-gray-500">{block.block_type}</p>
                            </div>
                            <button
                                onClick={() => handleRemoveBlock(block.id)}
                                disabled={isPending}
                                className="rounded p-1 text-gray-400 transition-colors hover:bg-red-100 hover:text-red-600 disabled:opacity-50"
                            >
                                {isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Trash2 className="h-4 w-4" />
                                )}
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {/* Add Block Button */}
            <div className="relative">
                <button
                    onClick={() => setShowAddMenu(!showAddMenu)}
                    disabled={isPending}
                    className="w-full rounded-lg border-2 border-dashed border-gray-300 py-3 text-sm font-medium text-gray-500 transition-colors hover:border-blue-400 hover:text-blue-600 disabled:opacity-50 dark:border-gray-700"
                >
                    <Plus className="mr-2 inline h-4 w-4" />
                    Добавить блок
                </button>

                {showAddMenu && (
                    <div className="absolute left-0 right-0 top-full z-10 mt-2 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
                        <div className="max-h-64 overflow-auto p-2">
                            {AVAILABLE_BLOCKS.map((block) => (
                                <button
                                    key={block.type}
                                    onClick={() => handleAddBlock(block.type)}
                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <span className="text-lg">{block.icon}</span>
                                    <span className="text-gray-900 dark:text-white">
                                        {block.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
