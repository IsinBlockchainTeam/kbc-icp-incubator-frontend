import React from 'react';
import { act, fireEvent, render } from '@testing-library/react';
import Profile from '@/pages/Profile/Profile';
import { useSelector } from 'react-redux';
import { useSigner } from '@/providers/auth/SignerProvider';
import { useSiweIdentity } from '@/providers/auth/SiweIdentityProvider';
import { useOrganization } from '@/providers/entities/icp/OrganizationProvider';
import { Navigate } from 'react-router-dom';

jest.mock('react-redux', () => ({
    useSelector: jest.fn()
}));

jest.mock('react-router-dom', () => ({
    Navigate: jest.fn(() => null)
}));

jest.mock('@/providers/auth/SiweIdentityProvider', () => ({
    useSiweIdentity: jest.fn()
}));

jest.mock('@/providers/auth/SignerProvider', () => ({
    useSigner: jest.fn()
}));

jest.mock('@/providers/entities/icp/OrganizationProvider', () => ({
    useOrganization: jest.fn()
}));

describe('Profile', () => {
    const mockUserInfo = {
        isLogged: true,
        employeeClaims: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            telephone: '123456789',
            address: '123 Street',
            birthDate: '1990-01-01',
            role: 'Employee',
            image: 'employee.jpg'
        },
        companyClaims: {
            legalName: 'Test Company',
            role: 'PRODUCER',
            industrialSector: 'Coffee',
            email: 'company@example.com',
            telephone: '987654321',
            address: '456 Avenue',
            nation: 'USA',
            image: 'company.jpg',
            latitude: '123',
            longitude: '456'
        },
        roleProof: {
            delegator: '0x123'
        }
    };

    const mockSigner = {
        _address: '0x456'
    };

    const mockIdentity = {
        getPrincipal: () => ({ toString: () => 'test-principal' })
    };

    const mockedGetOrganization = jest.fn();

    beforeEach(() => {
        (useSelector as jest.Mock).mockReturnValue(mockUserInfo);
        (useSigner as jest.Mock).mockReturnValue({ signer: mockSigner });
        (useSiweIdentity as jest.Mock).mockReturnValue({ identity: mockIdentity });
        (useOrganization as jest.Mock).mockReturnValue({
            getOrganization: mockedGetOrganization,
            storeOrganization: jest.fn(),
            updateOrganization: jest.fn(),
            organizations: []
        });
    });

    it('should redirect when user is not logged in', () => {
        (useSelector as jest.Mock).mockReturnValue({ ...mockUserInfo, isLogged: false });

        render(<Profile />);

        expect(Navigate).toHaveBeenCalledWith({ to: '/login' }, expect.anything());
    });

    it('should render user information correctly', () => {
        const { getByText } = render(<Profile />);

        expect(getByText('Welcome John Doe!')).toBeInTheDocument();
        expect(getByText('Test Company')).toBeInTheDocument();
        expect(getByText('john@example.com')).toBeInTheDocument();
        expect(getByText('company@example.com')).toBeInTheDocument();
    });

    it('should show store organization button when organization is not found', () => {
        mockedGetOrganization.mockImplementation(() => {
            throw new Error('Organization not found');
        });

        const { getByText } = render(<Profile />);

        expect(getByText('Share organization information')).toBeInTheDocument();
    });

    it('should show update button when organization exists', async () => {
        const mockOrg = {};
        (useOrganization as jest.Mock).mockReturnValue({
            getOrganization: jest.fn(() => mockOrg),
            storeOrganization: jest.fn(),
            updateOrganization: jest.fn(),
            organizations: [mockOrg]
        });

        const { getByText } = render(<Profile />);

        await act(async () => {
            fireEvent.click(getByText('Update organization information'));
        });

        expect(getByText('Update organization information')).toBeInTheDocument();
    });

    it('should handle store organization action', async () => {
        const mockStoreOrganization = jest.fn();
        (useOrganization as jest.Mock).mockReturnValue({
            getOrganization: jest.fn(),
            storeOrganization: mockStoreOrganization,
            updateOrganization: jest.fn(),
            organizations: []
        });

        const { getByText } = render(<Profile />);

        await act(async () => {
            fireEvent.click(getByText('Share organization information'));
        });

        expect(mockStoreOrganization).toHaveBeenCalled();
    });
});
