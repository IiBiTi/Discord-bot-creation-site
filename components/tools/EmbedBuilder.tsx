
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { ViewColumnsIcon } from '../icons/ViewColumnsIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { PlusIcon } from '../icons/PlusIcon';
import { ToggleSwitch } from '../ToggleSwitch';
import { CopyIcon } from '../icons/CopyIcon';

interface EmbedField {
    id: string; // Add id for stable key
    name: string;
    value: string;
    inline: boolean;
}

interface EmbedData {
    color?: number;
    author?: { name?: string; url?: string; icon_url?: string; };
    title?: string;
    url?: string;
    description?: string;
    fields?: EmbedField[];
    image?: { url?: string; };
    thumbnail?: { url?: string; };
    footer?: { text?: string; icon_url?: string; };
    timestamp?: string;
}

const EmbedPreview: React.FC<{ embed: EmbedData }> = ({ embed }) => {
    const {t} = useLanguage();
    // Helper to get a clean embed object for display (without our internal 'id' field)
    const getCleanedEmbed = () => {
        const cleanedEmbed = JSON.parse(JSON.stringify(embed));
        if (cleanedEmbed.fields) {
            cleanedEmbed.fields = cleanedEmbed.fields.map(({ id, ...rest }: EmbedField) => rest);
        }
        return cleanedEmbed;
    };
    const displayEmbed = getCleanedEmbed();

    return (
        <div className="bg-gray-800 p-4 rounded-lg flex-1 min-w-0">
             <h3 className="text-lg font-bold mb-4 text-center text-gray-300">{t('embedPreview')}</h3>
            <div className="bg-[#2f3136] rounded p-4 flex gap-4 w-full max-w-lg mx-auto">
                <div style={{ backgroundColor: displayEmbed.color ? `#${displayEmbed.color.toString(16).padStart(6, '0')}` : '#202225' }} className="w-1 rounded-l-full"></div>
                <div className="flex-1 min-w-0">
                    {displayEmbed.author?.name && (
                        <div className="flex items-center gap-2 mb-2">
                            {displayEmbed.author.icon_url && <img src={displayEmbed.author.icon_url} alt="author icon" className="w-6 h-6 rounded-full object-cover"/>}
                            <a href={displayEmbed.author.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-white hover:underline truncate">{displayEmbed.author.name}</a>
                        </div>
                    )}
                    {displayEmbed.title && (
                         <a href={displayEmbed.url} target="_blank" rel="noopener noreferrer" className="text-lg font-bold text-white hover:underline break-words">{displayEmbed.title}</a>
                    )}
                    {displayEmbed.description && (
                        <p className="text-sm text-gray-300 mt-1 whitespace-pre-wrap break-words">{displayEmbed.description}</p>
                    )}
                    {displayEmbed.fields && displayEmbed.fields.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                            {displayEmbed.fields.map((field: any, i: number) => (
                                <div key={i} className={`${field.inline ? 'md:col-span-1' : 'md:col-span-3'}`}>
                                    <h4 className="text-sm font-semibold text-white break-words">{field.name || '\u200b'}</h4>
                                    <p className="text-sm text-gray-300 whitespace-pre-wrap break-words">{field.value || '\u200b'}</p>
                                </div>
                            ))}
                        </div>
                    )}
                     {displayEmbed.image?.url && (
                        <img src={displayEmbed.image.url} alt="embed" className="mt-3 rounded-lg max-w-full h-auto" />
                     )}
                     {displayEmbed.thumbnail?.url && (
                        <img src={displayEmbed.thumbnail.url} alt="thumbnail" className="absolute top-4 right-4 w-20 h-20 rounded-lg object-cover" />
                     )}
                    {displayEmbed.footer?.text && (
                        <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                             {displayEmbed.footer.icon_url && <img src={displayEmbed.footer.icon_url} alt="footer icon" className="w-5 h-5 rounded-full object-cover"/>}
                             <span>{displayEmbed.footer.text}{displayEmbed.timestamp ? ` • ${new Date(displayEmbed.timestamp).toLocaleString()}` : ''}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


export const EmbedBuilder: React.FC = () => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('content');
    const [embed, setEmbed] = useState<EmbedData>({
        description: "This is an example embed.",
        title: "Example Title",
        color: 0x4f46e5,
        fields: []
    });
    const [colorInput, setColorInput] = useState('#4f46e5');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (/^#([0-9A-F]{3}){1,2}$/i.test(colorInput)) {
            const newColor = parseInt(colorInput.substring(1), 16);
            if (!isNaN(newColor)) {
                 handleUpdate('color', newColor);
            }
        }
    }, [colorInput]);

    const handleUpdate = (path: string, value: any) => {
        setEmbed(prev => {
            const newEmbed = JSON.parse(JSON.stringify(prev)); // Deep copy to prevent mutation
            const keys = path.split('.');
            let current: any = newEmbed;
            keys.forEach((key, index) => {
                if (index === keys.length - 1) {
                    if (value === undefined || value === null || value === '') {
                        delete current[key];
                    } else {
                        current[key] = value;
                    }
                } else {
                    if (current[key] === undefined || current[key] === null) {
                        current[key] = {};
                    }
                    current = current[key];
                }
            });
            // Cleanup empty objects after update
            if (newEmbed.author && Object.keys(newEmbed.author).length === 0) delete newEmbed.author;
            if (newEmbed.footer && Object.keys(newEmbed.footer).length === 0) delete newEmbed.footer;
            if (newEmbed.image && Object.keys(newEmbed.image).length === 0) delete newEmbed.image;
            if (newEmbed.thumbnail && Object.keys(newEmbed.thumbnail).length === 0) delete newEmbed.thumbnail;
            
            return newEmbed;
        });
    };
    
    const handleFieldChange = (id: string, key: keyof Omit<EmbedField, 'id'>, value: any) => {
        setEmbed(prev => {
            const newFields = (prev.fields || []).map(field => {
                if (field.id === id) {
                    return { ...field, [key]: value };
                }
                return field;
            });
            return { ...prev, fields: newFields };
        });
    };
    
    const addField = () => {
        const newField: EmbedField = { id: `field_${Date.now()}`, name: 'New Field', value: 'Some value', inline: false };
        setEmbed(prev => ({
            ...prev,
            fields: [...(prev.fields || []), newField]
        }));
    };
    
    const removeField = (id: string) => {
        setEmbed(prev => ({
            ...prev,
            fields: (prev.fields || []).filter(field => field.id !== id)
        }));
    };
    
    const getCleanedEmbed = () => {
        const cleanedEmbed = JSON.parse(JSON.stringify(embed));
        if (cleanedEmbed.fields) {
            cleanedEmbed.fields = cleanedEmbed.fields.map(({ id, ...rest }: EmbedField) => rest);
        }
        return cleanedEmbed;
    };

    const handleCopyJson = () => {
        const cleanedEmbed = getCleanedEmbed();
        navigator.clipboard.writeText(JSON.stringify(cleanedEmbed, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const TabButton = ({ id, label }: {id: string; label: string}) => (
        <button onClick={() => setActiveTab(id)} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === id ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>{label}</button>
    );
    
    const Input = ({label, name, value, ...props}: any) => (
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">{t(label)}</label>
            <input type="text" value={value || ''} onChange={(e) => handleUpdate(name, e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition" {...props} />
        </div>
    );
    
     const Textarea = ({label, name, value, ...props}: any) => (
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">{t(label)}</label>
            <textarea value={value || ''} onChange={(e) => handleUpdate(name, e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition" rows={4} {...props} />
        </div>
    );

    return (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 shadow-lg animate-fade-in">
             <div className="p-6 border-b border-gray-700">
                <div className="flex items-center gap-4">
                    <ViewColumnsIcon className="w-8 h-8 text-purple-400" />
                    <div>
                        <h2 className="text-2xl font-bold">{t('embedBuilderTitle')}</h2>
                        <p className="text-gray-400 text-sm">{t('embedBuilderSubtitle')}</p>
                    </div>
                </div>
            </div>
            
            <div className="flex flex-col lg:flex-row">
                <div className="lg:w-1/2 p-6 border-b lg:border-b-0 lg:border-r border-gray-700">
                    <div className="flex flex-wrap gap-2 mb-6 p-1 bg-gray-900/50 rounded-lg border border-gray-600">
                         <TabButton id="content" label={t('embedTabContent')} />
                         <TabButton id="author" label={t('embedTabAuthor')} />
                         <TabButton id="fields" label={t('embedTabFields')} />
                         <TabButton id="images" label={t('embedTabImages')} />
                         <TabButton id="footer" label={t('embedTabFooter')} />
                         <TabButton id="json" label={t('embedTabJson')} />
                    </div>
                    
                    <div className="space-y-4">
                        {activeTab === 'content' && <div className="space-y-4 animate-fade-in">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">{t('embedLabelColor')}</label>
                                <input type="text" value={colorInput} onChange={(e) => setColorInput(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition" />
                            </div>
                            <Input label="embedLabelTitle" name="title" value={embed.title} />
                            <Input label="embedLabelUrl" name="url" value={embed.url} />
                            <Textarea label="embedLabelDescription" name="description" value={embed.description} />
                        </div>}
                        
                        {activeTab === 'author' && <div className="space-y-4 animate-fade-in">
                             <Input label="embedLabelAuthorName" name="author.name" value={embed.author?.name} />
                             <Input label="embedLabelAuthorUrl" name="author.url" value={embed.author?.url} />
                             <Input label="embedLabelAuthorIconUrl" name="author.icon_url" value={embed.author?.icon_url} />
                        </div>}
                        
                        {activeTab === 'fields' && <div className="space-y-4 animate-fade-in">
                             {(embed.fields || []).map((field) => (
                                <div key={field.id} className="bg-gray-900/60 p-3 rounded-lg border border-gray-600 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold text-sm text-purple-300">Field</p>
                                        <button onClick={() => removeField(field.id)} className="text-gray-500 hover:text-red-500 p-1"><TrashIcon className="w-4 h-4" /></button>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">{t('embedLabelFieldName')}</label>
                                        <input type="text" value={field.name || ''} onChange={(e) => handleFieldChange(field.id, 'name', e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">{t('embedLabelFieldValue')}</label>
                                        <textarea value={field.value || ''} onChange={(e) => handleFieldChange(field.id, 'value', e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition" rows={2} />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium text-gray-300">{t('embedLabelFieldInline')}</label>
                                        <ToggleSwitch enabled={field.inline} onChange={(val) => handleFieldChange(field.id, 'inline', val)} ariaLabel="Field inline" />
                                    </div>
                                </div>
                             ))}
                            <button onClick={addField} className="w-full flex items-center justify-center gap-2 text-purple-400 hover:text-purple-300 font-semibold py-2 px-4 rounded-lg transition-colors border-2 border-dashed border-gray-600 hover:border-purple-400">
                                <PlusIcon className="w-5 h-5"/> {t('embedAddField')}
                            </button>
                        </div>}
                        
                         {activeTab === 'images' && <div className="space-y-4 animate-fade-in">
                            <Input label="embedLabelImageUrl" name="image.url" value={embed.image?.url} />
                            <Input label="embedLabelThumbnailUrl" name="thumbnail.url" value={embed.thumbnail?.url} />
                         </div>}

                        {activeTab === 'footer' && <div className="space-y-4 animate-fade-in">
                             <Input label="embedLabelFooterText" name="footer.text" value={embed.footer?.text} />
                             <Input label="embedLabelFooterIconUrl" name="footer.icon_url" value={embed.footer?.icon_url} />
                             <div className="flex items-center justify-between bg-gray-900/60 p-3 rounded-lg border border-gray-600">
                                <label className="text-sm font-medium text-gray-300">{t('embedToggleTimestamp')}</label>
                                <ToggleSwitch enabled={!!embed.timestamp} onChange={(val) => handleUpdate('timestamp', val ? new Date().toISOString() : undefined)} ariaLabel="Toggle timestamp" />
                             </div>
                        </div>}

                         {activeTab === 'json' && <div className="space-y-4 animate-fade-in">
                            <div className="relative">
                                <textarea dir="ltr" readOnly value={JSON.stringify(getCleanedEmbed(), null, 2)} rows={15} className="w-full bg-gray-900/80 border border-gray-600 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-purple-500 outline-none transition" />
                                 <button
                                    onClick={handleCopyJson}
                                    className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    {copied ? <span className="text-xs text-green-300">Copied!</span> : <CopyIcon className="w-4 h-4" />}
                                </button>
                            </div>
                         </div>}

                    </div>
                </div>
                <div className="lg:w-1/2 p-6 flex flex-col">
                   <EmbedPreview embed={embed} />
                </div>
            </div>
        </div>
    );
};
