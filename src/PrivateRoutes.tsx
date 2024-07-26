import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { SignerProvider } from '@/providers/SignerProvider';
import { SiweIdentityProvider } from '@/providers/SiweIdentityProvider';
import { ICPProvider } from '@/providers/ICPProvider';
import { paths } from '@/constants/paths';
import { EthMaterialProvider } from '@/providers/entities/EthMaterialProvider';
import { EthEnumerableProvider } from '@/providers/entities/EthEnumerableProvider';
import { EthOfferProvider } from '@/providers/entities/EthOfferProvider';
import { ICPNameProvider } from '@/providers/entities/ICPNameProvider';
import { EthRawTradeProvider } from '@/providers/entities/EthRawTradeProvider';
import { EthDocumentProvider } from '@/providers/entities/EthDocumentProvider';
import { EthBasicTradeProvider } from '@/providers/entities/EthBasicTradeProvider';
import { EthOrderTradeProvider } from '@/providers/entities/EthOrderTradeProvider';
import { EthAssetOperationProvider } from '@/providers/entities/EthAssetOperationProvider';
import { EthRelationshipProvider } from '@/providers/entities/EthRelationshipProvider';
import { EthGraphProvider } from '@/providers/entities/EthGraphProvider';

const PrivateRoutes = () => {
    const { isLogged } = useSelector((state: RootState) => state.userInfo);
    return isLogged ? (
        <SiweIdentityProvider>
            <ICPProvider>
                <EthRelationshipProvider>
                    <ICPNameProvider>
                        <EthEnumerableProvider>
                            <EthMaterialProvider>
                                <EthOfferProvider>
                                    <EthAssetOperationProvider>
                                        <EthDocumentProvider>
                                            <EthRawTradeProvider>
                                                <EthBasicTradeProvider>
                                                    <EthOrderTradeProvider>
                                                        <EthGraphProvider>
                                                            <Outlet />
                                                        </EthGraphProvider>
                                                    </EthOrderTradeProvider>
                                                </EthBasicTradeProvider>
                                            </EthRawTradeProvider>
                                        </EthDocumentProvider>
                                    </EthAssetOperationProvider>
                                </EthOfferProvider>
                            </EthMaterialProvider>
                        </EthEnumerableProvider>
                    </ICPNameProvider>
                </EthRelationshipProvider>
            </ICPProvider>
        </SiweIdentityProvider>
    ) : (
        <Navigate to={paths.LOGIN} />
    );
};

export default PrivateRoutes;
