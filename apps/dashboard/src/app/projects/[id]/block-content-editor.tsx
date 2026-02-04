'use client';

import { useState, useTransition } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
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

interface BlockContentEditorProps {
    projectId: string;
    blockType: string;
    blockLabel: string;
    initialContent: Record<string, unknown> | null;
    onClose: () => void;
    onSave: () => void;
}

export function BlockContentEditor({
    projectId,
    blockType,
    blockLabel,
    initialContent,
    onClose,
    onSave,
}: BlockContentEditorProps) {
    const fields = BLOCK_FIELDS[blockType] || [];
    const [content, setContent] = useState<Record<string, string>>(
        (initialContent as Record<string, string>) || {}
    );
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const handleFieldChange = (key: string, value: string) => {
        setContent((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        setError(null);
        startTransition(async () => {
            const result = await saveBlockContent(projectId, blockType, content);
            if (result.error) {
                setError(result.error);
            } else {
                onSave();
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">
                        Редактирование: {blockLabel}
                    </h2>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {/* Fields */}
                <div className="space-y-4">
                    {fields.length > 0 ? (
                        fields.map((field) => (
                            <div key={field.key}>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {field.label}
                                </label>
                                {field.type === 'textarea' ? (
                                    <textarea
                                        value={content[field.key] || ''}
                                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                        placeholder={field.placeholder}
                                        rows={3}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    />
                                ) : (
                                    <input
                                        type="text"
                                        value={content[field.key] || ''}
                                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                        placeholder={field.placeholder}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    />
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            Для этого типа блока нет настраиваемых полей
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                    >
                        Отмена
                    </button>
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
        </div>
    );
}
