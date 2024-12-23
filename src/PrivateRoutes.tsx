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
import SyncDataLoader from './dataLoaders/SyncDataLoader';
import { CallHandlerProvider } from '@/providers/icp/CallHandlerProvider';

const PrivateRoutes = () => {
    const { isLogged } = useSelector((state: RootState) => state.userInfo);

    const isOrganizationOnIcp = () => {
        const { getOrganization } = useOrganization();
        const userInfo = useSelector((state: RootState) => state.userInfo);

        const organizationEthAddress = userInfo.roleProof.delegator;

        try {
            getOrganization(organizationEthAddress);

            return true;
        } catch (error) {
            return false;
        }
    };

    // TODO: check if this provider can be moved to a higher level
    return isLogged ? (
        <SignerProvider>
            <SiweIdentityProvider>
                <ICPProvider>
                    <CallHandlerProvider>
                    <AuthenticationProvider>
                        <OrganizationProvider>
                            <EthEnumerableProvider>
                                <ProductCategoryProvider>
                                    <MaterialProvider>
                                        <OfferProvider>
                                            <OrderProvider>
                                                <EthEscrowProvider>
                                                    <ShipmentProvider>
                                                        <SyncDataLoader
                                                            customUseContext={useOrganization}>
                                                            <NavigationBlocker
                                                                condition={isOrganizationOnIcp}
                                                                redirectPath={paths.PROFILE}>
                                                                <Outlet />
                                                            </NavigationBlocker>
                                                        </SyncDataLoader>
                                                    </ShipmentProvider>
                                                </EthEscrowProvider>
                                            </OrderProvider>
                                        </OfferProvider>
                                    </MaterialProvider>
                                </ProductCategoryProvider>
                            </EthEnumerableProvider>
                        </OrganizationProvider>
                    </AuthenticationProvider>
                    </CallHandlerProvider>
                </ICPProvider>
            </SiweIdentityProvider>
        </SignerProvider>
    ) : (
        <Navigate to={paths.LOGIN} />
    );
};

export default PrivateRoutes;
