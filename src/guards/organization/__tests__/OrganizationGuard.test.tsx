import React, { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { render } from '@testing-library/react';
import { useOrganization } from '@/providers/entities/icp/OrganizationProvider';
import OrganizationGuard from '@/guards/organization/OrganizationGuard';
import { UserInfoState } from '@/redux/reducers/userInfoSlice';
import { RoleProof } from '@kbc-lib/coffee-trading-management-lib';

jest.mock('react-redux', () => ({
    useSelector: jest.fn()
}));

jest.mock('@/providers/entities/icp/OrganizationProvider', () => ({
    useOrganization: jest.fn()
}));

jest.mock('@/layout/MenuLayout/MenuLayout', () => ({
    __esModule: true,
    MenuLayout: ({ children }: { children: ReactNode }) => <div data-testid="menu-layout">{children}</div>
}));

jest.mock('@/layout/LimitedAccessLayout/LimitedAccessLayout', () => ({
    __esModule: true,
    LimitedAccessLayout: ({ children }: { children: ReactNode }) => <div data-testid="limited-access-layout">{children}</div>
}));

jest.mock('@/data-loaders/SyncDataLoader', () => ({
    __esModule: true,
    default: ({ children }: { children: ReactNode }) => <div data-testid="sync-loader">{children}</div>
}));

jest.mock('@/guards/navigation/NavigationBlocker', () => ({
    __esModule: true,
    default: ({ children }: { children: ReactNode }) => <div data-testid="nav-blocker">{children}</div>
}));

describe('OrganizationGuard', () => {
    const mockGetOrganization = jest.fn();
    const mockedUserInfo: UserInfoState = {
        roleProof: { delegator: '0x123' } as RoleProof
    };

    beforeEach(() => {
        (useOrganization as jest.Mock).mockReturnValue({ getOrganization: mockGetOrganization });
        (useSelector as jest.Mock).mockReturnValue(mockedUserInfo);
    });

    it('should render MenuLayout when organization is on ICP', () => {
        mockGetOrganization.mockReturnValue({});

        const { getByTestId } = render(
            <OrganizationGuard>
                <div>Test Content</div>
            </OrganizationGuard>
        );

        expect(mockGetOrganization).toHaveBeenCalled();

        expect(getByTestId('menu-layout')).toBeInTheDocument();
        expect(getByTestId('sync-loader')).toBeInTheDocument();
        expect(getByTestId('nav-blocker')).toBeInTheDocument();
    });

    it('should render LimitedAccessLayout when organization is not on ICP', () => {
        mockGetOrganization.mockImplementation(() => {
            throw new Error('Organization not found');
        });

        const { getByTestId } = render(
            <OrganizationGuard>
                <div>Test Content</div>
            </OrganizationGuard>
        );

        expect(mockGetOrganization).toHaveBeenCalled();

        expect(getByTestId('limited-access-layout')).toBeInTheDocument();
        expect(getByTestId('sync-loader')).toBeInTheDocument();
        expect(getByTestId('nav-blocker')).toBeInTheDocument();
    });
});
