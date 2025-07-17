import React from 'react';
import { render } from '@testing-library/react';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner', () => {
    it('renders with default size', () => {
        const { container } = render(<LoadingSpinner />);
        const spinner = container.firstChild;
        expect(spinner).toHaveClass('w-8 h-8');
    });

    it('renders with small size', () => {
        const { container } = render(<LoadingSpinner size="sm" />);
        const spinner = container.firstChild;
        expect(spinner).toHaveClass('w-4 h-4');
    });

    it('renders with large size', () => {
        const { container } = render(<LoadingSpinner size="lg" />);
        const spinner = container.firstChild;
        expect(spinner).toHaveClass('w-12 h-12');
    });

    it('applies additional className', () => {
        const { container } = render(<LoadingSpinner className="custom-class" />);
        const wrapper = container.firstChild;
        expect(wrapper).toHaveClass('custom-class');
    });

    it('has correct ARIA attributes', () => {
        const { container } = render(<LoadingSpinner />);
        const spinner = container.querySelector('[role="status"]');
        expect(spinner).toHaveAttribute('aria-label', 'Loading');
    });
}); 