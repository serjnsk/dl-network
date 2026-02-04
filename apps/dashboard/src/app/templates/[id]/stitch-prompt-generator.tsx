'use client';

import { useState } from 'react';
import { Wand2, Copy, Check, X, ExternalLink } from 'lucide-react';

// Рыбные данные для каждого типа блока
const PLACEHOLDER_DATA: Record<string, Record<string, string>> = {
    hero: {
        title: 'Создавайте сайты быстрее',
        subtitle: 'Конструктор лендингов с AI-дизайном. Запустите профессиональный сайт за 10 минут.',
        buttonText: 'Попробовать бесплатно',
        buttonUrl: '#pricing',
        backgroundImage: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1920',
    },
    features: {
        title: 'Почему выбирают нас',
        feature1Title: 'Быстрый запуск',
        feature1Description: 'Создайте и опубликуйте сайт за несколько минут, а не дней.',
        feature2Title: 'AI-дизайн',
        feature2Description: 'Интеллектуальная система подбирает стили под ваш бренд.',
        feature3Title: 'Без кода',
        feature3Description: 'Визуальный редактор — никаких технических навыков не требуется.',
    },
    cta: {
        title: 'Готовы начать?',
        description: 'Присоединяйтесь к тысячам предпринимателей, которые уже используют нашу платформу.',
        buttonText: 'Создать сайт',
        buttonUrl: '#signup',
    },
    testimonials: {
        title: 'Отзывы клиентов',
        testimonial1Name: 'Анна Петрова, CEO StartupX',
        testimonial1Text: 'Отличный инструмент! Создали корпоративный сайт за один вечер.',
        testimonial2Name: 'Михаил Иванов, Фрилансер',
        testimonial2Text: 'Экономит огромное количество времени. Рекомендую всем!',
    },
    pricing: {
        title: 'Тарифы',
        plan1Name: 'Базовый',
        plan1Price: '990 ₽/мес',
        plan1Features: '1 сайт\n5 ГБ хранилища\nSSL сертификат',
        plan2Name: 'Про',
        plan2Price: '2990 ₽/мес',
        plan2Features: '10 сайтов\n50 ГБ хранилища\nПриоритетная поддержка',
    },
    faq: {
        title: 'Часто задаваемые вопросы',
        q1: 'Нужны ли навыки программирования?',
        a1: 'Нет, наш конструктор полностью визуальный и не требует знания кода.',
        q2: 'Можно ли подключить свой домен?',
        a2: 'Да, вы можете подключить любой домен в личном кабинете.',
        q3: 'Есть ли пробный период?',
        a3: 'Да, первые 14 дней бесплатно на любом тарифе.',
    },
    contact: {
        title: 'Связаться с нами',
        email: 'hello@example.com',
        phone: '+7 (495) 123-45-67',
        address: 'Москва, ул. Тверская, 1',
    },
    gallery: {
        title: 'Наши работы',
        image1: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
        image2: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800',
        image3: 'https://images.unsplash.com/photo-1522542550221-31fd8575f2b2?w=800',
        image4: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800',
    },
    footer: {
        copyright: '© 2025 Company Name. Все права защищены.',
        links: 'Политика конфиденциальности|/privacy\nУсловия использования|/terms\nКонтакты|/contact',
    },
};

// Конфигурация полей для каждого типа блока
const BLOCK_FIELDS: Record<string, { key: string; label: string; type: 'text' | 'textarea' }[]> = {
    hero: [
        { key: 'title', label: 'Заголовок', type: 'text' },
        { key: 'subtitle', label: 'Подзаголовок', type: 'textarea' },
        { key: 'buttonText', label: 'Текст кнопки', type: 'text' },
        { key: 'buttonUrl', label: 'Ссылка кнопки', type: 'text' },
        { key: 'backgroundImage', label: 'Фоновое изображение', type: 'text' },
    ],
    features: [
        { key: 'title', label: 'Заголовок секции', type: 'text' },
        { key: 'feature1Title', label: 'Преимущество 1 — Заголовок', type: 'text' },
        { key: 'feature1Description', label: 'Преимущество 1 — Описание', type: 'textarea' },
        { key: 'feature2Title', label: 'Преимущество 2 — Заголовок', type: 'text' },
        { key: 'feature2Description', label: 'Преимущество 2 — Описание', type: 'textarea' },
        { key: 'feature3Title', label: 'Преимущество 3 — Заголовок', type: 'text' },
        { key: 'feature3Description', label: 'Преимущество 3 — Описание', type: 'textarea' },
    ],
    cta: [
        { key: 'title', label: 'Заголовок', type: 'text' },
        { key: 'description', label: 'Описание', type: 'textarea' },
        { key: 'buttonText', label: 'Текст кнопки', type: 'text' },
        { key: 'buttonUrl', label: 'Ссылка', type: 'text' },
    ],
    testimonials: [
        { key: 'title', label: 'Заголовок', type: 'text' },
        { key: 'testimonial1Name', label: 'Отзыв 1 — Имя', type: 'text' },
        { key: 'testimonial1Text', label: 'Отзыв 1 — Текст', type: 'textarea' },
        { key: 'testimonial2Name', label: 'Отзыв 2 — Имя', type: 'text' },
        { key: 'testimonial2Text', label: 'Отзыв 2 — Текст', type: 'textarea' },
    ],
    pricing: [
        { key: 'title', label: 'Заголовок', type: 'text' },
        { key: 'plan1Name', label: 'Тариф 1 — Название', type: 'text' },
        { key: 'plan1Price', label: 'Тариф 1 — Цена', type: 'text' },
        { key: 'plan1Features', label: 'Тариф 1 — Возможности', type: 'textarea' },
        { key: 'plan2Name', label: 'Тариф 2 — Название', type: 'text' },
        { key: 'plan2Price', label: 'Тариф 2 — Цена', type: 'text' },
        { key: 'plan2Features', label: 'Тариф 2 — Возможности', type: 'textarea' },
    ],
    faq: [
        { key: 'title', label: 'Заголовок', type: 'text' },
        { key: 'q1', label: 'Вопрос 1', type: 'text' },
        { key: 'a1', label: 'Ответ 1', type: 'textarea' },
        { key: 'q2', label: 'Вопрос 2', type: 'text' },
        { key: 'a2', label: 'Ответ 2', type: 'textarea' },
        { key: 'q3', label: 'Вопрос 3', type: 'text' },
        { key: 'a3', label: 'Ответ 3', type: 'textarea' },
    ],
    contact: [
        { key: 'title', label: 'Заголовок', type: 'text' },
        { key: 'email', label: 'Email', type: 'text' },
        { key: 'phone', label: 'Телефон', type: 'text' },
        { key: 'address', label: 'Адрес', type: 'textarea' },
    ],
    gallery: [
        { key: 'title', label: 'Заголовок', type: 'text' },
        { key: 'image1', label: 'Изображение 1 URL', type: 'text' },
        { key: 'image2', label: 'Изображение 2 URL', type: 'text' },
        { key: 'image3', label: 'Изображение 3 URL', type: 'text' },
        { key: 'image4', label: 'Изображение 4 URL', type: 'text' },
    ],
    footer: [
        { key: 'copyright', label: 'Копирайт', type: 'text' },
        { key: 'links', label: 'Ссылки', type: 'textarea' },
    ],
};

const BLOCK_LABELS: Record<string, string> = {
    hero: 'Hero секция',
    features: 'Преимущества',
    cta: 'Призыв к действию',
    testimonials: 'Отзывы',
    pricing: 'Тарифы',
    faq: 'FAQ',
    contact: 'Контакты',
    gallery: 'Галерея',
    footer: 'Подвал',
};

interface Block {
    id: string;
    block_type: string;
    block_order: number;
    default_content: Record<string, unknown>;
}

interface StitchPromptGeneratorProps {
    templateName: string;
    blocks: Block[];
}

export function StitchPromptGenerator({ templateName, blocks }: StitchPromptGeneratorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [referenceUrl, setReferenceUrl] = useState('');
    const [copied, setCopied] = useState(false);

    const generatePrompt = () => {
        const structure = {
            template: templateName,
            blocks: blocks.map((block) => {
                const fields = BLOCK_FIELDS[block.block_type] || [];
                const placeholders = PLACEHOLDER_DATA[block.block_type] || {};

                return {
                    type: block.block_type,
                    label: BLOCK_LABELS[block.block_type] || block.block_type,
                    order: block.block_order,
                    fields: fields.map((f) => ({
                        key: f.key,
                        label: f.label,
                        type: f.type,
                        sampleValue: placeholders[f.key] || '',
                    })),
                };
            }),
        };

        const structureJson = JSON.stringify(structure, null, 2);

        const prompt = `# Задание для Stitch

Создай современный landing page на основе следующей структуры блоков.

## Часть 1: Структура шаблона

\`\`\`json
${structureJson}
\`\`\`

## Часть 2: Референс стиля

${referenceUrl
                ? `Используй следующий сайт как референс для стилей, цветов, типографики и общего визуального оформления:
**${referenceUrl}**

Адаптируй визуальный стиль с этого сайта, сохраняя структуру блоков из Части 1.`
                : `[Вставьте URL сайта-референса для стилей]`
            }

## Требования к реализации

1. **Структура**: Строго следуй иерархии блоков из JSON
2. **CSS переменные**: Используй prefix \`--dl-\` для всех custom properties
3. **Адаптивность**: Mobile-first подход, breakpoints для tablet и desktop
4. **Семантика**: Используй правильные HTML5 теги (section, article, nav)
5. **Доступность**: ARIA-атрибуты где необходимо

## Формат вывода

Верни HTML + CSS в формате, готовом для экспорта. CSS должен содержать все стили через CSS Variables для легкой кастомизации.`;

        return prompt;
    };

    const handleCopy = async () => {
        const prompt = generatePrompt();
        await navigator.clipboard.writeText(prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:from-purple-700 hover:to-blue-700"
            >
                <Wand2 className="h-4 w-4" />
                Сформировать промпт для Stitch
            </button>
        );
    }

    return (
        <div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50 p-6">
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Wand2 className="h-5 w-5 text-purple-600" />
                    <h3 className="font-semibold text-gray-900">Генератор промпта для Stitch</h3>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            {/* Reference URL */}
            <div className="mb-4">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    URL сайта-референса (опционально)
                </label>
                <div className="flex gap-2">
                    <input
                        type="url"
                        value={referenceUrl}
                        onChange={(e) => setReferenceUrl(e.target.value)}
                        placeholder="https://example.com"
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                    {referenceUrl && (
                        <a
                            href={referenceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
                        >
                            <ExternalLink className="h-4 w-4" />
                        </a>
                    )}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                    Stitch возьмет стили, цвета и типографику с этого сайта
                </p>
            </div>

            {/* Preview */}
            <div className="mb-4">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Предпросмотр промпта
                </label>
                <pre className="max-h-64 overflow-auto rounded-lg bg-gray-900 p-4 text-xs text-green-400">
                    {generatePrompt()}
                </pre>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                <button
                    onClick={handleCopy}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-700"
                >
                    {copied ? (
                        <>
                            <Check className="h-4 w-4" />
                            Скопировано!
                        </>
                    ) : (
                        <>
                            <Copy className="h-4 w-4" />
                            Скопировать промпт
                        </>
                    )}
                </button>
                <a
                    href="https://stitch.withgoogle.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                    <ExternalLink className="h-4 w-4" />
                    Открыть Stitch
                </a>
            </div>
        </div>
    );
}
