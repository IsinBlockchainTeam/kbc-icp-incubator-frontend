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
import { EthOrderTradeProvider } from '@/providers/entities/EthOrderTradeProvider';
import { EthAssetOperationProvider } from '@/providers/entities/EthAssetOperationProvider';
import { EthRelationshipProvider } from '@/providers/entities/EthRelationshipProvider';
import { EthGraphProvider } from '@/providers/entities/EthGraphProvider';
import { EthEscrowProvider } from '@/providers/entities/EthEscrowProvider';
import { EthShipmentProvider } from '@/providers/entities/EthShipmentProvider';
import { EthRawCertificateProvider } from '@/providers/entities/EthRawCertificateProvider';
import { EthCertificateProvider } from '@/providers/entities/EthCertificateProvider';
import { OrderProvider } from '@/providers/icp/OrderProvider';
import { ProductCategoryProvider } from '@/providers/icp/ProductCategoryProvider';
import { RawCertificationProvider } from '@/providers/icp/RawCertificationProvider';
import { CertificationProvider } from '@/providers/icp/CertificationProvider';

const PrivateRoutes = () => {
    const { isLogged } = useSelector((state: RootState) => state.userInfo);
    return isLogged ? (
        <SignerProvider>
            <SiweIdentityProvider>
                <ICPProvider>
                    <EthRelationshipProvider>
                        <ICPOrganizationProvider>
                            <EthEnumerableProvider>
                                <EthMaterialProvider>
                                    <ProductCategoryProvider>
                                        <EthOfferProvider>
                                            <EthAssetOperationProvider>
                                                <EthRawTradeProvider>
                                                    <EthBasicTradeProvider>
                                                        <OrderProvider>
                                                            <EthOrderTradeProvider>
                                                                <EthEscrowProvider>
                                                                    <EthShipmentProvider>
                                                                        <RawCertificationProvider>
                                                                            <CertificationProvider>
                                                                                <EthRawCertificateProvider>
                                                                                    <EthCertificateProvider>
                                                                                        <EthGraphProvider>
                                                                                            <Outlet />
                                                                                        </EthGraphProvider>
                                                                                    </EthCertificateProvider>
                                                                                </EthRawCertificateProvider>
                                                                            </CertificationProvider>
                                                                        </RawCertificationProvider>
                                                                    </EthShipmentProvider>
                                                                </EthEscrowProvider>
                                                            </EthOrderTradeProvider>
                                                        </OrderProvider>
                                                    </EthBasicTradeProvider>
                                                </EthRawTradeProvider>
                                            </EthAssetOperationProvider>
                                        </EthOfferProvider>
                                    </ProductCategoryProvider>
                                </EthMaterialProvider>
                            </EthEnumerableProvider>
                        </ICPOrganizationProvider>
                    </EthRelationshipProvider>
                </ICPProvider>
            </SiweIdentityProvider>
        </SignerProvider>
    ) : (
        <Navigate to={paths.LOGIN} />
    );
};

export default PrivateRoutes;
