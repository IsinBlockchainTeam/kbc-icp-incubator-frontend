import React, { ReactNode } from 'react';
import { render } from '@testing-library/react';
import LoadingLayoutHandler from '@/handlers/layout/LoadingLayoutHandler';
import { useOrganization } from '@/providers/entities/icp/OrganizationProvider';

jest.mock('@/providers/entities/icp/OrganizationProvider', () => ({
    useOrganization: jest.fn()
}));

jest.mock('@/layout/BasicLayout/BasicLayout', () => ({
    __esModule: true,
    BasicLayout: ({ children }: { children: ReactNode }) => <div data-testid="basic-layout">{children}</div>
}));

describe('LoadingLayoutHandler', () => {
    it('should render BasicLayout when data is not loaded', () => {
        (useOrganization as jest.Mock).mockReturnValue({
            dataLoaded: false
        });

        const { getByTestId, getByText } = render(
            <LoadingLayoutHandler>
                <div>Test Content</div>
            </LoadingLayoutHandler>
        );

        expect(getByTestId('basic-layout')).toBeInTheDocument();
        expect(getByText('Test Content')).toBeInTheDocument();
    });

    it('should render children directly without BasicLayout when data is loaded', () => {
        (useOrganization as jest.Mock).mockReturnValue({
            dataLoaded: true
        });

        const { queryByTestId, getByText } = render(
            <LoadingLayoutHandler>
                <div>Test Content</div>
            </LoadingLayoutHandler>
        );

        expect(queryByTestId('basic-layout')).not.toBeInTheDocument();
        expect(getByText('Test Content')).toBeInTheDocument();
    });
});
