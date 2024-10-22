import {
    ICPBaseCertificate,
    ICPCertificationManagerDriver,
    ICPCertificationManagerService
} from '@kbc-lib/coffee-trading-management-lib';
import React, { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { addLoadingMessage, removeLoadingMessage } from '@/redux/reducers/loadingSlice';
import { RAW_CERTIFICATE_MESSAGE } from '@/constants/message';
import { NotificationType, openNotification } from '@/utils/notification';
import { NOTIFICATION_DURATION } from '@/constants/notification';
import { useSiweIdentity } from '@/providers/SiweIdentityProvider';
import { checkAndGetEnvironmentVariable } from '@/utils/env';
import { ICP } from '@/constants/icp';
import { Typography } from 'antd';
import { getProof } from '@/providers/icp/tempProof';
import { useSigner } from '@/providers/SignerProvider';

export type RawCertificationContextState = {
    dataLoaded: boolean;
    rawCertificates: ICPBaseCertificate[];
    loadData: () => Promise<void>;
};
export const RawCertificationContext = createContext<RawCertificationContextState>(
    {} as RawCertificationContextState
);

export const useRawCertification = (): RawCertificationContextState => {
    const context = useContext(RawCertificationContext);
    if (!context || Object.keys(context).length === 0) {
        throw new Error('useRawCertification must be used within an RawCertificationProvider.');
    }
    return context;
};

export function RawCertificationProvider(props: { children: ReactNode }) {
    const { identity } = useSiweIdentity();
    const entityManagerCanisterId = checkAndGetEnvironmentVariable(ICP.CANISTER_ID_ENTITY_MANAGER);
    const [dataLoaded, setDataLoaded] = useState<boolean>(false);
    const [rawCertificates, setRawCertificates] = useState<ICPBaseCertificate[]>([]);
    const dispatch = useDispatch();
    const { signer } = useSigner();

    if (!identity) {
        return <Typography.Text>Siwe identity not initialized</Typography.Text>;
    }

    const certificationManagerService = useMemo(
        () =>
            new ICPCertificationManagerService(
                new ICPCertificationManagerDriver(identity, entityManagerCanisterId)
            ),
        [identity]
    );

    const loadData = async () => {
        if (!certificationManagerService) return;

        try {
            dispatch(addLoadingMessage(RAW_CERTIFICATE_MESSAGE.RETRIEVE.LOADING));
            const roleProof = await getProof();
            const rawCertificates =
                await certificationManagerService.getBaseCertificatesInfoBySubject(
                    roleProof,
                    signer._address
                );
            setRawCertificates(rawCertificates);
            setDataLoaded(true);
        } catch (e) {
            console.log('Error retrieving raw certificates', e);
            openNotification(
                'Error',
                RAW_CERTIFICATE_MESSAGE.RETRIEVE.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(RAW_CERTIFICATE_MESSAGE.RETRIEVE.LOADING));
        }
    };

    return (
        <RawCertificationContext.Provider
            value={{
                dataLoaded,
                rawCertificates,
                loadData
            }}
            {...props}
        />
    );
}
