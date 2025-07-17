import { render, screen, fireEvent, act } from '@testing-library/react';
import Notification from './Notification';

describe('Notification', () => {
    const mockOnClose = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('renders success notification', () => {
        render(
            <Notification
                message="Operation successful"
                type="success"
                onClose={mockOnClose}
            />
        );
        
        expect(screen.getByText('Operation successful')).toBeInTheDocument();
        expect(screen.getByText('✓')).toBeInTheDocument();
    });

    it('renders error notification', () => {
        render(
            <Notification
                message="Operation failed"
                type="error"
                onClose={mockOnClose}
            />
        );
        
        expect(screen.getByText('Operation failed')).toBeInTheDocument();
        expect(screen.getByText('✕')).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
        render(
            <Notification
                message="Test message"
                type="success"
                onClose={mockOnClose}
            />
        );
        
        fireEvent.click(screen.getByText('×'));
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('automatically closes after duration', () => {
        render(
            <Notification
                message="Test message"
                type="success"
                onClose={mockOnClose}
                duration={1000}
            />
        );
        
        act(() => {
            jest.advanceTimersByTime(1000);
        });
        
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('cleans up timer on unmount', () => {
        const { unmount } = render(
            <Notification
                message="Test message"
                type="success"
                onClose={mockOnClose}
                duration={1000}
            />
        );
        
        unmount();
        
        act(() => {
            jest.advanceTimersByTime(1000);
        });
        
        expect(mockOnClose).not.toHaveBeenCalled();
    });
}); 