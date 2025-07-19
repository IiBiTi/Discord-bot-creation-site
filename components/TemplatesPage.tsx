import React, { useState, useEffect } from 'react';
import { GeneratedCodeProps, Template } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { UserPlusIcon } from './icons/UserPlusIcon';
import { ClipboardDocumentListIcon } from './icons/ClipboardDocumentListIcon';
import { CheckIcon } from './icons/CheckIcon';
import { ViewGridIcon } from './icons/ViewGridIcon';
import { Header } from './Header';
import { View } from '../App';
import { PlusIcon } from './icons/PlusIcon';
import { useAuth } from '../contexts/AuthContext';

interface TemplatesPageProps {
    onNavigate: (view: View) => void;
    onStartWithTemplate: (template: Partial<GeneratedCodeProps>) => void;
}

const officialTemplates = [
    {
        id: 'official_mod',
        nameKey: 'templateModTitle',
        descKey: 'templateModDesc',
        featuresKey: 'templateModFeatures',
        icon: <ShieldCheckIcon className="w-7 h-7 text-red-400"/>,
        imageUrl: "https://i.imgur.com/8dXRSA4.png",
        config: {
            botName: "Moderation Bot", language: 'nodejs' as const, framework: 'commonjs' as const, botType: 'slash' as const, commands: [],
            systems: {
                welcome: { enabled: false, channelId: '', message: '', useImage: false, backgroundImage: ''},
                moderation: { enabled: true, logChannelId: '' },
                tickets: { enabled: false, panelChannelId: '', logChannelId: '', openMessage: '', openMethod: 'button' as const, departments: [] }
            }
        }
    },
    {
        id: 'official_welcome',
        nameKey: 'templateWelcomeTitle',
        descKey: 'templateWelcomeDesc',
        featuresKey: 'templateWelcomeFeatures',
        icon: <UserPlusIcon className="w-7 h-7 text-green-400"/>,
        imageUrl: "https://i.imgur.com/SU5Zp5R.png",
        config: {
            botName: "Welcome Bot", language: 'nodejs' as const, framework: 'commonjs' as const, botType: 'slash' as const, commands: [],
            systems: {
                welcome: { enabled: true, channelId: '', message: 'Welcome {user} to {server}! 🎉', useImage: true, backgroundImage: 'https://i.imgur.com/g82B3vT.png'},
                moderation: { enabled: false, logChannelId: '' },
                tickets: { enabled: false, panelChannelId: '', logChannelId: '', openMessage: '', openMethod: 'button' as const, departments: [] }
            }
        }
    },
    {
        id: 'official_multi',
        nameKey: 'templateMultiPurposeTitle',
        descKey: 'templateMultiPurposeDesc',
        featuresKey: 'templateMultiPurposeFeatures',
        icon: <ClipboardDocumentListIcon className="w-7 h-7 text-blue-400"/>,
        imageUrl: "https://i.imgur.com/u5U2p21.png",
        config: {
            botName: "My Awesome Bot", language: 'nodejs' as const, framework: 'commonjs' as const, botType: 'slash' as const, commands: [],
            systems: {
                welcome: { enabled: false, channelId: '', message: '', useImage: false, backgroundImage: ''},
                moderation: { enabled: false, logChannelId: '' },
                tickets: { enabled: false, panelChannelId: '', logChannelId: '', openMessage: '', openMethod: 'button' as const, departments: [] }
            }
        }
    }
];


const TemplateCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
    features: string[];
    imageUrl?: string;
    author?: string;
    onClick: () => void;
}> = ({ icon, title, description, features, imageUrl, author, onClick }) => {
    const { t } = useLanguage();
    const placeholderImage = "https://user-images.githubusercontent.com/16839610/215313980-3b9513e9-74d6-444c-8b89-9a25997235b2.png";


    return (
        <div className="bg-gray-800/40 rounded-2xl border border-gray-700/60 shadow-lg overflow-hidden flex flex-col group transition-all duration-300 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-900/30 hover:scale-[1.03] transform">
            <div className="relative overflow-hidden h-48">
                 <img src={imageUrl || placeholderImage} alt={title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"/>
                 <div className="absolute inset-0 bg-gradient-to-t from-gray-800/80 via-gray-800/20 to-transparent"></div>
            </div>
            <div className="p-6 flex-grow flex flex-col">
                <div className="flex items-center gap-4 mb-2">
                    <div className="flex items-center justify-center bg-gray-700/50 w-12 h-12 rounded-xl border border-gray-600 transition-all duration-300 group-hover:bg-purple-600/30 group-hover:border-purple-500 flex-shrink-0">
                        {icon}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">{title}</h3>
                        {author && <p className="text-xs text-purple-300">{t('templatesByUser', {author})}</p>}
                    </div>
                </div>
                <p className="text-gray-400 leading-relaxed text-sm flex-grow">{description}</p>
                {features && features.length > 0 && (
                    <ul className="my-6 space-y-2">
                        {features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm text-gray-300">
                                <CheckIcon className="w-4 h-4 text-green-400 flex-shrink-0" />
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>
                )}
                <button
                    onClick={onClick}
                    className="mt-auto w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-md"
                >
                    {t('useTemplate')}
                </button>
            </div>
        </div>
    );
};


export const TemplatesPage: React.FC<TemplatesPageProps> = ({ onNavigate, onStartWithTemplate }) => {
    const { t } = useLanguage();
    const { user } = useAuth();
    const [userTemplates, setUserTemplates] = useState<Template[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        try {
            const approvedTemplates = JSON.parse(localStorage.getItem('dbg_approved_templates') || '[]') as Template[];
            setUserTemplates(approvedTemplates);
        } catch (error) {
            console.error("Error fetching approved templates from localStorage:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return (
        <div className="flex-grow w-full animate-fade-in">
            <Header onNavigate={onNavigate} />
             <header className="relative w-full max-w-6xl mx-auto py-16 px-4">
                 <div className="text-center">
                    <div className="flex justify-center items-center gap-4">
                        <ViewGridIcon className="w-16 h-16 text-purple-400" />
                        <div>
                            <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
                               {t('pageTemplatesTitle')}
                            </h1>
                            <p className="mt-4 text-lg max-w-3xl mx-auto text-gray-400">
                                {t('pageTemplatesSubtitle')}
                            </p>
                        </div>
                    </div>
                    {user && (
                         <button onClick={() => onNavigate('submit-template')} className="mt-6 flex items-center justify-center gap-2 mx-auto bg-gray-800/60 hover:bg-gray-700/80 text-gray-300 font-bold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out border border-gray-700">
                            <PlusIcon className="w-5 h-5"/>
                            <span>{t('shareTemplate')}</span>
                        </button>
                    )}
                </div>
            </header>
            <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                     {officialTemplates.map(template => (
                        <TemplateCard 
                            key={template.id}
                            icon={template.icon}
                            title={t(template.nameKey as any)}
                            description={t(template.descKey as any)}
                            features={t(template.featuresKey as any).split(',')}
                            imageUrl={template.imageUrl}
                            onClick={() => onStartWithTemplate(template.config)}
                        />
                     ))}
                     {userTemplates.map(template => (
                        <TemplateCard 
                            key={template.id}
                            icon={<ClipboardDocumentListIcon className="w-7 h-7 text-blue-400"/>}
                            title={template.name}
                            description={template.description}
                            features={[]}
                            author={template.author}
                            imageUrl={template.imageUrl}
                            onClick={() => onStartWithTemplate(template.config)}
                        />
                     ))}
                 </div>
                 {isLoading && <p className="text-center text-gray-400">Loading community templates...</p>}
            </main>
        </div>
    );
}