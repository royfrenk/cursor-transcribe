import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ExportControls from './ExportControls';
import { api } from '@/lib/api/client';

// Mock the API client
jest.mock('@/lib/api/client', () => ({
    api: {
        export: {
            exportTranscription: jest.fn()
        }
    }
}));

// Mock URL.createObjectURL and revokeObjectURL
const mockCreateObjectURL = jest.fn();
const mockRevokeObjectURL = jest.fn();
window.URL.createObjectURL = mockCreateObjectURL;
window.URL.revokeObjectURL = mockRevokeObjectURL;

describe('ExportControls', () => {
    const mockFileId = 'test-file-id';
    const mockOnError = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mockCreateObjectURL.mockReturnValue('mock-url');
    });

    it('renders export controls with default options', () => {
        render(<ExportControls fileId={mockFileId} onError={mockOnError} />);
        
        expect(screen.getByText('Export Transcription')).toBeInTheDocument();
        expect(screen.getByLabelText('Format')).toHaveValue('txt');
        expect(screen.getByLabelText('Include summary and key points')).not.toBeChecked();
    });

    it('handles format selection', () => {
        render(<ExportControls fileId={mockFileId} onError={mockOnError} />);
        
        const formatSelect = screen.getByLabelText('Format');
        fireEvent.change(formatSelect, { target: { value: 'srt' } });
        
        expect(formatSelect).toHaveValue('srt');
    });

    it('handles summary inclusion toggle', () => {
        render(<ExportControls fileId={mockFileId} onError={mockOnError} />);
        
        const summaryCheckbox = screen.getByLabelText('Include summary and key points');
        fireEvent.click(summaryCheckbox);
        
        expect(summaryCheckbox).toBeChecked();
    });

    it('handles successful export', async () => {
        const mockBlob = new Blob(['test content'], { type: 'text/plain' });
        (api.export.exportTranscription as jest.Mock).mockResolvedValueOnce(mockBlob);
        
        render(<ExportControls fileId={mockFileId} onError={mockOnError} />);
        
        fireEvent.click(screen.getByText('Export'));
        
        await waitFor(() => {
            expect(api.export.exportTranscription).toHaveBeenCalledWith(
                mockFileId,
                'txt',
                false
            );
            expect(mockCreateObjectURL).toHaveBeenCalled();
            expect(mockRevokeObjectURL).toHaveBeenCalled();
        });
    });

    it('handles export error', async () => {
        const errorMessage = 'Export failed';
        (api.export.exportTranscription as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));
        
        render(<ExportControls fileId={mockFileId} onError={mockOnError} />);
        
        fireEvent.click(screen.getByText('Export'));
        
        await waitFor(() => {
            expect(mockOnError).toHaveBeenCalledWith(errorMessage);
        });
    });

    it('disables controls while exporting', async () => {
        (api.export.exportTranscription as jest.Mock).mockImplementation(
            () => new Promise(resolve => setTimeout(resolve, 100))
        );
        
        render(<ExportControls fileId={mockFileId} onError={mockOnError} />);
        
        fireEvent.click(screen.getByText('Export'));
        
        expect(screen.getByText('Exporting...')).toBeInTheDocument();
        expect(screen.getByLabelText('Format')).toBeDisabled();
        expect(screen.getByLabelText('Include summary and key points')).toBeDisabled();
    });
}); 