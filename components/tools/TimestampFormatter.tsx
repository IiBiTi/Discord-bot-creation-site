
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { ClockIcon } from '../icons/ClockIcon';
import { CopyIcon } from '../icons/CopyIcon';

const TimestampRow: React.FC<{ label: string, formatChar: string, timestamp: number | null }> = ({ label, formatChar, timestamp }) => {
    const [copied, setCopied] = useState(false);
    
    if (timestamp === null) return null;
    
    const formatString = `<t:${timestamp}:${formatChar}>`;

    const handleCopy = () => {
        navigator.clipboard.writeText(formatString);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-600">
            <div className='min-w-0'>
                <p className="text-sm font-medium text-gray-200">{label}</p>
                <p className="text-xs font-mono text-purple-300 truncate">{formatString}</p>
            </div>
            <button 
                onClick={handleCopy}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0 ml-2"
                aria-label="Copy format"
            >
                {copied ? <span className="text-xs text-green-300">Copied!</span> : <CopyIcon className="w-4 h-4" />}
            </button>
        </div>
    );
};


export const TimestampFormatter: React.FC = () => {
    const { t } = useLanguage();
    const [date, setDate] = useState<Date>(new Date());
    const [unixTimestamp, setUnixTimestamp] = useState<number | null>(null);

    useEffect(() => {
        setUnixTimestamp(Math.floor(date.getTime() / 1000));
    }, [date]);
    
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.value) {
            setDate(new Date(e.target.value));
        }
    };
    
    // Format the date for the datetime-local input, considering timezone offset
    const toLocalISOString = (d: Date) => {
        const tzoffset = d.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(d.getTime() - tzoffset)).toISOString().slice(0, -1);
        return localISOTime.substring(0, 16); // YYYY-MM-DDTHH:mm
    };

    return (
         <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 shadow-lg animate-fade-in max-w-2xl mx-auto">
             <div className="p-6 border-b border-gray-700">
                <div className="flex items-center gap-4">
                    <ClockIcon className="w-8 h-8 text-purple-400" />
                    <div>
                        <h2 className="text-2xl font-bold">{t('timestampFormatterTitle')}</h2>
                        <p className="text-gray-400 text-sm">{t('timestampFormatterSubtitle')}</p>
                    </div>
                </div>
            </div>
            
            <div className="p-6 space-y-6">
                <div>
                    <label htmlFor="datetime" className="block text-sm font-medium text-gray-300 mb-2">{t('timestampLabelDateTime')}</label>
                     <input 
                        type="datetime-local" 
                        id="datetime"
                        value={toLocalISOString(date)}
                        onChange={handleDateChange}
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none transition"
                    />
                </div>

                <div className="space-y-3">
                    <h3 className="text-lg font-bold text-gray-200">{t('timestampPreview')}</h3>
                    <p className='text-xs text-gray-400 -mt-2'>{t('timestampNote')}</p>
                    <TimestampRow label="Short Time" formatChar="t" timestamp={unixTimestamp} />
                    <TimestampRow label="Long Time" formatChar="T" timestamp={unixTimestamp} />
                    <TimestampRow label="Short Date" formatChar="d" timestamp={unixTimestamp} />
                    <TimestampRow label="Long Date" formatChar="D" timestamp={unixTimestamp} />
                    <TimestampRow label="Short Date/Time" formatChar="f" timestamp={unixTimestamp} />
                    <TimestampRow label="Long Date/Time" formatChar="F" timestamp={unixTimestamp} />
                    <TimestampRow label="Relative" formatChar="R" timestamp={unixTimestamp} />
                </div>
            </div>
        </div>
    );
};
