import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageIcon } from './icons/LanguageIcon';

export const LanguageSwitcher: React.FC = () => {
    const { language, setLanguage } = useLanguage();

    const toggleLanguage = () => {
        const newLang = language === 'ar' ? 'en' : 'ar';
        setLanguage(newLang);
    };

    return (
        <div className="flex items-center">
            <button
                onClick={toggleLanguage}
                className="flex items-center gap-2 p-2 rounded-lg text-gray-300 hover:bg-gray-700/80 hover:text-white transition-colors"
                aria-label="Change language"
            >
                <LanguageIcon className="w-5 h-5"/>
                <span className="font-semibold text-sm">{language === 'ar' ? 'EN' : 'AR'}</span>
            </button>
        </div>
    );
};
