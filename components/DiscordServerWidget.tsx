
import React, { useState, useEffect } from 'react';
import { DiscordIcon } from './icons/DiscordIcon';
import { useLanguage } from '../contexts/LanguageContext';
import { CheckBadgeIcon } from './icons/CheckBadgeIcon';

const BANNER_URL = 'https://user-images.githubusercontent.com/1/361868358-10b5034c-6a0d-4076-a078-4384b6f790c3.png';
// This is the specific "KS" logo the user requested.
const ICON_URL = 'https://user-images.githubusercontent.com/1/361877607-b6e51240-a35b-4394-b17b-d784a30e71ca.jpeg';
const INVITE_URL = 'https://discord.gg/kzs';
const INVITE_CODE = 'kzs'; // Kzole Store vanity invite

// Interface for the data from the Discord Invite API
interface DiscordInviteData {
    guild: {
        name: string;
    };
    approximate_presence_count: number;
}


export const DiscordServerWidget: React.FC = () => {
    const { t } = useLanguage();
    const [serverData, setServerData] = useState<DiscordInviteData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchInviteData = async () => {
            setIsLoading(true);
            setError(null);
            // Using the official Discord invite API, which is more reliable than the widget.json endpoint.
            const apiUrl = `https://discord.com/api/invites/${INVITE_CODE}?with_counts=true`;

            try {
                const response = await fetch(apiUrl);
                if (!response.ok) {
                    throw new Error(`Failed to fetch invite data. Status: ${response.status}`);
                }
                const data: DiscordInviteData = await response.json();
                setServerData(data);
            } catch (err: any) {
                console.error("Error fetching Discord invite data:", err.message);
                setError(t('communityFetchError'));
            } finally {
                setIsLoading(false);
            }
        };

        fetchInviteData();
    }, [t]);

    // Use the name from the API for accuracy, with a fallback
    const serverName = serverData?.guild?.name || "Kzole Store";
    const onlineCount = serverData?.approximate_presence_count;

    const renderOnlineCount = () => {
        if (isLoading) {
            return (
                 <div className="mt-2 h-5 w-32 bg-gray-700/80 rounded-md animate-pulse"></div>
            );
        }
        
        if (error) {
            return (
                 <p className="mt-1 text-sm text-red-400">{error}</p>
            );
        }

        if (typeof onlineCount !== 'number') {
            return (
                 <p className="mt-1 text-sm text-gray-400">{t('communitySubtitle')}</p>
            );
        }

        return (
            <div className="mt-2 flex items-center justify-center md:justify-start gap-2 text-green-400">
                <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-sm font-medium">{onlineCount.toLocaleString()} {t('communityOnline')}</span>
            </div>
        );
    }

    return (
        <div className="relative w-full max-w-3xl mx-auto rounded-2xl border border-purple-800/60 shadow-2xl shadow-purple-900/40 overflow-hidden bg-gray-900/70 backdrop-blur-sm animate-fade-in-up">
            {/* Banner */}
            <div className="relative h-40 bg-cover bg-center" style={{ backgroundImage: `url(${BANNER_URL})` }}>
                 <div className="absolute inset-0 bg-black/40"></div>
            </div>

            <div className="relative flex flex-col md:flex-row items-center justify-between p-6 md:p-4">
                <div className="flex flex-col md:flex-row items-center">
                    {/* Icon */}
                    <div className="flex-shrink-0 -mt-16 md:-mt-12">
                        <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gray-800 p-1.5 shadow-lg ring-4 ring-gray-900 z-10">
                            <img src={ICON_URL} alt={`${serverName} Icon`} className="w-full h-full rounded-full object-cover" />
                        </div>
                    </div>
                    
                    {/* Info */}
                    <div className="flex-grow text-center md:text-start md:ltr:ml-5 md:rtl:mr-5 mt-4 md:mt-0">
                         <div className="flex items-center gap-2 justify-center md:justify-start">
                            <h3 className="text-2xl md:text-3xl font-bold text-white">{serverName}</h3>
                            <CheckBadgeIcon className="w-6 h-6 text-blue-400 flex-shrink-0" />
                        </div>
                        
                        {renderOnlineCount()}
                        
                    </div>
                </div>

                {/* Join Button */}
                <div className="mt-6 md:mt-0 flex-shrink-0 md:ltr:ml-4 md:rtl:mr-4">
                    <a
                        href={INVITE_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 shadow-lg shadow-purple-500/30 transform hover:scale-105"
                    >
                        <DiscordIcon className="w-6 h-6" />
                        <span>{t('communityJoin')}</span>
                    </a>
                </div>
            </div>
        </div>
    );
};
