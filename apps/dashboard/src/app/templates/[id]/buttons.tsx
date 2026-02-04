'use client';

import { useState, useTransition } from 'react';
import { Trash2, Loader2, Power, PowerOff } from 'lucide-react';
import { deleteTemplate, toggleTemplateActive } from '../actions';

interface DeleteButtonProps {
    templateId: string;
    templateName: string;
    hasProjects: boolean;
}

export function DeleteButton({ templateId, templateName, hasProjects }: DeleteButtonProps) {
    const [isPending, startTransition] = useTransition();
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = () => {
        setError(null);
        startTransition(async () => {
            const result = await deleteTemplate(templateId);
            if (result.error) {
                setError(result.error);
                setShowConfirm(false);
            }
        });
    };

    if (showConfirm) {
        return (
            <div className="space-y-3">
                <p className="text-sm font-medium text-red-700 dark:text-red-400">
                    Вы уверены, что хотите удалить "{templateName}"?
                </p>
                {error && (
                    <p className="text-sm text-red-600">{error}</p>
                )}
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
        <>
            {error && (
                <p className="mb-2 text-sm text-red-600">{error}</p>
            )}
            <button
                onClick={() => hasProjects ? setError('Нельзя удалить: шаблон используется в проектах') : setShowConfirm(true)}
                className="w-full rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/30"
            >
                <Trash2 className="mr-2 inline h-4 w-4" />
                Удалить шаблон
            </button>
        </>
    );
}

interface ToggleActiveButtonProps {
    templateId: string;
    isActive: boolean;
}

export function ToggleActiveButton({ templateId, isActive }: ToggleActiveButtonProps) {
    const [isPending, startTransition] = useTransition();

    const handleToggle = () => {
        startTransition(async () => {
            await toggleTemplateActive(templateId, !isActive);
        });
    };

    return (
        <button
            onClick={handleToggle}
            disabled={isPending}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${isActive
                    ? 'border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
        >
            {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : isActive ? (
                <PowerOff className="h-4 w-4" />
            ) : (
                <Power className="h-4 w-4" />
            )}
            {isActive ? 'Деактивировать' : 'Активировать'}
        </button>
    );
}
