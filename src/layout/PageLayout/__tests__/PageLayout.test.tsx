import React from 'react';
import { render } from '@testing-library/react';
import { PageLayout } from '../PageLayout';

jest.mock('react-router-dom', () => ({
    Outlet: () => <div data-testid="mock-outlet">Outlet Content</div>
}));

describe('PageLayout', () => {
    it('should render children when provided', () => {
        const { getByText, queryByTestId } = render(
            <PageLayout>
                <div>Test Child Content</div>
            </PageLayout>
        );

        expect(getByText('Test Child Content')).toBeInTheDocument();
        expect(queryByTestId('mock-outlet')).not.toBeInTheDocument();
    });

    it('should render Outlet when no children provided', () => {
        const { getByTestId } = render(<PageLayout />);

        expect(getByTestId('mock-outlet')).toBeInTheDocument();
    });
});
