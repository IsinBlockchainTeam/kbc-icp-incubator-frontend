import React, { ReactNode } from 'react';

import { render } from '@testing-library/react';
import PublicRoutes from '@/routes/public/PublicRoutes';

jest.mock('@/layout/BasicLayout/BasicLayout', () => ({
    BasicLayout: ({ children }: { children: ReactNode }) => <div data-testid="basic-layout">{children}</div>
}));

jest.mock('react-router-dom', () => ({
    Outlet: () => <div data-testid="outlet">Outlet Content</div>
}));

export {};

describe('PrivateRoutes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render Outlet inside BasicLayout', () => {
        const { getByTestId } = render(<PublicRoutes />);
        const basicLayout = getByTestId('basic-layout');
        const outlet = getByTestId('outlet');

        expect(getByTestId('basic-layout')).toBeInTheDocument();
        expect(basicLayout).toContainElement(outlet);
    });
});
