

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Command, Systems, GeneratedCodeProps, Event } from '../types';
import { CommandBuilder } from './CommandBuilder';
import { EventBuilder } from './EventBuilder';
import { GeneratedCode, downloadProjectAsZip } from './GeneratedCode';
import { BotIcon } from './icons/BotIcon';
import { generateCommandCode, generateEventCode } from '../services/geminiService';
import { SystemBuilder } from './SystemBuilder';
import { DownloadIcon } from './icons/DownloadIcon';
import { JavaScriptIcon } from './icons/JavaScriptIcon';
import { TypeScriptIcon } from './icons/TypeScriptIcon';
import { PythonIcon } from './icons/PythonIcon';
import { DiscordIcon } from './icons/DiscordIcon';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { useLanguage } from '../contexts/LanguageContext';
import { ChatBubbleLeftRightIcon } from './icons/ChatBubbleLeftRightIcon';
import { AIAssistant } from './AIAssistant';
import { BoltIcon } from './icons/BoltIcon';
import { Cog6ToothIcon } from './icons/Cog6ToothIcon';
import { CommandLineIcon } from './icons/CommandLineIcon';
import { WrenchScrewdriverIcon } from './icons/WrenchScrewdriverIcon';
import { EyeIcon } from './icons/EyeIcon';
import { Bars3Icon } from './icons/Bars3Icon';
import { logActivity } from '../services/activityLogger';
import { useAuth } from '../contexts/AuthContext';

interface BotGeneratorProps {
    onGoHome: () => void;
    initialState?: Partial<GeneratedCodeProps> | null;
}

type ActiveView = 'settings' | 'commands' | 'events' | 'systems' | 'assistant' | 'preview';

type SettingsState = Pick<GeneratedCodeProps, 'botName' | 'botToken' | 'clientId' | 'prefix' | 'language' | 'framework' | 'botType'>;

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

const SettingsView: React.FC<{
    initialSettings: SettingsState;
    onSave: (newSettings: SettingsState) => void;
    t: (key: any, replacements?: Record<string, string>) => string;
}> = ({ initialSettings, onSave, t }) => {
    const [localSettings, setLocalSettings] = useState(initialSettings);

    useEffect(() => {
        setLocalSettings(initialSettings);
    }, [initialSettings]);

    const hasChanges = JSON.stringify(localSettings) !== JSON.stringify(initialSettings);

    const handleSave = () => {
        onSave(localSettings);
    };
    
    const handleCancel = () => {
        setLocalSettings(initialSettings);
    };

    const handleFieldChange = (key: keyof SettingsState, value: string) => {
        setLocalSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleLanguageChange = (lang: 'nodejs' | 'python') => {
        setLocalSettings(prev => ({
            ...prev,
            language: lang,
            // Force slash commands for python
            ...(lang === 'python' && { botType: 'slash' }),
        }));
    };

    return (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 shadow-lg animate-fade-in">
            <div className="flex items-center gap-4 mb-6">
                <Cog6ToothIcon className="w-8 h-8 text-purple-400" />
                <h2 className="text-2xl font-bold">{t('settingsTitle')}</h2>
            </div>
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label htmlFor="botName" className="block text-sm font-medium text-gray-300 mb-2">{t('labelProjectName')}</label>
                        <input type="text" id="botName" value={localSettings.botName} onChange={(e) => handleFieldChange('botName', e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none transition" />
                    </div>
                    <div>
                        <label htmlFor="botToken" className="block text-sm font-medium text-gray-300 mb-2">{t('labelBotToken')}</label>
                        <input type="password" id="botToken" value={localSettings.botToken} onChange={(e) => handleFieldChange('botToken', e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none transition" />
                    </div>
                    <div>
                        <label htmlFor="clientId" className="block text-sm font-medium text-gray-300 mb-2">{t('labelClientId')}</label>
                        <input type="text" id="clientId" value={localSettings.clientId} onChange={(e) => handleFieldChange('clientId', e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none transition" />
                    </div>
                </div>
                <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-6 border-t border-gray-700/50">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">{t('labelLanguage')}</label>
                        <div className="flex rounded-lg shadow-sm bg-gray-900/70 border border-gray-600 p-1">
                            <button type="button" onClick={() => handleLanguageChange('nodejs')} className={`w-full flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors ${localSettings.language === 'nodejs' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:bg-gray-700'}`}>
                                <JavaScriptIcon className="w-5 h-5 rounded-sm" /><span>Node.js</span>
                            </button>
                            <button type="button" onClick={() => handleLanguageChange('python')} className={`w-full flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors ${localSettings.language === 'python' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:bg-gray-700'}`}>
                                <PythonIcon className="w-5 h-5" /><span>Python</span>
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">{t('labelCommandType')}</label>
                        <div className="flex rounded-lg shadow-sm bg-gray-900/70 border border-gray-600 p-1">
                            <button type="button" onClick={() => handleFieldChange('botType','slash')} disabled={localSettings.language==='python'} className={`w-full rounded-md py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${localSettings.botType === 'slash' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:bg-gray-700'}`}>{t('commandTypeSlash')}</button>
                            <button type="button" onClick={() => handleFieldChange('botType','prefix')} disabled={localSettings.language==='python'} className={`w-full rounded-md py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${localSettings.botType === 'prefix' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:bg-gray-700'}`}>{t('commandTypePrefix')}</button>
                        </div>
                        {localSettings.language === 'python' && <p className="text-xs text-gray-400 mt-1">{t('pythonSlashOnly')}</p>}
                    </div>
                    {localSettings.language === 'nodejs' && (
                        <div className="animate-fade-in">
                            <label className="block text-sm font-medium text-gray-300 mb-2">{t('labelFramework')}</label>
                            <div className="flex rounded-lg shadow-sm bg-gray-900/70 border border-gray-600 p-1">
                                <button type="button" onClick={() => handleFieldChange('framework','commonjs')} className={`w-full flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors ${localSettings.framework === 'commonjs' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:bg-gray-700'}`}>
                                    <JavaScriptIcon className="w-5 h-5" /><span>JavaScript</span>
                                </button>
                                <button type="button" onClick={() => handleFieldChange('framework','typescript')} className={`w-full flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors ${localSettings.framework === 'typescript' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:bg-gray-700'}`}>
                                    <TypeScriptIcon className="w-5 h-5" /><span>TypeScript</span>
                                </button>
                            </div>
                        </div>
                    )}
                    {localSettings.botType === 'prefix' && localSettings.language === 'nodejs' && (
                        <div className="animate-fade-in">
                            <label htmlFor="botPrefix" className="block text-sm font-medium text-gray-300 mb-2">{t('labelCommandPrefix')}</label>
                            <input type="text" id="botPrefix" value={localSettings.prefix} onChange={(e) => handleFieldChange('prefix', e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none transition" />
                        </div>
                    )}
                </div>
            </div>

             <div className={`mt-8 flex justify-end gap-3 transition-opacity duration-300 ${hasChanges ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <button
                    type="button"
                    onClick={handleCancel}
                    className="bg-gray-600/80 hover:bg-gray-600 text-white font-semibold py-2 px-5 rounded-lg transition-colors border border-gray-500"
                >
                    {t('cancel')}
                </button>
                <button
                    type="button"
                    onClick={handleSave}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-5 rounded-lg transition-colors"
                >
                    {t('saveChanges')}
                </button>
            </div>
        </div>
    );
};


export const BotGenerator: React.FC<BotGeneratorProps> = ({ onGoHome, initialState }) => {
    const { t, language: currentLang } = useLanguage();
    const { user } = useAuth();
    const [activeView, setActiveView] = useState<ActiveView>('settings');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // All the state definitions remain the same
    const [botName, setBotName] = useState<string>('MyAwesomeBot');
    const [botToken, setBotToken] = useState<string>('YOUR_BOT_TOKEN_HERE');
    const [clientId, setClientId] = useState<string>('YOUR_CLIENT_ID_HERE');
    const [botType, setBotType] = useState<'slash' | 'prefix'>('slash');
    const [prefix, setPrefix] = useState<string>('!');
    const [language, setLanguage] = useState<'nodejs' | 'python'>('nodejs');
    const [framework, setFramework] = useState<'commonjs' | 'typescript'>('commonjs');
    const [commands, setCommands] = useState<Command[]>([
        {
            id: '1', name: 'ping', description: 'Replies with Pong!',
            action: `Reply with "Pong!" and the bot's latency.`,
            generatedData: `.setName('ping').setDescription('Replies with Pong!')`,
            generatedCode: `const latency = Date.now() - interaction.createdTimestamp;
await interaction.reply(\`Pong! 🏓 Latency is \${latency}ms.\`);`,
            isGenerating: false, requiredPackages: [],
        }
    ]);
    const [events, setEvents] = useState<Event[]>([]);
    const [systems, setSystems] = useState<Systems>({
        welcome: { enabled: false, channelId: '', message: 'Welcome {user} to {server}! 🎉', useImage: false, backgroundImage: '' },
        moderation: { enabled: false, logChannelId: '' },
        tickets: {
            enabled: false, panelChannelId: '', logChannelId: '', openMessage: 'Open a ticket to get support.', openMethod: 'button',
            departments: [{
                id: 'default', label: 'General Support', description: 'For general help',
                categoryId: '', supportRoleId: '',
                welcomeMessage: 'Welcome {user}! The support team will get back to you shortly.', imageUrl: ''
            }]
        }
    });
    const [isDownloading, setIsDownloading] = useState<boolean>(false);

    useEffect(() => {
        if (initialState) {
            setBotName(initialState.botName || 'Imported Bot');
            setLanguage(initialState.language || 'nodejs');
            setFramework(initialState.framework || 'commonjs');
            setBotType(initialState.botType || 'slash');
            setPrefix(initialState.prefix || '!');
            setCommands(initialState.commands || []);
            setEvents(initialState.events || []);
            setSystems(initialState.systems || {
                 welcome: { enabled: false, channelId: '', message: 'Welcome {user} to {server}! 🎉', useImage: false, backgroundImage: '' },
                moderation: { enabled: false, logChannelId: '' },
                tickets: { enabled: false, panelChannelId: '', logChannelId: '', openMessage: 'Open a ticket to get support.', openMethod: 'button', departments: [{id: 'default', label: 'General Support', description: 'For general help', categoryId: '', supportRoleId: '', welcomeMessage: 'Welcome {user}! The support team will get back to you shortly.', imageUrl: ''}]}
            });
            setBotToken('YOUR_BOT_TOKEN_HERE');
            setClientId('YOUR_CLIENT_ID_HERE');
            setActiveView('settings'); // Start on settings tab after import
        }
    }, [initialState]);
    
     useEffect(() => {
        const defaultPing = {
            id: '1',
            isGenerating: false,
            requiredPackages: []
        };
        if (currentLang === 'ar') {
             setCommands(cmds => cmds.map(c => c.id === '1' && c.name === 'ping' ? {
                 ...defaultPing,
                 name: 'بينج',
                 description: 'يرد بـ بونج!',
                 action: `رد بـ "بونج!" مع وقت استجابة البوت.`,
                 generatedData: `.setName('ping').setDescription('يرد بـ بونج!')`,
                 generatedCode: `const latency = Date.now() - interaction.createdTimestamp;
await interaction.reply(\`بونج! 🏓 وقت الاستجابة هو \${latency}ms.\`);`,
             } : c));
        } else {
             setCommands(cmds => cmds.map(c => (c.id === '1' && (c.name === 'ping' || c.name === 'بينج')) ? {
                ...defaultPing,
                name: 'ping',
                description: 'Replies with Pong!',
                action: `Reply with "Pong!" and the bot's latency.`,
                generatedData: `.setName('ping').setDescription('Replies with Pong!')`,
                generatedCode: `const latency = Date.now() - interaction.createdTimestamp;
await interaction.reply(\`Pong! 🏓 Latency is \${latency}ms.\`);`,
             }: c));
        }
    }, [currentLang]);

    const resetProjectForLanguage = (newLanguage: 'nodejs' | 'python') => {
        setEvents([]); // Clear events on language change
        if (newLanguage === 'python') {
            setBotType('slash'); // Python template currently favors slash commands
            setCommands([{
                id: '1', name: 'ping', description: 'Replies with Pong!',
                action: `Reply with "Pong!" and the bot's latency.`,
                generatedData: '', isGenerating: false, requiredPackages: [],
                generatedCode: `import discord
from discord.ext import commands
from discord import app_commands
import time

class Ping(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @app_commands.command(name="ping", description="Replies with Pong!")
    async def ping(self, interaction: discord.Interaction):
        """Replies with the bot's latency."""
        latency = round(self.bot.latency * 1000)
        await interaction.response.send_message(f"Pong! 🏓 Latency is {latency}ms.")

async def setup(bot: commands.Bot):
    await bot.add_cog(Ping(bot))`,
            }]);
        } else { // Back to nodejs
             setCommands([{
                id: '1', name: 'ping', description: 'Replies with Pong!',
                action: `Reply with "Pong!" and the bot's latency.`,
                generatedData: `.setName('ping').setDescription('Replies with Pong!')`,
                generatedCode: `const latency = Date.now() - interaction.createdTimestamp;
await interaction.reply(\`Pong! 🏓 Latency is \${latency}ms.\`);`,
                isGenerating: false, requiredPackages: [],
            }]);
        }
    }

    const updateCommand = useCallback((id: string, newCommand: Partial<Command>) => {
        setCommands(prev => prev.map(cmd => cmd.id === id ? { ...cmd, ...newCommand } : cmd));
    }, []);

    const addCommand = useCallback(() => {
        const newId = Date.now().toString();
        setCommands(prev => [...prev, {
            id: newId, name: `command${prev.length + 1}`, description: '', action: '',
            generatedData: '', generatedCode: '', isGenerating: false, requiredPackages: [],
        }]);
    }, []);

    const removeCommand = useCallback((id: string) => {
        setCommands(prev => prev.filter(cmd => cmd.id !== id));
    }, []);

    const handleGenerateCode = useCallback(async (id: string, name: string, description: string, action: string) => {
        updateCommand(id, { isGenerating: true });
        try {
            if (!action.trim() || !name.trim()) {
                const defaultCode = language === 'python' ? `# Please enter a name and action for the command.` : `// Please enter a name and action for the command.`;
                updateCommand(id, { generatedCode: defaultCode });
                return;
            }
            const { commandData, executeBody, requiredPackages } = await generateCommandCode(action, name, description, botType, language);
            updateCommand(id, { generatedData: commandData, generatedCode: executeBody, requiredPackages });
        } catch (error) {
            console.error('Error generating command code:', error);
            updateCommand(id, { generatedCode: `// An error occurred while generating the code. Please try again.` });
        } finally {
            updateCommand(id, { isGenerating: false });
        }
    }, [updateCommand, botType, language]);

    const updateEvent = useCallback((id: string, newEvent: Partial<Event>) => {
        setEvents(prev => prev.map(evt => evt.id === id ? { ...evt, ...newEvent } : evt));
    }, []);

    const addEvent = useCallback(() => {
        const newId = Date.now().toString();
        setEvents(prev => [...prev, {
            id: newId, name: 'ready', description: '',
            generatedCode: '', isGenerating: false, requiredPackages: [],
        }]);
    }, []);

    const removeEvent = useCallback((id: string) => {
        setEvents(prev => prev.filter(evt => evt.id !== id));
    }, []);
    
    const handleGenerateEventCode = useCallback(async (id: string, name: string, description: string) => {
        updateEvent(id, { isGenerating: true });
        try {
            if (!description.trim() || !name.trim()) {
                const defaultCode = language === 'python' ? `# Please provide a description for the event.` : `// Please provide a description for the event.`;
                updateEvent(id, { generatedCode: defaultCode });
                return;
            }
            const { executeBody, requiredPackages } = await generateEventCode(name, description, language);
            updateEvent(id, { generatedCode: executeBody, requiredPackages });
        } catch (error) {
            console.error('Error generating event code:', error);
            updateEvent(id, { generatedCode: `// An error occurred while generating the code. Please try again.` });
        } finally {
            updateEvent(id, { isGenerating: false });
        }
    }, [updateEvent, language]);
    
    const handleSystemChange = useCallback((newSystems: Systems) => {
        setSystems(newSystems);
    }, []);
    
    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            await downloadProjectAsZip({ botName, botToken, clientId, commands, events, systems, botType, prefix, framework, language });
            if(user) {
                logActivity(user.id, 'project_downloaded', { botName });
            }
        } catch (error) {
            console.error("Failed to download project:", error);
            alert(t('downloadError'));
        } finally {
            setIsDownloading(false);
        }
    };
    
    const handleViewChange = (view: ActiveView) => {
        setActiveView(view);
        setIsSidebarOpen(false);
    };
    
    const settingsProps = useMemo((): SettingsState => ({ 
        botName, botToken, clientId, prefix, language, botType, framework 
    }), [botName, botToken, clientId, prefix, language, botType, framework]);
    
    const handleSettingsSave = (newSettings: SettingsState) => {
        // Handle the language change warning
        if (newSettings.language !== language) {
            const hasCustomItems = commands.length > 1 || (commands[0]?.name !== 'ping' && commands[0]?.name !== 'بينج') || events.length > 0;
            if (hasCustomItems && !window.confirm(t('changeLangWarning'))) {
                return; // User cancelled, so abort the save.
            }
            resetProjectForLanguage(newSettings.language);
        }

        // Update all state variables from the new settings object
        setBotName(newSettings.botName);
        setBotToken(newSettings.botToken);
        setClientId(newSettings.clientId);
        setPrefix(newSettings.prefix);
        setLanguage(newSettings.language);
        setBotType(newSettings.botType);
        setFramework(newSettings.framework);
    };

    const propsForCode: GeneratedCodeProps = { botName, botToken, clientId, commands, events, systems, botType, prefix, framework, language };

    const renderActiveView = () => {
        switch (activeView) {
            case 'settings':
                return <SettingsView 
                    initialSettings={settingsProps}
                    onSave={handleSettingsSave}
                    t={t}
                />;
            case 'commands':
                return <CommandBuilder commands={commands} onUpdateCommand={updateCommand} onAddCommand={addCommand} onRemoveCommand={removeCommand} onGenerateCode={handleGenerateCode} />;
            case 'events':
                return <EventBuilder events={events} onUpdateEvent={updateEvent} onAddEvent={addEvent} onRemoveEvent={removeEvent} onGenerateCode={handleGenerateEventCode} />;
            case 'systems':
                return <SystemBuilder initialSystems={systems} onSave={handleSystemChange} />;
            case 'assistant':
                return <AIAssistant />;
            case 'preview':
                return <GeneratedCode {...propsForCode} />;
            default:
                return null;
        }
    };
    
    const SidebarContent = () => (
      <div className="flex h-full flex-col">
          <div className="flex items-center gap-3 mb-6 px-1 flex-shrink-0">
              <BotIcon className="w-8 h-8 text-purple-400" />
              <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
                  {t('generatorTitle')}
              </h1>
          </div>
          <nav className="flex flex-col gap-2 flex-grow overflow-y-auto">
              <SidebarButton isActive={activeView === 'settings'} onClick={() => handleViewChange('settings')} icon={<Cog6ToothIcon className="w-5 h-5" />}>{t('tabSettings')}</SidebarButton>
              <SidebarButton isActive={activeView === 'commands'} onClick={() => handleViewChange('commands')} icon={<CommandLineIcon className="w-5 h-5" />}>{t('tabCommands')}</SidebarButton>
              <SidebarButton isActive={activeView === 'events'} onClick={() => handleViewChange('events')} icon={<BoltIcon className="w-5 h-5" />}>{t('tabEvents')}</SidebarButton>
              <SidebarButton isActive={activeView === 'systems'} onClick={() => handleViewChange('systems')} icon={<WrenchScrewdriverIcon className="w-5 h-5" />}>{t('tabSystems')}</SidebarButton>
              <SidebarButton isActive={activeView === 'assistant'} onClick={() => handleViewChange('assistant')} icon={<ChatBubbleLeftRightIcon className="w-5 h-5" />}>{t('tabAiAssistant')}</SidebarButton>
          </nav>
          <div className="mt-auto flex-shrink-0">
               <SidebarButton isActive={activeView === 'preview'} onClick={() => handleViewChange('preview')} icon={<EyeIcon className="w-5 h-5" />}>{t('tabPreview')}</SidebarButton>
          </div>
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
                    {activeView === 'preview' && (
                         <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                            <button
                                onClick={handleDownload}
                                disabled={isDownloading}
                                className="w-full sm:w-auto flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-bold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isDownloading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        <span>{t('downloading')}</span>
                                    </>
                                ) : (
                                    <>
                                        <DownloadIcon className="w-6 h-6" />
                                        <span>{t('downloadProject')}</span>
                                    </>
                                )}
                            </button>
                             <a
                                href="https://discord.gg/kzs"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full sm:w-auto flex items-center justify-center gap-3 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out"
                            >
                                <DiscordIcon className="w-6 h-6" />
                                <span>{t('joinSupportServer')}</span>
                            </a>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};