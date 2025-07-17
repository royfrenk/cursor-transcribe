"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';

// List of RTL languages
const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

interface Settings {
    defaultLanguage: string;
    includeSummary: boolean;
    exportFormat: 'txt' | 'srt' | 'vtt' | 'json';
    theme: 'light' | 'dark' | 'system';
}

interface SettingsContextType {
    settings: Settings;
    updateSettings: (settings: Partial<Settings>) => void;
    isRTL: boolean;
}

const defaultSettings: Settings = {
    defaultLanguage: 'auto',
    includeSummary: true,
    exportFormat: 'txt',
    theme: 'system'
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<Settings>(() => {
        if (typeof window !== 'undefined') {
            const savedSettings = localStorage.getItem('settings');
            if (savedSettings) {
                return JSON.parse(savedSettings);
            }
        }
        return defaultSettings;
    });

    const isRTL = RTL_LANGUAGES.includes(settings.defaultLanguage);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('settings', JSON.stringify(settings));
        }
    }, [settings]);

    const updateSettings = (newSettings: Partial<Settings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings, isRTL }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
} 