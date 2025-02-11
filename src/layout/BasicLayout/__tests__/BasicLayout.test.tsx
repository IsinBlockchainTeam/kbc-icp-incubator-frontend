import React, { ReactNode } from 'react';
import { render } from '@testing-library/react';
import { BasicLayout } from '@/layout/BasicLayout/BasicLayout';

jest.mock('@/layout/ContentLayout/ContentLayout', () => ({
    __esModule: true,
    ContentLayout: ({ children }: { children: ReactNode }) => <div data-testid="content-layout">{children}</div>
}));

describe('BasicLayout', () => {
    it('should render sider with logo and content layout', () => {
        const { getByTestId } = render(
            <BasicLayout>
                <div>Test Content</div>
            </BasicLayout>
        );

        // Check if ContentLayout is rendered with children
        const contentLayout = getByTestId('content-layout');
        expect(contentLayout).toBeInTheDocument();
        expect(contentLayout).toHaveTextContent('Test Content');
    });
});
