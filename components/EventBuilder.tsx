
import React, { useState } from 'react';
import { Event } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { useLanguage } from '../contexts/LanguageContext';
import { BoltIcon } from './icons/BoltIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

interface EventBuilderProps {
    events: Event[];
    onUpdateEvent: (id: string, newEvent: Partial<Event>) => void;
    onAddEvent: () => void;
    onRemoveEvent: (id: string) => void;
    onGenerateCode: (id: string, name: string, description: string) => void;
}

const supportedEvents = [
    { name: 'ready', translationKey: 'eventName_ready' },
    { name: 'messageCreate', translationKey: 'eventName_messageCreate' },
    { name: 'guildMemberAdd', translationKey: 'eventName_guildMemberAdd' },
    { name: 'guildMemberRemove', translationKey: 'eventName_guildMemberRemove' },
    { name: 'interactionCreate', translationKey: 'eventName_interactionCreate' },
    { name: 'voiceStateUpdate', translationKey: 'eventName_voiceStateUpdate' },
];

const EventItem: React.FC<{
    event: Event;
    index: number;
    onUpdateEvent: (id: string, newEvent: Partial<Event>) => void;
    onRemoveEvent: (id: string) => void;
    onGenerateCode: (id: string, name: string, description: string) => void;
}> = ({ event, index, onUpdateEvent, onRemoveEvent, onGenerateCode }) => {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const eventName = supportedEvents.find(e => e.name === event.name)?.translationKey || event.name;

    return (
        <div className="bg-gray-900/50 rounded-lg border border-gray-700 transition-all duration-300">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 text-left"
            >
                <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-purple-400">{t(eventName as any)}</span>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemoveEvent(event.id);
                        }}
                        className="text-gray-500 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-500/10"
                        aria-label="Remove event"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                    <ChevronDownIcon className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </button>

            {isOpen && (
                <div className="px-4 pb-4 pt-2 border-t border-gray-700/50 animate-fade-in">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">{t('labelEventName')}</label>
                        <select
                            value={event.name}
                            onChange={(e) => onUpdateEvent(event.id, { name: e.target.value })}
                            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                        >
                            {supportedEvents.map(e => (
                                <option key={e.name} value={e.name}>{t(e.translationKey as any)}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-300 mb-2">{t('labelEventAction')}</label>
                        <textarea
                            value={event.description}
                            onChange={(e) => onUpdateEvent(event.id, { description: e.target.value })}
                            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                            placeholder={t('placeholderEventAction')}
                            rows={3}
                        />
                    </div>
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={() => onGenerateCode(event.id, event.name, event.description)}
                            disabled={event.isGenerating}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow-md disabled:text-gray-400"
                        >
                            {event.isGenerating ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
}


export const EventBuilder: React.FC<EventBuilderProps> = ({
    events,
    onUpdateEvent,
    onAddEvent,
    onRemoveEvent,
    onGenerateCode
}) => {
    const { t } = useLanguage();
    return (
       <div className="h-full flex flex-col">
            <div className="flex items-center gap-4 mb-6">
                <BoltIcon className="w-8 h-8 text-purple-400" />
                <h2 className="text-2xl font-bold">{t('eventBuilderTitle')}</h2>
            </div>
            <div className="space-y-4 flex-grow overflow-y-auto pr-2">
                {events.map((event, index) => (
                    <EventItem 
                        key={event.id}
                        event={event}
                        index={index}
                        onUpdateEvent={onUpdateEvent}
                        onRemoveEvent={onRemoveEvent}
                        onGenerateCode={onGenerateCode}
                    />
                ))}
            </div>
            <div className="mt-6 flex-shrink-0">
                <button
                    onClick={onAddEvent}
                    className="flex items-center gap-2 text-purple-400 hover:text-purple-300 font-semibold py-3 px-4 rounded-lg transition-colors border-2 border-dashed border-gray-600 hover:border-purple-400 w-full justify-center bg-gray-800/20 hover:bg-gray-800/50"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span>{t('addEvent')}</span>
                </button>
            </div>
        </div>
    );
};
