'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    FolderKanban,
    Palette,
    Blocks,
    Globe,
    Settings,
} from 'lucide-react';

const navigation = [
    { name: 'Проекты', href: '/projects', icon: FolderKanban },
    { name: 'Шаблоны', href: '/templates', icon: LayoutDashboard },
    { name: 'Блоки', href: '/blocks', icon: Blocks },
    { name: 'Дизайн', href: '/designs', icon: Palette },
    { name: 'Домены', href: '/domains', icon: Globe },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
            {/* Logo */}
            <div className="flex h-16 items-center border-b border-gray-200 px-6 dark:border-gray-800">
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                        <span className="text-sm font-bold text-white">DL</span>
                    </div>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        Network
                    </span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-1 p-4">
                {navigation.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive
                                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white'
                                }`}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Settings at bottom */}
            <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 p-4 dark:border-gray-800">
                <Link
                    href="/settings"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white"
                >
                    <Settings className="h-5 w-5" />
                    Настройки
                </Link>
            </div>
        </aside>
    );
}
