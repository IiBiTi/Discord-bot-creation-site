import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { BotIcon } from './icons/BotIcon';
import { GeminiIcon } from './icons/GeminiIcon';
import { ReactIcon } from './icons/ReactIcon';
import { JavaScriptIcon } from './icons/JavaScriptIcon';
import { PythonIcon } from './icons/PythonIcon';
import { GitHubIcon } from './icons/GitHubIcon';

interface FooterProps {
    onNavigate: (page: 'terms' | 'privacy' | 'guide' | 'templates') => void;
}

const FooterLink: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
    <button onClick={onClick} className="text-gray-400 hover:text-purple-300 transition-colors duration-200">
        {children}
    </button>
);

const TechIcon: React.FC<{ href: string; icon: React.ReactNode; label: string }> = ({ href, icon, label }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
        {icon}
        <span className="text-sm">{label}</span>
    </a>
);

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
    const { t } = useLanguage();

    return (
        <footer className="bg-gray-900/70 backdrop-blur-sm mt-auto py-12 border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8">
                    {/* About */}
                    <div className="lg:col-span-2">
                         <div className="flex items-center gap-3">
                            <BotIcon className="h-8 w-8 text-purple-400" />
                            <span className="text-xl font-bold">{t('siteTitleShort')}</span>
                        </div>
                        <p className="text-gray-400 mt-4 max-w-xs leading-relaxed">
                            {t('footerSlogan')}
                        </p>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h3 className="text-sm font-semibold text-white tracking-wider uppercase">{t('footerNav')}</h3>
                        <ul className="mt-4 space-y-3">
                            <li><FooterLink onClick={() => onNavigate('guide')}>{t('footerLinkGuide')}</FooterLink></li>
                            <li><FooterLink onClick={() => onNavigate('templates')}>{t('templatesTitleShort')}</FooterLink></li>
                            <li>
                                <a href="https://discord.gg/kzs" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-300 transition-colors duration-200">
                                    Discord
                                </a>
                            </li>
                             <li>
                                <a href="https://github.com/ib0it/discord-bot-generator" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-300 transition-colors duration-200">
                                    GitHub
                                </a>
                            </li>
                        </ul>
                    </div>
                    
                    {/* Legal */}
                    <div>
                        <h3 className="text-sm font-semibold text-white tracking-wider uppercase">{t('footerLegal')}</h3>
                        <ul className="mt-4 space-y-3">
                            <li><FooterLink onClick={() => onNavigate('terms')}>{t('footerLinkTerms')}</FooterLink></li>
                            <li><FooterLink onClick={() => onNavigate('privacy')}>{t('footerLinkPrivacy')}</FooterLink></li>
                        </ul>
                    </div>

                    {/* Powered By */}
                    <div>
                        <h3 className="text-sm font-semibold text-white tracking-wider uppercase">{t('footerPoweredBy')}</h3>
                        <ul className="mt-4 space-y-3">
                            <li><TechIcon href="https://ai.google.dev/" icon={<GeminiIcon className="w-5 h-5"/>} label="Gemini API" /></li>
                            <li><TechIcon href="https://react.dev/" icon={<ReactIcon className="w-5 h-5"/>} label="React" /></li>
                            <li><TechIcon href="https://nodejs.org/" icon={<JavaScriptIcon className="w-5 h-5"/>} label="Node.js" /></li>
                            <li><TechIcon href="https://www.python.org/" icon={<PythonIcon className="w-5 h-5"/>} label="Python" /></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-gray-700/60 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-xs leading-5 text-gray-500">{t('footerRights')}</p>
                    <p className="text-xs leading-5 text-gray-500" dangerouslySetInnerHTML={{ __html: t('footerCredit') }}/>
                </div>
            </div>
        </footer>
    );
};