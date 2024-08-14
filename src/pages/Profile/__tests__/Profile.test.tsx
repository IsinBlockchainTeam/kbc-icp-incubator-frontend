import { render, act, screen } from '@testing-library/react';
import { useSelector } from 'react-redux';
import { useSigner } from '@/providers/SignerProvider';
import { useICP } from '@/providers/ICPProvider';
import { useSiweIdentity } from '@/providers/SiweIdentityProvider';
import Profile from '@/pages/Profile/Profile';
import { UserInfoState } from '@/redux/reducers/userInfoSlice';
import { Navigate } from 'react-router-dom';
import { paths } from '@/constants/paths';
import userEvent from '@testing-library/user-event';
import { JsonRpcSigner } from '@ethersproject/providers';

jest.mock('react-redux');
jest.mock('react-router-dom');
jest.mock('@/providers/SignerProvider');
jest.mock('@/providers/ICPProvider');
jest.mock('@/providers/SiweIdentityProvider');

describe('Profile', () => {
    const userInfo = {
        isLogged: true,
        companyClaims: {
            legalName: 'Test Company',
            industrialSector: 'IT',
            address: '123 Main St',
            email: 'company@example.com',
            nation: 'USA',
            latitude: '0',
            longitude: '0',
            telephone: '123-456-7890',
            image: 'https://example.com/image.png',
            role: 'Importer',
            organizationId: 'orgId'
        },
        employeeClaims: {
            firstName: 'John',
            lastName: 'Doe',
            address: '345 Second St',
            birthDate: '01/01/2000',
            email: 'john.doe@example.com',
            telephone: '111-222-3333',
            role: 'User',
            image: 'https://example.com/image.png'
        }
    } as UserInfoState;
    const signer = { _address: '0x123' } as JsonRpcSigner;
    const organizationDriver = { getUserOrganizations: jest.fn(), createOrganization: jest.fn() };
    const identity = { getPrincipal: () => ({ toString: () => 'principal' }) };

    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.clearAllMocks();

        (useSigner as jest.Mock).mockReturnValue({ signer });
        (useICP as jest.Mock).mockReturnValue({ organizationDriver });
        (useSiweIdentity as jest.Mock).mockReturnValue({ identity });
        (useSelector as jest.Mock).mockReturnValue(userInfo);
    });

    it('should navigate to login if user is not logged in', async () => {
        (useSelector as jest.Mock).mockReturnValue({ isLogged: false });
        render(<Profile />);
        expect(Navigate).toHaveBeenCalled();
        expect(Navigate).toHaveBeenCalledWith(
            {
                to: paths.LOGIN
            },
            {}
        );
    });
    it('should renders user information when user is logged in', () => {
        const { getByText } = render(<Profile />);

        expect(getByText('Welcome John Doe!')).toBeInTheDocument();
        expect(getByText('Test Company')).toBeInTheDocument();
        expect(getByText('Importer')).toBeInTheDocument();
        expect(getByText('John Doe', { exact: true })).toBeInTheDocument();
        expect(getByText('User')).toBeInTheDocument();
    });
    it.each([
        // Company
        {
            label: 'Industrial Sector',
            value: 'IT'
        },
        {
            label: 'Email',
            index: 0,
            value: 'company@example.com'
        },
        {
            label: 'Phone',
            index: 0,
            value: '123-456-7890'
        },
        {
            label: 'Address',
            index: 0,
            value: '123 Main St' + ', ' + 'USA'
        },
        {
            label: 'Latitude',
            value: '0'
        },
        {
            label: 'Longitude',
            value: '0'
        },
        // Employee
        {
            label: 'Email',
            index: 1,
            value: 'john.doe@example.com'
        },
        {
            label: 'Phone',
            index: 1,
            value: '111-222-3333'
        },
        {
            label: 'Address',
            index: 1,
            value: '345 Second St'
        },
        {
            label: 'Birth Date',
            value: '01/01/2000'
        },
        {
            label: 'Ethereum Address',
            value: '0x123'
        },
        {
            label: 'ICP Principal',
            value: 'principal'
        }
    ])('should render text with label $label and value $value', (testCase) => {
        const index = testCase.index || 0;
        const { getAllByText } = render(<Profile />);
        const label = getAllByText(testCase.label)[index];
        expect(label).toBeInTheDocument();
        expect(label.nextSibling).toHaveTextContent(testCase.value);
    });

    it('should create an organization if it is not present', async () => {
        organizationDriver.getUserOrganizations.mockRejectedValueOnce(
            new Error('Organization not found')
        );
        await act(async () => {
            render(<Profile />);
        });

        expect(screen.getByText('Create organization')).toBeInTheDocument();
        await act(async () => {
            userEvent.click(screen.getByText('Create organization'));
        });
        expect(organizationDriver.createOrganization).toHaveBeenCalled();
        expect(organizationDriver.createOrganization).toHaveBeenCalledWith(
            'Test Company',
            'A company based in USA',
            { legalName: 'Test Company' }
        );
    });
});
