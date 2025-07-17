import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';

describe('ThemeToggle', () => {
    it('renders moon icon in light theme', () => {
        render(
            <ThemeProvider>
                <ThemeToggle />
            </ThemeProvider>
        );
        
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('aria-label', 'Switch to dark theme');
    });

    it('renders sun icon in dark theme', () => {
        render(
            <ThemeProvider>
                <ThemeToggle />
            </ThemeProvider>
        );
        
        const button = screen.getByRole('button');
        fireEvent.click(button);
        expect(button).toHaveAttribute('aria-label', 'Switch to light theme');
    });

    it('toggles theme when clicked', () => {
        render(
            <ThemeProvider>
                <ThemeToggle />
            </ThemeProvider>
        );
        
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('aria-label', 'Switch to dark theme');
        
        fireEvent.click(button);
        expect(button).toHaveAttribute('aria-label', 'Switch to light theme');
        
        fireEvent.click(button);
        expect(button).toHaveAttribute('aria-label', 'Switch to dark theme');
    });
}); 