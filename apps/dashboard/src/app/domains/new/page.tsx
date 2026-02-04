import { DashboardLayout } from '@/components/layout';
import { DomainForm } from '../domain-form';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewDomainPage() {
    return (
        <DashboardLayout>
            {/* Header */}
            <div className="mb-8">
                <Link
                    href="/domains"
                    className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Назад к доменам
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Добавить домен
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Добавьте домен для использования в проектах
                </p>
            </div>

            {/* Form */}
            <div className="mx-auto max-w-2xl rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
                <DomainForm />
            </div>
        </DashboardLayout>
    );
}
