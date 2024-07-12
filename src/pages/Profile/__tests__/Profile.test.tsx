import { render, act, screen } from '@testing-library/react';
import { useSelector } from 'react-redux';
import { useSigner } from '@/providers/SignerProvider';
import { useICP } from '@/providers/ICPProvider';
import { useSiweIdentity } from '@/providers/SiweIdentityProvider';
import Profile from '@/pages/Profile/Profile';
import { UserInfoState } from '@/redux/reducers/userInfoSlice';
import { Wallet } from 'ethers';
import { Navigate } from 'react-router-dom';
import { paths } from '@/constants/paths';
import userEvent from '@testing-library/user-event';

jest.mock('react-redux');
jest.mock('react-router-dom');
jest.mock('@/providers/SignerProvider');
jest.mock('@/providers/ICPProvider');
jest.mock('@/providers/SiweIdentityProvider');

describe('Profile', () => {
    const userInfo = {
        isLogged: true,
        legalName: 'John Doe',
        role: 'User',
        email: 'john.doe@example.com',
        address: '123 Main St',
        nation: 'USA',
        telephone: '123-456-7890'
    } as UserInfoState;
    const signer = { address: '0x123' } as Wallet;
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
        expect(getByText('Role: User')).toBeInTheDocument();
        expect(getByText('Email: john.doe@example.com')).toBeInTheDocument();
        expect(getByText('Address: 123 Main St')).toBeInTheDocument();
        expect(getByText('Nation: USA')).toBeInTheDocument();
        expect(getByText('Telephone: 123-456-7890')).toBeInTheDocument();
        expect(getByText('Ethereum Address: 0x123')).toBeInTheDocument();
        expect(getByText('ICP principal: principal')).toBeInTheDocument();
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
            'John Doe',
            'A company based in USA',
            { legalName: 'John Doe' }
        );
    });
});
