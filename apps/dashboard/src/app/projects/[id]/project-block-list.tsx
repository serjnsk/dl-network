'use client';

import { useState } from 'react';
import { BlockContentEditor } from './block-content-editor';

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
    const [editingBlock, setEditingBlock] = useState<{
        type: string;
        label: string;
        content: Record<string, unknown> | null;
    } | null>(null);

    const handleEditBlock = (block: TemplateBlock) => {
        // Find custom content or use default
        const customContent = projectContent.find(
            (c) => c.block_type === block.block_type
        );

        setEditingBlock({
            type: block.block_type,
            label: getBlockLabel(block.block_type),
            content: (customContent?.content as Record<string, unknown>) || block.default_content || null,
        });
    };

    const handleCloseEditor = () => {
        setEditingBlock(null);
    };

    const handleSaveSuccess = () => {
        setEditingBlock(null);
        // The page will be revalidated by the server action
    };

    return (
        <>
            <div className="space-y-3">
                {templateBlocks.map((block) => {
                    const customContent = projectContent.find(
                        (c) => c.block_type === block.block_type
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
                            <button
                                onClick={() => handleEditBlock(block)}
                                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:border-gray-400"
                            >
                                Редактировать
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Editor Modal */}
            {editingBlock && (
                <BlockContentEditor
                    projectId={projectId}
                    blockType={editingBlock.type}
                    blockLabel={editingBlock.label}
                    initialContent={editingBlock.content}
                    onClose={handleCloseEditor}
                    onSave={handleSaveSuccess}
                />
            )}
        </>
    );
}
