'use client';

import { useState, useTransition } from 'react';
import { Plus, FileCode, Trash2, Pencil, Save, Loader2, X, ChevronDown, ChevronUp } from 'lucide-react';
import { createProjectPage, updateProjectPage, deleteProjectPage } from '../actions';

interface ProjectPage {
    id: string;
    slug: string;
    title: string;
    html_content: string;
    page_order: number;
}

interface ProjectPagesManagerProps {
    projectId: string;
    pages: ProjectPage[];
}

export function ProjectPagesManager({ projectId, pages: initialPages }: ProjectPagesManagerProps) {
    const [pages, setPages] = useState(initialPages);
    const [isAddingPage, setIsAddingPage] = useState(false);
    const [editingPageId, setEditingPageId] = useState<string | null>(null);
    const [expandedPageId, setExpandedPageId] = useState<string | null>(null);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FileCode className="h-5 w-5 text-gray-400" />
                    <h2 className="text-lg font-semibold text-gray-900">Страницы</h2>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                        {pages.length}
                    </span>
                </div>
                <button
                    onClick={() => setIsAddingPage(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                    <Plus className="h-4 w-4" />
                    Добавить
                </button>
            </div>

            {/* Add Page Form */}
            {isAddingPage && (
                <AddPageForm
                    projectId={projectId}
                    onSuccess={(newPage) => {
                        setPages([...pages, newPage]);
                        setIsAddingPage(false);
                    }}
                    onCancel={() => setIsAddingPage(false)}
                />
            )}

            {/* Pages List */}
            {pages.length === 0 && !isAddingPage ? (
                <div className="rounded-lg border-2 border-dashed border-gray-200 py-8 text-center">
                    <FileCode className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">Нет страниц</p>
                    <button
                        onClick={() => setIsAddingPage(true)}
                        className="mt-3 text-sm font-medium text-blue-600 hover:underline"
                    >
                        Добавить первую страницу
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {pages.map((page) => (
                        <PageItem
                            key={page.id}
                            page={page}
                            isExpanded={expandedPageId === page.id}
                            isEditing={editingPageId === page.id}
                            onToggleExpand={() => setExpandedPageId(expandedPageId === page.id ? null : page.id)}
                            onEdit={() => setEditingPageId(page.id)}
                            onCancelEdit={() => setEditingPageId(null)}
                            onUpdate={(updated) => {
                                setPages(pages.map(p => p.id === updated.id ? updated : p));
                                setEditingPageId(null);
                            }}
                            onDelete={() => setPages(pages.filter(p => p.id !== page.id))}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// Add Page Form
function AddPageForm({
    projectId,
    onSuccess,
    onCancel,
}: {
    projectId: string;
    onSuccess: (page: ProjectPage) => void;
    onCancel: () => void;
}) {
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [htmlContent, setHtmlContent] = useState('');
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = () => {
        if (!title || !slug) {
            setError('Заполните название и slug');
            return;
        }

        startTransition(async () => {
            const result = await createProjectPage(projectId, title, slug, htmlContent);
            if (result.error) {
                setError(result.error);
            } else if (result.pageId) {
                onSuccess({
                    id: result.pageId,
                    title,
                    slug,
                    html_content: htmlContent,
                    page_order: 0,
                });
            }
        });
    };

    return (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <div className="mb-3 flex items-center justify-between">
                <h3 className="font-medium text-blue-900">Новая страница</h3>
                <button onClick={onCancel} className="text-blue-600 hover:text-blue-800">
                    <X className="h-5 w-5" />
                </button>
            </div>

            {error && (
                <div className="mb-3 rounded-lg bg-red-100 p-2 text-sm text-red-700">{error}</div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Название</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Главная"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Slug (URL)</label>
                    <input
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        placeholder="index"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        {slug === 'index' ? '→ /' : slug ? `→ /${slug}/` : ''}
                    </p>
                </div>
            </div>

            <div className="mt-3">
                <label className="mb-1 block text-sm font-medium text-gray-700">HTML код</label>
                <textarea
                    value={htmlContent}
                    onChange={(e) => setHtmlContent(e.target.value)}
                    placeholder="<!DOCTYPE html>..."
                    rows={10}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm"
                />
            </div>

            <div className="mt-4 flex justify-end gap-2">
                <button
                    onClick={onCancel}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    Отмена
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={isPending}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Сохранить
                </button>
            </div>
        </div>
    );
}

// Page Item
function PageItem({
    page,
    isExpanded,
    isEditing,
    onToggleExpand,
    onEdit,
    onCancelEdit,
    onUpdate,
    onDelete,
}: {
    page: ProjectPage;
    isExpanded: boolean;
    isEditing: boolean;
    onToggleExpand: () => void;
    onEdit: () => void;
    onCancelEdit: () => void;
    onUpdate: (page: ProjectPage) => void;
    onDelete: () => void;
}) {
    const [title, setTitle] = useState(page.title);
    const [slug, setSlug] = useState(page.slug);
    const [htmlContent, setHtmlContent] = useState(page.html_content);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const handleSave = () => {
        startTransition(async () => {
            const result = await updateProjectPage(page.id, title, slug, htmlContent);
            if (result.error) {
                setError(result.error);
            } else {
                onUpdate({ ...page, title, slug, html_content: htmlContent });
            }
        });
    };

    const handleDelete = () => {
        if (!confirm(`Удалить страницу "${page.title}"?`)) return;

        startTransition(async () => {
            const result = await deleteProjectPage(page.id);
            if (result.error) {
                setError(result.error);
            } else {
                onDelete();
            }
        });
    };

    return (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            {/* Header */}
            <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                onClick={onToggleExpand}
            >
                <div className="flex items-center gap-3">
                    <FileCode className="h-5 w-5 text-blue-500" />
                    <div>
                        <p className="font-medium text-gray-900">{page.title}</p>
                        <p className="text-xs text-gray-500 font-mono">
                            {page.slug === 'index' ? '/' : `/${page.slug}/`}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                        {page.html_content.length} символов
                    </span>
                    {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                </div>
            </div>

            {/* Content */}
            {isExpanded && (
                <div className="border-t border-gray-200 p-4">
                    {error && (
                        <div className="mb-3 rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</div>
                    )}

                    {isEditing ? (
                        <>
                            <div className="grid gap-3 sm:grid-cols-2 mb-3">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Название</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Slug</label>
                                    <input
                                        type="text"
                                        value={slug}
                                        onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm"
                                    />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="mb-1 block text-sm font-medium text-gray-700">HTML код</label>
                                <textarea
                                    value={htmlContent}
                                    onChange={(e) => setHtmlContent(e.target.value)}
                                    rows={15}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={onCancelEdit}
                                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    Отмена
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isPending}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    Сохранить
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <pre className="max-h-60 overflow-auto rounded-lg bg-gray-900 p-4 text-xs text-green-400">
                                {page.html_content || '(пустая страница)'}
                            </pre>
                            <div className="mt-3 flex justify-end gap-2">
                                <button
                                    onClick={handleDelete}
                                    disabled={isPending}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Удалить
                                </button>
                                <button
                                    onClick={onEdit}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    <Pencil className="h-4 w-4" />
                                    Редактировать
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
