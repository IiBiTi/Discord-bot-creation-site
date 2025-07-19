import React, { createContext, useState, useContext, useEffect } from 'react';
import { translations, TranslationKeys } from '../translations';

type Language = 'ar' | 'en';

interface LanguageContextType {
    language: Language;
    setLanguage: (language: Language) => void;
    t: (key: TranslationKeys, replacements?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('ar');

    useEffect(() => {
        document.documentElement.lang = language;
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    }, [language]);

    const t = (key: TranslationKeys, replacements?: Record<string, string>): string => {
        let translation = translations[language][key] || translations['en'][key] || key;

        if (replacements) {
            Object.keys(replacements).forEach(placeholder => {
                translation = translation.replace(new RegExp(`{${placeholder}}`, 'g'), replacements[placeholder]);
            });
        }
        
        return translation;
    };

    const value = {
        language,
        setLanguage,
        t
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};