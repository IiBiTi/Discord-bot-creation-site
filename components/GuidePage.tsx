
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { InfoPageLayout } from './InfoPageLayout';

interface GuidePageProps {
    onGoHome: () => void;
}

export const GuidePage: React.FC<GuidePageProps> = ({ onGoHome }) => {
    const { t } = useLanguage();

    return (
        <InfoPageLayout titleKey="pageGuideTitle" onGoHome={onGoHome}>
            {t('guideContent')}
        </InfoPageLayout>
    );
};