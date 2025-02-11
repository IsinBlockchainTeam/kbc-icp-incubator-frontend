import React from 'react';
import { render } from '@testing-library/react';
import { useSelector } from 'react-redux';
import { ContentLayout } from '@/layout/ContentLayout/ContentLayout';

jest.mock('react-redux', () => ({
    useSelector: jest.fn()
}));

jest.mock('react-router-dom', () => ({
    __esModule: true,
    Outlet: () => <div data-testid="outlet">Outlet Content</div>
}));

describe('ContentLayout', () => {
    beforeEach(() => {
        (useSelector as jest.Mock).mockReturnValue({
            isLoading: false,
            loadingMessages: {}
        });
    });

    it('should render with children', () => {
        const { getByText } = render(
            <ContentLayout>
                <div>Test Content</div>
            </ContentLayout>
        );

        expect(getByText('Test Content')).toBeInTheDocument();
    });

    it('should render Outlet when no children provided', () => {
        const { getByTestId } = render(<ContentLayout />);

        expect(getByTestId('outlet')).toBeInTheDocument();
    });

    it('should show loading spinner with messages when loading', () => {
        (useSelector as jest.Mock).mockReturnValue({
            isLoading: true,
            loadingMessages: {
                'Loading message 1': true,
                'Loading message 2': true
            }
        });

        const { getByAltText, getByText } = render(<ContentLayout />);

        expect(getByAltText('loading...')).toBeInTheDocument();
        expect(getByText('Loading message 1')).toBeInTheDocument();
        expect(getByText('Loading message 2')).toBeInTheDocument();
    });
});
