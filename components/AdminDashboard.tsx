import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

import { useLanguage } from '../contexts/LanguageContext';
import { View } from '../App';
import { Header } from './Header';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { UsersIcon } from './icons/UsersIcon';
import { BotIcon } from './icons/BotIcon';
import { CommandLineIcon } from './icons/CommandLineIcon';
import { Template } from '../types';
import { analyzeTemplateSafety } from '../services/geminiService';
import { ClipboardDocumentListIcon } from './icons/ClipboardDocumentListIcon';
import { SparklesIcon } from './icons/SparklesIcon';


interface AdminDashboardProps {
    onNavigate: (view: View) => void;
}

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-gray-800/60 p-6 rounded-2xl border border-gray-700 flex items-center gap-4">
        <div className="bg-gray-700/70 p-3 rounded-full">{icon}</div>
        <div>
            <p className="text-sm text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);

const mockUsers = [
    { id: 1, name: 'Admin User', email: 'admin@example.com', role: 'admin', lastLogin: '2024-07-21T10:00:00Z' },
    { id: 2, name: 'John Doe', email: 'john.d@example.com', role: 'user', lastLogin: '2024-07-21T09:30:00Z' },
    { id: 3, name: 'Jane Smith', email: 'jane.s@example.com', role: 'user', lastLogin: '2024-07-20T15:00:00Z' },
    { id: 4, name: 'Wesam', email: 'wesam@example.com', role: 'user', lastLogin: '2024-07-21T11:00:00Z' },
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'templates'>('stats');
    const [searchTerm, setSearchTerm] = useState('');
    const [templates, setTemplates] = useState<Template[]>([]);
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
    const [safetyCheckResult, setSafetyCheckResult] = useState<Record<string, { result: any; loading: boolean }>>({});

    useEffect(() => {
        if (activeTab === 'templates') {
            setIsLoadingTemplates(true);
            const pendingTemplates = JSON.parse(localStorage.getItem('dbg_pending_templates') || '[]') as Template[];
            setTemplates(pendingTemplates);
            setIsLoadingTemplates(false);
        }
    }, [activeTab]);

    const updateTemplateStatus = (id: string, status: 'approved' | 'rejected') => {
        let pendingTemplates = JSON.parse(localStorage.getItem('dbg_pending_templates') || '[]') as Template[];
        const templateToUpdate = pendingTemplates.find(t => t.id === id);
        
        if (!templateToUpdate) return;
        
        pendingTemplates = pendingTemplates.filter(t => t.id !== id);
        localStorage.setItem('dbg_pending_templates', JSON.stringify(pendingTemplates));

        if (status === 'approved') {
            const approvedTemplates = JSON.parse(localStorage.getItem('dbg_approved_templates') || '[]') as Template[];
            templateToUpdate.status = 'approved';
            approvedTemplates.push(templateToUpdate);
            localStorage.setItem('dbg_approved_templates', JSON.stringify(approvedTemplates));
        }
        
        setTemplates(pendingTemplates);
    };

    const handleAnalyzeSafety = async (template: Template) => {
        setSafetyCheckResult(prev => ({ ...prev, [template.id]: { result: null, loading: true } }));
        const result = await analyzeTemplateSafety(JSON.stringify(template.config));
        setSafetyCheckResult(prev => ({ ...prev, [template.id]: { result, loading: false } }));
    };


    const lineChartData = {
        labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
        datasets: [{
            label: t('chartWeeklyVisits'),
            data: [65, 59, 80, 81, 56, 55, 90],
            fill: false,
            borderColor: '#8b5cf6',
            tension: 0.3,
        }],
    };
    
    const doughnutChartData = {
        labels: ['Node.js', 'Python'],
        datasets: [{
            data: [300, 150],
            backgroundColor: ['#8b5cf6', '#3b82f6'],
            borderColor: '#1f2937',
        }],
    };

    const filteredUsers = mockUsers.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const TabButton: React.FC<{ id: 'stats' | 'users' | 'templates'; icon: React.ReactNode; label: string }> = ({ id, icon, label }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === id ? 'bg-purple-600/20 text-purple-300' : 'text-gray-400 hover:bg-gray-700/50'}`}
        >
            {icon} {label}
        </button>
    );

    return (
        <div className="flex flex-col min-h-screen animate-fade-in">
            <Header onNavigate={onNavigate} />
            <main className="flex-grow p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <header className="mb-8">
                        <h1 className="text-3xl font-bold">{t('dashboardTitle')}</h1>
                        <p className="text-gray-400">{t('dashboardSubtitle')}</p>
                    </header>

                    <div className="mb-8 flex flex-wrap gap-2 p-1 bg-gray-800/60 rounded-lg border border-gray-700 self-start">
                        <TabButton id="stats" icon={<ChartBarIcon className="w-4 h-4" />} label={t('statSiteVisits')} />
                        <TabButton id="users" icon={<UsersIcon className="w-4 h-4" />} label={t('userManagementTitle')} />
                        <TabButton id="templates" icon={<ClipboardDocumentListIcon className="w-4 h-4" />} label={t('adminSubmissionsTitle')} />
                    </div>

                    {activeTab === 'stats' && <div className="animate-fade-in">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <StatCard title={t('statSiteVisits')} value="12,403" icon={<ChartBarIcon className="w-6 h-6 text-purple-400" />} />
                            <StatCard title={t('statActiveUsers')} value="1,287" icon={<UsersIcon className="w-6 h-6 text-green-400" />} />
                            <StatCard title={t('statBotsGenerated')} value="3,150" icon={<BotIcon className="w-6 h-6 text-blue-400" />} />
                            <StatCard title={t('statCommandsWritten')} value="25,849" icon={<CommandLineIcon className="w-6 h-6 text-yellow-400" />} />
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 bg-gray-800/60 p-6 rounded-2xl border border-gray-700">
                                <h3 className="font-semibold mb-4">{t('chartWeeklyVisits')}</h3>
                                <Line data={lineChartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                            </div>
                            <div className="bg-gray-800/60 p-6 rounded-2xl border border-gray-700">
                                <h3 className="font-semibold mb-4">{t('chartLanguageDistribution')}</h3>
                                <Doughnut data={doughnutChartData} options={{ responsive: true, cutout: '60%' }} />
                            </div>
                        </div>
                    </div>}
                    
                    {activeTab === 'users' && <div className="animate-fade-in">
                        <div className="bg-gray-800/60 p-6 rounded-2xl border border-gray-700">
                            <h3 className="font-semibold mb-4 text-lg">{t('userManagementTitle')}</h3>
                            <input type="text" placeholder={t('searchUsers')} value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                className="w-full max-w-sm mb-4 bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none transition" />
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-700">
                                    <thead className="bg-gray-800">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-400 uppercase tracking-wider">{t('userName')}</th>
                                            <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-400 uppercase tracking-wider">{t('userEmail')}</th>
                                            <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-400 uppercase tracking-wider">{t('userRole')}</th>
                                            <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-400 uppercase tracking-wider">{t('userLastLogin')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-gray-800/50 divide-y divide-gray-700">
                                        {filteredUsers.map(user => (
                                            <tr key={user.id} className="hover:bg-gray-700/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{user.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.email}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-900 text-purple-300' : 'bg-gray-700 text-gray-300'}`}>
                                                        {t(user.role === 'admin' ? 'userRoleAdmin' : 'userRoleUser')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{new Date(user.lastLogin).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>}

                    {activeTab === 'templates' && <div className="animate-fade-in">
                        <div className="bg-gray-800/60 p-6 rounded-2xl border border-gray-700">
                             <h3 className="font-semibold mb-1 text-lg">{t('adminSubmissionsTitle')}</h3>
                             <p className="text-sm text-gray-400 mb-6">{t('adminSubmissionsSubtitle')}</p>
                             {isLoadingTemplates ? (
                                <p className="text-gray-500 text-center py-8">Loading submissions...</p>
                             ) : templates.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">{t('adminNoSubmissions')}</p>
                             ) : (
                                <div className="space-y-4">
                                    {templates.map(template => (
                                        <div key={template.id} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 flex flex-col md:flex-row gap-4">
                                            {template.imageUrl && (
                                                <img src={template.imageUrl} alt={template.name} className="w-full md:w-48 h-32 object-cover rounded-lg flex-shrink-0" />
                                            )}
                                            <div className='flex-grow'>
                                                <h4 className="font-bold text-lg text-purple-300">{t('adminTemplateCardTitle', {templateName: template.name})}</h4>
                                                <p className="text-sm text-gray-400">{t('adminTemplateCardAuthor', {author: template.author})}</p>
                                                <div className='flex gap-2 text-xs mt-1'>
                                                    <span className='bg-gray-700 px-2 py-0.5 rounded-full'>{template.language}</span>
                                                    <span className='bg-gray-700 px-2 py-0.5 rounded-full'>{template.botType}</span>
                                                </div>
                                                <p className="text-sm text-gray-300 mt-2">{t('adminTemplateCardDesc', {description: template.description})}</p>
                                                <details className="mt-2 text-xs">
                                                    <summary className="cursor-pointer text-gray-400 hover:text-white">{t('adminTemplateCardConfig')}</summary>
                                                    <pre className="mt-1 bg-gray-800 p-2 rounded text-gray-300 max-h-40 overflow-auto font-mono">{JSON.stringify(template.config, null, 2)}</pre>
                                                </details>
                                                <div className="mt-4">
                                                    <h5 className="text-sm font-semibold mb-2">{t('safetyCheckResult')}</h5>
                                                    {safetyCheckResult[template.id]?.loading ? (
                                                        <p className="text-sm text-blue-400">{t('analyzingSafety')}</p>
                                                    ) : safetyCheckResult[template.id]?.result ? (
                                                        <div className={`text-sm p-2 rounded ${safetyCheckResult[template.id].result.safe ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                                                            <p>{safetyCheckResult[template.id].result.safe ? t('safetyCheckPassed') : t('safetyCheckFailed')}</p>
                                                            {!safetyCheckResult[template.id].result.safe && (
                                                                <ul className="list-disc list-inside mt-1">
                                                                    {safetyCheckResult[template.id].result.issues.map((issue: string, i: number) => <li key={i}>{issue}</li>)}
                                                                </ul>
                                                            )}
                                                        </div>
                                                    ) : <p className="text-xs text-gray-500">Awaiting analysis.</p>}
                                                </div>
                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    <button onClick={() => handleAnalyzeSafety(template)} disabled={safetyCheckResult[template.id]?.loading} className="flex items-center gap-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded-md transition-colors disabled:opacity-50">
                                                        <SparklesIcon className="w-4 h-4" /> {t('templateAnalyzeSafety')}
                                                    </button>
                                                    <button onClick={() => updateTemplateStatus(template.id, 'approved')} className="text-sm bg-green-600 hover:bg-green-700 text-white font-semibold py-1 px-3 rounded-md transition-colors">{t('templateApprove')}</button>
                                                    <button onClick={() => updateTemplateStatus(template.id, 'rejected')} className="text-sm bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded-md transition-colors">{t('templateReject')}</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                             )}
                        </div>
                    </div>}

                </div>
            </main>
        </div>
    );
};