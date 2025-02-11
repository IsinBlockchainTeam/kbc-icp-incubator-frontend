import { ICPBaseCertificate, ICPCertificationDriver, ICPCertificationService } from '@kbc-lib/coffee-trading-management-lib';
import React, { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { RAW_CERTIFICATION_MESSAGE } from '@/constants/message';
import { checkAndGetEnvironmentVariable } from '@/utils/env';
import { ICP } from '@/constants/icp';
import { Typography } from 'antd';
import { useSiweIdentity } from '@/providers/auth/SiweIdentityProvider';
import { useICP } from '@/providers/storage/IcpStorageProvider';
import { useSigner } from '@/providers/auth/SignerProvider';
import { useCallHandler } from '@/providers/errors/CallHandlerProvider';

export type RawCertificationContextState = {
    dataLoaded: boolean;
    rawCertificates: ICPBaseCertificate[];
    loadData: () => Promise<void>;
};
export const RawCertificationContext = createContext<RawCertificationContextState>({} as RawCertificationContextState);

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
    const { fileDriver } = useICP();
    const [dataLoaded, setDataLoaded] = useState<boolean>(false);
    const [rawCertificates, setRawCertificates] = useState<ICPBaseCertificate[]>([]);
    const { signer } = useSigner();
    const { handleICPCall } = useCallHandler();

    if (!identity) {
        return <Typography.Text>Siwe identity not initialized</Typography.Text>;
    }

    const certificationService = useMemo(
        () => new ICPCertificationService(new ICPCertificationDriver(identity, entityManagerCanisterId), fileDriver),
        [identity]
    );

    const loadCertificates = async () => {
        if (!certificationService) return;

        await handleICPCall(async () => {
            const rawCertificates = await certificationService.getBaseCertificatesInfoBySubject(signer._address);
            setRawCertificates(rawCertificates);
        }, RAW_CERTIFICATION_MESSAGE.RETRIEVE.LOADING);
    };

    const loadData = async () => {
        await loadCertificates();
        setDataLoaded(true);
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
