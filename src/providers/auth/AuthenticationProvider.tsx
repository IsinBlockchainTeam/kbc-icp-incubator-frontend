import React, { createContext, useMemo } from 'react';
import { ICPAuthenticationDriver, ICPAuthenticationService } from '@kbc-lib/coffee-trading-management-lib';
import { useSiweIdentity } from '@/providers/auth/SiweIdentityProvider';
import { checkAndGetEnvironmentVariable } from '@/utils/env';
import { ICP } from '@/constants/icp';
import { Typography } from 'antd';
import { AUTHENTICATION_MESSAGE } from '@/constants/message';
import { useCallHandler } from '@/providers/errors/CallHandlerProvider';

export type AuthenticationContextState = {
    logout: () => Promise<void>;
};
export const AuthenticationContext = createContext<AuthenticationContextState>({} as AuthenticationContextState);
export const useAuthentication = () => {
    const context = React.useContext(AuthenticationContext);
    if (!context || Object.keys(context).length === 0) {
        throw new Error('useAuthentication must be used within an AuthenticationProvider.');
    }
    return context;
};
export function AuthenticationProvider(props: { children: React.ReactNode }) {
    const { identity } = useSiweIdentity();
    const entityManagerCanisterId = checkAndGetEnvironmentVariable(ICP.CANISTER_ID_ENTITY_MANAGER);
    const { handleICPCall } = useCallHandler();

    if (!identity) {
        return <Typography.Text>Siwe identity not initialized</Typography.Text>;
    }

    const authenticationService = useMemo(
        () => new ICPAuthenticationService(new ICPAuthenticationDriver(identity, entityManagerCanisterId)),
        [identity]
    );

    const logout = async () => {
        await handleICPCall(async () => await authenticationService.logout(), AUTHENTICATION_MESSAGE.LOGOUT.LOADING);
    };

    return (
        <AuthenticationContext.Provider
            value={{
                logout
            }}>
            {props.children}
        </AuthenticationContext.Provider>
    );
}
