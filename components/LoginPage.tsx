import React, { useState } from 'react';
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
    const { login, signup, loginWithProvider } = useAuth();
    const [isLoginView, setIsLoginView] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        let success = false;
        if (isLoginView) {
            success = login(email, password);
        } else {
            success = signup(name, email, password);
        }
        
        if (success) {
            onNavigate('home');
        } else {
            setError(isLoginView ? 'Invalid credentials' : 'User already exists');
        }
    };
    
    const handleSocialLogin = (provider: 'discord' | 'google' | 'github') => {
        loginWithProvider(provider);
        onNavigate('home');
    }

    return (
        <div className="flex items-center justify-center min-h-screen p-4 bg-gray-900 animate-fade-in">
            <div className="w-full max-w-md">
                 <div className="text-center mb-8">
                    <BotIcon className="w-16 h-16 text-purple-400 mx-auto" />
                    <h1 className="text-3xl font-bold text-white mt-4">{isLoginView ? t('loginTitle') : t('signup')}</h1>
                    <p className="text-gray-400">{t('loginSubtitle')}</p>
                </div>
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 shadow-lg p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {!isLoginView && (
                             <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-300">{t('userName')}</label>
                                <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none" />
                            </div>
                        )}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300">{t('labelEmail')}</label>
                            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none" />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300">{t('labelPassword')}</label>
                            <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none" />
                        </div>
                        {error && <p className="text-sm text-red-400">{error}</p>}
                        <div>
                            <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">{isLoginView ? t('login') : t('signup')}</button>
                        </div>
                    </form>

                    <div className="relative mt-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-600" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-gray-800 text-gray-400">{t('loginWithSocial')}</span>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-3">
                         <button onClick={() => handleSocialLogin('discord')} className="w-full inline-flex justify-center items-center gap-2 py-2 px-4 border border-gray-600 rounded-md shadow-sm bg-[#5865F2] text-sm font-medium text-white hover:bg-[#4752C4] transition-colors">
                            <DiscordIcon className="w-5 h-5" />
                            <span>{t('loginWithDiscord')}</span>
                        </button>
                        <button onClick={() => handleSocialLogin('google')} className="w-full inline-flex justify-center items-center gap-2 py-2 px-4 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-sm font-medium text-white hover:bg-gray-600 transition-colors">
                            <GoogleIcon className="w-5 h-5" />
                            <span>{t('loginWithGoogle')}</span>
                        </button>
                         <button onClick={() => handleSocialLogin('github')} className="w-full inline-flex justify-center items-center gap-2 py-2 px-4 border border-gray-600 rounded-md shadow-sm bg-[#333] text-sm font-medium text-white hover:bg-[#444] transition-colors">
                            <GitHubIcon className="w-5 h-5" />
                            <span>{t('loginWithGithub')}</span>
                        </button>
                    </div>

                    <p className="mt-6 text-center text-sm text-gray-400">
                        {isLoginView ? t('loginNoAccount') : 'Already have an account?'}
                        <button onClick={() => { setIsLoginView(!isLoginView); setError(''); }} className="font-medium text-purple-400 hover:text-purple-300 ltr:ml-1 rtl:mr-1">
                            {isLoginView ? t('signupAction') : t('login')}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};