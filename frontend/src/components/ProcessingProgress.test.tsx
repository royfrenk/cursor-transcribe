import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProcessingProgress from './ProcessingProgress';

describe('ProcessingProgress', () => {
    it('renders nothing when not visible', () => {
        const { container } = render(
            <ProcessingProgress
                currentStage="uploading"
                progress={50}
                isVisible={false}
            />
        );
        expect(container.firstChild).toBeNull();
    });

    it('renders all processing stages', () => {
        render(
            <ProcessingProgress
                currentStage="uploading"
                progress={50}
                isVisible={true}
            />
        );

        expect(screen.getByText('Uploading Audio')).toBeInTheDocument();
        expect(screen.getByText('Transcribing Audio')).toBeInTheDocument();
        expect(screen.getByText('Identifying Speakers')).toBeInTheDocument();
        expect(screen.getByText('Generating Summary')).toBeInTheDocument();
    });

    it('shows progress percentage for current stage', () => {
        render(
            <ProcessingProgress
                currentStage="transcribing"
                progress={75}
                isVisible={true}
            />
        );

        expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('highlights current stage in blue', () => {
        render(
            <ProcessingProgress
                currentStage="diarizing"
                progress={30}
                isVisible={true}
            />
        );

        const currentStage = screen.getByText('Identifying Speakers');
        expect(currentStage).toHaveClass('text-blue-600');
    });

    it('shows completed stages in green', () => {
        render(
            <ProcessingProgress
                currentStage="summarizing"
                progress={20}
                isVisible={true}
            />
        );

        const completedStages = [
            screen.getByText('Uploading Audio'),
            screen.getByText('Transcribing Audio'),
            screen.getByText('Identifying Speakers')
        ];

        completedStages.forEach(stage => {
            expect(stage).toHaveClass('text-green-600');
        });
    });

    it('shows upcoming stages in gray', () => {
        render(
            <ProcessingProgress
                currentStage="uploading"
                progress={90}
                isVisible={true}
            />
        );

        const upcomingStages = [
            screen.getByText('Transcribing Audio'),
            screen.getByText('Identifying Speakers'),
            screen.getByText('Generating Summary')
        ];

        upcomingStages.forEach(stage => {
            expect(stage).toHaveClass('text-gray-500');
        });
    });
}); 