

import React, { useState } from 'react';
import { BotGenerator } from './components/BotGenerator';
import { GeneratedCodeProps } from './types';
import { AuthProvider } from './contexts/AuthContext';
import { Footer } from './components/Footer';
import { MainRouter } from './components/MainRouter';

export type View = 'home' | 'generator' | 'import' | 'tools' | 'terms' | 'privacy' | 'guide' | 'templates' | 'login' | 'profile' | 'admin' | 'submit-template';

const App: React.FC = () => {
    const [view, setView] = useState<View>('home');
    const [initialGeneratorState, setInitialGeneratorState] = useState<Partial<GeneratedCodeProps> | null>(null);

    const handleNavigate = (targetView: View) => {
        if(targetView !== 'generator') {
            setInitialGeneratorState(null);
        }
        setView(targetView);
        window.scrollTo(0, 0);
    }
    
    const handleImportSuccess = (state: Partial<GeneratedCodeProps>) => {
        setInitialGeneratorState(state);
        setView('generator');
    }

    const handleStartWithTemplate = (templateState: Partial<GeneratedCodeProps>) => {
        setInitialGeneratorState(templateState);
        setView('generator');
    };

    const showFooter = !['generator', 'tools', 'login', 'profile', 'admin', 'submit-template'].includes(view);

    return (
         <div className="min-h-screen bg-gray-900 text-white flex flex-col">
            <div className="flex-grow">
               <MainRouter 
                 view={view}
                 onNavigate={handleNavigate}
                 onImportSuccess={handleImportSuccess}
                 onStartWithTemplate={handleStartWithTemplate}
                 initialGeneratorState={initialGeneratorState}
               />
            </div>
            {showFooter && (
                 <Footer onNavigate={(page) => handleNavigate(page as View)} />
            )}
        </div>
    );
};

export default App;