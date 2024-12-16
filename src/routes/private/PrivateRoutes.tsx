import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { IcpStorageProvider } from '@/providers/storage/IcpStorageProvider';
import { paths } from '@/constants/paths';
import { AuthenticationProvider } from '@/providers/auth/AuthenticationProvider';
import { CallHandlerProvider } from '@/providers/errors/CallHandlerProvider';
import EvmToIcpProviders from '@/providers/auth/EvmToIcpProviders';
import EntitiesProviders from '@/providers/entities/EntitiesProviders';
import OrganizationGuard from '../../guards/organization/OrganizationGuard';

const PrivateRoutes = () => {
    const { isLogged } = useSelector((state: RootState) => state.userInfo);

    if (!isLogged) {
        return <Navigate to={paths.LOGIN} />;
    }

    // TODO: check if this provider can be moved to a higher level
    return (
        <EvmToIcpProviders>
            <IcpStorageProvider>
                <CallHandlerProvider>
                    <AuthenticationProvider>
                        <EntitiesProviders>
                            <OrganizationGuard />
                        </EntitiesProviders>
                    </AuthenticationProvider>
                </CallHandlerProvider>
            </IcpStorageProvider>
        </EvmToIcpProviders>
    );
};

export default PrivateRoutes;
