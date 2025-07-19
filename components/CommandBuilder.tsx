
import React, { useState } from 'react';
import { Command } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { useLanguage } from '../contexts/LanguageContext';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

const CommandItem: React.FC<{
    command: Command;
    index: number;
    onUpdateCommand: (id: string, newCommand: Partial<Command>) => void;
    onRemoveCommand: (id: string) => void;
    onGenerateCode: (id: string, name: string, description: string, action: string) => void;
}> = ({ command, index, onUpdateCommand, onRemoveCommand, onGenerateCode }) => {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(index === 0);

    return (
        <div className="bg-gray-900/50 rounded-lg border border-gray-700 transition-all duration-300">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 text-left"
            >
                <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-purple-400">{command.name || `${t('commandLabel')} #${index + 1}`}</span>
                    {command.description && <span className="hidden md:inline text-sm text-gray-400 truncate">{command.description}</span>}
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemoveCommand(command.id);
                        }}
                        className="text-gray-500 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-500/10"
                        aria-label="Remove command"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                    <ChevronDownIcon className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </button>

            {isOpen && (
                <div className="px-4 pb-4 pt-2 border-t border-gray-700/50 animate-fade-in">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">{t('labelCommandName')}</label>
                            <input
                                type="text"
                                value={command.name}
                                onChange={(e) => onUpdateCommand(command.id, { name: e.target.value.toLowerCase().replace(/\s/g, '') })}
                                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                                placeholder={t('placeholderCommandName')}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">{t('labelCommandDesc')}</label>
                            <input
                                type="text"
                                value={command.description}
                                onChange={(e) => onUpdateCommand(command.id, { description: e.target.value })}
                                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                                placeholder={t('placeholderCommandDesc')}
                            />
                        </div>
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-300 mb-2">{t('labelCommandAction')}</label>
                        <textarea
                            value={command.action}
                            onChange={(e) => onUpdateCommand(command.id, { action: e.target.value })}
                            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                            placeholder={t('placeholderCommandAction')}
                            rows={3}
                        />
                    </div>
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={() => onGenerateCode(command.id, command.name, command.description, command.action)}
                            disabled={command.isGenerating}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow-md disabled:text-gray-400"
                        >
                            {command.isGenerating ? (
                                <>
                                    <svg className="animate-spin -ml-1 rtl:ml-1 ltr:mr-3 rtl:ml-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {t('generating')}
                                </>
                            ) : (
                                <>
                                    <SparklesIcon className="w-5 h-5" />
                                    {t('generateCode')}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export const CommandBuilder: React.FC<{
    commands: Command[];
    onUpdateCommand: (id: string, newCommand: Partial<Command>) => void;
    onAddCommand: () => void;
    onRemoveCommand: (id: string) => void;
    onGenerateCode: (id: string, name: string, description: string, action: string) => void;
}> = ({ commands, onUpdateCommand, onAddCommand, onRemoveCommand, onGenerateCode }) => {
    const { t } = useLanguage();
    return (
        <div className="h-full flex flex-col">
            <div className="space-y-4 flex-grow overflow-y-auto pr-2">
                {commands.map((command, index) => (
                    <CommandItem 
                        key={command.id}
                        command={command}
                        index={index}
                        onUpdateCommand={onUpdateCommand}
                        onRemoveCommand={onRemoveCommand}
                        onGenerateCode={onGenerateCode}
                    />
                ))}
            </div>
            <div className="mt-6 flex-shrink-0">
                <button
                    onClick={onAddCommand}
                    className="flex items-center gap-2 text-purple-400 hover:text-purple-300 font-semibold py-3 px-4 rounded-lg transition-colors border-2 border-dashed border-gray-600 hover:border-purple-400 w-full justify-center bg-gray-800/20 hover:bg-gray-800/50"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span>{t('addCommand')}</span>
                </button>
            </div>
        </div>
    );
};
