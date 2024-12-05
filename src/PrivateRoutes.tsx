import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { SignerProvider } from '@/providers/SignerProvider';
import { SiweIdentityProvider } from '@/providers/SiweIdentityProvider';
import { ICPProvider } from '@/providers/ICPProvider';
import { paths } from '@/constants/paths';
import { EthDownPaymentProvider } from '@/providers/entities/EthDownPaymentProvider';
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
import { RawCertificationProvider } from '@/providers/icp/RawCertificationProvider';
import { CertificationProvider } from '@/providers/icp/CertificationProvider';
import { EnumerationProvider } from '@/providers/icp/EnumerationProvider';

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
                                <EnumerationProvider>
                                    <ProductCategoryProvider>
                                        <MaterialProvider>
                                            <OfferProvider>
                                                <OrderProvider>
                                                    <EthDownPaymentProvider>
                                                        <ShipmentProvider>
                                                            <RawCertificationProvider>
                                                                <CertificationProvider>
                                                                    <SyncDataLoader customUseContext={useOrganization}>
                                                                        <NavigationBlocker
                                                                            condition={isOrganizationOnIcp}
                                                                            redirectPath={paths.PROFILE}>
                                                                            <Outlet />
                                                                        </NavigationBlocker>
                                                                    </SyncDataLoader>
                                                                </CertificationProvider>
                                                            </RawCertificationProvider>
                                                        </ShipmentProvider>
                                                    </EthDownPaymentProvider>
                                                </OrderProvider>
                                            </OfferProvider>
                                        </MaterialProvider>
                                    </ProductCategoryProvider>
                                </EnumerationProvider>
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
