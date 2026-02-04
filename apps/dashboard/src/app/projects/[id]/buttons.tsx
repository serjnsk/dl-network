'use client';

import { useState, useTransition } from 'react';
import { Rocket, Trash2, Loader2 } from 'lucide-react';
import { deleteProject, publishProject } from '../actions';

interface DeleteButtonProps {
    projectId: string;
    projectName: string;
}

export function DeleteButton({ projectId, projectName }: DeleteButtonProps) {
    const [isPending, startTransition] = useTransition();
    const [showConfirm, setShowConfirm] = useState(false);

    const handleDelete = () => {
        startTransition(async () => {
            await deleteProject(projectId);
        });
    };

    if (showConfirm) {
        return (
            <div className="space-y-3">
                <p className="text-sm font-medium text-red-700 dark:text-red-400">
                    Вы уверены, что хотите удалить "{projectName}"?
                </p>
                <div className="flex gap-2">
                    <button
                        onClick={handleDelete}
                        disabled={isPending}
                        className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                    >
                        {isPending ? (
                            <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                        ) : (
                            'Да, удалить'
                        )}
                    </button>
                    <button
                        onClick={() => setShowConfirm(false)}
                        disabled={isPending}
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                        Отмена
                    </button>
                </div>
            </div>
        );
    }

    return (
        <button
            onClick={() => setShowConfirm(true)}
            className="w-full rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/30"
        >
            <Trash2 className="mr-2 inline h-4 w-4" />
            Удалить проект
        </button>
    );
}

interface PublishButtonProps {
    projectId: string;
    status: string;
}

export function PublishButton({ projectId, status }: PublishButtonProps) {
    const [isPending, startTransition] = useTransition();
    const [result, setResult] = useState<{ error?: string; url?: string } | null>(null);

    const handlePublish = () => {
        setResult(null);
        startTransition(async () => {
            const res = await publishProject(projectId);
            if (res.error) {
                setResult({ error: res.error });
            } else if (res.deploymentUrl) {
                setResult({ url: res.deploymentUrl });
            }
        });
    };

    if (status === 'building' || isPending) {
        return (
            <button
                disabled
                className="inline-flex items-center gap-2 rounded-lg bg-yellow-100 px-4 py-2 text-sm font-medium text-yellow-700"
            >
                <Loader2 className="h-4 w-4 animate-spin" />
                Сборка...
            </button>
        );
    }

    return (
        <div className="flex flex-col items-end gap-2">
            {result?.error && (
                <span className="text-sm text-red-600">{result.error}</span>
            )}
            {result?.url && (
                <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-green-600 hover:underline"
                >
                    ✓ Опубликован: {result.url}
                </a>
            )}
            <button
                onClick={handlePublish}
                disabled={isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
            >
                <Rocket className="h-4 w-4" />
                {status === 'published' ? 'Переопубликовать' : 'Опубликовать'}
            </button>
        </div>
    );
}
