import React, { ReactNode } from 'react';
import { render } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useWalletConnect } from '@/providers/auth/WalletConnectProvider';
import { LimitedAccessLayout } from '@/layout/LimitedAccessLayout/LimitedAccessLayout';
import { UserInfoState } from '@/redux/reducers/userInfoSlice';
import { Dispatch } from '@reduxjs/toolkit';

jest.mock('react-router-dom', () => ({
    Link: ({ children, to, className }: { children: ReactNode; to: string; className: string }) => (
        <a data-testid="router-link" href={to} className={className}>
            {children}
        </a>
    ),
    useNavigate: jest.fn()
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
    ContentLayout: ({ children }: { children: ReactNode }) => <div data-testid="content-layout">{children}</div>
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

describe('LimitedAccessLayout', () => {
    const mockNavigate = jest.fn();
    const mockDispatch = jest.fn();
    const mockDisconnect = jest.fn();
    const mockUserInfo = {
        name: 'Test User'
    };

    beforeEach(() => {
        (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
        (useDispatch as jest.Mock).mockReturnValue(mockDispatch);
        (useWalletConnect as jest.Mock).mockReturnValue({ disconnect: mockDisconnect });
        (useSelector as jest.Mock).mockReturnValue(mockUserInfo);
    });

    it('should render basic layout structure', () => {
        const { getByTestId } = render(
            <LimitedAccessLayout>
                <div>Test Content</div>
            </LimitedAccessLayout>
        );

        expect(getByTestId('content-layout')).toBeInTheDocument();
        expect(getByTestId('profile-menu-item')).toBeInTheDocument();
    });

    it('should handle menu click navigation', () => {
        const { getByTestId } = render(<LimitedAccessLayout />);

        getByTestId('profile-menu-item').click();
        expect(mockNavigate).toHaveBeenCalledWith('/profile');
    });
});
