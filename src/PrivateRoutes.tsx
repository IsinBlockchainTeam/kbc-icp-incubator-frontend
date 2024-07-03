import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { SignerProvider } from '@/providers/SignerProvider';
import { SiweIdentityProvider } from '@/providers/SiweIdentityProvider';
import { ICPProvider } from '@/providers/ICPProvider';
import { EthProvider } from '@/providers/EthProvider';
import { paths } from '@/constants/paths';
import { EthMaterialProvider } from '@/providers/entities/EthMaterialProvider';
import { EthEnumerableProvider } from '@/providers/entities/EthEnumerableProvider';
import { EthOfferProvider } from '@/providers/entities/EthOfferProvider';
import { ICPNameProvider } from '@/providers/entities/ICPNameProvider';
import { EthRawTradeProvider } from '@/providers/entities/EthRawTradeProvider';
import { EthDocumentProvider } from '@/providers/entities/EthDocumentProvider';
import { EthBasicTradeProvider } from '@/providers/entities/EthBasicTradeProvider';
import { EthOrderTradeProvider } from '@/providers/entities/EthOrderTradeProvider';

const PrivateRoutes = () => {
    const { isLogged } = useSelector((state: RootState) => state.userInfo);
    return isLogged ? (
        <SignerProvider>
            <SiweIdentityProvider>
                <ICPProvider>
                    <EthProvider>
                        <ICPNameProvider>
                            <EthEnumerableProvider>
                                <EthMaterialProvider>
                                    <EthOfferProvider>
                                        <EthDocumentProvider>
                                            <EthRawTradeProvider>
                                                <EthBasicTradeProvider>
                                                    <EthOrderTradeProvider>
                                                        <Outlet />
                                                    </EthOrderTradeProvider>
                                                </EthBasicTradeProvider>
                                            </EthRawTradeProvider>
                                        </EthDocumentProvider>
                                    </EthOfferProvider>
                                </EthMaterialProvider>
                            </EthEnumerableProvider>
                        </ICPNameProvider>
                    </EthProvider>
                </ICPProvider>
            </SiweIdentityProvider>
        </SignerProvider>
    ) : (
        <Navigate to={paths.LOGIN} />
    );
};

export default PrivateRoutes;
