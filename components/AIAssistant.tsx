
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { useLanguage } from '../contexts/LanguageContext';
import { ChatMessage } from '../types';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';
import { CopyIcon } from './icons/CopyIcon';
import { BotIcon } from './icons/BotIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { PlusIcon } from './icons/PlusIcon';
import { UserIcon } from './icons/UserIcon';

const startChatSession = (systemInstruction: string): Chat => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: systemInstruction,
            temperature: 0.7,
        },
    });
};


const CodeBlock: React.FC<{ code: string; language: string }> = ({ code, language }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative bg-gray-900/70 rounded-lg font-mono text-sm border border-gray-700 my-2">
            <div className="flex justify-between items-center px-4 py-2 bg-gray-800/60 rounded-t-lg">
                <span className="text-gray-400 text-xs">{language || 'code'}</span>
                 <button
                    onClick={handleCopy}
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                    aria-label="Copy code"
                >
                    {copied ? (
                        <span className="text-xs text-green-400">Copied!</span>
                    ) : (
                        <CopyIcon className="w-4 h-4" />
                    )}
                </button>
            </div>
            <pre className="whitespace-pre-wrap break-words p-4 text-gray-300">
                <code>{code}</code>
            </pre>
        </div>
    );
};

const parseMessageContent = (content: string) => {
    if (!content) return [];
    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map(part => {
        if (part.startsWith('```')) {
            const langMatch = part.match(/```(\w*)\n/);
            const lang = langMatch ? langMatch[1] : '';
            const code = part.replace(/```\w*\n?/, '').replace(/```$/, '');
            return { type: 'code', content: code, lang };
        }
        return { type: 'text', content: part };
    }).filter(p => p.content && p.content.trim() !== '');
};

const SuggestionCard: React.FC<{title: string, description: string, onClick: () => void}> = ({ title, description, onClick }) => (
    <button onClick={onClick} className="bg-gray-800/60 hover:bg-gray-700/80 p-4 rounded-lg text-start transition-colors w-full border border-gray-700">
        <h4 className="font-semibold text-gray-200">{title}</h4>
        <p className="text-sm text-gray-400">{description}</p>
    </button>
);


export const AIAssistant: React.FC = () => {
    const { t } = useLanguage();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        // Reset and initialize chat when language changes
        chatRef.current = startChatSession(t('aiSystemInstruction'));
        setMessages([]);
    }, [t]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    useEffect(() => {
        // Auto-resize textarea
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [userInput]);

    const handleSendMessage = async (e?: React.FormEvent, prompt?: string) => {
        e?.preventDefault();
        const messageToSend = prompt || userInput;
        if (!messageToSend.trim() || isLoading) return;

        const newUserMessage: ChatMessage = { role: 'user', content: messageToSend };
        setMessages(prev => [...prev, newUserMessage]);
        if (!prompt) setUserInput('');
        setIsLoading(true);

        try {
            if (!chatRef.current) throw new Error("Chat not initialized");
            
            const stream = await chatRef.current.sendMessageStream({ message: messageToSend });
            
            let currentResponse = "";
            setMessages(prev => [...prev, { role: 'model', content: '' }]);

            for await (const chunk of stream) {
                currentResponse += chunk.text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].content = currentResponse;
                    return newMessages;
                });
            }

        } catch (error) {
            console.error("Error sending message to Gemini:", error);
            const errorMessage = "Sorry, I encountered an error. Please try again.";
            setMessages(prev => {
                 const newMessages = [...prev];
                 if(newMessages[newMessages.length - 1].role === 'model') {
                     newMessages[newMessages.length - 1].content = errorMessage;
                 } else {
                     newMessages.push({ role: 'model', content: errorMessage });
                 }
                 return newMessages;
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSuggestionClick = (suggestion: string) => {
        setUserInput(suggestion);
        // We use a timeout to give react time to update the input before sending
        setTimeout(() => handleSendMessage(undefined, suggestion), 0);
    }
    
    return (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 shadow-lg animate-fade-in flex flex-row h-[75vh] overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 bg-gray-900/50 p-4 border-r border-gray-700/50 flex-col hidden md:flex">
                <div className="flex-shrink-0 flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold">{t('aiChatHistory')}</h3>
                    <button onClick={() => setMessages([])} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/80 rounded-lg transition-colors">
                        <PlusIcon className="w-5 h-5"/>
                    </button>
                </div>
                 <div className="flex-grow overflow-y-auto">
                    {/* Placeholder for chat history items */}
                    <div className="text-sm text-gray-500 text-center p-4">{/* Chat history will appear here */}</div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                <div className="flex-grow overflow-y-auto p-6">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center mb-4">
                                <SparklesIcon className="w-8 h-8 text-white"/>
                            </div>
                            <h2 className="text-xl sm:text-2xl font-bold">{t('aiWelcomeTitle')}</h2>
                            <p className="text-gray-400 mt-2 mb-6 max-w-md text-sm sm:text-base">{t('aiWelcomeDesc')}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
                                <SuggestionCard title={t('aiSuggestion1Title')} description={t('aiSuggestion1Desc')} onClick={() => handleSuggestionClick(t('aiSuggestion1Desc'))} />
                                <SuggestionCard title={t('aiSuggestion2Title')} description={t('aiSuggestion2Desc')} onClick={() => handleSuggestionClick(t('aiSuggestion2Desc'))} />
                                <SuggestionCard title={t('aiSuggestion3Title')} description={t('aiSuggestion3Desc')} onClick={() => handleSuggestionClick(t('aiSuggestion3Desc'))} />
                                <SuggestionCard title={t('aiSuggestion4Title')} description={t('aiSuggestion4Desc')} onClick={() => handleSuggestionClick(t('aiSuggestion4Desc'))} />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex items-start gap-3 w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.role === 'model' && (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
                                            <BotIcon className="w-5 h-5 text-white" />
                                        </div>
                                    )}
                                    <div className={`max-w-[90%] md:max-w-2xl rounded-2xl p-4 text-white ${msg.role === 'user' ? 'bg-indigo-600 rounded-br-lg' : 'bg-gray-700/80 rounded-bl-lg'}`}>
                                        <div className="prose prose-invert prose-sm max-w-none text-white">
                                            {parseMessageContent(msg.content).map((part, i) =>
                                                part.type === 'code' ? (
                                                    <CodeBlock key={i} code={part.content} language={part.lang} />
                                                ) : (
                                                    <p key={i} className="whitespace-pre-wrap">{part.content}</p>
                                                )
                                            )}
                                        </div>
                                    </div>
                                    {msg.role === 'user' && (
                                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                                            <UserIcon className="w-5 h-5 text-gray-300" />
                                        </div>
                                    )}
                                </div>
                            ))}
                             {isLoading && (
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
                                        <BotIcon className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="max-w-xl rounded-2xl p-4 bg-gray-700/80 rounded-bl-lg">
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                <div className="flex-shrink-0 p-4 border-t border-gray-700/50 bg-gray-800/50">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                        <textarea
                            ref={textareaRef}
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage(e as any);
                                }
                            }}
                            placeholder={t('aiPlaceholder')}
                            disabled={isLoading}
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition disabled:opacity-50 resize-none"
                            rows={1}
                            style={{ maxHeight: '120px' }}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !userInput.trim()}
                            className="p-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-900 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors shadow-md h-[42px] w-[42px] flex-shrink-0 flex items-center justify-center"
                        >
                            <PaperAirplaneIcon className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
