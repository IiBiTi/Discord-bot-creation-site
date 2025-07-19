
import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { PaperAirplaneIcon } from '../icons/PaperAirplaneIcon';
import { CheckIcon } from '../icons/CheckIcon';
import { XMarkIcon } from '../icons/XMarkIcon';

export const WebhookSender: React.FC = () => {
    const { t } = useLanguage();
    const [webhookUrl, setWebhookUrl] = useState('');
    const [content, setContent] = useState('');
    const [username, setUsername] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [embeds, setEmbeds] = useState('');
    
    const [isSending, setIsSending] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const handleSend = async () => {
        if (!webhookUrl.trim()) {
            setStatus({ type: 'error', message: t('webhookError') });
            return;
        }

        setIsSending(true);
        setStatus(null);

        let parsedEmbeds;
        try {
            parsedEmbeds = embeds ? JSON.parse(embeds) : undefined;
            // Discord expects an array of embeds
            if(parsedEmbeds && !Array.isArray(parsedEmbeds)) {
                parsedEmbeds = [parsedEmbeds];
            }
        } catch (e) {
            setStatus({ type: 'error', message: `${t('webhookError')} (Invalid JSON)` });
            setIsSending(false);
            return;
        }

        const body = {
            content: content || undefined,
            username: username || undefined,
            avatar_url: avatarUrl || undefined,
            embeds: parsedEmbeds,
        };

        try {
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (response.ok) {
                setStatus({ type: 'success', message: t('webhookSuccess') });
            } else {
                const errorText = await response.text();
                setStatus({ type: 'error', message: `${t('webhookError')} ${response.status}: ${errorText}` });
            }
        } catch (error) {
            setStatus({ type: 'error', message: t('webhookError') });
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 shadow-lg animate-fade-in">
             <div className="p-6 border-b border-gray-700">
                <div className="flex items-center gap-4">
                    <PaperAirplaneIcon className="w-8 h-8 text-purple-400" />
                    <div>
                        <h2 className="text-2xl font-bold">{t('webhookSenderTitle')}</h2>
                        <p className="text-gray-400 text-sm">{t('webhookSenderSubtitle')}</p>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-6">
                <div>
                    <label htmlFor="webhookUrl" className="block text-sm font-medium text-gray-300 mb-2">{t('webhookLabelUrl')}*</label>
                    <input id="webhookUrl" type="text" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none transition" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">{t('webhookLabelUsername')}</label>
                        <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none transition" />
                    </div>
                     <div>
                        <label htmlFor="avatarUrl" className="block text-sm font-medium text-gray-300 mb-2">{t('webhookLabelAvatar')}</label>
                        <input id="avatarUrl" type="text" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none transition" />
                    </div>
                </div>

                <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-2">{t('webhookLabelContent')}</label>
                    <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows={4} className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none transition" />
                </div>
                <div>
                    <label htmlFor="embeds" className="block text-sm font-medium text-gray-300 mb-2">{t('webhookLabelEmbeds')}</label>
                    <textarea id="embeds" value={embeds} onChange={(e) => setEmbeds(e.target.value)} rows={8} className="font-mono text-sm w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none transition" placeholder='[ { "title": "Hello", "description": "World" } ]' dir="ltr" />
                </div>

                <div className="flex items-center gap-4">
                     <button
                        onClick={handleSend}
                        disabled={isSending || !webhookUrl}
                        className="flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-5 rounded-lg transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSending ? (
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : <PaperAirplaneIcon className="w-5 h-5"/>}
                        <span>{t('webhookSendMessage')}</span>
                    </button>
                    {status && (
                        <div className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg ${status.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                            {status.type === 'success' ? <CheckIcon className="w-5 h-5"/> : <XMarkIcon className="w-5 h-5"/>}
                            {status.message}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
