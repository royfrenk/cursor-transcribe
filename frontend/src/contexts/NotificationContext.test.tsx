import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { NotificationProvider, useNotification } from './NotificationContext';

// Test component that uses the notification context
function TestComponent() {
    const { showNotification } = useNotification();
    return (
        <button onClick={() => showNotification('Test message', 'success')}>
            Show Notification
        </button>
    );
}

describe('NotificationContext', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('provides notification context to children', () => {
        render(
            <NotificationProvider>
                <TestComponent />
            </NotificationProvider>
        );
        
        expect(screen.getByText('Show Notification')).toBeInTheDocument();
    });

    it('shows notification when showNotification is called', () => {
        render(
            <NotificationProvider>
                <TestComponent />
            </NotificationProvider>
        );
        
        screen.getByText('Show Notification').click();
        expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    it('automatically closes notification after duration', () => {
        render(
            <NotificationProvider>
                <TestComponent />
            </NotificationProvider>
        );
        
        screen.getByText('Show Notification').click();
        expect(screen.getByText('Test message')).toBeInTheDocument();
        
        act(() => {
            jest.advanceTimersByTime(3000);
        });
        
        expect(screen.queryByText('Test message')).not.toBeInTheDocument();
    });

    it('throws error when useNotification is used outside provider', () => {
        const consoleError = console.error;
        console.error = jest.fn();
        
        expect(() => {
            render(<TestComponent />);
        }).toThrow('useNotification must be used within a NotificationProvider');
        
        console.error = consoleError;
    });
}); 