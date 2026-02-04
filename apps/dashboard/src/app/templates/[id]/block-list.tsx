'use client';

import { useState, useTransition } from 'react';
import { Plus, Trash2, GripVertical, Loader2 } from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { addTemplateBlock, removeTemplateBlock, reorderTemplateBlocks } from '../actions';

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

// Sortable Block Item Component
function SortableBlockItem({
    block,
    onRemove,
    isPending,
    getBlockLabel,
    getBlockIcon,
}: {
    block: Block;
    onRemove: (id: string) => void;
    isPending: boolean;
    getBlockLabel: (type: string) => string;
    getBlockIcon: (type: string) => string;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: block.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <li
            ref={setNodeRef}
            style={style}
            className={`flex items-center gap-3 rounded-lg border bg-white px-4 py-3 ${isDragging ? 'border-blue-400 shadow-lg' : 'border-gray-200'
                }`}
        >
            <button
                {...attributes}
                {...listeners}
                className="cursor-grab touch-none text-gray-400 hover:text-gray-600 active:cursor-grabbing"
            >
                <GripVertical className="h-4 w-4" />
            </button>
            <span className="text-xl">{getBlockIcon(block.block_type)}</span>
            <div className="flex-1">
                <p className="font-medium text-gray-900">
                    {getBlockLabel(block.block_type)}
                </p>
                <p className="text-xs text-gray-500">{block.block_type}</p>
            </div>
            <button
                onClick={() => onRemove(block.id)}
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
    );
}

export function BlockList({ templateId, blocks: initialBlocks }: BlockListProps) {
    const [isPending, startTransition] = useTransition();
    const [showAddMenu, setShowAddMenu] = useState(false);
    const [blocks, setBlocks] = useState(initialBlocks);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

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

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = blocks.findIndex((b) => b.id === active.id);
            const newIndex = blocks.findIndex((b) => b.id === over.id);

            const newBlocks = arrayMove(blocks, oldIndex, newIndex);
            setBlocks(newBlocks);

            // Save new order to database
            startTransition(async () => {
                await reorderTemplateBlocks(templateId, newBlocks.map((b) => b.id));
            });
        }
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
                <div className="rounded-lg border-2 border-dashed border-gray-300 py-8 text-center">
                    <p className="mb-2 text-gray-500">
                        Блоки ещё не добавлены
                    </p>
                    <p className="text-sm text-gray-400">
                        Добавьте блоки для формирования структуры шаблона
                    </p>
                </div>
            ) : (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={blocks.map((b) => b.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <ul className="space-y-2">
                            {blocks.map((block) => (
                                <SortableBlockItem
                                    key={block.id}
                                    block={block}
                                    onRemove={handleRemoveBlock}
                                    isPending={isPending}
                                    getBlockLabel={getBlockLabel}
                                    getBlockIcon={getBlockIcon}
                                />
                            ))}
                        </ul>
                    </SortableContext>
                </DndContext>
            )}

            {/* Add Block Button */}
            <div className="relative">
                <button
                    onClick={() => setShowAddMenu(!showAddMenu)}
                    disabled={isPending}
                    className="w-full rounded-lg border-2 border-dashed border-gray-300 py-3 text-sm font-medium text-gray-500 transition-colors hover:border-blue-400 hover:text-blue-600 disabled:opacity-50"
                >
                    <Plus className="mr-2 inline h-4 w-4" />
                    Добавить блок
                </button>

                {showAddMenu && (
                    <div className="absolute left-0 right-0 top-full z-10 mt-2 rounded-lg border border-gray-200 bg-white shadow-lg">
                        <div className="max-h-64 overflow-auto p-2">
                            {AVAILABLE_BLOCKS.map((block) => (
                                <button
                                    key={block.type}
                                    onClick={() => handleAddBlock(block.type)}
                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-gray-100"
                                >
                                    <span className="text-lg">{block.icon}</span>
                                    <span className="text-gray-900">
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
