
import React, { useState, useEffect } from 'react';
import { Systems, TicketDepartment } from '../types';
import { WrenchScrewdriverIcon } from './icons/WrenchScrewdriverIcon';
import { useLanguage } from '../contexts/LanguageContext';
import { WelcomeSystemComponent } from './systems/WelcomeSystem';
import { ModerationSystemComponent } from './systems/ModerationSystem';
import { TicketSystemComponent } from './systems/TicketSystem';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { UserPlusIcon } from './icons/UserPlusIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { TicketIcon } from './icons/TicketIcon';

interface SystemBuilderProps {
    initialSystems: Systems;
    onSave: (systems: Systems) => void;
}

const AccordionItem: React.FC<{
    title: string;
    icon: React.ReactNode;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}> = ({ title, icon, isOpen, onToggle, children }) => {
    return (
        <div className="bg-gray-900/50 rounded-lg border border-gray-700 transition-all duration-300">
            <button
                onClick={onToggle}
                className="w-full flex justify-between items-center p-4 text-left"
            >
                <div className="flex items-center gap-3">
                    {icon}
                    <h3 className="text-lg font-semibold text-gray-100">{title}</h3>
                </div>
                <ChevronDownIcon className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                 <div className="px-4 pb-4 pt-2 border-t border-gray-700/50 animate-fade-in">
                    {children}
                 </div>
            )}
        </div>
    );
};

export const SystemBuilder: React.FC<SystemBuilderProps> = ({ initialSystems, onSave }) => {
    const { t } = useLanguage();
    const [openAccordion, setOpenAccordion] = useState<string | null>(null);
    const [localSystems, setLocalSystems] = useState<Systems>(initialSystems);

    useEffect(() => {
        setLocalSystems(initialSystems);
    }, [initialSystems]);
    
    const hasChanges = JSON.stringify(localSystems) !== JSON.stringify(initialSystems);

    const handleSystemUpdate = (updatedSystem: Partial<Systems>) => {
        const newSystems = { ...localSystems, ...updatedSystem };
        setLocalSystems(newSystems);
    };

    const handleSaveClick = () => {
        onSave(localSystems);
    };

    const handleCancelClick = () => {
        setLocalSystems(initialSystems);
    };

    const handleToggle = (system: keyof Systems, subKey: string, enabled: boolean) => {
        handleSystemUpdate({
            [system]: { ...localSystems[system], [subKey]: enabled }
        });
    };

    const handleConfigChange = (
        system: keyof Systems,
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        handleSystemUpdate({
            [system]: { ...localSystems[system], [name]: value }
        });
    };

    const handleRadioChange = (system: keyof Systems, name: string, value: string) => {
        handleSystemUpdate({
            [system]: { ...localSystems[system], [name]: value }
        });
    };
    
    const handleDepartmentChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const newDepartments = [...localSystems.tickets.departments];
        newDepartments[index] = { ...newDepartments[index], [name]: value };
        handleSystemUpdate({
            tickets: { ...localSystems.tickets, departments: newDepartments }
        });
    };

    const addDepartment = () => {
        const newDepartment: TicketDepartment = {
            id: `dept_${Date.now()}`,
            label: t('ticketDeptNewLabel'),
            description: t('ticketDeptNewDesc'),
            categoryId: '',
            supportRoleId: '',
            welcomeMessage: t('ticketDeptNewWelcome'),
            imageUrl: ''
        };
        handleSystemUpdate({
            tickets: { ...localSystems.tickets, departments: [...localSystems.tickets.departments, newDepartment] }
        });
    };

    const removeDepartment = (index: number) => {
        const newDepartments = localSystems.tickets.departments.filter((_, i) => i !== index);
        handleSystemUpdate({
            tickets: { ...localSystems.tickets, departments: newDepartments }
        });
    };
    
    const toggleAccordion = (id: string) => {
        setOpenAccordion(openAccordion === id ? null : id);
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center gap-4 mb-6">
                <WrenchScrewdriverIcon className="w-8 h-8 text-purple-400" />
                <h2 className="text-2xl font-bold">{t('systemsTitle')}</h2>
            </div>
            
            <div className="flex-grow space-y-4 overflow-y-auto ltr:pr-2 rtl:pl-2 pb-4">
                 <AccordionItem 
                    title={t('systemWelcome')} 
                    icon={<UserPlusIcon className="w-6 h-6 text-green-400" />}
                    isOpen={openAccordion === 'welcome'} 
                    onToggle={() => toggleAccordion('welcome')}
                 >
                    <WelcomeSystemComponent 
                        system={localSystems.welcome} 
                        onToggle={(subKey, enabled) => handleToggle('welcome', subKey, enabled)}
                        onChange={(e) => handleConfigChange('welcome', e)}
                    />
                </AccordionItem>
                
                <AccordionItem 
                    title={t('systemModeration')} 
                    icon={<ShieldCheckIcon className="w-6 h-6 text-red-400" />}
                    isOpen={openAccordion === 'moderation'} 
                    onToggle={() => toggleAccordion('moderation')}
                >
                    <ModerationSystemComponent
                        system={localSystems.moderation}
                        onToggle={(subKey, enabled) => handleToggle('moderation', subKey, enabled)}
                        onChange={(e) => handleConfigChange('moderation', e)}
                    />
                </AccordionItem>
                
                 <AccordionItem 
                    title={t('systemTickets')} 
                    icon={<TicketIcon className="w-6 h-6 text-blue-400" />}
                    isOpen={openAccordion === 'tickets'} 
                    onToggle={() => toggleAccordion('tickets')}
                >
                    <TicketSystemComponent
                        system={localSystems.tickets}
                        onToggle={(subKey, enabled) => handleToggle('tickets', subKey, enabled)}
                        onRadioChange={(name, value) => handleRadioChange('tickets', name, value)}
                        onConfigChange={(e) => handleConfigChange('tickets', e)}
                        onDepartmentChange={handleDepartmentChange}
                        onAddDepartment={addDepartment}
                        onRemoveDepartment={removeDepartment}
                    />
                </AccordionItem>
            </div>
             <div className={`mt-auto pt-4 flex-shrink-0 flex justify-end gap-3 transition-opacity duration-300 ${hasChanges ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <button
                    type="button"
                    onClick={handleCancelClick}
                    className="bg-gray-600/80 hover:bg-gray-600 text-white font-semibold py-2 px-5 rounded-lg transition-colors border border-gray-500"
                >
                    {t('cancel')}
                </button>
                <button
                    type="button"
                    onClick={handleSaveClick}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-5 rounded-lg transition-colors"
                >
                    {t('saveChanges')}
                </button>
            </div>
        </div>
    );
};
