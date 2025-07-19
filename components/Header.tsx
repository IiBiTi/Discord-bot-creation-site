import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { View } from '../App';
import { LanguageSwitcher } from './LanguageSwitcher';
import { BotIcon } from './icons/BotIcon';
import { Bars3Icon } from './icons/Bars3Icon';
import { XMarkIcon } from './icons/XMarkIcon';

interface HeaderProps {
    onNavigate: (view: View) => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
    const { t } = useLanguage();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleMobileLinkClick = (view: View) => {
        onNavigate(view);
        setIsMenuOpen(false);
    }

    const navLinks = [
        { key: 'navGenerator', view: 'generator' as View },
        { key: 'navTemplates', view: 'templates' as View },
        { key: 'navTools', view: 'tools' as View },
        { key: 'navImport', view: 'import' as View },
    ];

    return (
        <header className="sticky top-0 left-0 right-0 z-20 p-4 bg-gray-900/60 backdrop-blur-sm border-b border-white/5">
            <div className="max-w-7xl mx-auto">
                <nav className="flex justify-between items-center">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('home')}>
                        <BotIcon className="w-8 h-8 text-purple-400" />
                        <span className="text-xl font-bold">{t('siteTitleShort')}</span>
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-x-6">
                        {navLinks.map(link => (
                            <button key={link.key} onClick={() => onNavigate(link.view)} className="font-semibold text-gray-300 hover:text-white transition-colors">{t(link.key as any)}</button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        <LanguageSwitcher />
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-gray-300 hover:text-white">
                             {isMenuOpen ? <XMarkIcon className="w-6 h-6"/> : <Bars3Icon className="w-6 h-6" />}
                        </button>
                    </div>
                </nav>
                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden mt-4 p-4 bg-gray-800/80 rounded-lg animate-fade-in">
                        <div className="flex flex-col gap-y-2">
                             {navLinks.map(link => (
                                <button key={link.key} onClick={() => handleMobileLinkClick(link.view)} className="font-semibold text-lg text-gray-200 hover:text-white transition-colors w-full text-start p-3 rounded-md hover:bg-gray-700/50">{t(link.key as any)}</button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};