import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { SignerProvider } from '@/providers/SignerProvider';
import { SiweIdentityProvider } from '@/providers/SiweIdentityProvider';
import { ICPProvider } from '@/providers/ICPProvider';
import { paths } from '@/constants/paths';
import { EthMaterialProvider } from '@/providers/entities/EthMaterialProvider';
import { EthEnumerableProvider } from '@/providers/entities/EthEnumerableProvider';
import { EthOfferProvider } from '@/providers/entities/EthOfferProvider';
import { ICPOrganizationProvider } from '@/providers/entities/ICPOrganizationProvider';
import { EthRawTradeProvider } from '@/providers/entities/EthRawTradeProvider';
import { EthBasicTradeProvider } from '@/providers/entities/EthBasicTradeProvider';
import { EthAssetOperationProvider } from '@/providers/entities/EthAssetOperationProvider';
import { EthRelationshipProvider } from '@/providers/entities/EthRelationshipProvider';
import { EthGraphProvider } from '@/providers/entities/EthGraphProvider';
import { EthEscrowProvider } from '@/providers/entities/EthEscrowProvider';
import { OrderProvider } from '@/providers/icp/OrderProvider';
import { ProductCategoryProvider } from '@/providers/icp/ProductCategoryProvider';
import { MaterialProvider } from '@/providers/icp/MaterialProvider';
import { AuthenticationProvider } from '@/providers/icp/AuthenticationProvider';
import { ShipmentProvider } from '@/providers/icp/ShipmentProvider';
import { OrganizationProvider } from '@/providers/icp/OrganizationProvider';

const PrivateRoutes = () => {
    const { isLogged } = useSelector((state: RootState) => state.userInfo);
    return isLogged ? (
        <SignerProvider>
            <SiweIdentityProvider>
                <ICPProvider>
                    <AuthenticationProvider>
                        <EthRelationshipProvider>
                            <OrganizationProvider>
                                <EthEnumerableProvider>
                                    <EthMaterialProvider>
                                        <ProductCategoryProvider>
                                            <MaterialProvider>
                                                <EthOfferProvider>
                                                    <EthAssetOperationProvider>
                                                        <EthRawTradeProvider>
                                                            <EthBasicTradeProvider>
                                                                <OrderProvider>
                                                                    <EthEscrowProvider>
                                                                        <ShipmentProvider>
                                                                            <EthGraphProvider>
                                                                                <Outlet />
                                                                            </EthGraphProvider>
                                                                        </ShipmentProvider>
                                                                    </EthEscrowProvider>
                                                                </OrderProvider>
                                                            </EthBasicTradeProvider>
                                                        </EthRawTradeProvider>
                                                    </EthAssetOperationProvider>
                                                </EthOfferProvider>
                                            </MaterialProvider>
                                        </ProductCategoryProvider>
                                    </EthMaterialProvider>
                                </EthEnumerableProvider>
                            </OrganizationProvider>
                        </EthRelationshipProvider>
                    </AuthenticationProvider>
                </ICPProvider>
            </SiweIdentityProvider>
        </SignerProvider>
    ) : (
        <Navigate to={paths.LOGIN} />
    );
};

export default PrivateRoutes;
