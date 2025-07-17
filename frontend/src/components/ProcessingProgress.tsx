import React from 'react';

export type ProcessingStage = 'uploading' | 'transcribing' | 'diarizing' | 'summarizing';

interface ProcessingProgressProps {
    currentStage: ProcessingStage;
    progress: number;
    isVisible: boolean;
}

const STAGE_LABELS: Record<ProcessingStage, string> = {
    uploading: 'Uploading Audio',
    transcribing: 'Transcribing Audio',
    diarizing: 'Identifying Speakers',
    summarizing: 'Generating Summary'
};

export default function ProcessingProgress({
    currentStage,
    progress,
    isVisible
}: ProcessingProgressProps) {
    if (!isVisible) return null;

    const stages: ProcessingStage[] = ['uploading', 'transcribing', 'diarizing', 'summarizing'];
    const currentStageIndex = stages.indexOf(currentStage);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-xl w-full max-w-md">
                <div className="space-y-6">
                    {stages.map((stage, index) => {
                        const isCurrentStage = stage === currentStage;
                        const isCompleted = index < currentStageIndex;
                        const isUpcoming = index > currentStageIndex;

                        return (
                            <div key={stage} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className={`text-sm font-medium ${
                                        isCurrentStage ? 'text-blue-600' :
                                        isCompleted ? 'text-green-600' :
                                        'text-gray-500'
                                    }`}>
                                        {STAGE_LABELS[stage]}
                                    </span>
                                    {isCurrentStage && (
                                        <span className="text-sm text-blue-600">
                                            {progress}%
                                        </span>
                                    )}
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-300 ${
                                            isCurrentStage ? 'bg-blue-600' :
                                            isCompleted ? 'bg-green-600' :
                                            'bg-gray-300'
                                        }`}
                                        style={{
                                            width: isCurrentStage ? `${progress}%` :
                                                   isCompleted ? '100%' : '0%'
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
} 