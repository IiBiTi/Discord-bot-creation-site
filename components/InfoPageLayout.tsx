
import React from 'react';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { useLanguage } from '../contexts/LanguageContext';

interface InfoPageLayoutProps {
    titleKey: string;
    children: React.ReactNode;
    onGoHome: () => void;
}

export const InfoPageLayout: React.FC<InfoPageLayoutProps> = ({ titleKey, onGoHome, children }) => {
    const { t } = useLanguage();
    return (
        <div className="flex-grow w-full animate-fade-in p-4">
            <div className="flex-grow flex flex-col items-center">
                 <header className="relative w-full max-w-4xl mx-auto py-8">
                    <button onClick={onGoHome} className="absolute top-8 ltr:left-0 rtl:right-0 flex items-center gap-2 text-gray-400 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-gray-800">
                        <ArrowLeftIcon className="w-5 h-5"/>
                        <span className="hidden sm:inline">{t('backToHome')}</span>
                    </button>
                    <h1 className="text-center text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
                       {t(titleKey as any)}
                    </h1>
                </header>
                <main className="w-full max-w-4xl mx-auto bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 shadow-lg p-6 sm:p-8 md:p-10 mb-12">
                    <div 
                        className="prose prose-invert prose-lg max-w-none text-gray-300 prose-h2:text-white prose-h2:font-bold prose-h2:text-2xl prose-h3:text-gray-200 prose-a:text-purple-400 hover:prose-a:text-purple-300 prose-ul:list-disc prose-ul:ml-5 prose-ol:list-decimal prose-ol:ml-5"
                        dangerouslySetInnerHTML={{ __html: children as string }}
                    >
                    </div>
                </main>
            </div>
        </div>
    );
};