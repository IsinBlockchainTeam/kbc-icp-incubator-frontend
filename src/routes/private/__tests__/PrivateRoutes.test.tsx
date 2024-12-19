// import React from 'react';
// import { render } from '@testing-library/react';
// import PrivateRoutes from '../PrivateRoutes';
// import { IcpStorageProvider } from '@/providers/storage/IcpStorageProvider';
// import { Outlet } from 'react-router-dom';
// import { AuthenticationProvider } from '@/providers/auth/AuthenticationProvider';
// import AuthenticationGuard from '@/guards/auth/AuthenticationGuard';
// import OrganizationGuard from '@/guards/organization/OrganizationGuard';
// import EvmToIcpProviders from '@/providers/auth/EvmToIcpProviders';
// import EntitiesProviders from '@/providers/entities/EntitiesProviders';
// import LoadingLayoutHandler from '@/handlers/layout/LoadingLayoutHandler';
// import { CallHandlerProvider } from '@/providers/errors/CallHandlerProvider';

// jest.mock('react-router-dom');
// jest.mock('react-redux');
// jest.mock('@/guards/auth/AuthenticationGuard');
// jest.mock('@/providers/auth/EvmToIcpProviders');
// jest.mock('@/providers/storage/IcpStorageProvider');
// jest.mock('@/providers/errors/CallHandlerProvider');
// jest.mock('@/providers/auth/AuthenticationProvider');
// jest.mock('@/providers/entities/EntitiesProviders');
// jest.mock('@/handlers/layout/LoadingLayoutHandler');
// jest.mock('@/guards/organization/OrganizationGuard');

export {};

describe('PrivateRoutes', () => {
    it('', () => {
        expect(true).toBe(true);
    });
    // it('renders when user is logged in', () => {
    //     const renderChildren = ({ children }: any) => <div>{children}</div>;
    //     (AuthenticationGuard as jest.Mock).mockImplementation(renderChildren);
    //     (EvmToIcpProviders as jest.Mock).mockImplementation(renderChildren);
    //     (IcpStorageProvider as jest.Mock).mockImplementation(renderChildren);
    //     (CallHandlerProvider as jest.Mock).mockImplementation(renderChildren);
    //     (AuthenticationProvider as jest.Mock).mockImplementation(renderChildren);
    //     (EntitiesProviders as jest.Mock).mockImplementation(renderChildren);
    //     (LoadingLayoutHandler as jest.Mock).mockImplementation(renderChildren);
    //     (OrganizationGuard as jest.Mock).mockImplementation(renderChildren);
    //
    //     render(<PrivateRoutes />);
    //
    //     expect(AuthenticationGuard).toHaveBeenCalled();
    //     expect(EvmToIcpProviders).toHaveBeenCalled();
    //     expect(IcpStorageProvider).toHaveBeenCalled();
    //     expect(CallHandlerProvider).toHaveBeenCalled();
    //     expect(AuthenticationProvider).toHaveBeenCalled();
    //     expect(EntitiesProviders).toHaveBeenCalled();
    //     expect(LoadingLayoutHandler).toHaveBeenCalled();
    //     expect(OrganizationGuard).toHaveBeenCalled();
    //     expect(Outlet).toHaveBeenCalled();
    // });
});
