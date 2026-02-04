import { DashboardLayout } from '@/components/layout';
import { createAdminClient } from '@/lib/supabase/server';
import { Palette, Plus, FileCode, CheckCircle, AlertCircle, Download, Upload } from 'lucide-react';
import Link from 'next/link';

export default async function DesignsPage() {
    const supabase = await createAdminClient();

    const { data: designFiles, error } = await supabase
        .from('design_files')
        .select('*')
        .order('created_at', { ascending: false });

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Дизайн-система
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Управление CSS через Stitch
                    </p>
                </div>
                <Link
                    href="/designs/new"
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                    <Plus className="h-4 w-4" />
                    Добавить дизайн
                </Link>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Design Files List */}
                <div className="lg:col-span-2">
                    <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
                        <div className="border-b border-gray-200 p-4 dark:border-gray-800">
                            <h2 className="font-semibold text-gray-900 dark:text-white">
                                Загруженные дизайны
                            </h2>
                        </div>

                        {error ? (
                            <div className="p-4 text-red-600">Ошибка: {error.message}</div>
                        ) : designFiles?.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
                                    <Palette className="h-8 w-8 text-gray-400" />
                                </div>
                                <p className="mb-2 text-gray-500">Нет загруженных дизайнов</p>
                                <p className="text-sm text-gray-400">
                                    Экспортируйте CSS из Stitch и загрузите сюда
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                {designFiles?.map((file) => (
                                    <div
                                        key={file.id}
                                        className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-900"
                                    >
                                        <div className="flex items-center gap-3">
                                            <FileCode className="h-5 w-5 text-blue-500" />
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {file.name}
                                                </p>
                                                <p className="text-sm text-gray-500">{file.css_url}</p>
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-400">
                                            {new Date(file.created_at).toLocaleDateString('ru-RU')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Stitch Instructions */}
                <div className="space-y-6">
                    {/* Instructions Card */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
                        <div className="mb-4 flex items-center gap-2">
                            <Download className="h-5 w-5 text-blue-500" />
                            <h2 className="font-semibold text-gray-900 dark:text-white">
                                Экспорт из Stitch
                            </h2>
                        </div>

                        <div className="space-y-4 text-sm">
                            <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                                <h3 className="mb-2 font-medium text-blue-800 dark:text-blue-300">
                                    Шаг 1: Откройте Stitch
                                </h3>
                                <p className="text-blue-700 dark:text-blue-400">
                                    Перейдите в ваш проект Stitch и выберите нужный дизайн
                                </p>
                            </div>

                            <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                                <h3 className="mb-2 font-medium text-blue-800 dark:text-blue-300">
                                    Шаг 2: Экспортируйте CSS
                                </h3>
                                <p className="text-blue-700 dark:text-blue-400">
                                    Нажмите <strong>Export → CSS File</strong> или используйте хоткей <code className="rounded bg-blue-200 px-1 dark:bg-blue-800">Cmd+Shift+E</code>
                                </p>
                            </div>

                            <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                                <h3 className="mb-2 font-medium text-blue-800 dark:text-blue-300">
                                    Шаг 3: Настройки экспорта
                                </h3>
                                <ul className="list-inside list-disc space-y-1 text-blue-700 dark:text-blue-400">
                                    <li>Format: <strong>CSS Variables</strong></li>
                                    <li>Prefix: <strong>--dl-</strong></li>
                                    <li>Include: <strong>All tokens</strong></li>
                                    <li>Output: <strong>Single file</strong></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Expected Format */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
                        <div className="mb-4 flex items-center gap-2">
                            <FileCode className="h-5 w-5 text-green-500" />
                            <h2 className="font-semibold text-gray-900 dark:text-white">
                                Формат CSS файла
                            </h2>
                        </div>

                        <pre className="overflow-x-auto rounded-lg bg-gray-900 p-4 text-xs text-green-400">
                            {`:root {
  /* Colors */
  --dl-color-primary: #3b82f6;
  --dl-color-secondary: #8b5cf6;
  --dl-color-background: #ffffff;
  --dl-color-text: #1f2937;
  
  /* Typography */
  --dl-font-family: 'Inter', sans-serif;
  --dl-font-size-base: 16px;
  --dl-font-size-lg: 1.125rem;
  --dl-font-size-xl: 1.25rem;
  
  /* Spacing */
  --dl-spacing-xs: 0.25rem;
  --dl-spacing-sm: 0.5rem;
  --dl-spacing-md: 1rem;
  --dl-spacing-lg: 1.5rem;
  
  /* Border Radius */
  --dl-radius-sm: 0.25rem;
  --dl-radius-md: 0.5rem;
  --dl-radius-lg: 1rem;
}`}
                        </pre>
                    </div>

                    {/* JSON Variables */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
                        <div className="mb-4 flex items-center gap-2">
                            <Upload className="h-5 w-5 text-purple-500" />
                            <h2 className="font-semibold text-gray-900 dark:text-white">
                                JSON формат (альтернатива)
                            </h2>
                        </div>

                        <p className="mb-3 text-sm text-gray-500">
                            Также можно загрузить JSON с переменными:
                        </p>

                        <pre className="overflow-x-auto rounded-lg bg-gray-900 p-4 text-xs text-purple-400">
                            {`{
  "colors": {
    "primary": "#3b82f6",
    "secondary": "#8b5cf6"
  },
  "typography": {
    "fontFamily": "Inter, sans-serif",
    "fontSize": { "base": "16px" }
  },
  "spacing": {
    "xs": "0.25rem",
    "sm": "0.5rem"
  }
}`}
                        </pre>
                    </div>

                    {/* Checklist */}
                    <div className="rounded-xl border border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-900/20">
                        <h2 className="mb-4 font-semibold text-green-800 dark:text-green-300">
                            Чеклист перед загрузкой
                        </h2>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2 text-green-700 dark:text-green-400">
                                <CheckCircle className="h-4 w-4" />
                                CSS переменные начинаются с <code>--dl-</code>
                            </li>
                            <li className="flex items-center gap-2 text-green-700 dark:text-green-400">
                                <CheckCircle className="h-4 w-4" />
                                Все цвета в формате HEX или RGB
                            </li>
                            <li className="flex items-center gap-2 text-green-700 dark:text-green-400">
                                <CheckCircle className="h-4 w-4" />
                                Шрифты подключены через Google Fonts
                            </li>
                            <li className="flex items-center gap-2 text-green-700 dark:text-green-400">
                                <CheckCircle className="h-4 w-4" />
                                Размеры в rem/em (не px где возможно)
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
