

import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { Bars3Icon } from './icons/Bars3Icon';
import { BotIcon } from './icons/BotIcon';
import { EmbedBuilder } from './tools/EmbedBuilder';
import { WebhookSender } from './tools/WebhookSender';
import { TimestampFormatter } from './tools/TimestampFormatter';
import { ToolCodeGenerator } from './tools/ToolCodeGenerator';
import { ViewColumnsIcon } from './icons/ViewColumnsIcon';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';
import { ClockIcon } from './icons/ClockIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { useAuth } from '../contexts/AuthContext';
import { logActivity } from '../services/activityLogger';

interface ToolsGeneratorProps {
    onGoHome: () => void;
}

type ActiveTool = 'ai-tool-generator' | 'embed' | 'webhook' | 'timestamp';

const SidebarButton: React.FC<{
    isActive: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    children: React.ReactNode;
}> = ({ isActive, onClick, icon, children }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
            isActive
                ? 'bg-purple-600/20 text-purple-300'
                : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
        }`}
    >
        {icon}
        {children}
    </button>
);


export const ToolsGenerator: React.FC<ToolsGeneratorProps> = ({ onGoHome }) => {
    const { t } = useLanguage();
    const { user } = useAuth();
    const [activeView, setActiveView] = useState<ActiveTool>('ai-tool-generator');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleViewChange = (view: ActiveTool) => {
        setActiveView(view);
        setIsSidebarOpen(false);
        if (user) {
            logActivity(user.id, 'tool_used', { toolName: view });
        }
    };

    const renderActiveView = () => {
        switch (activeView) {
            case 'ai-tool-generator':
                return <ToolCodeGenerator />;
            case 'embed':
                return <EmbedBuilder />;
            case 'webhook':
                return <WebhookSender />;
            case 'timestamp':
                return <TimestampFormatter />;
            default:
                return null;
        }
    };

    const SidebarContent = () => (
         <div className="flex h-full flex-col">
            <div className="flex items-center gap-3 mb-6 px-1 flex-shrink-0">
                <BotIcon className="w-8 h-8 text-purple-400" />
                <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
                    {t('toolsGeneratorTitle')}
                </h1>
            </div>
            <nav className="flex flex-col gap-2 flex-grow overflow-y-auto">
                <SidebarButton isActive={activeView === 'ai-tool-generator'} onClick={() => handleViewChange('ai-tool-generator')} icon={<SparklesIcon className="w-5 h-5" />}>{t('tabToolsAiToolGenerator')}</SidebarButton>
                <SidebarButton isActive={activeView === 'embed'} onClick={() => handleViewChange('embed')} icon={<ViewColumnsIcon className="w-5 h-5" />}>{t('tabToolsEmbed')}</SidebarButton>
                <SidebarButton isActive={activeView === 'webhook'} onClick={() => handleViewChange('webhook')} icon={<PaperAirplaneIcon className="w-5 h-5" />}>{t('tabToolsWebhook')}</SidebarButton>
                <SidebarButton isActive={activeView === 'timestamp'} onClick={() => handleViewChange('timestamp')} icon={<ClockIcon className="w-5 h-5" />}>{t('tabToolsTimestamp')}</SidebarButton>
            </nav>
        </div>
    );

    return (
        <div className="flex h-screen bg-gray-900 text-white animate-fade-in">
             {/* Overlay for sliding sidebar on all screen sizes */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/60"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 ltr:left-0 rtl:right-0 z-40 flex w-64 flex-col border-r border-gray-800 bg-gray-900 p-4 transition-transform duration-300 ease-in-out ${ isSidebarOpen ? 'ltr:translate-x-0 rtl:-translate-x-0' : 'ltr:-translate-x-full rtl:translate-x-full' }`}
            >
                <SidebarContent />
            </aside>

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <header className="flex h-[65px] flex-shrink-0 items-center justify-between border-b border-gray-700/50 bg-gray-900/80 p-4 backdrop-blur-sm">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-1 text-gray-400 hover:text-white"
                        aria-label="Open sidebar"
                    >
                        <Bars3Icon className="h-6 w-6" />
                    </button>
                    <button onClick={onGoHome} className="flex items-center gap-2 rounded-lg py-2 px-3 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white">
                        <ArrowLeftIcon className="h-5 w-5"/>
                        <span className="hidden sm:inline">{t('backToHome')}</span>
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {renderActiveView()}
                </main>
            </div>
        </div>
    );
};