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

const EntitiesProviders = ({ children }: { children: ReactNode }) => (
    <OrganizationProvider>
        <EnumerationProvider>
            <ProductCategoryProvider>
                <MaterialProvider>
                    <OfferProvider>
                        <OrderProvider>
                            <EthDownPaymentProvider>
                                <ShipmentProvider>
                                    <CertificationProvider>{children}</CertificationProvider>
                                </ShipmentProvider>
                            </EthDownPaymentProvider>
                        </OrderProvider>
                    </OfferProvider>
                </MaterialProvider>
            </ProductCategoryProvider>
        </EnumerationProvider>
    </OrganizationProvider>
);

export default EntitiesProviders;
