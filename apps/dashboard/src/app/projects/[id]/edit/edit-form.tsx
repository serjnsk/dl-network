'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { updateProject, type ActionState } from '../../actions';

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
            {pending ? 'Сохранение...' : 'Сохранить изменения'}
        </button>
    );
}

interface Template {
    id: string;
    name: string;
    slug: string;
}

interface Project {
    id: string;
    name: string;
    slug: string;
    template_id: string | null;
}

interface EditFormProps {
    project: Project;
    templates: Template[];
}

export function EditForm({ project, templates }: EditFormProps) {
    const updateProjectWithId = updateProject.bind(null, project.id);
    const [state, formAction] = useActionState<ActionState, FormData>(
        updateProjectWithId,
        {}
    );

    return (
        <form action={formAction} className="space-y-6">
            {state.error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {state.error}
                </div>
            )}

            {state.success && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                    Изменения сохранены успешно
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
                    defaultValue={project.name}
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
                    defaultValue={project.slug}
                    pattern="[a-z0-9-]+"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-mono text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
                <p className="mt-1 text-xs text-gray-500">
                    Только строчные буквы, цифры и дефисы
                </p>
            </div>

            {/* Template Selection */}
            <div>
                <label
                    htmlFor="template_id"
                    className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                >
                    Шаблон
                </label>
                <select
                    id="template_id"
                    name="template_id"
                    defaultValue={project.template_id || ''}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                >
                    <option value="">Без шаблона</option>
                    {templates.map((template) => (
                        <option key={template.id} value={template.id}>
                            {template.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3 border-t border-gray-200 pt-6 dark:border-gray-800">
                <a
                    href={`/projects/${project.id}`}
                    className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                    Отмена
                </a>
                <SubmitButton />
            </div>
        </form>
    );
}
