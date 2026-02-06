'use client';

import { useState } from 'react';
import { login } from '@/lib/auth';
import { Lock, Loader2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null);
    const [isPending, setIsPending] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        setError(null);
        setIsPending(true);

        try {
            const result = await login(formData);
            if (result?.error) {
                setError(result.error);
            }
        } catch {
            // Redirect happens on success, this catches any other errors
        } finally {
            setIsPending(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <div className="w-full max-w-md px-6">
                <div className="rounded-2xl border border-gray-700 bg-gray-800/50 p-8 shadow-2xl backdrop-blur-sm">
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600/20">
                            <Lock className="h-8 w-8 text-blue-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-white">DL Network</h1>
                        <p className="mt-2 text-gray-400">Введите пароль для доступа</p>
                    </div>

                    <form action={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-3 text-red-400">
                                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                                Пароль
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                required
                                autoFocus
                                className="mt-2 block w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Вход...
                                </>
                            ) : (
                                'Войти'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
