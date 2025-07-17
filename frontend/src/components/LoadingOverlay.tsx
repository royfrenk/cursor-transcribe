import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface LoadingOverlayProps {
    message?: string;
    isVisible: boolean;
}

export default function LoadingOverlay({ message, isVisible }: LoadingOverlayProps) {
    if (!isVisible) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            role="alert"
            aria-busy="true"
        >
            <div className="bg-white rounded-lg p-6 shadow-xl flex flex-col items-center space-y-4">
                <LoadingSpinner size="lg" />
                {message && (
                    <p className="text-gray-700 font-medium">{message}</p>
                )}
            </div>
        </div>
    );
} 