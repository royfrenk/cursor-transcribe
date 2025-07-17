'use client';

import React, { useState } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useNotification } from '@/contexts/NotificationContext';
import FileUpload from '@/components/FileUpload';
import TranscriptionDisplay from '@/components/TranscriptionDisplay';
import LoadingOverlay from '@/components/LoadingOverlay';
import ErrorBoundary from '@/components/ErrorBoundary';
import Link from 'next/link';

export default function HomePage() {
    const { settings, isRTL } = useSettings();
    const { theme } = useTheme();
    const { showNotification } = useNotification();
    const [isLoading, setIsLoading] = useState(false);
    const [fileId, setFileId] = useState<string | null>(null);

    const handleError = (error: Error | string) => {
        showNotification(typeof error === 'string' ? error : error.message, 'error');
        setIsLoading(false);
    };

    return (
        <main className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Podcast Transcription Service
                    </h1>
                    <Link
                        href="/settings"
                        className="text-blue-600 hover:text-blue-700"
                    >
                        {isRTL ? '← Settings' : 'Settings →'}
                    </Link>
                </div>

                <FileUpload
                    onUploadComplete={setFileId}
                    onError={handleError}
                />

                {fileId && (
                    <ErrorBoundary>
                        <TranscriptionDisplay fileId={fileId} onError={handleError} />
                    </ErrorBoundary>
                )}

                <LoadingOverlay
                    isVisible={isLoading}
                    message="Transcribing your audio..."
                />
            </div>
        </main>
    );
} 