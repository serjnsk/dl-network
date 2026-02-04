'use client';

import { useState, useTransition } from 'react';
import { RefreshCw, Loader2 } from 'lucide-react';
import { syncDomainsFromCloudflare } from './actions';

export function SyncDomainsButton() {
    const [isPending, startTransition] = useTransition();
    const [result, setResult] = useState<{
        imported?: number;
        skipped?: number;
        error?: string;
    } | null>(null);

    const handleSync = () => {
        setResult(null);
        startTransition(async () => {
            const res = await syncDomainsFromCloudflare();
            setResult(res);
        });
    };

    return (
        <div className="flex items-center gap-3">
            <button
                onClick={handleSync}
                disabled={isPending}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
                {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <RefreshCw className="h-4 w-4" />
                )}
                Синхронизировать с Cloudflare
            </button>

            {result && (
                <span className="text-sm">
                    {result.error ? (
                        <span className="text-red-600">{result.error}</span>
                    ) : (
                        <span className="text-green-600">
                            Импортировано: {result.imported}, пропущено: {result.skipped}
                        </span>
                    )}
                </span>
            )}
        </div>
    );
}
