import { DashboardLayout } from '@/components/layout';
import { Palette, Construction } from 'lucide-react';

export default function DesignsPage() {
    return (
        <DashboardLayout>
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-6 rounded-full bg-gray-100 p-6 dark:bg-gray-800">
                    <Palette className="h-12 w-12 text-gray-400" />
                </div>
                <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                    Дизайн-система
                </h1>
                <p className="mb-4 max-w-md text-gray-500 dark:text-gray-400">
                    Здесь будет управление CSS через Stitch и дизайн-токенами
                </p>
                <div className="inline-flex items-center gap-2 rounded-full bg-yellow-100 px-4 py-2 text-sm text-yellow-700">
                    <Construction className="h-4 w-4" />
                    В разработке
                </div>
            </div>
        </DashboardLayout>
    );
}
