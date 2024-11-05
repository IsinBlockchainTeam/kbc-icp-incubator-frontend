import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { SignerProvider } from '@/providers/SignerProvider';
import { SiweIdentityProvider } from '@/providers/SiweIdentityProvider';
import { ICPProvider } from '@/providers/ICPProvider';
import { paths } from '@/constants/paths';
import { EthEnumerableProvider } from '@/providers/entities/EthEnumerableProvider';
import { ICPOrganizationProvider } from '@/providers/entities/ICPOrganizationProvider';
import { EthEscrowProvider } from '@/providers/entities/EthEscrowProvider';
import { OrderProvider } from '@/providers/icp/OrderProvider';
import { ProductCategoryProvider } from '@/providers/icp/ProductCategoryProvider';
import { MaterialProvider } from '@/providers/icp/MaterialProvider';
import { AuthenticationProvider } from '@/providers/icp/AuthenticationProvider';
import { ShipmentProvider } from '@/providers/icp/ShipmentProvider';
import { OfferProvider } from '@/providers/icp/OfferProvider';

const PrivateRoutes = () => {
    const { isLogged } = useSelector((state: RootState) => state.userInfo);
    return isLogged ? (
        <SignerProvider>
            <SiweIdentityProvider>
                <ICPProvider>
                    <AuthenticationProvider>
                        <ICPOrganizationProvider>
                            <EthEnumerableProvider>
                                <ProductCategoryProvider>
                                    <MaterialProvider>
                                        <OfferProvider>
                                            <OrderProvider>
                                                <EthEscrowProvider>
                                                    <ShipmentProvider>
                                                        <Outlet />
                                                    </ShipmentProvider>
                                                </EthEscrowProvider>
                                            </OrderProvider>
                                        </OfferProvider>
                                    </MaterialProvider>
                                </ProductCategoryProvider>
                            </EthEnumerableProvider>
                        </ICPOrganizationProvider>
                    </AuthenticationProvider>
                </ICPProvider>
            </SiweIdentityProvider>
        </SignerProvider>
    ) : (
        <Navigate to={paths.LOGIN} />
    );
};

export default PrivateRoutes;
