import React from 'react';
import { useSelector } from 'react-redux';
import { render, screen } from '@testing-library/react';
import AuthenticationGuard from '@/guards/auth/AuthenticationGuard';
import { Navigate } from 'react-router-dom';
import { paths } from '@/constants/paths';

jest.mock('react-redux', () => ({
    useSelector: jest.fn()
}));

jest.mock('react-router-dom', () => ({
    Navigate: jest.fn(() => null)
}));

describe('AuthenticationGuard', () => {
    it('should render children when user is logged in', () => {
        (useSelector as jest.Mock).mockReturnValue({ isLogged: true });

        render(
            <AuthenticationGuard>
                <div>Protected Content</div>
            </AuthenticationGuard>
        );

        expect(screen.getByText('Protected Content')).toBeInTheDocument();
        expect(Navigate).not.toHaveBeenCalled();
    });

    it('should navigate to login when user is not logged in', () => {
        (useSelector as jest.Mock).mockReturnValue({ isLogged: false });

        render(
            <AuthenticationGuard>
                <div>Protected Content</div>
            </AuthenticationGuard>
        );

        expect(Navigate).toHaveBeenCalledWith({ to: paths.LOGIN }, expect.anything());
    });
});
