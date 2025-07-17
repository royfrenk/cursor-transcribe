import { useEffect } from 'react';

interface NotificationProps {
    message: string;
    type: 'success' | 'error';
    onClose: () => void;
    duration?: number;
}

export default function Notification({
    message,
    type,
    onClose,
    duration = 5000
}: NotificationProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const bgColor = type === 'success' ? 'bg-green-50' : 'bg-red-50';
    const borderColor = type === 'success' ? 'border-green-200' : 'border-red-200';
    const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
    const icon = type === 'success' ? '✓' : '✕';

    return (
        <div
            className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg border ${bgColor} ${borderColor} ${textColor} flex items-center space-x-3 min-w-[300px] max-w-md`}
            role="alert"
        >
            <span className="text-lg">{icon}</span>
            <p className="flex-1">{message}</p>
            <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
            >
                ×
            </button>
        </div>
    );
} 