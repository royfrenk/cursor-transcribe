import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SummaryDisplay from './SummaryDisplay';
import { api } from '@/lib/api/client';

// Mock the API client
jest.mock('@/lib/api/client', () => ({
    api: {
        summary: {
            summarize: jest.fn()
        }
    }
}));

describe('SummaryDisplay', () => {
    const mockFileId = 'test-file-id';
    const mockOnError = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders initial state with summarize button', () => {
        render(<SummaryDisplay fileId={mockFileId} onError={mockOnError} />);
        
        expect(screen.getByText('Generate Summary')).toBeInTheDocument();
    });

    it('shows loading state while generating summary', async () => {
        (api.summary.summarize as jest.Mock).mockImplementation(
            () => new Promise(resolve => setTimeout(resolve, 100))
        );
        
        render(<SummaryDisplay fileId={mockFileId} onError={mockOnError} />);
        
        fireEvent.click(screen.getByText('Generate Summary'));
        
        expect(screen.getByText('Generating Summary...')).toBeInTheDocument();
        expect(screen.getByText('Generating Summary...')).toBeDisabled();
    });

    it('displays summary results after successful generation', async () => {
        const mockSummary = {
            summary: 'This is a test summary of the transcription.',
            key_points: [
                'Key point 1',
                'Key point 2',
                'Key point 3'
            ],
            language: 'en'
        };

        (api.summary.summarize as jest.Mock).mockResolvedValueOnce(mockSummary);
        
        render(<SummaryDisplay fileId={mockFileId} onError={mockOnError} />);
        
        fireEvent.click(screen.getByText('Generate Summary'));
        
        await waitFor(() => {
            expect(screen.getByText('Summary')).toBeInTheDocument();
            expect(screen.getByText('Language: en')).toBeInTheDocument();
            expect(screen.getByText('Overview')).toBeInTheDocument();
            expect(screen.getByText('Key Points')).toBeInTheDocument();
            expect(screen.getByText(mockSummary.summary)).toBeInTheDocument();
            mockSummary.key_points.forEach(point => {
                expect(screen.getByText(point)).toBeInTheDocument();
            });
        });
    });

    it('handles summary generation error', async () => {
        const errorMessage = 'Summary generation failed';
        (api.summary.summarize as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));
        
        render(<SummaryDisplay fileId={mockFileId} onError={mockOnError} />);
        
        fireEvent.click(screen.getByText('Generate Summary'));
        
        await waitFor(() => {
            expect(mockOnError).toHaveBeenCalledWith(errorMessage);
        });
    });
}); 