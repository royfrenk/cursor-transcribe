import { useState } from 'react';
import { api } from '@/lib/api/client';

interface SummaryDisplayProps {
    fileId: string;
    onError: (error: string) => void;
}

export default function SummaryDisplay({ fileId, onError }: SummaryDisplayProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [summary, setSummary] = useState<{
        summary: string;
        key_points: string[];
        language: string;
    } | null>(null);

    const handleSummarize = async () => {
        try {
            setIsLoading(true);
            const response = await api.summary.summarize(fileId);
            setSummary(response);
        } catch (error) {
            onError(error instanceof Error ? error.message : 'Failed to generate summary');
        } finally {
            setIsLoading(false);
        }
    };

    if (!summary) {
        return (
            <div className="w-full max-w-4xl mx-auto p-6">
                <button
                    onClick={handleSummarize}
                    disabled={isLoading}
                    className={`w-full py-3 px-6 rounded-lg text-white font-medium transition-colors
                        ${isLoading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                >
                    {isLoading ? 'Generating Summary...' : 'Generate Summary'}
                </button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Summary</h2>
                <p className="text-sm text-gray-500">
                    Language: {summary.language}
                </p>
            </div>

            <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold mb-3">Overview</h3>
                    <p className="text-gray-800 whitespace-pre-wrap">{summary.summary}</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold mb-3">Key Points</h3>
                    <ul className="space-y-2">
                        {summary.key_points.map((point, index) => (
                            <li
                                key={index}
                                className="flex items-start space-x-2"
                            >
                                <span className="text-blue-600 mt-1">•</span>
                                <span className="text-gray-800">{point}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
} 