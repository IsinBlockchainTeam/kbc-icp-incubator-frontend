import {
    BaseCertificate,
    CertificateDocument,
    CertificateDocumentType,
    CertificateManagerDriver,
    CertificateManagerService,
    DocumentDriver,
    RoleProof,
    URLStructure
} from '@kbc-lib/coffee-trading-management-lib';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
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
import { useParams } from 'react-router-dom';
import { ICPResourceSpec } from '@blockchain-lib/common';

type DocumentRequest = {
    fileName: string;
    fileType: string;
    fileContent: Uint8Array;
};

type BaseCertificateRequest = {
    issuer: string;
    subject: string;
    assessmentStandard: string;
    document?: DocumentRequest;
    documentType: CertificateDocumentType;
    documentReferenceId: string;
};
export type CompanyCertificateRequest = BaseCertificateRequest & {
    validFrom: number;
    validUntil: number;
};
export type ScopeCertificateRequest = BaseCertificateRequest & {
    validFrom: number;
    validUntil: number;
    processTypes: string[];
};
export type MaterialCertificateRequest = BaseCertificateRequest & {
    materialId: number;
};
export type DetailedCertificate = {
    certificate: BaseCertificate; // based on runtime type it will be either CompanyCertificate, ScopeCertificate or MaterialCertificate
    document: CertificateDocument;
};

export type EthCertificateContextState = {
    detailedCertificate: DetailedCertificate | null;

    saveCompanyCertificate: (request: CompanyCertificateRequest) => Promise<void>;
    saveScopeCertificate: (request: ScopeCertificateRequest) => Promise<void>;
    saveMaterialCertificate: (request: MaterialCertificateRequest) => Promise<void>;
    updateCompanyCertificate: (request: CompanyCertificateRequest) => Promise<void>;
    updateScopeCertificate: (request: ScopeCertificateRequest) => Promise<void>;
    updateMaterialCertificate: (request: MaterialCertificateRequest) => Promise<void>;
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
    const { id, type } = useParams();
    const { signer, waitForTransactions } = useSigner();
    const { fileDriver } = useICP();
    const { loadData: loadRawCertificates } = useEthRawCertificate();
    const [detailedCertificate, setDetailedCertificate] = useState<DetailedCertificate | null>(
        null
    );

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

    const getCompanyCertificate = async (roleProof: RoleProof, id: number) => {
        const certificate = await certificateManagerService.getCompanyCertificate(roleProof, id);
        return {
            certificate,
            document: await certificateManagerService.getDocument(
                roleProof,
                certificate.document.id
            )
        };
    };

    const getScopeCertificate = async (roleProof: RoleProof, id: number) => {
        const certificate = await certificateManagerService.getScopeCertificate(roleProof, id);
        return {
            certificate,
            document: await certificateManagerService.getDocument(
                roleProof,
                certificate.document.id
            )
        };
    };

    const getMaterialCertificate = async (roleProof: RoleProof, id: number) => {
        const certificate = await certificateManagerService.getMaterialCertificate(roleProof, id);
        return {
            certificate,
            document: await certificateManagerService.getDocument(
                roleProof,
                certificate.document.id
            )
        };
    };

    const loadData = async () => {
        if (!certificateManagerService) return;

        try {
            dispatch(addLoadingMessage(CERTIFICATE_MESSAGE.RETRIEVE.LOADING));
            const certificateByType = [
                () => getCompanyCertificate(roleProof, Number(id)),
                () => getScopeCertificate(roleProof, Number(id)),
                () => getMaterialCertificate(roleProof, Number(id))
            ];
            setDetailedCertificate(await certificateByType[Number(type)]());
        } catch (e: any) {
            console.log('Error while loading certificate', e);
            openNotification(
                'Error',
                CERTIFICATE_MESSAGE.RETRIEVE.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(CERTIFICATE_MESSAGE.RETRIEVE.LOADING));
        }
    };

    const _preliminaryCertificateSaving = (
        request: BaseCertificateRequest
    ): {
        delegatedOrganizationIds: number[];
        urlStructure: URLStructure;
        resourceSpec: ICPResourceSpec;
    } => {
        if (!request.document) throw new Error('Document is required');
        // if (!request.document) throw new Error('Document is required');
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
        return { delegatedOrganizationIds, urlStructure, resourceSpec };
    };

    const saveCompanyCertificate = async (request: CompanyCertificateRequest) => {
        if (!certificateManagerService) return;

        try {
            const { delegatedOrganizationIds, urlStructure, resourceSpec } =
                _preliminaryCertificateSaving(request);

            const [_, txHash] = await certificateManagerService.registerCompanyCertificate(
                roleProof,
                request.issuer,
                request.subject,
                request.assessmentStandard,
                new Date().getTime(),
                request.validFrom,
                request.validUntil,
                request.documentType,
                {
                    fileName: request.document!.fileName,
                    fileType: request.document!.fileType,
                    fileContent: request.document!.fileContent,
                    documentReferenceId: request.documentReferenceId
                },
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

    const saveScopeCertificate = async (request: ScopeCertificateRequest) => {
        if (!certificateManagerService) return;

        try {
            const { delegatedOrganizationIds, urlStructure, resourceSpec } =
                _preliminaryCertificateSaving(request);

            const [_, txHash] = await certificateManagerService.registerScopeCertificate(
                roleProof,
                request.issuer,
                request.subject,
                request.assessmentStandard,
                new Date().getTime(),
                request.validFrom,
                request.validUntil,
                request.processTypes,
                request.documentType,
                {
                    fileName: request.document!.fileName,
                    fileType: request.document!.fileType,
                    fileContent: request.document!.fileContent,
                    documentReferenceId: request.documentReferenceId
                },
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
            console.log('Error while saving scope certificate', e);
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

    const saveMaterialCertificate = async (request: MaterialCertificateRequest) => {
        if (!certificateManagerService) return;

        try {
            const { delegatedOrganizationIds, urlStructure, resourceSpec } =
                _preliminaryCertificateSaving(request);

            const [_, txHash] = await certificateManagerService.registerMaterialCertificate(
                roleProof,
                request.issuer,
                request.subject,
                request.assessmentStandard,
                new Date().getTime(),
                request.materialId,
                request.documentType,
                {
                    fileName: request.document!.fileName,
                    fileType: request.document!.fileType,
                    fileContent: request.document!.fileContent,
                    documentReferenceId: request.documentReferenceId
                },
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
            console.log('Error while saving material certificate', e);
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

    const updateCompanyCertificate = async (request: CompanyCertificateRequest) => {
        if (!certificateManagerService || !detailedCertificate) return;

        try {
            dispatch(addLoadingMessage(CERTIFICATE_MESSAGE.UPDATE.LOADING));
            const delegatedOrganizationIds: number[] = organizationId === 0 ? [1] : [0];

            await certificateManagerService.updateCompanyCertificate(
                roleProof,
                detailedCertificate.certificate.id,
                request.documentType,
                request.assessmentStandard,
                new Date().getTime(),
                request.validFrom,
                request.validUntil
            );
            if (detailedCertificate.document.documentReferenceId !== request.documentReferenceId) {
                await certificateManagerService.updateDocumentMetadata(
                    roleProof,
                    detailedCertificate.certificate.document.id,
                    {
                        ...detailedCertificate.document,
                        documentReferenceId: request.documentReferenceId
                    },
                    {
                        name: detailedCertificate.document.fileName,
                        type: detailedCertificate.document.fileType
                    },
                    delegatedOrganizationIds
                );
            }
            if (request.document) {
                await certificateManagerService.updateDocument(
                    roleProof,
                    detailedCertificate.certificate.id,
                    detailedCertificate.certificate.document.id,
                    {
                        fileName: request.document.fileName,
                        fileType: request.document.fileType,
                        fileContent: request.document.fileContent,
                        documentReferenceId: request.documentReferenceId
                    },
                    {
                        name: request.document.fileName,
                        type: request.document.fileType
                    },
                    delegatedOrganizationIds
                );
            }
            await loadData();
        } catch (e: any) {
            console.log('Error while updating company certificate', e);
            openNotification(
                'Error',
                CERTIFICATE_MESSAGE.UPDATE.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(CERTIFICATE_MESSAGE.UPDATE.LOADING));
        }
    };

    useEffect(() => {
        if (!id || !type) return;
        loadData();
    }, [id, type]);

    return (
        <EthCertificateContext.Provider
            value={{
                detailedCertificate: detailedCertificate,
                saveCompanyCertificate,
                saveScopeCertificate,
                saveMaterialCertificate,
                updateCompanyCertificate,
                updateScopeCertificate: async (request: ScopeCertificateRequest) => {
                    console.log('updateScopeCertificate', request);
                },
                updateMaterialCertificate: async (request: MaterialCertificateRequest) => {
                    console.log('updateMaterialCertificate', request);
                }
            }}
            {...props}
        />
    );
}
