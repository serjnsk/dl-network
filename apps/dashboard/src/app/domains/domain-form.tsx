'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { createDomain, type ActionState } from './actions';

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
            {pending ? 'Добавление...' : 'Добавить домен'}
        </button>
    );
}

export function DomainForm() {
    const [state, formAction] = useActionState<ActionState, FormData>(
        createDomain,
        {}
    );

    return (
        <form action={formAction} className="space-y-6">
            {state.error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {state.error}
                </div>
            )}

            {/* Domain Name */}
            <div>
                <label
                    htmlFor="domain_name"
                    className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                >
                    Доменное имя
                </label>
                <input
                    type="text"
                    id="domain_name"
                    name="domain_name"
                    required
                    placeholder="example.com"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
                <p className="mt-1 text-sm text-gray-500">
                    Введите домен без http:// и www.
                </p>
            </div>

            {/* Info Box */}
            <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                <h4 className="mb-2 font-medium text-blue-800 dark:text-blue-300">
                    После добавления домена:
                </h4>
                <ol className="list-decimal space-y-1 pl-4 text-sm text-blue-700 dark:text-blue-400">
                    <li>Настройте DNS-записи в панели регистратора</li>
                    <li>Добавьте CNAME запись на ваш Cloudflare Pages проект</li>
                    <li>Дождитесь активации DNS (до 24 часов)</li>
                </ol>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3 border-t border-gray-200 pt-6 dark:border-gray-800">
                <a
                    href="/domains"
                    className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                    Отмена
                </a>
                <SubmitButton />
            </div>
        </form>
    );
}
