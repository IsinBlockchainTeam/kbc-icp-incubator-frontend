import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, Routes } from 'react-router-dom';
import { paths } from '@/constants/paths';
import publicRoutes from '../public.routes';

// Mock the Login component
jest.mock('@/pages/Login/Login', () => ({
    Login: () => <div>Login Page</div>
}));

describe('Public Routes', () => {
    const renderWithRouter = (route: string) => {
        return render(
            <MemoryRouter initialEntries={[route]}>
                <Routes>
                    {publicRoutes}
                </Routes>
            </MemoryRouter>
        );
    };

    it('should render Login page when accessing /login', () => {
        const { getByText } = renderWithRouter(paths.LOGIN);
        expect(getByText('Login Page')).toBeInTheDocument();
    });

    it('should redirect to Login page when accessing unknown route', () => {
        const { getByText } = renderWithRouter('/unknown-route');
        expect(getByText('Login Page')).toBeInTheDocument();
    });

    it('should redirect to Login page when accessing root path', () => {
        const { getByText } = renderWithRouter('/');
        expect(getByText('Login Page')).toBeInTheDocument();
    });
});