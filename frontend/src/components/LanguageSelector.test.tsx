import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LanguageSelector from './LanguageSelector';

describe('LanguageSelector', () => {
    const mockOnChange = jest.fn();

    beforeEach(() => {
        mockOnChange.mockClear();
    });

    it('renders with default value', () => {
        render(
            <LanguageSelector
                value="en"
                onChange={mockOnChange}
            />
        );
        
        const select = screen.getByRole('combobox');
        expect(select).toHaveValue('en');
    });

    it('calls onChange when selection changes', () => {
        render(
            <LanguageSelector
                value="en"
                onChange={mockOnChange}
            />
        );
        
        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: 'fr' } });
        
        expect(mockOnChange).toHaveBeenCalledWith('fr');
    });

    it('is disabled when disabled prop is true', () => {
        render(
            <LanguageSelector
                value="en"
                onChange={mockOnChange}
                disabled={true}
            />
        );
        
        const select = screen.getByRole('combobox');
        expect(select).toBeDisabled();
    });

    it('applies additional class name', () => {
        const customClass = 'custom-class';
        render(
            <LanguageSelector
                value="en"
                onChange={mockOnChange}
                className={customClass}
            />
        );
        
        const container = screen.getByRole('combobox').parentElement;
        expect(container).toHaveClass(customClass);
    });

    it('renders all supported languages', () => {
        render(
            <LanguageSelector
                value="en"
                onChange={mockOnChange}
            />
        );
        
        // Check for some key languages
        expect(screen.getByText('Auto-detect')).toBeInTheDocument();
        expect(screen.getByText('English')).toBeInTheDocument();
        expect(screen.getByText('Spanish')).toBeInTheDocument();
        expect(screen.getByText('French')).toBeInTheDocument();
        expect(screen.getByText('German')).toBeInTheDocument();
        expect(screen.getByText('Chinese')).toBeInTheDocument();
        expect(screen.getByText('Japanese')).toBeInTheDocument();
        expect(screen.getByText('Arabic')).toBeInTheDocument();
        expect(screen.getByText('Hebrew')).toBeInTheDocument();
    });

    it('handles RTL languages correctly', () => {
        render(
            <LanguageSelector
                value="ar"
                onChange={mockOnChange}
            />
        );
        
        const container = screen.getByRole('combobox').parentElement;
        const select = screen.getByRole('combobox');
        
        expect(container).toHaveAttribute('dir', 'rtl');
        expect(select).toHaveClass('text-right');
    });

    it('handles LTR languages correctly', () => {
        render(
            <LanguageSelector
                value="en"
                onChange={mockOnChange}
            />
        );
        
        const container = screen.getByRole('combobox').parentElement;
        const select = screen.getByRole('combobox');
        
        expect(container).toHaveAttribute('dir', 'ltr');
        expect(select).toHaveClass('text-left');
    });
}); 