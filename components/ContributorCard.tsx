
import React from 'react';
import { GitHubIcon } from './icons/GitHubIcon';
import { TwitterIcon } from './icons/TwitterIcon';
import { DiscordIcon } from './icons/DiscordIcon';

interface ContributorCardProps {
    name: string;
    role: string;
    avatarUrl: string;
    bio: string;
    githubUrl?: string;
    twitterUrl?: string;
    discordUrl?: string;
}

export const ContributorCard: React.FC<ContributorCardProps> = ({ name, role, avatarUrl, bio, githubUrl, twitterUrl, discordUrl }) => {
    return (
        <div className="bg-gradient-to-br from-gray-800 to-gray-800/60 rounded-2xl border border-gray-700/80 p-6 text-center shadow-lg hover:border-purple-500/50 transform hover:-translate-y-1 transition-all duration-300 flex flex-col">
            <img src={avatarUrl} alt={name} className="w-28 h-28 rounded-full mx-auto -mt-12 border-4 border-gray-900 shadow-xl object-cover" />
            <div className="mt-4 flex-grow">
                <h3 className="text-xl font-bold text-white">{name}</h3>
                <p className="text-sm font-semibold text-purple-400">{role}</p>
                <p className="text-gray-400 mt-3 text-sm leading-relaxed">{bio}</p>
            </div>
            <div className="mt-6 flex justify-center items-center gap-4">
                {githubUrl && (
                    <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                        <GitHubIcon className="w-6 h-6" />
                    </a>
                )}
                 {twitterUrl && (
                    <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                        <TwitterIcon className="w-6 h-6" />
                    </a>
                )}
                 {discordUrl && (
                    <a href={discordUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                        <DiscordIcon className="w-6 h-6" />
                    </a>
                )}
            </div>
        </div>
    );
};