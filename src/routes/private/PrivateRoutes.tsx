import React from 'react';
import { Outlet } from 'react-router-dom';
import { IcpStorageProvider } from '@/providers/storage/IcpStorageProvider';
import { AuthenticationProvider } from '@/providers/auth/AuthenticationProvider';
import { CallHandlerProvider } from '@/providers/errors/CallHandlerProvider';
import EntitiesProviders from '@/providers/entities/EntitiesProviders';
import OrganizationGuard from '@/guards/organization/OrganizationGuard';
import AuthenticationGuard from '@/guards/auth/AuthenticationGuard';
import LoadingLayoutHandler from '@/handlers/layout/LoadingLayoutHandler';
import { SignerProvider } from '@/providers/auth/SignerProvider';
import { SiweIdentityProvider } from '@/providers/auth/SiweIdentityProvider';

const PrivateRoutes = () => {
    return (
        <AuthenticationGuard>
            <SignerProvider>
                <SiweIdentityProvider>
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
                </SiweIdentityProvider>
            </SignerProvider>
        </AuthenticationGuard>
    );
};

export default PrivateRoutes;
