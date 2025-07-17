import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SettingsPage from './page';

describe('SettingsPage', () => {
    it('renders all settings controls', () => {
        render(<SettingsPage />);

        // Check for language selector
        expect(screen.getByLabelText(/default language/i)).toBeInTheDocument();

        // Check for include summary checkbox
        expect(screen.getByLabelText(/include summary by default/i)).toBeInTheDocument();

        // Check for export format select
        expect(screen.getByLabelText(/default export format/i)).toBeInTheDocument();

        // Check for theme select
        expect(screen.getByLabelText(/theme/i)).toBeInTheDocument();
    });

    it('updates settings when controls are changed', () => {
        render(<SettingsPage />);

        // Change language
        const languageSelect = screen.getByLabelText(/default language/i);
        fireEvent.change(languageSelect, { target: { value: 'fr' } });
        expect(languageSelect).toHaveValue('fr');

        // Toggle include summary
        const summaryCheckbox = screen.getByLabelText(/include summary by default/i);
        fireEvent.click(summaryCheckbox);
        expect(summaryCheckbox).toBeChecked();

        // Change export format
        const formatSelect = screen.getByLabelText(/default export format/i);
        fireEvent.change(formatSelect, { target: { value: 'srt' } });
        expect(formatSelect).toHaveValue('srt');

        // Change theme
        const themeSelect = screen.getByLabelText(/theme/i);
        fireEvent.change(themeSelect, { target: { value: 'dark' } });
        expect(themeSelect).toHaveValue('dark');
    });

    it('renders back to home link', () => {
        render(<SettingsPage />);
        const backLink = screen.getByText(/back to home/i);
        expect(backLink).toBeInTheDocument();
        expect(backLink.closest('a')).toHaveAttribute('href', '/');
    });
}); 