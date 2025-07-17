import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsProvider, useSettings } from './SettingsContext';

// Test component that uses the settings context
function TestComponent() {
    const { settings, updateSettings } = useSettings();
    return (
        <div>
            <div data-testid="language">{settings.defaultLanguage}</div>
            <div data-testid="summary">{settings.includeSummary.toString()}</div>
            <div data-testid="format">{settings.exportFormat}</div>
            <div data-testid="theme">{settings.theme}</div>
            <button onClick={() => updateSettings('defaultLanguage', 'fr')}>
                Change Language
            </button>
            <button onClick={() => updateSettings('includeSummary', false)}>
                Toggle Summary
            </button>
            <button onClick={() => updateSettings('exportFormat', 'srt')}>
                Change Format
            </button>
            <button onClick={() => updateSettings('theme', 'dark')}>
                Change Theme
            </button>
        </div>
    );
}

describe('SettingsContext', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('provides default settings', () => {
        render(
            <SettingsProvider>
                <TestComponent />
            </SettingsProvider>
        );

        expect(screen.getByTestId('language')).toHaveTextContent('auto');
        expect(screen.getByTestId('summary')).toHaveTextContent('true');
        expect(screen.getByTestId('format')).toHaveTextContent('txt');
        expect(screen.getByTestId('theme')).toHaveTextContent('system');
    });

    it('loads settings from localStorage', () => {
        const savedSettings = {
            defaultLanguage: 'es',
            includeSummary: false,
            exportFormat: 'vtt',
            theme: 'dark'
        };
        localStorage.setItem('settings', JSON.stringify(savedSettings));

        render(
            <SettingsProvider>
                <TestComponent />
            </SettingsProvider>
        );

        expect(screen.getByTestId('language')).toHaveTextContent('es');
        expect(screen.getByTestId('summary')).toHaveTextContent('false');
        expect(screen.getByTestId('format')).toHaveTextContent('vtt');
        expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    });

    it('updates settings and saves to localStorage', () => {
        render(
            <SettingsProvider>
                <TestComponent />
            </SettingsProvider>
        );

        // Change language
        fireEvent.click(screen.getByText('Change Language'));
        expect(screen.getByTestId('language')).toHaveTextContent('fr');

        // Toggle summary
        fireEvent.click(screen.getByText('Toggle Summary'));
        expect(screen.getByTestId('summary')).toHaveTextContent('false');

        // Change format
        fireEvent.click(screen.getByText('Change Format'));
        expect(screen.getByTestId('format')).toHaveTextContent('srt');

        // Change theme
        fireEvent.click(screen.getByText('Change Theme'));
        expect(screen.getByTestId('theme')).toHaveTextContent('dark');

        // Check localStorage
        const savedSettings = JSON.parse(localStorage.getItem('settings') || '{}');
        expect(savedSettings).toEqual({
            defaultLanguage: 'fr',
            includeSummary: false,
            exportFormat: 'srt',
            theme: 'dark'
        });
    });

    it('throws error when useSettings is used outside provider', () => {
        const consoleError = console.error;
        console.error = jest.fn();

        expect(() => {
            render(<TestComponent />);
        }).toThrow('useSettings must be used within a SettingsProvider');

        console.error = consoleError;
    });
}); 