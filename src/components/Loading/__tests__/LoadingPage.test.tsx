import React from 'react';
import { render, screen } from '@testing-library/react';
import { LoadingPage } from '@/components/Loading/LoadingPage';

describe('LoadingPage', () => {
    test('renders loading text messages correctly', () => {
        render(<LoadingPage />);

        expect(screen.getByText('Loading your content...')).toBeInTheDocument();
        expect(screen.getByText('This may take a few moments')).toBeInTheDocument();
    });

    test('renders skeleton components', () => {
        render(<LoadingPage />);

        const skeletonInput = document.querySelector('.ant-skeleton-input');
        const skeletonButton = document.querySelector('.ant-skeleton-button');
        const skeletonParagraph = document.querySelector('.ant-skeleton-paragraph');

        expect(skeletonInput).toBeInTheDocument();
        expect(skeletonButton).toBeInTheDocument();
        expect(skeletonParagraph).toBeInTheDocument();
    });

    test('renders skeleton paragraph with correct number of rows', () => {
        render(<LoadingPage />);

        const paragraphLines = document.querySelectorAll('.ant-skeleton-paragraph li');
        expect(paragraphLines).toHaveLength(3);
    });

    test('renders card container', () => {
        render(<LoadingPage />);

        expect(document.querySelector('.ant-card')).toBeInTheDocument();
    });
});
