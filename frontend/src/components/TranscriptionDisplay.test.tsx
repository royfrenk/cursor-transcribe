import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TranscriptionDisplay from './TranscriptionDisplay';
import { api } from '@/lib/api/client';

// Mock the API client
jest.mock('@/lib/api/client', () => ({
    api: {
        transcription: {
            transcribe: jest.fn()
        }
    }
}));

describe('TranscriptionDisplay', () => {
    const mockFileId = 'test-file-id';
    const mockOnError = jest.fn();

    beforeEach(() => {
        mockOnError.mockClear();
        (api.transcription.transcribe as jest.Mock).mockClear();
    });

    it('renders language selector and transcribe button', () => {
        render(<TranscriptionDisplay fileId={mockFileId} onError={mockOnError} />);
        
        expect(screen.getByText('Language')).toBeInTheDocument();
        expect(screen.getByRole('combobox')).toBeInTheDocument();
        expect(screen.getByText('Start Transcription')).toBeInTheDocument();
    });

    it('calls transcribe API with selected language', async () => {
        const mockTranscription = {
            text: 'Test transcription',
            segments: [],
            language: 'fr'
        };
        (api.transcription.transcribe as jest.Mock).mockResolvedValueOnce(mockTranscription);
        
        render(<TranscriptionDisplay fileId={mockFileId} onError={mockOnError} />);
        
        // Select French language
        const languageSelect = screen.getByRole('combobox');
        fireEvent.change(languageSelect, { target: { value: 'fr' } });
        
        // Click transcribe button
        fireEvent.click(screen.getByText('Start Transcription'));
        
        await waitFor(() => {
            expect(api.transcription.transcribe).toHaveBeenCalledWith(mockFileId, 'fr');
        });
    });

    it('calls transcribe API with undefined language when auto is selected', async () => {
        const mockTranscription = {
            text: 'Test transcription',
            segments: [],
            language: 'en'
        };
        (api.transcription.transcribe as jest.Mock).mockResolvedValueOnce(mockTranscription);
        
        render(<TranscriptionDisplay fileId={mockFileId} onError={mockOnError} />);
        
        // Click transcribe button (auto language is selected by default)
        fireEvent.click(screen.getByText('Start Transcription'));
        
        await waitFor(() => {
            expect(api.transcription.transcribe).toHaveBeenCalledWith(mockFileId, undefined);
        });
    });

    it('displays transcription results after successful transcription', async () => {
        const mockTranscription = {
            text: 'Full transcription text',
            segments: [
                {
                    start: 0,
                    end: 5,
                    text: 'First segment',
                    speaker: { id: '1', name: 'Speaker 1' }
                },
                {
                    start: 5,
                    end: 10,
                    text: 'Second segment',
                    speaker: { id: '2', name: 'Speaker 2' }
                }
            ],
            language: 'en'
        };

        (api.transcription.transcribe as jest.Mock).mockResolvedValueOnce(mockTranscription);
        
        render(<TranscriptionDisplay fileId={mockFileId} onError={mockOnError} />);
        
        fireEvent.click(screen.getByText('Start Transcription'));
        
        await waitFor(() => {
            expect(screen.getByText('Transcription')).toBeInTheDocument();
            expect(screen.getByText('Language: en')).toBeInTheDocument();
            expect(screen.getByText('First segment')).toBeInTheDocument();
            expect(screen.getByText('Second segment')).toBeInTheDocument();
            expect(screen.getByText('Speaker 1')).toBeInTheDocument();
            expect(screen.getByText('Speaker 2')).toBeInTheDocument();
        });
    });

    it('handles RTL languages correctly', async () => {
        const mockTranscription = {
            text: 'نص تجريبي',
            segments: [
                {
                    start: 0,
                    end: 5,
                    text: 'نص تجريبي',
                    speaker: { id: '1', name: 'Speaker 1' }
                }
            ],
            language: 'ar'
        };

        (api.transcription.transcribe as jest.Mock).mockResolvedValueOnce(mockTranscription);
        
        render(<TranscriptionDisplay fileId={mockFileId} onError={mockOnError} />);
        
        fireEvent.click(screen.getByText('Start Transcription'));
        
        await waitFor(() => {
            const segment = screen.getByText('نص تجريبي').closest('div');
            expect(segment).toHaveAttribute('dir', 'rtl');
            expect(segment?.querySelector('p')).toHaveClass('text-right');
        });
    });

    it('handles transcription error', async () => {
        const errorMessage = 'Transcription failed';
        (api.transcription.transcribe as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));
        
        render(<TranscriptionDisplay fileId={mockFileId} onError={mockOnError} />);
        
        fireEvent.click(screen.getByText('Start Transcription'));
        
        await waitFor(() => {
            expect(mockOnError).toHaveBeenCalledWith(errorMessage);
        });
    });

    it('formats timestamps correctly', async () => {
        const mockTranscription = {
            text: 'Test transcription',
            segments: [
                {
                    start: 3661, // 1:01:01
                    end: 3662,   // 1:01:02
                    text: 'Test segment'
                }
            ],
            language: 'en'
        };

        (api.transcription.transcribe as jest.Mock).mockResolvedValueOnce(mockTranscription);
        
        render(<TranscriptionDisplay fileId={mockFileId} onError={mockOnError} />);
        
        fireEvent.click(screen.getByText('Start Transcription'));
        
        await waitFor(() => {
            expect(screen.getByText('01:01:01 - 01:01:02')).toBeInTheDocument();
        });
    });
}); 