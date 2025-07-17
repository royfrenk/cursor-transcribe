import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, useTheme } from './ThemeContext';

// Test component that uses the theme context
const TestComponent = () => {
    const { theme, toggleTheme } = useTheme();
    return (
        <div>
            <span data-testid="theme">{theme}</span>
            <button onClick={toggleTheme}>Toggle Theme</button>
        </div>
    );
};

describe('ThemeContext', () => {
    beforeEach(() => {
        localStorage.clear();
        window.matchMedia = jest.fn().mockImplementation(query => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: jest.fn(),
            removeListener: jest.fn(),
        }));
    });

    it('provides light theme by default', () => {
        render(
            <ThemeProvider>
                <TestComponent />
            </ThemeProvider>
        );
        
        expect(screen.getByTestId('theme')).toHaveTextContent('light');
    });

    it('toggles theme when button is clicked', () => {
        render(
            <ThemeProvider>
                <TestComponent />
            </ThemeProvider>
        );
        
        fireEvent.click(screen.getByText('Toggle Theme'));
        expect(screen.getByTestId('theme')).toHaveTextContent('dark');
        
        fireEvent.click(screen.getByText('Toggle Theme'));
        expect(screen.getByTestId('theme')).toHaveTextContent('light');
    });

    it('loads theme from localStorage', () => {
        localStorage.setItem('theme', 'dark');
        
        render(
            <ThemeProvider>
                <TestComponent />
            </ThemeProvider>
        );
        
        expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    });

    it('uses system preference when no theme is saved', () => {
        window.matchMedia = jest.fn().mockImplementation(query => ({
            matches: true,
            media: query,
            onchange: null,
            addListener: jest.fn(),
            removeListener: jest.fn(),
        }));
        
        render(
            <ThemeProvider>
                <TestComponent />
            </ThemeProvider>
        );
        
        expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    });

    it('throws error when useTheme is used outside ThemeProvider', () => {
        const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
        
        expect(() => {
            render(<TestComponent />);
        }).toThrow('useTheme must be used within a ThemeProvider');
        
        consoleError.mockRestore();
    });
}); 