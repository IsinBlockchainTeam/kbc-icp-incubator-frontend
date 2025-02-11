import React, { type ReactNode } from 'react';
import { OrganizationProvider } from '@/providers/entities/icp/OrganizationProvider';
import { EnumerationProvider } from '@/providers/entities/icp/EnumerationProvider';
import { ProductCategoryProvider } from '@/providers/entities/icp/ProductCategoryProvider';
import { MaterialProvider } from '@/providers/entities/icp/MaterialProvider';
import { OfferProvider } from '@/providers/entities/icp/OfferProvider';
import { OrderProvider } from '@/providers/entities/icp/OrderProvider';
import { EthDownPaymentProvider } from '@/providers/entities/evm/EthDownPaymentProvider';
import { ShipmentProvider } from '@/providers/entities/icp/ShipmentProvider';
import { CertificationProvider } from '@/providers/entities/icp/CertificationProvider';
import { RawCertificationProvider } from '@/providers/entities/icp/RawCertificationProvider';
import { SessionProvider } from '@/providers/auth/SessionProvider';
import { AssetOperationProvider } from '@/providers/entities/icp/AssetOperationProvider';
import { BusinessRelationProvider } from './icp/BusinessRelationProvider';

export const EntitiesProviders = ({ children }: { children: ReactNode }) => (
    <OrganizationProvider>
        <SessionProvider>
            <EnumerationProvider>
                <ProductCategoryProvider>
                    <MaterialProvider>
                        <AssetOperationProvider>
                            <OfferProvider>
                                <OrderProvider>
                                    <EthDownPaymentProvider>
                                        <ShipmentProvider>
                                            <RawCertificationProvider>
                                                <CertificationProvider>
                                                    <BusinessRelationProvider>{children}</BusinessRelationProvider>
                                                </CertificationProvider>
                                            </RawCertificationProvider>
                                        </ShipmentProvider>
                                    </EthDownPaymentProvider>
                                </OrderProvider>
                            </OfferProvider>
                        </AssetOperationProvider>
                    </MaterialProvider>
                </ProductCategoryProvider>
            </EnumerationProvider>
        </SessionProvider>
    </OrganizationProvider>
);

export default EntitiesProviders;
