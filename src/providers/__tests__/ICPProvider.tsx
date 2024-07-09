import React from 'react';
import { render, screen } from '@testing-library/react';
import { ICPProvider, ICPContext } from '../ICPProvider';
import { useSiweIdentity } from '../SiweIdentityProvider';
import { useICPDrivers } from '@/providers/hooks/useICPDrivers';

jest.mock('../SiweIdentityProvider', () => ({
    useSiweIdentity: jest.fn()
}));

jest.mock('@/providers/hooks/useICPDrivers', () => ({
    useICPDrivers: jest.fn()
}));

describe('ICPProvider', () => {
    it('renders children when identity is present', () => {
        const mockIdentity = { id: 'test-id' };
        const mockDrivers = {
            icpOrganizationDriver: {},
            icpStorageDriver: {},
            icpFileDriver: {},
            icpIdentityDriver: {},
            getNameByDID: jest.fn()
        };

        (useSiweIdentity as jest.Mock).mockReturnValue({ identity: mockIdentity });
        (useICPDrivers as jest.Mock).mockReturnValue(mockDrivers);

        render(
            <ICPProvider>
                <div data-testid="child-component"></div>
            </ICPProvider>
        );

        expect(screen.getByTestId('child-component')).toBeInTheDocument();
    });

    it('renders error message when identity is not present', () => {
        (useSiweIdentity as jest.Mock).mockReturnValue({ identity: null });

        render(
            <ICPProvider>
                <div data-testid="child-component"></div>
            </ICPProvider>
        );

        expect(screen.queryByText('Siwe identity not initialized')).toBeInTheDocument();
        expect(screen.queryByTestId('child-component')).not.toBeInTheDocument();
    });

    it('provides ICP drivers via context when identity is present', () => {
        const mockIdentity = { id: 'test-id' };
        const mockDrivers = {
            icpOrganizationDriver: {},
            icpStorageDriver: {},
            icpFileDriver: {},
            icpIdentityDriver: {},
            getNameByDID: jest.fn()
        };

        (useSiweIdentity as jest.Mock).mockReturnValue({ identity: mockIdentity });
        (useICPDrivers as jest.Mock).mockReturnValue(mockDrivers);

        const TestComponent = () => {
            const context = React.useContext(ICPContext);
            expect(context).toHaveProperty('organizationDriver');
            expect(context).toHaveProperty('storageDriver');
            expect(context).toHaveProperty('fileDriver');
            expect(context).toHaveProperty('identityDriver');
            expect(context).toHaveProperty('getNameByDID');
            return null;
        };

        render(
            <ICPProvider>
                <TestComponent />
            </ICPProvider>
        );
    });
});
