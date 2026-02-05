'use client';

import { useActionState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { ArrowLeft, Upload, FileCode, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { createDesignFile } from '../actions';

export default function NewDesignPage() {
    const [state, formAction, isPending] = useActionState(createDesignFile, {});

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="mb-8">
                <Link
                    href="/designs"
                    className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Назад к дизайнам
                </Link>

                <h1 className="text-2xl font-bold text-gray-900">
                    Загрузить дизайн из Stitch
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                    Вставьте CSS код, экспортированный из Google Stitch
                </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Form */}
                <div className="lg:col-span-2">
                    <form action={formAction}>
                        <div className="rounded-xl border border-gray-200 bg-white p-6">
                            {state.error && (
                                <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                                    <AlertCircle className="h-4 w-4" />
                                    {state.error}
                                </div>
                            )}

                            {/* Name */}
                            <div className="mb-4">
                                <label
                                    htmlFor="name"
                                    className="mb-1.5 block text-sm font-medium text-gray-700"
                                >
                                    Название дизайна *
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    required
                                    placeholder="Stripe Style"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>

                            {/* CSS Content */}
                            <div className="mb-6">
                                <label
                                    htmlFor="css_content"
                                    className="mb-1.5 block text-sm font-medium text-gray-700"
                                >
                                    CSS код из Stitch *
                                </label>
                                <textarea
                                    id="css_content"
                                    name="css_content"
                                    required
                                    rows={20}
                                    placeholder={`:root {
  /* Colors */
  --dl-color-primary: #635bff;
  --dl-color-secondary: #0a2540;
  --dl-color-background: #ffffff;
  
  /* Typography */
  --dl-font-family: 'Inter', sans-serif;
  --dl-font-size-base: 16px;
  
  /* Spacing */
  --dl-spacing-md: 1rem;
  --dl-radius-lg: 1rem;
}`}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                                <p className="mt-1.5 text-xs text-gray-500">
                                    Вставьте весь CSS код, включая :root с переменными
                                </p>
                            </div>

                            {/* Submit */}
                            <div className="flex justify-end gap-3">
                                <Link
                                    href="/designs"
                                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Отмена
                                </Link>
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                                >
                                    <Upload className="h-4 w-4" />
                                    {isPending ? 'Загрузка...' : 'Загрузить дизайн'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Instructions */}
                <div className="space-y-6">
                    <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
                        <div className="mb-4 flex items-center gap-2">
                            <FileCode className="h-5 w-5 text-blue-600" />
                            <h2 className="font-semibold text-blue-900">
                                Как экспортировать из Stitch
                            </h2>
                        </div>

                        <ol className="space-y-3 text-sm text-blue-800">
                            <li className="flex gap-2">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-200 text-xs font-medium">
                                    1
                                </span>
                                <span>Откройте результат в Stitch</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-200 text-xs font-medium">
                                    2
                                </span>
                                <span>Нажмите на вкладку <strong>Code</strong></span>
                            </li>
                            <li className="flex gap-2">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-200 text-xs font-medium">
                                    3
                                </span>
                                <span>Скопируйте CSS (или HTML+CSS)</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-200 text-xs font-medium">
                                    4
                                </span>
                                <span>Вставьте в поле выше</span>
                            </li>
                        </ol>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-6">
                        <h3 className="mb-3 font-semibold text-gray-900">
                            Что происходит при загрузке
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-start gap-2">
                                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                                CSS переменные автоматически извлекаются
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                                Дизайн можно привязать к шаблону
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                                Стили применятся ко всем блокам
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
