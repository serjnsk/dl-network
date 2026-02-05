import { DashboardLayout } from '@/components/layout';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ProjectForm } from '../project-form';

export default async function NewProjectPage() {
    return (
        <DashboardLayout>
            {/* Header */}
            <div className="mb-8">
                <Link
                    href="/projects"
                    className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Назад к проектам
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Создать проект
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Заполните информацию для нового проекта
                </p>
            </div>

            {/* Form Card */}
            <div className="mx-auto max-w-2xl rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
                <ProjectForm />
            </div>
        </DashboardLayout>
    );
}
