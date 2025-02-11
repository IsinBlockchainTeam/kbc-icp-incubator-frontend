import React from 'react';
import { act, render, screen } from '@testing-library/react';
import ProfileMenuItem from '@/components/Menu/ProfileMenuItem';
import { UserInfoState } from '@/redux/reducers/userInfoSlice';

describe('ProfileMenuItem', () => {
    const mockDispatch = jest.fn();
    const mockDisconnect = jest.fn();
    const mockOnMenuClick = jest.fn();

    const mockUserInfo = {
        isLogged: false,
        subjectDid: '',
        companyClaims: {},
        employeeClaims: {},
        roleProof: {}
    } as UserInfoState;

    const loggedInUserInfo = {
        ...mockUserInfo,
        isLogged: true,
        employeeClaims: { lastName: 'Doe', image: 'test.jpg' },
        companyClaims: { legalName: 'Test Company' }
    } as UserInfoState;

    test('renders settings menu when logged out', async () => {
        await act(async () => {
            render(<ProfileMenuItem userInfo={mockUserInfo} dispatch={mockDispatch} disconnect={mockDisconnect} onMenuClick={mockOnMenuClick} />);
        });

        expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    test('renders profile menu when logged in', async () => {
        await act(async () => {
            render(<ProfileMenuItem userInfo={loggedInUserInfo} dispatch={mockDispatch} disconnect={mockDisconnect} onMenuClick={mockOnMenuClick} />);
        });

        expect(screen.getByText(`${loggedInUserInfo.employeeClaims.lastName}, ${loggedInUserInfo.companyClaims.legalName}`)).toBeInTheDocument();
    });
});
