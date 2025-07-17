'use client';

import React from 'react';
import Link from 'next/link';
import LanguageSelector from '@/components/LanguageSelector';
import { useSettings } from '@/contexts/SettingsContext';

export default function SettingsPage() {
    const { settings, updateSettings, isRTL } = useSettings();

    return (
        <main className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Settings
                    </h1>
                    <Link
                        href="/"
                        className="text-blue-600 hover:text-blue-700"
                    >
                        {isRTL ? '← Back to Home' : 'Back to Home →'}
                    </Link>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Default Language
                            </label>
                            <LanguageSelector
                                value={settings.defaultLanguage}
                                onChange={(language) => updateSettings({ defaultLanguage: language })}
                            />
                        </div>

                        <div>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={settings.includeSummary}
                                    onChange={(e) => updateSettings({ includeSummary: e.target.checked })}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">
                                    Include summary by default
                                </span>
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Default Export Format
                            </label>
                            <select
                                value={settings.exportFormat}
                                onChange={(e) => updateSettings({ exportFormat: e.target.value as 'txt' | 'srt' | 'vtt' })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="txt">Text (TXT)</option>
                                <option value="srt">SubRip (SRT)</option>
                                <option value="vtt">WebVTT (VTT)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Theme
                            </label>
                            <select
                                value={settings.theme}
                                onChange={(e) => updateSettings({ theme: e.target.value as 'light' | 'dark' | 'system' })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                                <option value="system">System</option>
                            </select>
                        </div>

                        <div className="pt-4">
                            <button
                                type="button"
                                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Save Settings
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
} 