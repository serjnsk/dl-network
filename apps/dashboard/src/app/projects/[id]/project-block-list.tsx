'use client';

import { useState, useTransition } from 'react';
import { Save, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { saveBlockContent } from '@/app/projects/actions';

interface BlockField {
    key: string;
    label: string;
    type: 'text' | 'textarea' | 'image' | 'color';
    placeholder?: string;
}

// Block field configurations
const BLOCK_FIELDS: Record<string, BlockField[]> = {
    hero: [
        { key: 'title', label: 'Заголовок', type: 'text', placeholder: 'Добро пожаловать' },
        { key: 'subtitle', label: 'Подзаголовок', type: 'textarea', placeholder: 'Краткое описание...' },
        { key: 'buttonText', label: 'Текст кнопки', type: 'text', placeholder: 'Начать' },
        { key: 'buttonUrl', label: 'Ссылка кнопки', type: 'text', placeholder: 'https://...' },
        { key: 'backgroundImage', label: 'Фоновое изображение', type: 'text', placeholder: 'URL изображения' },
    ],
    features: [
        { key: 'title', label: 'Заголовок секции', type: 'text', placeholder: 'Наши преимущества' },
        { key: 'feature1Title', label: 'Преимущество 1 — Заголовок', type: 'text' },
        { key: 'feature1Description', label: 'Преимущество 1 — Описание', type: 'textarea' },
        { key: 'feature2Title', label: 'Преимущество 2 — Заголовок', type: 'text' },
        { key: 'feature2Description', label: 'Преимущество 2 — Описание', type: 'textarea' },
        { key: 'feature3Title', label: 'Преимущество 3 — Заголовок', type: 'text' },
        { key: 'feature3Description', label: 'Преимущество 3 — Описание', type: 'textarea' },
    ],
    cta: [
        { key: 'title', label: 'Заголовок', type: 'text', placeholder: 'Готовы начать?' },
        { key: 'description', label: 'Описание', type: 'textarea', placeholder: 'Подробнее о предложении...' },
        { key: 'buttonText', label: 'Текст кнопки', type: 'text', placeholder: 'Связаться' },
        { key: 'buttonUrl', label: 'Ссылка', type: 'text', placeholder: 'https://...' },
    ],
    footer: [
        { key: 'copyright', label: 'Копирайт', type: 'text', placeholder: '© 2025 Компания' },
        { key: 'links', label: 'Ссылки (по одной на строку)', type: 'textarea', placeholder: 'Политика|/privacy\nУсловия|/terms' },
    ],
    testimonials: [
        { key: 'title', label: 'Заголовок', type: 'text', placeholder: 'Отзывы клиентов' },
        { key: 'testimonial1Name', label: 'Отзыв 1 — Имя', type: 'text' },
        { key: 'testimonial1Text', label: 'Отзыв 1 — Текст', type: 'textarea' },
        { key: 'testimonial2Name', label: 'Отзыв 2 — Имя', type: 'text' },
        { key: 'testimonial2Text', label: 'Отзыв 2 — Текст', type: 'textarea' },
    ],
    pricing: [
        { key: 'title', label: 'Заголовок', type: 'text', placeholder: 'Наші тарифи' },
        { key: 'plan1Name', label: 'Тариф 1 — Название', type: 'text' },
        { key: 'plan1Price', label: 'Тариф 1 — Цена', type: 'text' },
        { key: 'plan1Features', label: 'Тариф 1 — Возможности', type: 'textarea' },
        { key: 'plan2Name', label: 'Тариф 2 — Название', type: 'text' },
        { key: 'plan2Price', label: 'Тариф 2 — Цена', type: 'text' },
        { key: 'plan2Features', label: 'Тариф 2 — Возможности', type: 'textarea' },
    ],
    faq: [
        { key: 'title', label: 'Заголовок', type: 'text', placeholder: 'Часто задаваемые вопросы' },
        { key: 'q1', label: 'Вопрос 1', type: 'text' },
        { key: 'a1', label: 'Ответ 1', type: 'textarea' },
        { key: 'q2', label: 'Вопрос 2', type: 'text' },
        { key: 'a2', label: 'Ответ 2', type: 'textarea' },
        { key: 'q3', label: 'Вопрос 3', type: 'text' },
        { key: 'a3', label: 'Ответ 3', type: 'textarea' },
    ],
    contact: [
        { key: 'title', label: 'Заголовок', type: 'text', placeholder: 'Связаться с нами' },
        { key: 'email', label: 'Email', type: 'text', placeholder: 'info@example.com' },
        { key: 'phone', label: 'Телефон', type: 'text', placeholder: '+7 (999) 123-45-67' },
        { key: 'address', label: 'Адрес', type: 'textarea', placeholder: 'Москва, ул. Примерная, 1' },
    ],
    gallery: [
        { key: 'title', label: 'Заголовок', type: 'text', placeholder: 'Галерея' },
        { key: 'image1', label: 'Изображение 1 URL', type: 'text' },
        { key: 'image2', label: 'Изображение 2 URL', type: 'text' },
        { key: 'image3', label: 'Изображение 3 URL', type: 'text' },
        { key: 'image4', label: 'Изображение 4 URL', type: 'text' },
    ],
};

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

interface TemplateBlock {
    id: string;
    block_type: string;
    block_order: number;
    default_content: Record<string, unknown>;
}

interface ProjectContent {
    id: string;
    block_type: string;
    content: Record<string, unknown>;
}

interface BlockAccordionItemProps {
    projectId: string;
    block: TemplateBlock;
    initialContent: Record<string, unknown> | null;
}

function BlockAccordionItem({ projectId, block, initialContent }: BlockAccordionItemProps) {
    const fields = BLOCK_FIELDS[block.block_type] || [];
    const [isExpanded, setIsExpanded] = useState(true);
    const [content, setContent] = useState<Record<string, string>>(
        (initialContent as Record<string, string>) ||
        (block.default_content as Record<string, string>) ||
        {}
    );
    const [isPending, startTransition] = useTransition();
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');

    const handleFieldChange = (key: string, value: string) => {
        setContent((prev) => ({ ...prev, [key]: value }));
        setSaveStatus('idle');
    };

    const handleSave = () => {
        startTransition(async () => {
            const result = await saveBlockContent(projectId, block.block_type, content);
            if (result.error) {
                setSaveStatus('error');
            } else {
                setSaveStatus('saved');
                setTimeout(() => setSaveStatus('idle'), 2000);
            }
        });
    };

    const hasContent = Object.values(content).some((v) => {
        if (typeof v === 'string') return v.trim() !== '';
        return v !== null && v !== undefined;
    });

    return (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex w-full items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <span className="text-xl">{getBlockIcon(block.block_type)}</span>
                    <div>
                        <p className="font-semibold text-gray-900">
                            {getBlockLabel(block.block_type)}
                        </p>
                        <p className="text-xs text-gray-500">
                            {hasContent ? (
                                <span className="text-green-600">✓ Заполнено</span>
                            ) : (
                                <span className="text-gray-400">Не заполнено</span>
                            )}
                        </p>
                    </div>
                </div>
                {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
            </button>

            {/* Content */}
            {isExpanded && (
                <div className="border-t border-gray-100 p-4 bg-gray-50/50">
                    {fields.length > 0 ? (
                        <div className="space-y-4">
                            {fields.map((field) => (
                                <div key={field.key}>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">
                                        {field.label}
                                    </label>
                                    {field.type === 'textarea' ? (
                                        <textarea
                                            value={content[field.key] || ''}
                                            onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                            placeholder={field.placeholder}
                                            rows={2}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            value={content[field.key] || ''}
                                            onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                            placeholder={field.placeholder}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                        />
                                    )}
                                </div>
                            ))}

                            {/* Save Button */}
                            <div className="flex items-center justify-end gap-3 pt-2">
                                {saveStatus === 'saved' && (
                                    <span className="text-sm text-green-600">✓ Сохранено</span>
                                )}
                                {saveStatus === 'error' && (
                                    <span className="text-sm text-red-600">Ошибка сохранения</span>
                                )}
                                <button
                                    onClick={handleSave}
                                    disabled={isPending}
                                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4" />
                                    )}
                                    Сохранить
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-4 text-gray-500 text-sm">
                            Для этого типа блока нет настраиваемых полей
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

interface ProjectBlockListProps {
    projectId: string;
    templateBlocks: TemplateBlock[];
    projectContent: ProjectContent[];
}

export function ProjectBlockList({
    projectId,
    templateBlocks,
    projectContent,
}: ProjectBlockListProps) {
    return (
        <div className="space-y-4">
            {templateBlocks.map((block) => {
                const customContent = projectContent.find(
                    (c) => c.block_type === block.block_type
                );

                return (
                    <BlockAccordionItem
                        key={block.id}
                        projectId={projectId}
                        block={block}
                        initialContent={(customContent?.content as Record<string, unknown>) || null}
                    />
                );
            })}
        </div>
    );
}
