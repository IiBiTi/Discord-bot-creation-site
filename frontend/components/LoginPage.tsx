import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { View } from '../App';
import { BotIcon } from './icons/BotIcon';
import { DiscordIcon } from './icons/DiscordIcon';
import { GoogleIcon } from './icons/GoogleIcon';
import { GitHubIcon } from './icons/GitHubIcon';

interface LoginPageProps {
    onNavigate: (view: View) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
    const { t } = useLanguage();
    const { loginWithProvider } = useAuth();

    return (
        <div className="flex items-center justify-center min-h-screen p-4 bg-gray-900 animate-fade-in">
            <div className="w-full max-w-md">
                 <div className="text-center mb-8">
                    <BotIcon className="w-16 h-16 text-purple-400 mx-auto" />
                    <h1 className="text-3xl font-bold text-white mt-4">{t('loginTitle')}</h1>
                    <p className="text-gray-400">{t('loginSubtitle')}</p>
                </div>
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 shadow-lg p-8">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-600" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-gray-800 text-gray-400">{t('loginWithSocial')}</span>
                        </div>
                    </div>
                    <div className="mt-6 grid grid-cols-1 gap-3">
                         <button onClick={() => loginWithProvider('discord')} disabled className="w-full inline-flex justify-center items-center gap-2 py-2 px-4 border border-gray-600 rounded-md shadow-sm bg-[#5865F2] text-sm font-medium text-white hover:bg-[#4752C4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            <DiscordIcon className="w-5 h-5" />
                            <span>{t('loginWithDiscord')} (Coming Soon)</span>
                        </button>
                        <button onClick={() => loginWithProvider('google')} className="w-full inline-flex justify-center items-center gap-2 py-2 px-4 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-sm font-medium text-white hover:bg-gray-600 transition-colors">
                            <GoogleIcon className="w-5 h-5" />
                            <span>{t('loginWithGoogle')}</span>
                        </button>
                         <button onClick={() => loginWithProvider('github')} disabled className="w-full inline-flex justify-center items-center gap-2 py-2 px-4 border border-gray-600 rounded-md shadow-sm bg-[#333] text-sm font-medium text-white hover:bg-[#444] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            <GitHubIcon className="w-5 h-5" />
                            <span>{t('loginWithGithub')} (Coming Soon)</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};