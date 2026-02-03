// ===========================================
// Block Registry
// ===========================================

import { BlockType } from './types';

export const BLOCK_TYPES: BlockType[] = ['hero', 'features', 'cta', 'testimonials', 'footer'];

export const BLOCK_LABELS: Record<BlockType, string> = {
    hero: 'Hero Section',
    features: 'Features',
    cta: 'Call to Action',
    testimonials: 'Testimonials',
    footer: 'Footer',
};

export const BLOCK_ICONS: Record<BlockType, string> = {
    hero: '🎯',
    features: '⭐',
    cta: '📢',
    testimonials: '💬',
    footer: '📄',
};

// ===========================================
// Project Statuses
// ===========================================

export const PROJECT_STATUS_LABELS = {
    draft: 'Черновик',
    building: 'Сборка...',
    published: 'Опубликован',
    failed: 'Ошибка',
} as const;

export const PROJECT_STATUS_COLORS = {
    draft: 'gray',
    building: 'yellow',
    published: 'green',
    failed: 'red',
} as const;

// ===========================================
// DNS Statuses
// ===========================================

export const DNS_STATUS_LABELS = {
    pending: 'Ожидание',
    active: 'Активен',
    error: 'Ошибка',
} as const;
