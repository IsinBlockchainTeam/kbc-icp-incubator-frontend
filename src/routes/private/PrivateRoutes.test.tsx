import React from 'react';
import { render } from '@testing-library/react';
import { useSelector } from 'react-redux';
import PrivateRoutes from './PrivateRoutes';
import { paths } from '@/constants/paths';
import { SignerProvider } from '@/providers/auth/SignerProvider';
import { SiweIdentityProvider } from '@/providers/auth/SiweIdentityProvider';
import { IcpStorageProvider } from '@/providers/storage/IcpStorageProvider';
import { MaterialProvider } from '@/providers/entities/icp/MaterialProvider';
import { EnumerationProvider } from '@/providers/entities/icp/EnumerationProvider';
import { OfferProvider } from '@/providers/entities/icp/OfferProvider';
import { OrganizationProvider } from '@/providers/entities/icp/OrganizationProvider';
import { OrderProvider } from '@/providers/entities/icp/OrderProvider';
import { Navigate, Outlet } from 'react-router-dom';
import { EthDownPaymentProvider } from '@/providers/entities/evm/EthDownPaymentProvider';
import { ShipmentProvider } from '@/providers/entities/icp/ShipmentProvider';
import { CallHandlerProvider } from '@/providers/errors/CallHandlerProvider';
import { AuthenticationProvider } from '@/providers/auth/AuthenticationProvider';
import { ProductCategoryProvider } from '@/providers/entities/icp/ProductCategoryProvider';
import NavigationBlocker from '../../NavigationBlocker';
import SyncDataLoader from '../../data-loaders/SyncDataLoader';
import { CertificationProvider } from '@/providers/entities/icp/CertificationProvider';

jest.mock('react-router-dom');
jest.mock('react-redux');
jest.mock('@/providers/auth/SignerProvider');
jest.mock('@/providers/auth/SiweIdentityProvider');
jest.mock('@/providers/storage/IcpStorageProvider');
jest.mock('@/providers/entities/icp/MaterialProvider');
jest.mock('@/providers/entities/icp/ProductCategoryProvider');
jest.mock('@/providers/entities/icp/EnumerationProvider');
jest.mock('@/providers/entities/icp/OfferProvider');
jest.mock('@/providers/entities/icp/OrganizationProvider');
jest.mock('@/providers/entities/icp/OrderProvider');
jest.mock('@/providers/entities/icp/ShipmentProvider');
jest.mock('@/providers/entities/evm/EthDownPaymentProvider');
jest.mock('@/providers/errors/CallHandlerProvider');
jest.mock('@/providers/auth/AuthenticationProvider');
jest.mock('../../NavigationBlocker');
jest.mock('../../data-loaders/SyncDataLoader');
jest.mock('@/providers/entities/icp/CertificationProvider');

describe('PrivateRoutes', () => {
    it('renders when user is logged in', () => {
        const renderChildren = ({ children }: any) => <div>{children}</div>;
        (useSelector as jest.Mock).mockReturnValue({ isLogged: true });
        (SignerProvider as jest.Mock).mockImplementation(renderChildren);
        (SiweIdentityProvider as jest.Mock).mockImplementation(renderChildren);
        (IcpStorageProvider as jest.Mock).mockImplementation(renderChildren);
        (MaterialProvider as jest.Mock).mockImplementation(renderChildren);
        (ProductCategoryProvider as jest.Mock).mockImplementation(renderChildren);
        (EnumerationProvider as jest.Mock).mockImplementation(renderChildren);
        (OfferProvider as jest.Mock).mockImplementation(renderChildren);
        (OrganizationProvider as jest.Mock).mockImplementation(renderChildren);
        (OrderProvider as jest.Mock).mockImplementation(renderChildren);
        (ShipmentProvider as jest.Mock).mockImplementation(renderChildren);
        (EthDownPaymentProvider as jest.Mock).mockImplementation(renderChildren);
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
        expect(IcpStorageProvider).toHaveBeenCalled();
        expect(MaterialProvider).toHaveBeenCalled();
        expect(ProductCategoryProvider).toHaveBeenCalled();
        expect(EnumerationProvider).toHaveBeenCalled();
        expect(OfferProvider).toHaveBeenCalled();
        expect(OrganizationProvider).toHaveBeenCalled();
        expect(OrderProvider).toHaveBeenCalled();
        expect(ShipmentProvider).toHaveBeenCalled();
        expect(EthDownPaymentProvider).toHaveBeenCalled();
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
