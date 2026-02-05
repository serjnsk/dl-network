'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { createProject, type ActionState } from './actions';

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
            {pending ? 'Создание...' : 'Создать проект'}
        </button>
    );
}

export function ProjectForm() {
    const [state, formAction] = useActionState<ActionState, FormData>(
        createProject,
        {}
    );

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    };

    return (
        <form action={formAction} className="space-y-6">
            {state.error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {state.error}
                </div>
            )}

            {/* Project Name */}
            <div>
                <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                >
                    Название проекта
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    placeholder="Мой новый проект"
                    onChange={(e) => {
                        const slugInput = document.getElementById('slug') as HTMLInputElement;
                        if (slugInput && !slugInput.dataset.edited) {
                            slugInput.value = generateSlug(e.target.value);
                        }
                    }}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
            </div>

            {/* Slug */}
            <div>
                <label
                    htmlFor="slug"
                    className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                >
                    Slug (URL-идентификатор)
                </label>
                <input
                    type="text"
                    id="slug"
                    name="slug"
                    required
                    placeholder="my-new-project"
                    pattern="[a-z0-9-]+"
                    onInput={(e) => {
                        (e.target as HTMLInputElement).dataset.edited = 'true';
                    }}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-mono text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
                <p className="mt-1 text-xs text-gray-500">
                    Только строчные буквы, цифры и дефисы
                </p>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3 border-t border-gray-200 pt-6 dark:border-gray-800">
                <a
                    href="/projects"
                    className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                    Отмена
                </a>
                <SubmitButton />
            </div>
        </form>
    );
}
