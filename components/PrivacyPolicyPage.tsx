
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { InfoPageLayout } from './InfoPageLayout';

interface PrivacyPolicyPageProps {
    onGoHome: () => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onGoHome }) => {
    const { t } = useLanguage();

    return (
        <InfoPageLayout titleKey="pagePrivacyTitle" onGoHome={onGoHome}>
            {t('privacyContent')}
        </InfoPageLayout>
    );
};