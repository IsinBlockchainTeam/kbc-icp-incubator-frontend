import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { SignerProvider } from '@/providers/SignerProvider';
import { SiweIdentityProvider } from '@/providers/SiweIdentityProvider';
import { ICPProvider } from '@/providers/ICPProvider';
import { paths } from '@/constants/paths';
import { EthEnumerableProvider } from '@/providers/entities/EthEnumerableProvider';
import { EthEscrowProvider } from '@/providers/entities/EthEscrowProvider';
import { OrderProvider } from '@/providers/icp/OrderProvider';
import { ProductCategoryProvider } from '@/providers/icp/ProductCategoryProvider';
import { MaterialProvider } from '@/providers/icp/MaterialProvider';
import { AuthenticationProvider } from '@/providers/icp/AuthenticationProvider';
import { ShipmentProvider } from '@/providers/icp/ShipmentProvider';
import { OfferProvider } from '@/providers/icp/OfferProvider';
import { OrganizationProvider, useOrganization } from '@/providers/icp/OrganizationProvider';
import NavigationBlocker from './NavigationBlocker';

const PrivateRoutes = () => {
    const { isLogged } = useSelector((state: RootState) => state.userInfo);

    const isOrganizationOnIcp = () => {
        const { getOrganization } = useOrganization();
        const userInfo = useSelector((state: RootState) => state.userInfo);

        const organizationEthAddress = userInfo.roleProof.delegator;

        const foundedOrganization = getOrganization(organizationEthAddress);

        return foundedOrganization !== undefined;
    };

    return isLogged ? (
        <SignerProvider>
            <SiweIdentityProvider>
                <ICPProvider>
                    <AuthenticationProvider>
                        <OrganizationProvider>
                            <EthEnumerableProvider>
                                <ProductCategoryProvider>
                                    <MaterialProvider>
                                        <OfferProvider>
                                            <OrderProvider>
                                                <EthEscrowProvider>
                                                    <ShipmentProvider>
                                                        <NavigationBlocker
                                                            condition={
                                                                isOrganizationOnIcp
                                                            }
                                                            redirectPath={
                                                                paths.PROFILE
                                                            }>
                                                        <Outlet />
                                                        </NavigationBlocker>
                                                    </ShipmentProvider>
                                                </EthEscrowProvider>
                                            </OrderProvider>
                                        </OfferProvider>
                                    </MaterialProvider>
                                </ProductCategoryProvider>
                            </EthEnumerableProvider>
                        </OrganizationProvider>
                    </AuthenticationProvider>
                </ICPProvider>
            </SiweIdentityProvider>
        </SignerProvider>
    ) : (
        <Navigate to={paths.LOGIN} />
    );
};

export default PrivateRoutes;
