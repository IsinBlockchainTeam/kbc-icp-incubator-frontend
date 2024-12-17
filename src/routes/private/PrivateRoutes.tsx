import React from 'react';
import { Outlet } from 'react-router-dom';
import { IcpStorageProvider } from '@/providers/storage/IcpStorageProvider';
import { AuthenticationProvider } from '@/providers/auth/AuthenticationProvider';
import { CallHandlerProvider } from '@/providers/errors/CallHandlerProvider';
import EvmToIcpProviders from '@/providers/auth/EvmToIcpProviders';
import EntitiesProviders from '@/providers/entities/EntitiesProviders';
import OrganizationGuard from '../../guards/organization/OrganizationGuard';
import AuthenticationGuard from '../../guards/auth/AuthenticationGuard';
import LoadingLayoutHandler from '../../handlers/layout/LoadingLayoutHandler';

const PrivateRoutes = () => {
    return (
        <AuthenticationGuard>
            <EvmToIcpProviders>
                <IcpStorageProvider>
                    <CallHandlerProvider>
                        <AuthenticationProvider>
                            <EntitiesProviders>
                                <LoadingLayoutHandler>
                                    <OrganizationGuard>
                                        <Outlet />
                                    </OrganizationGuard>
                                </LoadingLayoutHandler>
                            </EntitiesProviders>
                        </AuthenticationProvider>
                    </CallHandlerProvider>
                </IcpStorageProvider>
            </EvmToIcpProviders>
        </AuthenticationGuard>
    );
};

export default PrivateRoutes;
