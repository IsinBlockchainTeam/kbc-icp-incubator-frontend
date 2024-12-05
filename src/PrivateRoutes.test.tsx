import React from 'react';
import { render } from '@testing-library/react';
import { useSelector } from 'react-redux';
import PrivateRoutes from './PrivateRoutes';
import { paths } from '@/constants/paths';
import { SignerProvider } from '@/providers/SignerProvider';
import { SiweIdentityProvider } from '@/providers/SiweIdentityProvider';
import { ICPProvider } from '@/providers/ICPProvider';
import { MaterialProvider } from '@/providers/icp/MaterialProvider';
import { EnumerationProvider } from '@/providers/icp/EnumerationProvider';
import { OfferProvider } from '@/providers/icp/OfferProvider';
import { OrganizationProvider } from '@/providers/icp/OrganizationProvider';
import { OrderProvider } from '@/providers/icp/OrderProvider';
import { Navigate, Outlet } from 'react-router-dom';
import { EthEscrowProvider } from '@/providers/entities/EthEscrowProvider';
import { ShipmentProvider } from '@/providers/icp/ShipmentProvider';
import { CallHandlerProvider } from '@/providers/icp/CallHandlerProvider';
import { AuthenticationProvider } from '@/providers/icp/AuthenticationProvider';
import { ProductCategoryProvider } from '@/providers/icp/ProductCategoryProvider';
import NavigationBlocker from './NavigationBlocker';
import SyncDataLoader from './dataLoaders/SyncDataLoader';
import { CertificationProvider } from '@/providers/icp/CertificationProvider';

jest.mock('react-router-dom');
jest.mock('react-redux');
jest.mock('@/providers/SignerProvider');
jest.mock('@/providers/SiweIdentityProvider');
jest.mock('@/providers/ICPProvider');
jest.mock('@/providers/icp/MaterialProvider');
jest.mock('@/providers/icp/ProductCategoryProvider');
jest.mock('@/providers/icp/EnumerationProvider');
jest.mock('@/providers/icp/OfferProvider');
jest.mock('@/providers/icp/OrganizationProvider');
jest.mock('@/providers/icp/OrderProvider');
jest.mock('@/providers/icp/ShipmentProvider');
jest.mock('@/providers/entities/EthEscrowProvider');
jest.mock('@/providers/icp/CallHandlerProvider');
jest.mock('@/providers/icp/AuthenticationProvider');
jest.mock('./NavigationBlocker');
jest.mock('./dataLoaders/SyncDataLoader');
jest.mock('@/providers/icp/CertificationProvider');

describe('PrivateRoutes', () => {
    it('renders when user is logged in', () => {
        const renderChildren = ({ children }: any) => <div>{children}</div>;
        (useSelector as jest.Mock).mockReturnValue({ isLogged: true });
        (SignerProvider as jest.Mock).mockImplementation(renderChildren);
        (SiweIdentityProvider as jest.Mock).mockImplementation(renderChildren);
        (ICPProvider as jest.Mock).mockImplementation(renderChildren);
        (MaterialProvider as jest.Mock).mockImplementation(renderChildren);
        (ProductCategoryProvider as jest.Mock).mockImplementation(renderChildren);
        (EnumerationProvider as jest.Mock).mockImplementation(renderChildren);
        (OfferProvider as jest.Mock).mockImplementation(renderChildren);
        (OrganizationProvider as jest.Mock).mockImplementation(renderChildren);
        (OrderProvider as jest.Mock).mockImplementation(renderChildren);
        (ShipmentProvider as jest.Mock).mockImplementation(renderChildren);
        (EthEscrowProvider as jest.Mock).mockImplementation(renderChildren);
        (CallHandlerProvider as jest.Mock).mockImplementation(renderChildren);
        (AuthenticationProvider as jest.Mock).mockImplementation(renderChildren);
        (NavigationBlocker as jest.Mock).mockImplementation(renderChildren);
        (SyncDataLoader as jest.Mock).mockImplementation(renderChildren);

        (CertificationProvider as jest.Mock).mockImplementation(renderChildren);
        render(<PrivateRoutes />);

        expect(SignerProvider).toHaveBeenCalled();
        expect(CallHandlerProvider).toHaveBeenCalled();
        expect(AuthenticationProvider).toHaveBeenCalled();
        expect(SiweIdentityProvider).toHaveBeenCalled();
        expect(ICPProvider).toHaveBeenCalled();
        expect(MaterialProvider).toHaveBeenCalled();
        expect(ProductCategoryProvider).toHaveBeenCalled();
        expect(EnumerationProvider).toHaveBeenCalled();
        expect(OfferProvider).toHaveBeenCalled();
        expect(OrganizationProvider).toHaveBeenCalled();
        expect(OrderProvider).toHaveBeenCalled();
        expect(ShipmentProvider).toHaveBeenCalled();
        expect(EthEscrowProvider).toHaveBeenCalled();
        expect(NavigationBlocker).toHaveBeenCalled();
        expect(SyncDataLoader).toHaveBeenCalled();
        expect(CertificationProvider).toHaveBeenCalled();
        expect(Outlet).toHaveBeenCalled();
    });

    it('renders Navigate to LOGIN when user is not logged in', () => {
        (useSelector as jest.Mock).mockReturnValue({ isLogged: false });

        render(<PrivateRoutes />);

        expect(Navigate).toHaveBeenCalled();
        expect(Navigate).toHaveBeenCalledWith({ to: paths.LOGIN }, {});
    });
});
