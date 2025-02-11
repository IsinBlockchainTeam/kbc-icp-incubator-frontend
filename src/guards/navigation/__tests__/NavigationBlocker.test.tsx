import React from 'react';
import { render, screen } from '@testing-library/react';
import { useLocation, useNavigate } from 'react-router-dom';
import NavigationBlocker from '@/guards/navigation/NavigationBlocker';

jest.mock('react-router-dom', () => ({
    useLocation: jest.fn(),
    useNavigate: jest.fn()
}));

describe('NavigationBlocker', () => {
    const mockNavigate = jest.fn();
    const redirectPath = '/redirect';

    beforeEach(() => {
        (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
        (useLocation as jest.Mock).mockReturnValue({ pathname: '/current' });
    });

    it('should render children when condition is met', () => {
        const condition = jest.fn().mockReturnValue(true);

        render(
            <NavigationBlocker condition={condition} redirectPath={redirectPath}>
                <div>Protected Content</div>
            </NavigationBlocker>
        );

        expect(screen.getByText('Protected Content')).toBeInTheDocument();
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should navigate to redirect path when condition is not met', () => {
        const condition = jest.fn().mockReturnValue(false);

        render(
            <NavigationBlocker condition={condition} redirectPath={redirectPath}>
                <div>Protected Content</div>
            </NavigationBlocker>
        );

        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
        expect(mockNavigate).toHaveBeenCalledWith(redirectPath);
    });

    it('should not navigate when already on redirect path', () => {
        const condition = jest.fn().mockReturnValue(false);
        (useLocation as jest.Mock).mockReturnValue({ pathname: redirectPath });

        const { queryByText } = render(
            <NavigationBlocker condition={condition} redirectPath={redirectPath}>
                <div>Protected Content</div>
            </NavigationBlocker>
        );

        expect(queryByText('Protected Content')).toBeInTheDocument();
        expect(mockNavigate).not.toHaveBeenCalled();
    });
});
