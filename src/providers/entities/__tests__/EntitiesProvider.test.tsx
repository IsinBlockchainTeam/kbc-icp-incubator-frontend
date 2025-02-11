import React from 'react';
import { render, screen } from '@testing-library/react';
import { EthDownPaymentProvider } from '../evm/EthDownPaymentProvider';
import { CertificationProvider } from '../icp/CertificationProvider';
import { EnumerationProvider } from '../icp/EnumerationProvider';
import { MaterialProvider } from '../icp/MaterialProvider';
import { OfferProvider } from '../icp/OfferProvider';
import { OrderProvider } from '../icp/OrderProvider';
import { OrganizationProvider } from '../icp/OrganizationProvider';
import { ProductCategoryProvider } from '../icp/ProductCategoryProvider';
import { RawCertificationProvider } from '../icp/RawCertificationProvider';
import { ShipmentProvider } from '../icp/ShipmentProvider';
import EntitiesProviders from '../EntitiesProviders';
import { SessionProvider } from '@/providers/auth/SessionProvider';
import { AssetOperationProvider } from '../icp/AssetOperationProvider';
import { BusinessRelationProvider } from '../icp/BusinessRelationProvider';

jest.mock('@/providers/entities/icp/OrganizationProvider');
jest.mock('@/providers/auth/SessionProvider');
jest.mock('@/providers/entities/icp/EnumerationProvider');
jest.mock('@/providers/entities/icp/ProductCategoryProvider');
jest.mock('@/providers/entities/icp/MaterialProvider');
jest.mock('@/providers/entities/icp/AssetOperationProvider')
jest.mock('@/providers/entities/icp/OfferProvider');
jest.mock('@/providers/entities/icp/OrderProvider');
jest.mock('@/providers/entities/evm/EthDownPaymentProvider');
jest.mock('@/providers/entities/icp/ShipmentProvider');
jest.mock('@/providers/entities/icp/CertificationProvider');
jest.mock('@/providers/entities/icp/RawCertificationProvider');
jest.mock('@/providers/entities/icp/BusinessRelationProvider');

describe('EntitiesProviders', () => {
    it('should render all providers', () => {
        const renderChildren = ({ children }: any) => <div>{children}</div>;

        (OrganizationProvider as jest.Mock).mockImplementation(renderChildren);
        (SessionProvider as jest.Mock).mockImplementation(renderChildren);
        (EnumerationProvider as jest.Mock).mockImplementation(renderChildren);
        (ProductCategoryProvider as jest.Mock).mockImplementation(renderChildren);
        (MaterialProvider as jest.Mock).mockImplementation(renderChildren);
        (AssetOperationProvider as jest.Mock).mockImplementation(renderChildren);
        (OfferProvider as jest.Mock).mockImplementation(renderChildren);
        (OrderProvider as jest.Mock).mockImplementation(renderChildren);
        (EthDownPaymentProvider as jest.Mock).mockImplementation(renderChildren);
        (ShipmentProvider as jest.Mock).mockImplementation(renderChildren);
        (RawCertificationProvider as jest.Mock).mockImplementation(renderChildren);
        (CertificationProvider as jest.Mock).mockImplementation(renderChildren);
        (BusinessRelationProvider as jest.Mock).mockImplementation(renderChildren);

        render(<EntitiesProviders>children component</EntitiesProviders>);

        expect(OrganizationProvider).toHaveBeenCalled();
        expect(SessionProvider).toHaveBeenCalled();
        expect(EnumerationProvider).toHaveBeenCalled();
        expect(ProductCategoryProvider).toHaveBeenCalled();
        expect(MaterialProvider).toHaveBeenCalled();
        expect(AssetOperationProvider).toHaveBeenCalled();
        expect(OfferProvider).toHaveBeenCalled();
        expect(OrderProvider).toHaveBeenCalled();
        expect(EthDownPaymentProvider).toHaveBeenCalled();
        expect(ShipmentProvider).toHaveBeenCalled();
        expect(RawCertificationProvider).toHaveBeenCalled();
        expect(CertificationProvider).toHaveBeenCalled();
        expect(BusinessRelationProvider).toHaveBeenCalled();
        expect(screen.getByText('children component')).toBeInTheDocument();
    });
});
