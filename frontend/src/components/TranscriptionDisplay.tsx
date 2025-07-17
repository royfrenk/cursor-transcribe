import React, { useState } from 'react';
import { api } from '@/lib/api/client';
import LanguageSelector from './LanguageSelector';
import ProcessingProgress, { ProcessingStage } from './ProcessingProgress';

interface Speaker {
    id: string;
    name: string;
}

interface Segment {
    start: number;
    end: number;
    text: string;
    speaker?: Speaker;
    confidence?: number;
    corrections?: string[];
}

interface TranscriptionDisplayProps {
    fileId: string;
    onError: (error: string) => void;
}

// List of RTL languages
const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

export default function TranscriptionDisplay({ fileId, onError }: TranscriptionDisplayProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentStage, setCurrentStage] = useState<ProcessingStage>('uploading');
    const [progress, setProgress] = useState(0);
    const [selectedLanguage, setSelectedLanguage] = useState('auto');
    const [transcription, setTranscription] = useState<{
        text: string;
        segments: Segment[];
        language: string;
    } | null>(null);
    const [editingSegment, setEditingSegment] = useState<number | null>(null);
    const [editedText, setEditedText] = useState('');

    const formatTimestamp = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleTranscribe = async () => {
        try {
            setIsProcessing(true);
            setCurrentStage('transcribing');
            setProgress(0);

            // Simulate progress updates during transcription
            const progressInterval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 1000);

            const response = await api.transcription.transcribe(
                fileId,
                selectedLanguage === 'auto' ? undefined : selectedLanguage
            );

            clearInterval(progressInterval);
            setProgress(100);

            // Move to diarization stage
            setCurrentStage('diarizing');
            setProgress(0);

            // Simulate diarization progress
            const diarizationInterval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(diarizationInterval);
                        return 90;
                    }
                    return prev + 30;
                });
            }, 500);

            // Wait for diarization to complete
            await new Promise(resolve => setTimeout(resolve, 1500));
            clearInterval(diarizationInterval);
            setProgress(100);

            // Move to summarization stage if needed
            if (response.includeSummary) {
                setCurrentStage('summarizing');
                setProgress(0);

                // Simulate summarization progress
                const summaryInterval = setInterval(() => {
                    setProgress(prev => {
                        if (prev >= 90) {
                            clearInterval(summaryInterval);
                            return 90;
                        }
                        return prev + 20;
                    });
                }, 500);

                // Wait for summarization to complete
                await new Promise(resolve => setTimeout(resolve, 2000));
                clearInterval(summaryInterval);
                setProgress(100);
            }

            setTranscription(response);
        } catch (error) {
            onError(error instanceof Error ? error.message : 'Failed to transcribe audio');
        } finally {
            setIsProcessing(false);
            setProgress(0);
        }
    };

    const handleEditSegment = (index: number) => {
        setEditingSegment(index);
        setEditedText(transcription?.segments[index].text || '');
    };

    const handleSaveEdit = async (index: number) => {
        if (!transcription) return;

        try {
            const updatedSegments = [...transcription.segments];
            const originalText = updatedSegments[index].text;
            updatedSegments[index] = {
                ...updatedSegments[index],
                text: editedText,
                corrections: [...(updatedSegments[index].corrections || []), originalText]
            };

            setTranscription({
                ...transcription,
                segments: updatedSegments
            });

            // Save correction to backend
            await api.transcription.saveCorrection(fileId, {
                segment_index: index,
                original_text: originalText,
                corrected_text: editedText
            });

            setEditingSegment(null);
        } catch (error) {
            onError(error instanceof Error ? error.message : 'Failed to save correction');
        }
    };

    const isRTL = transcription ? RTL_LANGUAGES.includes(transcription.language) : false;

    if (!transcription) {
        return (
            <div className="w-full max-w-4xl mx-auto p-6">
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Language
                    </label>
                    <LanguageSelector
                        value={selectedLanguage}
                        onChange={setSelectedLanguage}
                        disabled={isProcessing}
                    />
                </div>
                <button
                    onClick={handleTranscribe}
                    disabled={isProcessing}
                    className={`w-full py-3 px-6 rounded-lg text-white font-medium transition-colors
                        ${isProcessing
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                >
                    {isProcessing ? 'Processing...' : 'Start Transcription'}
                </button>

                <ProcessingProgress
                    currentStage={currentStage}
                    progress={progress}
                    isVisible={isProcessing}
                />
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Transcription</h2>
                <p className="text-sm text-gray-500">
                    Language: {transcription.language}
                </p>
            </div>

            <div className="space-y-4">
                {transcription.segments.map((segment, index) => (
                    <div
                        key={index}
                        className="p-4 bg-white rounded-lg shadow-sm border border-gray-200"
                        dir={isRTL ? 'rtl' : 'ltr'}
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                                {segment.speaker && (
                                    <span className="px-2 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded">
                                        {segment.speaker.name}
                                    </span>
                                )}
                                <span className="text-sm text-gray-500">
                                    {formatTimestamp(segment.start)} - {formatTimestamp(segment.end)}
                                </span>
                                {segment.confidence && (
                                    <span className={`text-sm ${
                                        segment.confidence > 0.8 ? 'text-green-600' :
                                        segment.confidence > 0.6 ? 'text-yellow-600' :
                                        'text-red-600'
                                    }`}>
                                        {Math.round(segment.confidence * 100)}% confidence
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={() => handleEditSegment(index)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                                Edit
                            </button>
                        </div>
                        {editingSegment === index ? (
                            <div className="space-y-2">
                                <textarea
                                    value={editedText}
                                    onChange={(e) => setEditedText(e.target.value)}
                                    className="w-full p-2 border rounded"
                                    rows={3}
                                    dir={isRTL ? 'rtl' : 'ltr'}
                                />
                                <div className="flex justify-end space-x-2">
                                    <button
                                        onClick={() => setEditingSegment(null)}
                                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => handleSaveEdit(index)}
                                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className={`text-gray-800 ${isRTL ? 'text-right' : 'text-left'}`}>
                                {segment.text}
                            </p>
                        )}
                        {segment.corrections && segment.corrections.length > 0 && (
                            <div className="mt-2 text-sm text-gray-500">
                                <p>Previous versions:</p>
                                <ul className="list-disc list-inside">
                                    {segment.corrections.map((correction, i) => (
                                        <li key={i}>{correction}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
} 