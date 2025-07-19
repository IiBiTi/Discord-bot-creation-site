
import React from 'react';
import { TicketSystem, TicketDepartment } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { ToggleSwitch } from '../ToggleSwitch';
import { TrashIcon } from '../icons/TrashIcon';
import { ListBulletIcon } from '../icons/ListBulletIcon';

interface TicketSystemProps {
    system: TicketSystem;
    onToggle: (subKey: keyof TicketSystem, enabled: boolean) => void;
    onRadioChange: (name: string, value: string) => void;
    onConfigChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onDepartmentChange: (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onAddDepartment: () => void;
    onRemoveDepartment: (index: number) => void;
}

export const TicketSystemComponent: React.FC<TicketSystemProps> = ({ 
    system, onToggle, onRadioChange, onConfigChange, onDepartmentChange, onAddDepartment, onRemoveDepartment
}) => {
    const { t } = useLanguage();
    return (
       <div className="space-y-4">
            <div className="flex justify-between items-center bg-gray-800/50 p-3 rounded-lg border border-gray-600">
                 <p className="text-sm font-medium text-gray-200">{t('enableSystem', { systemName: t('systemTickets') })}</p>
                <ToggleSwitch
                    enabled={system.enabled}
                    onChange={(enabled) => onToggle('enabled', enabled)}
                    ariaLabel={t('systemTickets')}
                />
            </div>
            {system.enabled && (
                <div className="space-y-4 animate-fade-in">
                     <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">{t('labelTicketOpenMethod')}</label>
                        <div className="flex rounded-lg shadow-sm bg-gray-900/70 border border-gray-600 p-1">
                            <button type="button" onClick={() => onRadioChange('openMethod', 'button')} className={`w-full rounded-md py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${system.openMethod === 'button' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:bg-gray-700'}`}>
                                {t('ticketOpenMethodButton')}
                            </button>
                            <button type="button" onClick={() => onRadioChange('openMethod', 'menu')} className={`w-full rounded-md py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${system.openMethod === 'menu' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:bg-gray-700'}`}>
                                {t('ticketOpenMethodMenu')}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="ticketPanelChannelId" className="block text-sm font-medium text-gray-300 mb-2">{t('labelTicketPanelChannelId')}</label>
                        <input
                            type="text" name="panelChannelId" id="ticketPanelChannelId"
                            value={system.panelChannelId} onChange={onConfigChange}
                            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                            placeholder={t('placeholderTicketPanelChannelId')}
                        />
                    </div>
                    <div>
                        <label htmlFor="ticketLogChannelId" className="block text-sm font-medium text-gray-300 mb-2">{t('labelTicketLogChannelId')}</label>
                        <input
                            type="text" name="logChannelId" id="ticketLogChannelId"
                            value={system.logChannelId} onChange={onConfigChange}
                            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                            placeholder={t('placeholderTicketLogChannelId')}
                        />
                    </div>
                     <div>
                        <label htmlFor="ticketOpenMessage" className="block text-sm font-medium text-gray-300 mb-2">{t('labelTicketOpenMessage')}</label>
                        <textarea
                            id="ticketOpenMessage" name="openMessage"
                            value={system.openMessage} onChange={onConfigChange}
                            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                            rows={2}
                        />
                    </div>

                    <div className="pt-4 border-t border-gray-700/50 space-y-4">
                       <h4 className="text-lg font-semibold text-gray-200">{system.openMethod === 'menu' ? t('ticketDeptsTitle') : t('ticketDeptSettingsTitle')}</h4>
                       {system.departments.map((dept, index) => (
                           <div key={dept.id} className="bg-gray-800/70 p-4 rounded-lg border border-gray-600 space-y-3">
                                <div className="flex justify-between items-center">
                                    <p className="font-semibold text-purple-400">
                                        {system.openMethod === 'menu' ? `${t('ticketDeptLabel')} #${index + 1}` : t('ticketDeptSettingsTitle')}
                                    </p>
                                    {system.openMethod === 'menu' && system.departments.length > 1 && (
                                        <button onClick={() => onRemoveDepartment(index)} className="text-gray-500 hover:text-red-500 transition-colors p-1 rounded-full"><TrashIcon className="w-5 h-5"/></button>
                                    )}
                                </div>
                               
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-300 mb-1">{t('labelTicketDeptLabel')}</label>
                                        <input type="text" name="label" value={dept.label} onChange={e => onDepartmentChange(index, e)} className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-1.5 text-sm focus:ring-1 focus:ring-purple-500 outline-none"/>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-300 mb-1">{t('labelTicketDeptDesc')}</label>
                                        <input type="text" name="description" value={dept.description} onChange={e => onDepartmentChange(index, e)} className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-1.5 text-sm focus:ring-1 focus:ring-purple-500 outline-none"/>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-300 mb-1">{t('labelTicketDeptCategoryId')}</label>
                                        <input type="text" name="categoryId" value={dept.categoryId} onChange={e => onDepartmentChange(index, e)} className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-1.5 text-sm focus:ring-1 focus:ring-purple-500 outline-none"/>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-300 mb-1">{t('labelTicketDeptSupportRoleId')}</label>
                                        <input type="text" name="supportRoleId" value={dept.supportRoleId} onChange={e => onDepartmentChange(index, e)} className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-1.5 text-sm focus:ring-1 focus:ring-purple-500 outline-none"/>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-300 mb-1">{t('labelTicketDeptImageUrl')}</label>
                                    <input type="text" name="imageUrl" value={dept.imageUrl} placeholder="https://example.com/image.png" className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-1.5 text-sm focus:ring-1 focus:ring-purple-500 outline-none"/>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-300 mb-1">{t('labelTicketDeptWelcomeMsg')}</label>
                                    <textarea name="welcomeMessage" value={dept.welcomeMessage} onChange={e => onDepartmentChange(index, e)} rows={2} className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-1.5 text-sm focus:ring-1 focus:ring-purple-500 outline-none"/>
                                     <p className="mt-1 text-xs text-gray-400">{t('userTagNote')}</p>
                                </div>
                           </div>
                       ))}
                       {system.openMethod === 'menu' && (
                           <button onClick={onAddDepartment} className="w-full flex items-center justify-center gap-2 text-blue-400 hover:text-blue-300 font-semibold py-2 px-4 rounded-lg transition-colors border-2 border-dashed border-gray-600 hover:border-blue-400">
                                <ListBulletIcon className="w-5 h-5"/>
                               <span>{t('addTicketDept')}</span>
                           </button>
                       )}
                    </div>
                </div>
            )}
        </div>
    );
};
