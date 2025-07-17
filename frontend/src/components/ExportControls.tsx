import { useState } from 'react';
import { api } from '@/lib/api/client';

interface ExportControlsProps {
    fileId: string;
    onError: (error: string) => void;
}

type ExportFormat = 'txt' | 'srt' | 'vtt' | 'json';

export default function ExportControls({ fileId, onError }: ExportControlsProps) {
    const [isExporting, setIsExporting] = useState(false);
    const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('txt');
    const [includeSummary, setIncludeSummary] = useState(false);

    const handleExport = async () => {
        try {
            setIsExporting(true);
            const response = await api.export.exportTranscription(
                fileId,
                selectedFormat,
                includeSummary
            );

            // Create a download link
            const blob = new Blob([response], {
                type: getContentType(selectedFormat)
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `transcription.${selectedFormat}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            onError(error instanceof Error ? error.message : 'Failed to export transcription');
        } finally {
            setIsExporting(false);
        }
    };

    const getContentType = (format: ExportFormat): string => {
        switch (format) {
            case 'txt':
                return 'text/plain';
            case 'srt':
                return 'text/plain';
            case 'vtt':
                return 'text/vtt';
            case 'json':
                return 'application/json';
            default:
                return 'text/plain';
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-4">Export Transcription</h2>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Format
                        </label>
                        <select
                            value={selectedFormat}
                            onChange={(e) => setSelectedFormat(e.target.value as ExportFormat)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            disabled={isExporting}
                        >
                            <option value="txt">Plain Text (TXT)</option>
                            <option value="srt">SubRip (SRT)</option>
                            <option value="vtt">WebVTT (VTT)</option>
                            <option value="json">JSON</option>
                        </select>
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="includeSummary"
                            checked={includeSummary}
                            onChange={(e) => setIncludeSummary(e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            disabled={isExporting}
                        />
                        <label
                            htmlFor="includeSummary"
                            className="ml-2 block text-sm text-gray-700"
                        >
                            Include summary and key points
                        </label>
                    </div>

                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors
                            ${isExporting
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {isExporting ? 'Exporting...' : 'Export'}
                    </button>
                </div>
            </div>
        </div>
    );
} 