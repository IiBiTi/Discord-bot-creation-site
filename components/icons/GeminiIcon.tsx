
import React from 'react';

export const GeminiIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M4.5 12a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0Z" fill="url(#gemini-gradient-1)"></path>
        <path d="M15.5 12a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0Z" fill="url(#gemini-gradient-2)"></path>
        <path d="M10 12a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z" fill="url(#gemini-gradient-3)"></path>
        <path d="m11.136 3.424 2.864 5.727L11.136 3.424Z" fill="#8E8BFF"></path>
        <path d="M14 9.151 12 11l-2-1.849L12 7l2 2.151Z" fill="#A29FFF"></path>
        <path d="m12.864 3.424-2.864 5.727L12.864 3.424Z" fill="#C4C2FF"></path>
        <defs>
            <linearGradient id="gemini-gradient-1" x1="4.5" y1="9.5" x2="9.5" y2="14.5" gradientUnits="userSpaceOnUse">
                <stop stopColor="#8E8BFF"></stop>
                <stop offset="1" stopColor="#C4C2FF"></stop>
            </linearGradient>
            <linearGradient id="gemini-gradient-2" x1="15.5" y1="9.5" x2="20.5" y2="14.5" gradientUnits="userSpaceOnUse">
                <stop stopColor="#8E8BFF"></stop>
                <stop offset="1" stopColor="#C4C2FF"></stop>
            </linearGradient>
            <linearGradient id="gemini-gradient-3" x1="10" y1="10" x2="14" y2="14" gradientUnits="userSpaceOnUse">
                <stop stopColor="#8E8BFF"></stop>
                <stop offset="1" stopColor="#C4C2FF"></stop>
            </linearGradient>
        </defs>
    </svg>
);