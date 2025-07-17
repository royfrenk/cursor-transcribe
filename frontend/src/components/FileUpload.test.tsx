import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FileUpload from './FileUpload';
import { api } from '@/lib/api/client';

// Mock the API client
jest.mock('@/lib/api/client', () => ({
    api: {
        upload: {
            uploadFile: jest.fn()
        }
    }
}));

describe('FileUpload', () => {
    const mockOnUploadComplete = jest.fn();
    const mockOnError = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders upload area with correct text', () => {
        render(<FileUpload onUploadComplete={mockOnUploadComplete} onError={mockOnError} />);
        
        expect(screen.getByText(/Drag & drop an audio file here/i)).toBeInTheDocument();
        expect(screen.getByText(/Supports MP3, WAV, and M4A files/i)).toBeInTheDocument();
    });

    it('shows error for invalid file type', async () => {
        render(<FileUpload onUploadComplete={mockOnUploadComplete} onError={mockOnError} />);
        
        const file = new File(['test'], 'test.txt', { type: 'text/plain' });
        const input = screen.getByTestId('file-input');
        
        Object.defineProperty(input, 'files', {
            value: [file]
        });
        
        fireEvent.change(input);
        
        await waitFor(() => {
            expect(mockOnError).toHaveBeenCalledWith(
                'Invalid file type. Please upload an audio file (MP3, WAV, M4A).'
            );
        });
    });

    it('shows error for file exceeding size limit', async () => {
        render(<FileUpload onUploadComplete={mockOnUploadComplete} onError={mockOnError} />);
        
        const file = new File(['x'.repeat(101 * 1024 * 1024)], 'large.mp3', { type: 'audio/mpeg' });
        const input = screen.getByTestId('file-input');
        
        Object.defineProperty(input, 'files', {
            value: [file]
        });
        
        fireEvent.change(input);
        
        await waitFor(() => {
            expect(mockOnError).toHaveBeenCalledWith('File size exceeds 100MB limit.');
        });
    });

    it('handles successful file upload', async () => {
        const mockFileId = 'test-file-id';
        (api.upload.uploadFile as jest.Mock).mockResolvedValueOnce({ file_id: mockFileId });
        
        render(<FileUpload onUploadComplete={mockOnUploadComplete} onError={mockOnError} />);
        
        const file = new File(['test'], 'test.mp3', { type: 'audio/mpeg' });
        const input = screen.getByTestId('file-input');
        
        Object.defineProperty(input, 'files', {
            value: [file]
        });
        
        fireEvent.change(input);
        
        await waitFor(() => {
            expect(api.upload.uploadFile).toHaveBeenCalledWith(file);
            expect(mockOnUploadComplete).toHaveBeenCalledWith(mockFileId);
        });
    });

    it('handles upload error', async () => {
        const errorMessage = 'Upload failed';
        (api.upload.uploadFile as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));
        
        render(<FileUpload onUploadComplete={mockOnUploadComplete} onError={mockOnError} />);
        
        const file = new File(['test'], 'test.mp3', { type: 'audio/mpeg' });
        const input = screen.getByTestId('file-input');
        
        Object.defineProperty(input, 'files', {
            value: [file]
        });
        
        fireEvent.change(input);
        
        await waitFor(() => {
            expect(mockOnError).toHaveBeenCalledWith(errorMessage);
        });
    });
}); 