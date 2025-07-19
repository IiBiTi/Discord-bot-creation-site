
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { InfoPageLayout } from './InfoPageLayout';

interface TermsPageProps {
    onGoHome: () => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onGoHome }) => {
    const { t } = useLanguage();

    return (
        <InfoPageLayout titleKey="pageTermsTitle" onGoHome={onGoHome}>
            {t('termsContent')}
        </InfoPageLayout>
    );
};