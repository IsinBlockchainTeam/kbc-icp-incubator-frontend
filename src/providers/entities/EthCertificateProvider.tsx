import {
    CertificateDocument,
    CertificateManagerDriver,
    CertificateManagerService,
    DocumentDriver,
    URLStructure
} from '@kbc-lib/coffee-trading-management-lib';
import { createContext, ReactNode, useContext, useMemo } from 'react';
import { useSigner } from '@/providers/SignerProvider';
import { CONTRACT_ADDRESSES } from '@/constants/evm';
import { useICP } from '@/providers/ICPProvider';
import { useEthRawCertificate } from '@/providers/entities/EthRawCertificateProvider';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { getICPCanisterURL } from '@/utils/icp';
import { ICP } from '@/constants/icp';
import { NotificationType, openNotification } from '@/utils/notification';
import { CERTIFICATE_MESSAGE } from '@/constants/message';
import { NOTIFICATION_DURATION } from '@/constants/notification';
import { addLoadingMessage, removeLoadingMessage } from '@/redux/reducers/loadingSlice';

type BaseCertificateRequest = {
    issuer: string;
    subject: string;
    assessmentStandard: string;
    document: CertificateDocument;
};
export type CompanyCertificateRequest = BaseCertificateRequest & {
    validFrom: Date;
    validUntil: Date;
};
export type ScopeCertificateRequest = BaseCertificateRequest & {
    validFrom: Date;
    validUntil: Date;
    processTypes: string[];
};
export type MaterialCertificateRequest = BaseCertificateRequest & {
    materialId: number;
};

export type EthCertificateContextState = {
    saveCompanyCertificate: (request: CompanyCertificateRequest) => Promise<void>;
    saveScopeCertificate: (request: ScopeCertificateRequest) => Promise<void>;
    saveMaterialCertificate: (request: MaterialCertificateRequest) => Promise<void>;
};

export const EthCertificateContext = createContext<EthCertificateContextState>(
    {} as EthCertificateContextState
);

export const useEthCertificate = (): EthCertificateContextState => {
    const context = useContext(EthCertificateContext);
    if (!context || Object.keys(context).length === 0) {
        throw new Error('useEthCertificate must be used within an EthCertificateProvider.');
    }
    return context;
};

export function EthCertificateProvider(props: { children: ReactNode }) {
    const { signer, waitForTransactions } = useSigner();
    const { fileDriver } = useICP();
    const { loadData: loadRawCertificates } = useEthRawCertificate();

    const dispatch = useDispatch();
    const userInfo = useSelector((state: RootState) => state.userInfo);
    const organizationId = parseInt(userInfo.companyClaims.organizationId);
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

    const saveCompanyCertificate = async (request: CompanyCertificateRequest) => {
        if (!certificateManagerService) return;

        try {
            dispatch(addLoadingMessage(CERTIFICATE_MESSAGE.SAVE.LOADING));
            // TODO: remove this harcoded value
            const delegatedOrganizationIds: number[] = organizationId === 0 ? [1] : [0];
            const urlStructure: URLStructure = {
                prefix: getICPCanisterURL(ICP.CANISTER_ID_ORGANIZATION),
                organizationId
            };
            const resourceSpec = {
                name: request.document.fileName,
                type: request.document.fileType
            };
            const [_, txHash] = await certificateManagerService.registerCompanyCertificate(
                roleProof,
                request.issuer,
                request.subject,
                request.assessmentStandard,
                new Date(),
                request.validFrom,
                request.validUntil,
                request.document,
                urlStructure,
                resourceSpec,
                delegatedOrganizationIds
            );
            await waitForTransactions(
                txHash,
                Number(process.env.REACT_APP_BC_CONFIRMATION_NUMBER || 0)
            );
            await loadRawCertificates();
        } catch (e: any) {
            console.log('Error while saving company certificate', e);
            openNotification(
                'Error',
                CERTIFICATE_MESSAGE.SAVE.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(CERTIFICATE_MESSAGE.SAVE.LOADING));
        }
    };

    return (
        <EthCertificateContext.Provider
            value={{
                saveCompanyCertificate,
                saveScopeCertificate: async (request: ScopeCertificateRequest) => {
                    console.log('saveScopeCertificate', request);
                },
                saveMaterialCertificate: async (request: MaterialCertificateRequest) => {
                    console.log('saveMaterialCertificate', request);
                }
            }}
            {...props}
        />
    );
}
