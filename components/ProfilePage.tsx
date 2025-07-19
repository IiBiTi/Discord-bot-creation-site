import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { View } from '../App';
import { Header } from './Header';
import { UserCircleIcon } from './icons/UserCircleIcon';
import { UserActivity } from '../types';
import { getActivitiesForUser } from '../services/activityLogger';
import { BotIcon } from './icons/BotIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { WrenchScrewdriverIcon } from './icons/WrenchScrewdriverIcon';

interface ProfilePageProps {
    onNavigate: (view: View) => void;
}

const ActivityIcon: React.FC<{ type: UserActivity['type'] }> = ({ type }) => {
    switch (type) {
        case 'bot_created':
        case 'project_downloaded':
            return <DownloadIcon className="w-5 h-5 text-blue-400" />;
        case 'tool_used':
            return <WrenchScrewdriverIcon className="w-5 h-5 text-yellow-400" />;
        default:
            return <BotIcon className="w-5 h-5 text-gray-400" />;
    }
};

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
    const { t } = useLanguage();
    const { user } = useAuth();
    const [activities, setActivities] = useState<UserActivity[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            setIsLoading(true);
            const userActivities = getActivitiesForUser(user.id);
            setActivities(userActivities);
            setIsLoading(false);
        }
    }, [user]);
    
    const getActivityText = (activity: UserActivity) => {
        const { type, details } = activity;
        switch (type) {
            case 'tool_used':
                const toolNameKey = `toolName_${details.toolName}` as any;
                return t('activityUsedTool', { toolName: t(toolNameKey) });
            case 'project_downloaded':
                return t('activityDownloadedProject', { botName: details.botName });
            default:
                return 'Unknown activity';
        }
    }


    if (!user) {
        return null; // Should be redirected by router, but as a fallback
    }

    return (
        <div className="flex flex-col min-h-screen animate-fade-in">
            <Header onNavigate={onNavigate} />
            <main className="flex-grow flex items-center justify-center p-4">
                <div className="w-full max-w-2xl">
                    <div className="text-center mb-8">
                        <UserCircleIcon className="w-20 h-20 text-purple-400 mx-auto" />
                        <h1 className="text-3xl font-bold text-white mt-4">{user.name}</h1>
                        <p className="text-gray-400">{t('profileSubtitle')}</p>
                    </div>
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 shadow-lg p-8">
                        <h2 className="text-xl font-bold text-white mb-4">{t('profileRecentActivity')}</h2>
                        {isLoading ? (
                            <p className="text-gray-500 text-center py-8">Loading activities...</p>
                        ) : activities.length > 0 ? (
                            <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
                                {activities.map(activity => (
                                    <li key={activity.id} className="flex items-center gap-4 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                                        <ActivityIcon type={activity.type} />
                                        <div className="flex-grow">
                                            <p className="text-sm text-gray-200">{getActivityText(activity)}</p>
                                            <p className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleString()}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 text-center py-8">{t('profileNoActivity')}</p>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};
