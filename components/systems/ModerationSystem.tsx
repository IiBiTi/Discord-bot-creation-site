
import React from 'react';
import { ModerationSystem } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { ToggleSwitch } from '../ToggleSwitch';

interface ModerationSystemProps {
    system: ModerationSystem;
    onToggle: (subKey: keyof ModerationSystem, enabled: boolean) => void;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ModerationSystemComponent: React.FC<ModerationSystemProps> = ({ system, onToggle, onChange }) => {
    const { t } = useLanguage();
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-gray-800/50 p-3 rounded-lg border border-gray-600">
                <p className="text-sm font-medium text-gray-200">{t('enableSystem', { systemName: t('systemModeration') })}</p>
                <ToggleSwitch
                    enabled={system.enabled}
                    onChange={(enabled) => onToggle('enabled', enabled)}
                    ariaLabel={t('systemModeration')}
                />
            </div>
            {system.enabled && (
                <div className="space-y-4 animate-fade-in">
                   <p className="text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: t('modNote')}} />
                    <div>
                        <label htmlFor="logChannelId" className="block text-sm font-medium text-gray-300 mb-2">{t('labelModLogChannelId')}</label>
                        <input
                            type="text"
                            id="logChannelId"
                            name="logChannelId"
                            value={system.logChannelId}
                            onChange={onChange}
                            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                            placeholder="e.g., 123456789012345678"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
