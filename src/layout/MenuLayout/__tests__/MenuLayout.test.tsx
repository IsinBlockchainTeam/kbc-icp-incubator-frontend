import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MenuLayout } from '@/layout/MenuLayout/MenuLayout';
import { UserInfoState } from '@/redux/reducers/userInfoSlice';
import { Dispatch } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import { paths } from '@/constants/paths';
import { useLocation, useNavigate } from 'react-router-dom';
import { useWalletConnect } from '@/providers/auth/WalletConnectProvider';

jest.mock('react-router-dom', () => ({
    useLocation: jest.fn(),
    useNavigate: jest.fn(),
    Link: ({ children, to, className }: any) => (
        <a data-testid="router-link" href={to} className={className}>
            {children}
        </a>
    )
}));

jest.mock('react-redux', () => ({
    useDispatch: jest.fn(),
    useSelector: jest.fn()
}));

jest.mock('@/providers/auth/WalletConnectProvider', () => ({
    useWalletConnect: jest.fn()
}));

jest.mock('@/layout/ContentLayout/ContentLayout', () => ({
    __esModule: true,
    ContentLayout: ({ children }: { children: React.ReactNode }) => <div data-testid="content-layout">{children}</div>
}));

jest.mock('@/components/Menu/ProfileMenuItem', () => ({
    __esModule: true,
    ProfileMenuItem: ({
        userInfo,
        dispatch,
        disconnect,
        onMenuClick
    }: {
        userInfo: UserInfoState;
        dispatch: Dispatch;
        disconnect: () => void;
        onMenuClick: (key: any) => void;
    }) => (
        <div data-testid="profile-menu-item" onClick={() => onMenuClick({ key: '/profile' })}>
            Profile Menu Item
        </div>
    )
}));

describe('MenuLayout', () => {
    const mockLocation = { pathname: paths.TRADES };
    const mockNavigate = jest.fn();
    const mockDispatch = jest.fn();
    const mockDisconnect = jest.fn();
    const mockUserInfo = {
        name: 'Test User'
    };

    beforeEach(() => {
        (useLocation as jest.Mock).mockReturnValue(mockLocation);
        (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
        (useDispatch as jest.Mock).mockReturnValue(mockDispatch);
        (useWalletConnect as jest.Mock).mockReturnValue({ disconnect: mockDisconnect });
        (useSelector as jest.Mock).mockReturnValue(mockUserInfo);
        jest.clearAllMocks();
    });

    it('should render correctly', async () => {
        await act(async () => {
            render(
                <MenuLayout>
                    <div>Test Content</div>
                </MenuLayout>
            );
        });

        expect(screen.getByText('Test Content')).toBeInTheDocument();

        expect(screen.getByTestId('router-link')).toBeInTheDocument();
        expect(screen.getByTestId('content-layout')).toBeInTheDocument();
        expect(screen.getByTestId('profile-menu-item')).toBeInTheDocument();
        expect(screen.getByAltText('KBC-Logo')).toBeInTheDocument();
    });

    it('should handle profile menu click', async () => {
        const { getByTestId } = render(<MenuLayout />);

        await act(async () => {
            fireEvent.click(getByTestId('profile-menu-item'));
        });

        expect(mockNavigate).toHaveBeenCalledWith('/profile');
    });
});
