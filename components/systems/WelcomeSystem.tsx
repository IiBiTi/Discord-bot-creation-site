
import React from 'react';
import { WelcomeSystem } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { ToggleSwitch } from '../ToggleSwitch';

interface WelcomeSystemProps {
    system: WelcomeSystem;
    onToggle: (subKey: keyof WelcomeSystem, enabled: boolean) => void;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const WelcomeSystemComponent: React.FC<WelcomeSystemProps> = ({ system, onToggle, onChange }) => {
    const { t } = useLanguage();
    return (
        <div className="space-y-4">
             <div className="flex justify-between items-center bg-gray-800/50 p-3 rounded-lg border border-gray-600">
                <p className="text-sm font-medium text-gray-200">{t('enableSystem', { systemName: t('systemWelcome') })}</p>
                <ToggleSwitch
                    enabled={system.enabled}
                    onChange={(enabled) => onToggle('enabled', enabled)}
                    ariaLabel={t('systemWelcome')}
                />
            </div>
            {system.enabled && (
                <div className="space-y-4 animate-fade-in">
                    <div>
                        <label htmlFor="welcomeChannelId" className="block text-sm font-medium text-gray-300 mb-2">{t('labelWelcomeChannelId')}</label>
                        <input
                            type="text"
                            id="welcomeChannelId"
                            name="channelId"
                            value={system.channelId}
                            onChange={onChange}
                            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                            placeholder="e.g., 123456789012345678"
                        />
                    </div>
                     <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-600">
                        <div className="flex justify-between items-center">
                            <label htmlFor="useImage" className="text-sm font-medium text-gray-200">{t('labelWelcomeUseImage')}</label>
                             <ToggleSwitch
                                enabled={system.useImage}
                                onChange={(enabled) => onToggle('useImage', enabled)}
                                ariaLabel={t('labelWelcomeUseImage')}
                            />
                        </div>
                        {system.useImage && (
                             <div className="mt-3 pt-3 border-t border-gray-700/50 animate-fade-in space-y-4">
                                <div>
                                    <label htmlFor="welcomeMessage" className="block text-sm font-medium text-gray-300 mb-2">{t('labelWelcomeEmbedMessage')}</label>
                                    <textarea
                                        id="welcomeMessage"
                                        name="message"
                                        value={system.message}
                                        onChange={onChange}
                                        className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                                        rows={2}
                                    />
                                </div>
                                 <div>
                                     <label htmlFor="backgroundImage" className="block text-sm font-medium text-gray-300 mb-2">{t('labelWelcomeBgUrl')}</label>
                                     <input
                                        type="text"
                                        id="backgroundImage"
                                        name="backgroundImage"
                                        value={system.backgroundImage}
                                        onChange={onChange}
                                        className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                                        placeholder="https://example.com/background.png"
                                    />
                                     <p className="mt-2 text-xs text-gray-400">
                                        {t('canvasNote')}
                                    </p>
                                 </div>
                             </div>
                        )}
                        {!system.useImage && (
                            <div className="mt-3 pt-3 border-t border-gray-700/50 animate-fade-in">
                                 <label htmlFor="welcomeMessageText" className="block text-sm font-medium text-gray-300 mb-2">{t('labelWelcomeTextMessage')}</label>
                                <textarea
                                    id="welcomeMessageText"
                                    name="message"
                                    value={system.message}
                                    onChange={onChange}
                                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                                    rows={2}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
