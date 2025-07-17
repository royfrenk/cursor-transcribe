import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { api } from '@/lib/api/client';
import ProcessingProgress, { ProcessingStage } from './ProcessingProgress';

interface FileUploadProps {
    onUploadComplete: (fileId: string) => void;
    onError: (error: string) => void;
}

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks
const ACCEPTED_FILE_TYPES = {
    'audio/mpeg': ['.mp3'],
    'audio/wav': ['.wav'],
    'audio/x-m4a': ['.m4a']
};

export default function FileUpload({ onUploadComplete, onError }: FileUploadProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentStage, setCurrentStage] = useState<ProcessingStage>('uploading');
    const [progress, setProgress] = useState(0);
    const [uploadedChunks, setUploadedChunks] = useState(0);
    const [totalChunks, setTotalChunks] = useState(0);

    const uploadChunk = async (chunk: Blob, chunkIndex: number, fileId: string) => {
        const formData = new FormData();
        formData.append('chunk', chunk);
        formData.append('chunk_index', chunkIndex.toString());
        formData.append('file_id', fileId);

        await api.upload.uploadChunk(formData);
        setUploadedChunks(prev => prev + 1);
        setProgress(Math.round((uploadedChunks + 1) / totalChunks * 100));
    };

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        if (file.size > MAX_FILE_SIZE) {
            onError('File size exceeds 500MB limit');
            return;
        }

        try {
            setIsProcessing(true);
            setCurrentStage('uploading');
            setProgress(0);

            // Calculate total chunks
            const chunks = Math.ceil(file.size / CHUNK_SIZE);
            setTotalChunks(chunks);
            setUploadedChunks(0);

            // Initialize upload and get file ID
            const initResponse = await api.upload.initializeUpload({
                filename: file.name,
                total_chunks: chunks,
                total_size: file.size
            });

            const fileId = initResponse.file_id;

            // Upload chunks
            for (let i = 0; i < chunks; i++) {
                const start = i * CHUNK_SIZE;
                const end = Math.min(start + CHUNK_SIZE, file.size);
                const chunk = file.slice(start, end);
                await uploadChunk(chunk, i, fileId);
            }

            // Finalize upload
            await api.upload.finalizeUpload(fileId);
            setProgress(100);
            onUploadComplete(fileId);
        } catch (error) {
            onError(error instanceof Error ? error.message : 'Failed to upload file');
        } finally {
            setIsProcessing(false);
            setProgress(0);
            setUploadedChunks(0);
            setTotalChunks(0);
        }
    }, [onUploadComplete, onError]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: ACCEPTED_FILE_TYPES,
        maxSize: MAX_FILE_SIZE,
        disabled: isProcessing,
        multiple: false
    });

    return (
        <div className="w-full max-w-xl mx-auto">
            <div
                {...getRootProps()}
                className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors
                    ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
                    ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <input {...getInputProps()} />
                <div className="space-y-4">
                    <div className="text-4xl mb-4">
                        {isProcessing ? '📤' : '📁'}
                    </div>
                    <p className="text-lg font-medium">
                        {isProcessing
                            ? `Uploading... (${uploadedChunks}/${totalChunks} chunks)`
                            : isDragActive
                            ? 'Drop the audio file here'
                            : 'Drag & drop an audio file here, or click to select'}
                    </p>
                    <p className="text-sm text-gray-500">
                        Supports MP3, WAV, and M4A files (max 500MB)
                    </p>
                </div>
            </div>

            <ProcessingProgress
                currentStage={currentStage}
                progress={progress}
                isVisible={isProcessing}
            />
        </div>
    );
} 