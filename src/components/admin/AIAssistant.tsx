import React, { useState } from 'react';
import { Sparkles, X, Wand2, Loader2, Copy, Check, PenTool } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AIAssistantProps {
    onGenerate: (text: string) => void;
    title?: string;
    placeholder?: string;
    initialValue?: string;
}

export default function AIAssistant({
    onGenerate,
    title = "AI İçerik Asistanı",
    placeholder = "Örnek: Bu hafta sonu yapılacak 5km koşusu için heyecan verici bir açıklama yaz.",
    initialValue = ""
}: AIAssistantProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState('');
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');
    const [mode, setMode] = useState<'create' | 'fix'>('create');

    const handleOpen = (newMode: 'create' | 'fix') => {
        setMode(newMode);
        setIsOpen(true);
        setResult('');
        setError('');

        if (newMode === 'fix') {
            const textToFix = initialValue || '';
            if (!textToFix) {
                setPrompt('Düzeltilecek metin bulunamadı.');
            } else {
                setPrompt(`Aşağıdaki metindeki yazım ve noktalama hatalarını düzelt, anlatım bozukluklarını gider:\n\n"${textToFix}"`);
            }
        } else {
            setPrompt('');
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        setResult('');
        setPrompt('');
        setError('');
    };

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/gemini', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: `${prompt}\n\n(Lütfen yanıtı Türkçe olarak ver. Sadece istenilen içeriği yaz, ekstra açıklama yapma.)`
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('API Error:', errorData);
                // Backend'den gelen detaylı hatayı göster
                const errorMessage = errorData.details || errorData.error || 'AI yanıtı alınamadı.';
                throw new Error(typeof errorMessage === 'object' ? JSON.stringify(errorMessage) : errorMessage);
            }

            const data = await response.json();
            setResult(data.text);
        } catch (err: any) {
            console.error('Generate Error:', err);
            setError(err.message || 'Bir hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleApply = () => {
        onGenerate(result);
        handleClose();
    };

    const handleCopy = async () => {
        await navigator.clipboard.writeText(result);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <>
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={() => handleOpen('create')}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-black bg-lime-500 hover:bg-lime-400 rounded-lg transition-colors shadow-sm hover:shadow-lime-500/20"
                >
                    <Sparkles className="w-4 h-4" />
                    AI ile Oluştur
                </button>

                <button
                    type="button"
                    onClick={() => handleOpen('fix')}
                    title="Mevcut metni düzelt"
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-lime-500 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors border border-gray-700"
                >
                    <PenTool className="w-4 h-4" />
                    AI ile Düzelt
                </button>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className=" bg-gray-900 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-800"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900">
                                <div className="flex items-center gap-2 text-lime-400">
                                    {mode === 'fix' ? <PenTool className="w-5 h-5" /> : <Wand2 className="w-5 h-5" />}
                                    <h3 className="font-bold text-white tracking-wide">
                                        {mode === 'fix' ? 'AI Metin Düzeltici' : title}
                                    </h3>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="text-gray-400 hover:text-white p-1 hover:bg-gray-800 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        {mode === 'fix' ? 'Düzeltilecek Metin / Talimat' : 'Ne yazmamı istersin?'}
                                    </label>
                                    <textarea
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        placeholder={placeholder}
                                        className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg focus:ring-1 focus:ring-lime-500 focus:border-lime-500 min-h-[100px] resize-none text-gray-200 placeholder-gray-600 outline-none transition-all"
                                    />
                                </div>

                                {error && (
                                    <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex flex-col gap-1">
                                        <span className="font-bold">Hata Detayı:</span>
                                        <span className="break-words font-mono text-xs opacity-90">{error}</span>
                                    </div>
                                )}

                                {result && (
                                    <div className="bg-black/40 rounded-lg border border-gray-800">
                                        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-gray-900/50">
                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sonuç</span>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={handleCopy}
                                                    className="p-1.5 text-gray-500 hover:text-lime-400 hover:bg-gray-800 rounded transition-colors"
                                                    title="Kopyala"
                                                >
                                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="p-4 text-gray-300 text-sm leading-relaxed whitespace-pre-wrap max-h-[200px] overflow-y-auto font-light">
                                            {result}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 border-t border-gray-800 bg-gray-900 flex justify-end gap-3">
                                <button
                                    onClick={handleClose}
                                    className="px-4 py-2 text-gray-400 font-medium hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                                >
                                    İptal
                                </button>

                                {!result ? (
                                    <button
                                        onClick={handleGenerate}
                                        disabled={isLoading || !prompt.trim()}
                                        className="flex items-center gap-2 px-6 py-2 bg-lime-500 hover:bg-lime-400 text-black font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-lime-500/20"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                {mode === 'fix' ? 'Düzeltiliyor...' : 'Oluşturuluyor...'}
                                            </>
                                        ) : (
                                            <>
                                                {mode === 'fix' ? <PenTool className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                                                {mode === 'fix' ? 'Düzelt' : 'Oluştur'}
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleApply}
                                        className="px-6 py-2 bg-lime-500 hover:bg-lime-400 text-black font-bold rounded-lg shadow-lg shadow-lime-500/20 transition-all flex items-center gap-2"
                                    >
                                        <Check className="w-4 h-4" />
                                        Kullan
                                    </button>
                                )}

                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
