import React, { useState, useRef } from 'react';
import JSZip from 'jszip';
import { useLanguage } from '../contexts/LanguageContext';
import { View } from '../App';
import { Header } from './Header';
import { useAuth } from '../contexts/AuthContext';
import { Template, GeneratedCodeProps } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { GitHubIcon } from './icons/GitHubIcon';
import { FolderOpenIcon } from './icons/FolderOpenIcon';
import { CodeIcon } from './icons/CodeIcon';
import { analyzeRepository } from '../services/geminiService';

const analyzeZipProject = async (file: File, onProgress: (log: string) => void): Promise<Partial<GeneratedCodeProps>> => {
    onProgress('Reading ZIP file...');
    const zip = await JSZip.loadAsync(file);
    const filesToAnalyze: { path: string, content: string }[] = [];
    const filePromises: Promise<void>[] = [];
    
    zip.forEach((relativePath, zipEntry) => {
        const path = zipEntry.name;
        const isKeyFile = (
            path.endsWith('.js') || path.endsWith('.ts') || path.endsWith('.py') ||
            path.toLowerCase().endsWith('package.json') || path.toLowerCase().endsWith('requirements.txt')
        ) && (
            path.includes('index.') || path.includes('main.') || path.includes('command') || 
            path.includes('event') || path.includes('cog') || path.toLowerCase().includes('package.json') ||
            path.toLowerCase().includes('requirements.txt')
        );

        if (!zipEntry.dir && isKeyFile) {
            filePromises.push(
                zipEntry.async('string').then(content => {
                     const truncatedContent = content.length > 5000 ? content.substring(0, 5000) + "\n... (file truncated)" : content;
                    filesToAnalyze.push({ path, content: truncatedContent });
                })
            );
        }
    });

    await Promise.all(filePromises);
    
    if (filesToAnalyze.length === 0) {
        throw new Error("No relevant files found in ZIP for analysis.");
    }
    
    onProgress('Simulating AI analysis on file contents...');
    
    const packageJson = filesToAnalyze.find(f => f.path.endsWith('package.json'))?.content;
    const isPython = filesToAnalyze.some(f => f.path.endsWith('.py'));
    
    const mockAnalysis: Partial<GeneratedCodeProps> = {
        botName: packageJson ? JSON.parse(packageJson).name : "Zipped Bot",
        language: isPython ? 'python' : 'nodejs',
        botType: 'slash',
        commands: [],
        events: [],
    };
    
    onProgress('Analysis complete!');
    return mockAnalysis;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

interface SubmitTemplatePageProps {
    onNavigate: (view: View) => void;
}

export const SubmitTemplatePage: React.FC<SubmitTemplatePageProps> = ({ onNavigate }) => {
    const { t } = useLanguage();
    const { user } = useAuth();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [language, setLanguage] = useState<'nodejs' | 'python'>('nodejs');
    const [botType, setBotType] = useState<'slash' | 'prefix'>('slash');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageBase64, setImageBase64] = useState<string | undefined>();
    const [config, setConfig] = useState<Partial<GeneratedCodeProps> | null>(null);
    
    const [submitMethod, setSubmitMethod] = useState<'github' | 'zip' | 'json'>('github');
    const [githubUrl, setGithubUrl] = useState('');

    const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    
    const imageInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImagePreview(URL.createObjectURL(file));
            const base64 = await fileToBase64(file);
            setImageBase64(base64);
        }
    };
    
    const handleAnalysis = async () => {
        setIsAnalyzing(true);
        setStatus({ type: 'info', message: t('analyzingProject') });
        try {
            const result = await analyzeRepository(githubUrl, (log) => {
                setStatus({ type: 'info', message: t(log.messageKey as any, log.replacements) });
            });
            setConfig(result);
            if (result.language) setLanguage(result.language);
            if (result.botType) setBotType(result.botType);
            setStatus({ type: 'success', message: t('analysisSuccess') });
        } catch (error: any) {
            setStatus({ type: 'error', message: `${t('analysisError')}: ${error.message}` });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsAnalyzing(true);
        setStatus({ type: 'info', message: t('analyzingProject') });
        
        try {
            if (submitMethod === 'json') {
                const text = await file.text();
                const jsonConfig = JSON.parse(text);
                setConfig(jsonConfig);
                if (jsonConfig.language) setLanguage(jsonConfig.language);
                if (jsonConfig.botType) setBotType(jsonConfig.botType);
            } else if (submitMethod === 'zip') {
                const result = await analyzeZipProject(file, (log) => {
                    setStatus({ type: 'info', message: log });
                });
                setConfig(result);
                if (result.language) setLanguage(result.language);
                if (result.botType) setBotType(result.botType);
            }
             setStatus({ type: 'success', message: t('analysisSuccess') });
        } catch(error: any) {
             setStatus({ type: 'error', message: `${t('analysisError')}: ${error.message}` });
        } finally {
            setIsAnalyzing(false);
        }
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !name.trim() || !description.trim() || !config) {
            setStatus({ type: 'error', message: t('templateSubmissionError') });
            return;
        }

        setIsSubmitting(true);
        setStatus(null);

        try {
            const newTemplate: Template = {
                id: `template_${Date.now()}`,
                name, description, language, botType,
                author: user.name || 'Anonymous',
                authorId: user.id,
                status: 'pending',
                config,
                imageUrl: imageBase64,
            };
            
            const pendingTemplates = JSON.parse(localStorage.getItem('dbg_pending_templates') || '[]') as Template[];
            pendingTemplates.push(newTemplate);
            localStorage.setItem('dbg_pending_templates', JSON.stringify(pendingTemplates));

            setStatus({ type: 'success', message: t('templateSubmissionSuccess') });
            // Reset form
            setName(''); setDescription(''); setImageBase64(undefined); setImagePreview(null); setConfig(null); setGithubUrl('');

        } catch (error) {
            console.error("Error submitting template:", error);
            setStatus({ type: 'error', message: t('templateSubmissionError') });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen animate-fade-in">
            <Header onNavigate={onNavigate} />
            <main className="flex-grow flex items-center justify-center p-4">
                <div className="w-full max-w-3xl">
                     <div className="text-center mb-8">
                        <PlusIcon className="w-16 h-16 text-purple-400 mx-auto" />
                        <h1 className="text-3xl font-bold text-white mt-4">{t('submitTemplateTitle')}</h1>
                        <p className="text-gray-400">{t('submitTemplateSubtitle')}</p>
                    </div>
                     <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 shadow-lg p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* General Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="template-name" className="block text-sm font-medium text-gray-300">{t('labelTemplateName')}*</label>
                                    <input id="template-name" type="text" value={name} onChange={e => setName(e.target.value)} required
                                        className="mt-1 w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none transition" />
                                </div>
                                <div className='row-span-2'>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">{t('labelTemplateImage')}</label>
                                    <div 
                                        onClick={() => imageInputRef.current?.click()}
                                        className="mt-1 w-full h-40 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center text-gray-400 hover:border-purple-500 hover:text-white cursor-pointer transition-colors bg-cover bg-center"
                                        style={{backgroundImage: `url(${imagePreview})`}}
                                    >
                                        {!imagePreview && <span>Click to upload</span>}
                                    </div>
                                    <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                </div>
                                <div>
                                    <label htmlFor="template-desc" className="block text-sm font-medium text-gray-300">{t('labelTemplateDescription')}*</label>
                                    <textarea id="template-desc" value={description} onChange={e => setDescription(e.target.value)} required
                                        rows={3} className="mt-1 w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none transition" />
                                </div>
                            </div>
                            
                             {/* Submission Method */}
                            <div className='pt-6 border-t border-gray-700'>
                                <label className="block text-sm font-medium text-gray-300 mb-2">{t('labelTemplateSubmitMethod')}*</label>
                                <div className="flex gap-2 p-1 bg-gray-900/50 rounded-lg border border-gray-600">
                                    <button type="button" onClick={() => setSubmitMethod('github')} className={`w-full flex justify-center items-center gap-2 px-4 py-2 rounded-md text-sm font-medium ${submitMethod === 'github' ? 'bg-purple-600 text-white' : 'hover:bg-gray-700'}`}><GitHubIcon className="w-4 h-4" />{t('submitMethod_github')}</button>
                                    <button type="button" onClick={() => setSubmitMethod('zip')} className={`w-full flex justify-center items-center gap-2 px-4 py-2 rounded-md text-sm font-medium ${submitMethod === 'zip' ? 'bg-purple-600 text-white' : 'hover:bg-gray-700'}`}><FolderOpenIcon className="w-4 h-4" />{t('submitMethod_zip')}</button>
                                    <button type="button" onClick={() => setSubmitMethod('json')} className={`w-full flex justify-center items-center gap-2 px-4 py-2 rounded-md text-sm font-medium ${submitMethod === 'json' ? 'bg-purple-600 text-white' : 'hover:bg-gray-700'}`}><CodeIcon className="w-4 h-4" />{t('submitMethod_json')}</button>
                                </div>
                                <div className="mt-4 p-4 bg-gray-900/40 rounded-lg">
                                    {submitMethod === 'github' && <div>
                                        <label htmlFor="github-url" className="block text-sm font-medium text-gray-300">{t('submitGithubUrl')}</label>
                                        <p className="text-xs text-gray-400 mb-2">{t('submitGithubInfo')}</p>
                                        <div className="flex gap-2">
                                            <input id="github-url" type="url" value={githubUrl} onChange={e => setGithubUrl(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none" />
                                            <button type="button" onClick={handleAnalysis} disabled={isAnalyzing || !githubUrl} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50">{isAnalyzing ? t('analyzing') : t('analyzeAndImport')}</button>
                                        </div>
                                    </div>}
                                    {submitMethod === 'zip' && <div>
                                        <label htmlFor="zip-file" className="block text-sm font-medium text-gray-300">{t('submitZipFile')}</label>
                                        <p className="text-xs text-gray-400 mb-2">{t('submitZipInfo')}</p>
                                        <input id="zip-file" type="file" accept=".zip" onChange={handleFileChange} className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700" />
                                    </div>}
                                    {submitMethod === 'json' && <div>
                                        <label htmlFor="json-file" className="block text-sm font-medium text-gray-300">{t('submitJsonFile')}</label>
                                        <p className="text-xs text-gray-400 mb-2">{t('submitJsonInfo')}</p>
                                        <input id="json-file" type="file" accept=".json" onChange={handleFileChange} className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700" />
                                    </div>}
                                </div>
                            </div>

                            {config && <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-700">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300">{t('labelLanguage')}*</label>
                                    <select value={language} onChange={e => setLanguage(e.target.value as any)} className="mt-1 w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500">
                                        <option value="nodejs">Node.js</option>
                                        <option value="python">Python</option>
                                    </select>
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium text-gray-300">{t('labelCommandType')}*</label>
                                    <select value={botType} onChange={e => setBotType(e.target.value as any)} className="mt-1 w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500">
                                        <option value="slash">{t('commandTypeSlash')}</option>
                                        <option value="prefix">{t('commandTypePrefix')}</option>
                                    </select>
                                </div>
                            </div>}
                            
                            <div className="flex items-center justify-between pt-6 border-t border-gray-700">
                                <button type="submit" disabled={isSubmitting || !config} className="flex justify-center py-2 px-5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 transition-colors disabled:opacity-50">
                                    {isSubmitting ? 'Submitting...' : t('submitTemplateButton')}
                                </button>
                                {status && <p className={`text-sm animate-fade-in ${status.type === 'success' ? 'text-green-400' : status.type === 'error' ? 'text-red-400' : 'text-blue-400'}`}>{status.message}</p>}
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};