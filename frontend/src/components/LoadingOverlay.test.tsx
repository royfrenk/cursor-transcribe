import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingOverlay from './LoadingOverlay';

describe('LoadingOverlay', () => {
    it('renders nothing when not visible', () => {
        const { container } = render(<LoadingOverlay isVisible={false} />);
        expect(container.firstChild).toBeNull();
    });

    it('renders with loading spinner when visible', () => {
        render(<LoadingOverlay isVisible={true} />);
        const spinner = screen.getByRole('status');
        expect(spinner).toBeInTheDocument();
    });

    it('renders with message when provided', () => {
        const message = 'Loading...';
        render(<LoadingOverlay isVisible={true} message={message} />);
        expect(screen.getByText(message)).toBeInTheDocument();
    });

    it('has correct ARIA attributes', () => {
        render(<LoadingOverlay isVisible={true} />);
        const overlay = screen.getByRole('alert');
        expect(overlay).toHaveAttribute('aria-busy', 'true');
    });
}); 