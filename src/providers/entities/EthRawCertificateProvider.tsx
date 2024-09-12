import {
    BaseCertificate,
    CertificateManagerDriver,
    CertificateManagerService,
    DocumentDriver
} from '@kbc-lib/coffee-trading-management-lib';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useSigner } from '@/providers/SignerProvider';
import { useICP } from '@/providers/ICPProvider';
import { CONTRACT_ADDRESSES } from '@/constants/evm';
import { addLoadingMessage, removeLoadingMessage } from '@/redux/reducers/loadingSlice';
import { RAW_CERTIFICATE_MESSAGE } from '@/constants/message';
import { NotificationType, openNotification } from '@/utils/notification';
import { NOTIFICATION_DURATION } from '@/constants/notification';

export type EthRawCertificateContextState = {
    dataLoaded: boolean;
    rawCertificates: BaseCertificate[];
    loadData: () => Promise<void>;
};
export const EthRawCertificateContext = createContext<EthRawCertificateContextState>(
    {} as EthRawCertificateContextState
);

export const useEthRawCertificate = (): EthRawCertificateContextState => {
    const context = useContext(EthRawCertificateContext);
    if (!context || Object.keys(context).length === 0) {
        throw new Error('useEthRawCertificate must be used within an EthRawCertificateProvider.');
    }
    return context;
};

export function EthRawCertificateProvider(props: { children: ReactNode }) {
    const [dataLoaded, setDataLoaded] = useState<boolean>(false);
    const [rawCertificates, setRawCertificates] = useState<BaseCertificate[]>([]);
    const { signer } = useSigner();
    const { fileDriver } = useICP();
    const dispatch = useDispatch();
    const roleProof = useSelector((state: RootState) => state.userInfo.roleProof);

    const documentDriver = useMemo(
        () => new DocumentDriver(signer, CONTRACT_ADDRESSES.DOCUMENT()),
        [signer]
    );

    const certificateManagerService = useMemo(
        () =>
            new CertificateManagerService(
                new CertificateManagerDriver(signer, CONTRACT_ADDRESSES.CERTIFICATE()),
                documentDriver,
                fileDriver
            ),
        [signer]
    );

    const loadData = async () => {
        if (!certificateManagerService) return;

        try {
            dispatch(addLoadingMessage(RAW_CERTIFICATE_MESSAGE.RETRIEVE.LOADING));
            const rawCertificates =
                await certificateManagerService.getBaseCertificatesInfoBySubject(
                    roleProof,
                    signer._address
                );
            setRawCertificates(rawCertificates);
            setDataLoaded(true);
        } catch (e) {
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
        <EthRawCertificateContext.Provider
            value={{
                dataLoaded,
                rawCertificates,
                loadData
            }}
            {...props}
        />
    );
}
