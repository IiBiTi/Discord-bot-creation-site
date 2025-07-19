import React from 'react';
import { View } from '../App';
import { GeneratedCodeProps } from '../types';
import { useAuth } from '../contexts/AuthContext';

import { HomePage } from './HomePage';
import { BotGenerator } from './BotGenerator';
import { ImportPage } from './ImportPage';
import { ToolsGenerator } from './ToolsGenerator';
import { TermsPage } from './TermsPage';
import { PrivacyPolicyPage } from './PrivacyPolicyPage';
import { GuidePage } from './GuidePage';
import { TemplatesPage } from './TemplatesPage';
// The following pages are now inaccessible due to the auth system being hidden.
// We keep the imports in case they are re-enabled later.
import { LoginPage } from './LoginPage';
import { ProfilePage } from './ProfilePage';
import { AdminDashboard } from './AdminDashboard';
import { SubmitTemplatePage } from './SubmitTemplatePage';


interface MainRouterProps {
    view: View;
    onNavigate: (view: View) => void;
    onImportSuccess: (state: Partial<GeneratedCodeProps>) => void;
    onStartWithTemplate: (templateState: Partial<GeneratedCodeProps>) => void;
    initialGeneratorState: Partial<GeneratedCodeProps> | null;
}

export const MainRouter: React.FC<MainRouterProps> = ({
    view,
    onNavigate,
    onImportSuccess,
    onStartWithTemplate,
    initialGeneratorState
}) => {
    const { loading } = useAuth();
    
    if (loading) {
        return <div className="flex items-center justify-center h-screen"><p>Loading...</p></div>;
    }

    // Since the auth system is hidden, all protected routes now redirect to home.
    const protectedViews: View[] = ['login', 'profile', 'admin', 'submit-template'];
    if (protectedViews.includes(view)) {
        // Render HomePage directly instead of triggering a navigation loop
        return <HomePage onNavigate={onNavigate} />;
    }

    switch (view) {
        case 'import':
            return <ImportPage onGoHome={() => onNavigate('home')} onImportSuccess={onImportSuccess} />;
        case 'generator':
            return <BotGenerator onGoHome={() => onNavigate('home')} initialState={initialGeneratorState} />;
        case 'tools':
            return <ToolsGenerator onGoHome={() => onNavigate('home')} />;
        case 'terms':
            return <TermsPage onGoHome={() => onNavigate('home')} />;
        case 'privacy':
            return <PrivacyPolicyPage onGoHome={() => onNavigate('home')} />;
        case 'guide':
            return <GuidePage onGoHome={() => onNavigate('home')} />;
        case 'templates':
            return <TemplatesPage onNavigate={onNavigate} onStartWithTemplate={onStartWithTemplate} />;
        case 'home':
        default:
            return <HomePage onNavigate={onNavigate} />;
    }
}