'use client';

import { useState, useTransition } from 'react';
import { Code, Save, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { updateGlobalCode } from '../actions';

interface GlobalCodeEditorProps {
    projectId: string;
    initialHeadCode: string;
    initialBodyCode: string;
}

export function GlobalCodeEditor({
    projectId,
    initialHeadCode,
    initialBodyCode,
}: GlobalCodeEditorProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [headCode, setHeadCode] = useState(initialHeadCode || '');
    const [bodyCode, setBodyCode] = useState(initialBodyCode || '');
    const [isPending, startTransition] = useTransition();
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSave = () => {
        startTransition(async () => {
            const result = await updateGlobalCode(projectId, headCode, bodyCode);
            if (result.error) {
                setError(result.error);
                setSaved(false);
            } else {
                setSaved(true);
                setError(null);
                setTimeout(() => setSaved(false), 2000);
            }
        });
    };

    const hasChanges = headCode !== (initialHeadCode || '') || bodyCode !== (initialBodyCode || '');

    return (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            {/* Header */}
            <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <Code className="h-5 w-5 text-purple-500" />
                    <div>
                        <p className="font-medium text-gray-900">Глобальный код</p>
                        <p className="text-xs text-gray-500">
                            Analytics, Meta теги, виджеты
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {(headCode || bodyCode) && (
                        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700">
                            Настроено
                        </span>
                    )}
                    {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                </div>
            </div>

            {/* Content */}
            {isExpanded && (
                <div className="border-t border-gray-200 p-4 space-y-4">
                    {error && (
                        <div className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</div>
                    )}

                    {/* Head Code */}
                    <div>
                        <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700">
                            <span>Код в &lt;head&gt;</span>
                            <span className="text-xs font-normal text-gray-400">
                                (все страницы)
                            </span>
                        </label>
                        <textarea
                            value={headCode}
                            onChange={(e) => setHeadCode(e.target.value)}
                            placeholder={`<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXX');
</script>`}
                            rows={6}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm placeholder:text-gray-400"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Вставляется перед &lt;/head&gt;
                        </p>
                    </div>

                    {/* Body Code */}
                    <div>
                        <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700">
                            <span>Код в конце &lt;body&gt;</span>
                            <span className="text-xs font-normal text-gray-400">
                                (все страницы)
                            </span>
                        </label>
                        <textarea
                            value={bodyCode}
                            onChange={(e) => setBodyCode(e.target.value)}
                            placeholder={`<!-- Yandex.Metrika counter -->
<script type="text/javascript" >
   (function(m,e,t,r,i,k,a){...})(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
   ym(XXXXX, "init", { clickmap:true, trackLinks:true });
</script>`}
                            rows={6}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm placeholder:text-gray-400"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Вставляется перед &lt;/body&gt;
                        </p>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={isPending || !hasChanges}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
                        >
                            {isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            {saved ? 'Сохранено ✓' : 'Сохранить'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
