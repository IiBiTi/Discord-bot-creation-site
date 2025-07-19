import React, { useState } from 'react';
import { BotIcon } from './icons/BotIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { WrenchScrewdriverIcon } from './icons/WrenchScrewdriverIcon';
import { JavaScriptIcon } from './icons/JavaScriptIcon';
import { PythonIcon } from './icons/PythonIcon';
import { GitHubIcon } from './icons/GitHubIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { GeneratedCodeProps } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { DiscordServerWidget } from './DiscordServerWidget';
import { CodeShowcase } from './CodeShowcase';
import { ToolboxIcon } from './icons/ToolboxIcon';
import { ContributorCard } from './ContributorCard';
import { View } from '../App';
import { Header } from './Header';

interface HomePageProps {
  onNavigate: (view: View) => void;
}

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode, onClick?: () => void }> = ({ icon, title, children, onClick }) => (
    <div 
        className={`bg-gray-800/50 p-6 rounded-2xl border border-gray-700/80 hover:border-purple-500/50 hover:bg-gray-800/80 transform hover:-translate-y-1 transition-all duration-300 shadow-lg group ${onClick ? 'cursor-pointer' : ''}`}
        onClick={onClick}
    >
        <div className="flex items-center justify-center bg-gray-700/50 w-12 h-12 rounded-xl mb-4 border border-gray-600 transition-all duration-300 group-hover:bg-purple-600/30 group-hover:border-purple-500">
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
        <p className="text-gray-400 leading-relaxed">{children}</p>
    </div>
);

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  
  return (
    <div className="flex flex-col flex-grow animate-fade-in">
      <Header onNavigate={onNavigate} />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="pt-40 pb-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-gray-700/[0.1] [mask-image:linear-gradient(to_bottom,white_5%,transparent_100%)] -z-10"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-900/30 rounded-full blur-3xl -z-10"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className="text-center md:text-start animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-300">
                    {t('heroTitle')}
                </h1>
                <p className="mt-6 text-lg md:text-xl max-w-2xl mx-auto md:mx-0 text-gray-400">
                  {t('heroSubtitle')}
                </p>
                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
                    <button
                        onClick={() => onNavigate('generator')}
                        className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-bold py-4 px-10 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out"
                    >
                        {t('startFromScratch')}
                    </button>
                    <button
                        onClick={() => onNavigate('templates')}
                        className="w-full sm:w-auto bg-gray-800/60 hover:bg-gray-700/80 text-gray-300 font-bold py-4 px-10 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out border border-gray-700"
                    >
                        {t('browseTemplates')}
                    </button>
                </div>
              </div>

              <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                  <CodeShowcase />
              </div>
            </div>
        </section>

        {/* Join Discord Section */}
        <section id="community" className="py-16 sm:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                 <DiscordServerWidget />
            </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-900/40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold">{t('whyUsTitle')}</h2>
                    <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">{t('whyUsSubtitle')}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <FeatureCard icon={<SparklesIcon className="w-7 h-7 text-purple-400"/>} title={t('featureAiTitle')}>
                        {t('featureAiDesc')}
                    </FeatureCard>
                    <FeatureCard icon={<WrenchScrewdriverIcon className="w-7 h-7 text-green-400"/>} title={t('featureSystemsTitle')}>
                        {t('featureSystemsDesc')}
                    </FeatureCard>
                    <FeatureCard icon={<ToolboxIcon className="w-7 h-7 text-yellow-400" />} title={t('featureToolsTitle')} onClick={() => onNavigate('tools')}>
                        {t('featureToolsDesc')}
                    </FeatureCard>
                     <FeatureCard icon={
                        <div className="flex -space-x-2">
                             <JavaScriptIcon className="w-8 h-8 rounded-sm border-2 border-gray-600"/>
                             <PythonIcon className="w-8 h-8"/>
                        </div>
                     } title={t('featureLanguagesTitle')}>
                         {t('featureLanguagesDesc')}
                    </FeatureCard>
                    <FeatureCard icon={<DownloadIcon className="w-7 h-7 text-blue-400"/>} title={t('featureDownloadTitle')}>
                       {t('featureDownloadDesc')}
                    </FeatureCard>
                    <FeatureCard icon={<GitHubIcon className="w-7 h-7 text-white"/>} title={t('featureImportTitle')} onClick={() => onNavigate('import')}>
                        {t('featureImportDesc')}
                    </FeatureCard>
                </div>
            </div>
        </section>

        {/* How it works section */}
        <section className="py-20 bg-gray-900/30">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold">{t('howItWorksTitle')}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
                     <div className="absolute top-8 left-0 w-full h-0.5 bg-gray-700/80 hidden md:block -z-10 [mask-image:linear-gradient(to_right,transparent_0%,white_10%,white_90%,transparent_100%)]"></div>
                     
                    <div className="flex flex-col items-center text-center relative">
                        <div className="absolute top-8 left-1/2 w-0.5 h-full bg-gray-700/80 md:hidden -z-10 [mask-image:linear-gradient(to_bottom,transparent_0%,white_10%,white_90%,transparent_100%)]"></div>
                        <div className="flex items-center justify-center w-16 h-16 bg-gray-800 border-2 border-purple-500 rounded-full text-2xl font-bold text-purple-400 mb-4 z-0 shadow-lg shadow-purple-900/50">1</div>
                        <h3 className="text-xl font-bold mb-2">{t('step1Title')}</h3>
                        <p className="text-gray-400">{t('step1Desc')}</p>
                    </div>
                     <div className="flex flex-col items-center text-center relative">
                        <div className="absolute top-8 left-1/2 w-0.5 h-full bg-gray-700/80 md:hidden -z-10 [mask-image:linear-gradient(to_bottom,transparent_0%,white_10%,white_90%,transparent_100%)]"></div>
                        <div className="flex items-center justify-center w-16 h-16 bg-gray-800 border-2 border-purple-500 rounded-full text-2xl font-bold text-purple-400 mb-4 z-0 shadow-lg shadow-purple-900/50">2</div>
                        <h3 className="text-xl font-bold mb-2">{t('step2Title')}</h3>
                        <p className="text-gray-400">{t('step2Desc')}</p>
                    </div>
                     <div className="flex flex-col items-center text-center relative">
                        <div className="flex items-center justify-center w-16 h-16 bg-gray-800 border-2 border-purple-500 rounded-full text-2xl font-bold text-purple-400 mb-4 z-0 shadow-lg shadow-purple-900/50">3</div>
                        <h3 className="text-xl font-bold mb-2">{t('step3Title')}</h3>
                        <p className="text-gray-400">{t('step3Desc')}</p>
                    </div>
                </div>
            </div>
        </section>
         
        {/* Contributors Section */}
        <section id="contributors" className="py-20">
             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold">{t('contributorsTitle')}</h2>
                    <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">{t('contributorsSubtitle')}</p>
                </div>
                <div className="flex justify-center">
                    <div className="w-full max-w-sm">
                        <ContributorCard 
                            name="Wesam"
                            role={t('devB0itRole')}
                            avatarUrl="https://avatars.githubusercontent.com/u/16839610?v=4"
                            bio={t('devB0itBio')}
                            githubUrl="https://github.com/ib0it"
                            twitterUrl="https://twitter.com/b0it_"
                            discordUrl="https://discord.gg/kzs"
                        />
                    </div>
                </div>
            </div>
        </section>
      </main>
    </div>
  );
};