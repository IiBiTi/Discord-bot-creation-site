import React, { useState, useEffect } from 'react';

const codeSnippets = [
    {
        name: 'ping.js',
        lang: 'js',
        code: `
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription("Replies with Pong!"),
  async execute(interaction) {
    await interaction.reply('Pong! 🏓');
  },
};`
    },
    {
        name: 'hello_cog.py',
        lang: 'py',
        code: `
import discord
from discord.ext import commands
from discord import app_commands

class Hello(commands.Cog):
    @app_commands.command(name="hello")
    async def hello(self, interaction: discord.Interaction):
        await interaction.response.send_message("Hello! 👋")

async def setup(bot: commands.Bot):
    await bot.add_cog(Hello(bot))`
    },
    {
        name: 'welcome.js',
        lang: 'js',
        code: `
const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    const channel = member.guild.systemChannel;
    if (!channel) return;
    
    const embed = new EmbedBuilder()
      .setDescription(\`Welcome, \${member.user}!\`);
      
    await channel.send({ embeds: [embed] });
  },
};`
    }
];

// A simple syntax highlighter using regex and spans
const SimpleSyntaxHighlighter: React.FC<{ code: string }> = ({ code }) => {
    const highlight = (text: string) => {
        let highlightedCode = text;
        // comments
        highlightedCode = highlightedCode.replace(/(\/\/.*|\#.*)/g, '<span class="text-gray-500/80">$1</span>');
        // keywords (const, async, await, class, etc.)
        highlightedCode = highlightedCode.replace(/\b(const|let|var|async|await|import|from|require|module|exports|return|new|class|def|if|else|for|of|in|try|except|pass)\b/g, '<span class="text-purple-400">$1</span>');
        // function/method calls
        highlightedCode = highlightedCode.replace(/(\w+)\(/g, '<span class="text-indigo-400">$1</span>(');
        // strings
        highlightedCode = highlightedCode.replace(/(['"`])(.*?)\1/g, '<span class="text-green-300">$1$2$1</span>');
        // numbers
        highlightedCode = highlightedCode.replace(/\b(\d+)\b/g, '<span class="text-indigo-300">$1</span>');
        // properties on objects
        highlightedCode = highlightedCode.replace(/\.(\w+)/g, '.<span class="text-gray-400">$1</span>');
        // Class names
        highlightedCode = highlightedCode.replace(/\b([A-Z][A-Za-z]+)\b/g, '<span class="text-sky-300">$1</span>');
        
        return <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />;
    };

    return (
        <pre className="font-mono text-xs md:text-sm leading-relaxed text-left whitespace-pre-wrap">
            {highlight(code)}
        </pre>
    );
};


export const CodeShowcase: React.FC = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [typedCode, setTypedCode] = useState('');
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const currentSnippet = codeSnippets[activeIndex];
    
    // Typing effect for the very first load
    useEffect(() => {
        if (!isInitialLoad) return;
        
        const targetCode = codeSnippets[0].code.trim();
        let i = 0;
        const typingInterval = setInterval(() => {
            if (i < targetCode.length) {
                setTypedCode(targetCode.substring(0, i + 1));
                i++;
            } else {
                clearInterval(typingInterval);
                setTimeout(() => setIsInitialLoad(false), 2000); // Pause before starting cycle
            }
        }, 20);

        return () => clearInterval(typingInterval);
    }, [isInitialLoad]);

    // Cycling effect for subsequent snippets
    useEffect(() => {
        if (isInitialLoad) return;

        const timer = setTimeout(() => {
            setActiveIndex((prevIndex) => (prevIndex + 1) % codeSnippets.length);
        }, 5000);

        return () => clearTimeout(timer);
    }, [activeIndex, isInitialLoad]);

    return (
        <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700 shadow-2xl shadow-purple-900/20 min-h-[320px]">
            {/* macOS window bar */}
            <div className="h-9 bg-gray-900/80 rounded-t-xl flex items-center px-4 border-b border-gray-700">
                <div className="flex gap-1.5">
                    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                    <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                </div>
                <div className="flex-1 text-center font-mono text-xs text-gray-400">
                    {isInitialLoad ? codeSnippets[0].name : currentSnippet.name}
                </div>
            </div>

            {/* Code Content */}
            <div className="relative overflow-hidden p-4">
                {isInitialLoad ? (
                    <div className="relative">
                        <SimpleSyntaxHighlighter code={typedCode} />
                        <span className="blinking-cursor text-gray-300 absolute">|</span>
                    </div>
                ) : (
                    codeSnippets.map((snippet, index) => (
                        <div
                            key={index}
                            className={`transition-opacity duration-700 ease-in-out ${
                                activeIndex === index ? 'opacity-100' : 'opacity-0 absolute top-4 left-4 right-4'
                            }`}
                            aria-hidden={activeIndex !== index}
                        >
                            <SimpleSyntaxHighlighter code={snippet.code.trim()} />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};