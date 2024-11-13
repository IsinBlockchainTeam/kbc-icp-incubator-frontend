import React, { createContext, useEffect, useMemo, useState } from 'react';
import {
    ICPAuthenticationDriver,
    ICPAuthenticationService
} from '@kbc-lib/coffee-trading-management-lib';
import { useSiweIdentity } from '@/providers/SiweIdentityProvider';
import { checkAndGetEnvironmentVariable } from '@/utils/env';
import { ICP } from '@/constants/icp';
import { Typography } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { addLoadingMessage, removeLoadingMessage } from '@/redux/reducers/loadingSlice';
import { AUTHENTICATION_MESSAGE } from '@/constants/message';
import { NotificationType, openNotification } from '@/utils/notification';
import { NOTIFICATION_DURATION } from '@/constants/notification';
import { useSigner } from '@/providers/SignerProvider';
import { useNavigate } from 'react-router-dom';
import { paths } from '@/constants/paths';
import { RootState } from '@/redux/store';

export type AuthenticationContextState = {
    logout: () => Promise<void>;
};
export const AuthenticationContext = createContext<AuthenticationContextState>(
    {} as AuthenticationContextState
);
export const useAuthentication = () => {
    const context = React.useContext(AuthenticationContext);
    if (!context || Object.keys(context).length === 0) {
        throw new Error('useAuthentication must be used within an AuthenticationProvider.');
    }
    return context;
};
export function AuthenticationProvider(props: { children: React.ReactNode }) {
    const signer = useSigner();
    const navigate = useNavigate();
    const { identity } = useSiweIdentity();
    const entityManagerCanisterId = checkAndGetEnvironmentVariable(ICP.CANISTER_ID_ENTITY_MANAGER);
    const dispatch = useDispatch();
    const [loggedIn, setLoggedIn] = useState<boolean>(false);
    const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
    const roleProof = useSelector((state: RootState) => state.userInfo.roleProof);

    if (!identity) {
        return <Typography.Text>Siwe identity not initialized</Typography.Text>;
    }

    const authenticationService = useMemo(
        () =>
            new ICPAuthenticationService(
                new ICPAuthenticationDriver(identity, entityManagerCanisterId)
            ),
        [identity]
    );

    useEffect(() => {
        (async () => {
            await login();
            const interval = setInterval(() => {
                refresh();
            }, 800000);
            setRefreshInterval(interval);
        })();
        return () => {
            if (refreshInterval) clearInterval(refreshInterval);
        };
    }, []);

    const login = async () => {
        try {
            dispatch(addLoadingMessage(AUTHENTICATION_MESSAGE.LOGIN.LOADING));
            // const roleProof = await getProof(await signer.signer.getAddress());
            console.log(roleProof);
            const success = await authenticationService.login(roleProof);
            setLoggedIn(success);
            if (!success) {
                navigate(paths.PROFILE);
                openNotification(
                    'Error',
                    AUTHENTICATION_MESSAGE.LOGIN.ERROR,
                    NotificationType.ERROR,
                    NOTIFICATION_DURATION
                );
            }
        } catch (e: any) {
            console.log(e);
            openNotification(
                'Error',
                AUTHENTICATION_MESSAGE.LOGIN.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(AUTHENTICATION_MESSAGE.LOGIN.LOADING));
        }
    };

    const refresh = async () => {
        try {
            dispatch(addLoadingMessage(AUTHENTICATION_MESSAGE.REFRESH.LOADING));
            const success = await authenticationService.refresh();
            if (!success) {
                navigate(paths.PROFILE);
                openNotification(
                    'Error',
                    AUTHENTICATION_MESSAGE.REFRESH.ERROR,
                    NotificationType.ERROR,
                    NOTIFICATION_DURATION
                );
            }
        } catch (e: any) {
            console.error(e);
            openNotification(
                'Error',
                AUTHENTICATION_MESSAGE.REFRESH.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(AUTHENTICATION_MESSAGE.REFRESH.LOADING));
        }
    };

    const logout = async () => {
        try {
            dispatch(addLoadingMessage(AUTHENTICATION_MESSAGE.LOGOUT.LOADING));
            const success = await authenticationService.logout();
            if (!success) {
                openNotification(
                    'Error',
                    AUTHENTICATION_MESSAGE.LOGOUT.ERROR,
                    NotificationType.ERROR,
                    NOTIFICATION_DURATION
                );
            }
        } catch (e: any) {
            openNotification(
                'Error',
                AUTHENTICATION_MESSAGE.LOGOUT.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(AUTHENTICATION_MESSAGE.LOGOUT.LOADING));
        }
    };

    if (!loggedIn) {
        return <></>;
    }
    return (
        <AuthenticationContext.Provider
            value={{
                logout
            }}>
            {props.children}
        </AuthenticationContext.Provider>
    );
}
