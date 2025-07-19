
import React from 'react';

interface ToggleSwitchProps {
    enabled: boolean;
    onChange: (enabled: boolean) => void;
    ariaLabel: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ enabled, onChange, ariaLabel }) => (
    <button
        type="button"
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
            enabled ? 'bg-gradient-to-r from-purple-600 to-indigo-600' : 'bg-gray-700'
        }`}
        role="switch"
        aria-checked={enabled}
        aria-label={ariaLabel}
        onClick={() => onChange(!enabled)}
    >
        <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                enabled ? 'translate-x-5.5' : 'translate-x-0.5'
            }`}
        />
    </button>
);