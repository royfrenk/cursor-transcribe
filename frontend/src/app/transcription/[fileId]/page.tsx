'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import TranscriptionDisplay from '@/components/TranscriptionDisplay';
import SummaryDisplay from '@/components/SummaryDisplay';
import ExportControls from '@/components/ExportControls';
import Link from 'next/link';

export default function TranscriptionPage() {
    const params = useParams();
    const fileId = params.fileId as string;
    const [error, setError] = useState<string | null>(null);

    const handleError = (errorMessage: string) => {
        setError(errorMessage);
    };

    return (
        <main className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Transcription
                    </h1>
                    <Link
                        href="/"
                        className="text-blue-600 hover:text-blue-700"
                    >
                        ← Back to Home
                    </Link>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600">{error}</p>
                    </div>
                )}

                <div className="space-y-8">
                    <TranscriptionDisplay
                        fileId={fileId}
                        onError={handleError}
                    />

                    <SummaryDisplay
                        fileId={fileId}
                        onError={handleError}
                    />

                    <ExportControls
                        fileId={fileId}
                        onError={handleError}
                    />
                </div>
            </div>
        </main>
    );
} 