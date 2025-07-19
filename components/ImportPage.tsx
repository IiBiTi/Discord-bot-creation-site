
import React, { useState } from 'react';
import { GeneratedCodeProps } from '../types';
import { TranslationKeys } from '../translations';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { GitHubIcon } from './icons/GitHubIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { analyzeRepository } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';


interface ImportPageProps {
    onGoHome: () => void;
    onImportSuccess: (state: Partial<GeneratedCodeProps>) => void;
}

const LoadingSpinner: React.FC = () => (
    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


export const ImportPage: React.FC<ImportPageProps> = ({ onGoHome, onImportSuccess }) => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<'standard' | 'ai'>('standard');
    
    const [githubUrl, setGithubUrl] = useState<string>('');
    const [isImporting, setIsImporting] = useState<boolean>(false);
    const [importStatus, setImportStatus] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);

    const [aiGithubUrl, setAiGithubUrl] = useState<string>('');
    const [isAiImporting, setIsAiImporting] = useState<boolean>(false);
    const [aiImportStatus, setAiImportStatus] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);
    const [aiImportLog, setAiImportLog] = useState<string[]>([]);

    const handleStandardImport = async () => {
        if (!githubUrl.trim()) {
            setImportStatus({ message: t('importErrorNoUrl'), type: 'error' });
            return;
        }
    
        setIsImporting(true);
        setImportStatus({ message: t('importStatusSearching'), type: 'info' });
    
        const urlMatch = githubUrl.match(/github\.com\/([^\/]+\/[^\/]+)/);
        if (!urlMatch) {
            setImportStatus({ message: t('importErrorInvalidUrl'), type: 'error' });
            setIsImporting(false);
            return;
        }
    
        const repoPath = urlMatch[1].replace('.git', '');
        const branchesToTry = ['main', 'master'];
        let configData = null;
    
        for (const branch of branchesToTry) {
            try {
                const configUrl = `https://raw.githubusercontent.com/${repoPath}/${branch}/discord-bot-generator.json`;
                const response = await fetch(configUrl);
                if (response.ok) {
                    configData = await response.json();
                    break; 
                }
            } catch (error) { /* Ignore fetch error and try next branch */ }
        }
    
        if (configData) {
            try {
                if (!configData.botName || !configData.commands || !configData.systems) {
                    throw new Error(t('importErrorIncompleteFile'));
                }
                setImportStatus({ message: t('importStatusSuccess'), type: 'success' });
                setTimeout(() => onImportSuccess(configData), 1500);
            } catch(e: any) {
                setImportStatus({ message: `${t('importErrorParsingFailed')}: ${e.message}`, type: 'error' });
            }
        } else {
            setImportStatus({ message: t('importErrorNotFound'), type: 'error' });
        }
    
        setIsImporting(false);
    };
    
    const handleAiImport = async () => {
        if (!aiGithubUrl.trim()) {
            setAiImportStatus({ message: t('importErrorNoUrl'), type: 'error' });
            return;
        }
        setIsAiImporting(true);
        setAiImportStatus(null);
        setAiImportLog([]);

        const onProgress = ({ messageKey, replacements }: { messageKey: TranslationKeys, replacements?: Record<string, string> }) => {
            const message = t(messageKey, replacements);
            setAiImportLog(prev => [...prev, message]);
        };

        try {
            const result = await analyzeRepository(aiGithubUrl, onProgress);
            setAiImportStatus({ message: t('aiImportStatusSuccess'), type: 'success' });
            setTimeout(() => onImportSuccess(result), 1500);

        } catch (error: any) {
            console.error(error);
            onProgress({ messageKey: 'aiLogError' });
            setAiImportStatus({ message: error.message || t('aiImportError'), type: 'error' });
        }
        setIsAiImporting(false);
    }

    return (
        <div className="flex flex-col flex-grow w-full animate-fade-in p-4">
            <div className="flex-grow flex flex-col items-center justify-center">
                <header className="mb-10 text-center max-w-2xl">
                    <button onClick={onGoHome} className="absolute top-6 ltr:left-6 rtl:right-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-gray-800">
                        <ArrowLeftIcon className="w-5 h-5"/>
                        <span className="hidden sm:inline">{t('backToHome')}</span>
                    </button>
                    <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
                       {t('importTitle')}
                    </h1>
                    <p className="mt-4 text-lg text-gray-400">
                        {t('importSubtitle')}
                    </p>
                </header>

                <main className="w-full max-w-2xl">
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 shadow-lg animate-fade-in-up">
                        <div className="p-2 bg-gray-900/50 rounded-t-2xl">
                            <div className="flex gap-2">
                                <button onClick={() => setActiveTab('standard')} className={`w-full text-center px-4 py-2.5 rounded-lg font-semibold transition-colors ${activeTab === 'standard' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700/50'}`}>
                                    {t('standardImportTitle')}
                                </button>
                                <button onClick={() => setActiveTab('ai')} className={`w-full text-center px-4 py-2.5 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${activeTab === 'ai' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700/50'}`}>
                                    <SparklesIcon className="w-5 h-5" />
                                    <span>{t('aiImportTitle')}</span>
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            {activeTab === 'standard' && (
                                <div className="animate-fade-in">
                                    <p className="text-gray-400 mb-4 text-sm" dangerouslySetInnerHTML={{ __html: t('standardImportDesc')}} />
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <input
                                            type="text"
                                            value={githubUrl}
                                            onChange={(e) => setGithubUrl(e.target.value)}
                                            disabled={isImporting}
                                            className="flex-grow bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                                            placeholder="https://github.com/user/repo"
                                            aria-label="GitHub Repository URL"
                                        />
                                        <button
                                            onClick={handleStandardImport}
                                            disabled={isImporting}
                                            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow-md"
                                        >
                                            {isImporting ? <LoadingSpinner/> : <GitHubIcon className="w-5 h-5" />}
                                            <span>{isImporting ? t('importing') : t('importProject')}</span>
                                        </button>
                                    </div>
                                    {importStatus && (
                                        <div className={`mt-4 p-3 rounded-lg text-sm transition-all ${
                                            importStatus.type === 'success' ? 'bg-green-900/50 text-green-300' : 
                                            importStatus.type === 'error' ? 'bg-red-900/50 text-red-300' : 'bg-blue-900/50 text-blue-300'
                                        }`} role="alert">
                                            {importStatus.message}
                                        </div>
                                    )}
                                </div>
                            )}

                             {activeTab === 'ai' && (
                                <div className="animate-fade-in">
                                    <div className="flex items-center gap-2 mb-2">
                                        <p className="text-gray-400 text-sm">{t('aiImportDesc')}</p>
                                        <span className="text-xs font-normal bg-purple-500/50 text-purple-300 rounded-full px-2 py-0.5 border border-purple-500">{t('experimental')}</span>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <input
                                            type="text"
                                            value={aiGithubUrl}
                                            onChange={(e) => setAiGithubUrl(e.target.value)}
                                            disabled={isAiImporting}
                                            className="flex-grow bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                                            placeholder="https://github.com/another-user/another-bot"
                                            aria-label="AI GitHub Repository URL"
                                        />
                                        <button
                                            onClick={handleAiImport}
                                            disabled={isAiImporting}
                                            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow-md"
                                        >
                                            {isAiImporting ? <LoadingSpinner/> : <SparklesIcon className="w-5 h-5" />}
                                            <span>{isAiImporting ? t('analyzing') : t('analyzeAndImport')}</span>
                                        </button>
                                    </div>
                                    
                                    {isAiImporting && (
                                        <div className="mt-4 p-4 bg-gray-900/70 rounded-lg border border-gray-700 max-h-48 overflow-y-auto">
                                            <h4 className="font-semibold mb-2 text-sm text-gray-300">{t('aiImportLogTitle')}</h4>
                                            <ul className="space-y-1 text-xs font-mono text-gray-400">
                                                {aiImportLog.map((log, index) => (
                                                    <li key={index} className="animate-fade-in">{log}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    
                                    {aiImportStatus && !isAiImporting && (
                                        <div className={`mt-4 p-3 rounded-lg text-sm transition-all ${
                                            aiImportStatus.type === 'success' ? 'bg-green-900/50 text-green-300' : 
                                            aiImportStatus.type === 'error' ? 'bg-red-900/50 text-red-300' : 'bg-blue-900/50 text-blue-300'
                                        }`} role="alert">
                                            {aiImportStatus.message}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};
