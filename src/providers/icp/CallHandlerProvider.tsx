import React, { useMemo } from 'react';
import { NotificationType, openNotification } from '@/utils/notification';
import { NOTIFICATION_DURATION } from '@/constants/notification';
import {
    ICPAuthenticationDriver,
    ICPAuthenticationService,
    NotAuthenticatedError,
    NotAuthorizedError
} from '@kbc-lib/coffee-trading-management-lib';
import { addLoadingMessage, removeLoadingMessage } from '@/redux/reducers/loadingSlice';
import { getProof } from '@/providers/icp/tempProof';
import { useDispatch } from 'react-redux';
import { useSigner } from '@/providers/SignerProvider';
import { Typography } from 'antd';
import { useSiweIdentity } from '@/providers/SiweIdentityProvider';
import { checkAndGetEnvironmentVariable } from '@/utils/env';
import { ICP } from '@/constants/icp';

export type CallHandlerContextState = {
    handleICPCall: (callback: () => Promise<void>, message: string) => Promise<void>;
};
export const CallHandlerContext = React.createContext<CallHandlerContextState>(
    {} as CallHandlerContextState
);
export const useCallHandler = () => {
    const context = React.useContext(CallHandlerContext);
    if (!context || Object.keys(context).length === 0) {
        throw new Error('useCallHandler must be used within an CallHandlerProvider.');
    }
    return context;
};
export function CallHandlerProvider(props: { children: React.ReactNode }) {
    const { identity } = useSiweIdentity();
    const dispatch = useDispatch();
    const signer = useSigner();
    const entityManagerCanisterId = checkAndGetEnvironmentVariable(ICP.CANISTER_ID_ENTITY_MANAGER);

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

    const authenticate = async () => {
        const roleProof = await getProof(await signer.signer.getAddress());
        await authenticationService.authenticate(roleProof);
    };

    const handleICPCall = async (callback: () => Promise<void>, message: string) => {
        try {
            dispatch(addLoadingMessage(message));
            await callback();
        } catch (e: any) {
            await handleError(e, callback, true);
        } finally {
            dispatch(removeLoadingMessage(message));
        }
    };

    const handleError = async (
        error: Error,
        retryAfterAuth: () => Promise<void>,
        canRetry = false
    ) => {
        console.info('An error occurred', error);
        if (error instanceof NotAuthenticatedError) {
            console.info('Not authenticated, retrying after authentication');
            try {
                await authenticate();
                if (canRetry) await retryAfterAuth();
                else
                    openNotification(
                        'Error',
                        "Can't authenticate",
                        NotificationType.ERROR,
                        NOTIFICATION_DURATION
                    );
            } catch (e: any) {
                await handleError(e, retryAfterAuth);
            }
            return;
        } else if (error instanceof NotAuthorizedError) {
            openNotification(
                'Error',
                'You are not authorized to perform this action',
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
            return;
        } else {
            openNotification(
                'Error',
                'Unexpected error occurred',
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        }
    };

    return (
        <CallHandlerContext.Provider value={{ handleICPCall }}>
            {props.children}
        </CallHandlerContext.Provider>
    );
}
