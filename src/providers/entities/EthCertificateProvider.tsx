import {
    BaseCertificate,
    CertificateDocument,
    CertificateDocumentType,
    CertificateManagerDriver,
    CertificateManagerService,
    DocumentDriver,
    MaterialCertificate,
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
    filename: string;
    fileType: string;
    fileContent: Uint8Array;
};

type BaseCertificateRequest = {
    issuer: string;
    subject: string;
    assessmentStandard: string;
    document: DocumentRequest;
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

export const EthCertificateContext = createContext<EthCertificateContextState>({} as EthCertificateContextState);

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
    const [detailedCertificate, setDetailedCertificate] = useState<DetailedCertificate | null>(null);

    const dispatch = useDispatch();
    const userInfo = useSelector((state: RootState) => state.userInfo);
    const organizationId = parseInt(userInfo.companyClaims.organizationId);
    const roleProof = useSelector((state: RootState) => state.userInfo.roleProof);

    const documentDriver = useMemo(() => new DocumentDriver(signer, CONTRACT_ADDRESSES.DOCUMENT()), [signer]);

    const certificateManagerService = useMemo(
        () => new CertificateManagerService(new CertificateManagerDriver(signer, CONTRACT_ADDRESSES.CERTIFICATE()), documentDriver, fileDriver),
        [signer]
    );

    const getCompanyCertificate = async (roleProof: RoleProof, id: number): Promise<DetailedCertificate> => {
        const certificate = await certificateManagerService.getCompanyCertificate(roleProof, id);
        return {
            certificate,
            document: await certificateManagerService.getDocument(roleProof, certificate.document.id)
        };
    };

    const getScopeCertificate = async (roleProof: RoleProof, id: number): Promise<DetailedCertificate> => {
        const certificate = await certificateManagerService.getScopeCertificate(roleProof, id);
        return {
            certificate,
            document: await certificateManagerService.getDocument(roleProof, certificate.document.id)
        };
    };

    const getMaterialCertificate = async (roleProof: RoleProof, id: number): Promise<DetailedCertificate> => {
        const certificate = await certificateManagerService.getMaterialCertificate(roleProof, id);
        return {
            certificate,
            document: await certificateManagerService.getDocument(roleProof, certificate.document.id)
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
            openNotification('Error', CERTIFICATE_MESSAGE.RETRIEVE.ERROR, NotificationType.ERROR, NOTIFICATION_DURATION);
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
            name: request.document.filename,
            type: request.document.fileType
        };
        return { delegatedOrganizationIds, urlStructure, resourceSpec };
    };

    const _updateDocument = async (delegatedOrganizationIds: number[], updatedDocumentReferenceId: string, updatedDocument: DocumentRequest) => {
        if (!certificateManagerService || !detailedCertificate) return;

        if (updatedDocument.filename) {
            await certificateManagerService.updateDocument(
                roleProof,
                detailedCertificate.certificate.id,
                detailedCertificate.certificate.document.id,
                {
                    filename: updatedDocument.filename,
                    fileType: updatedDocument.fileType,
                    fileContent: updatedDocument.fileContent,
                    documentReferenceId: updatedDocumentReferenceId
                },
                {
                    name: updatedDocument.filename,
                    type: updatedDocument.fileType
                },
                delegatedOrganizationIds
            );
        } else if (detailedCertificate.document.documentReferenceId !== updatedDocumentReferenceId) {
            await certificateManagerService.updateDocumentMetadata(
                roleProof,
                detailedCertificate.certificate.document.id,
                {
                    filename: detailedCertificate.document.filename,
                    fileType: detailedCertificate.document.fileType,
                    documentReferenceId: updatedDocumentReferenceId
                },
                {
                    name: detailedCertificate.document.filename,
                    type: detailedCertificate.document.fileType
                },
                delegatedOrganizationIds
            );
        }
    };

    const _areEthFieldsChanged = (request: BaseCertificateRequest, certificateSpecificFields: string[]): boolean => {
        if (!detailedCertificate) return false;
        const certificate = detailedCertificate.certificate;
        const document = detailedCertificate.document;
        return (
            request.documentType !== certificate.document.documentType ||
            request.assessmentStandard !== certificate.assessmentStandard ||
            certificateSpecificFields.some((field) => request[field as keyof BaseCertificateRequest] !== certificate[field as keyof BaseCertificate])
        );
    };

    const saveCompanyCertificate = async (request: CompanyCertificateRequest) => {
        if (!certificateManagerService) return;

        try {
            const { delegatedOrganizationIds, urlStructure, resourceSpec } = _preliminaryCertificateSaving(request);

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
                    filename: request.document!.filename,
                    fileType: request.document!.fileType,
                    fileContent: request.document!.fileContent,
                    documentReferenceId: request.documentReferenceId
                },
                urlStructure,
                resourceSpec,
                delegatedOrganizationIds
            );
            await waitForTransactions(txHash, Number(process.env.REACT_APP_BC_CONFIRMATION_NUMBER || 0));
            await loadRawCertificates();
        } catch (e: any) {
            console.log('Error while saving company certificate', e);
            openNotification('Error', CERTIFICATE_MESSAGE.SAVE.ERROR, NotificationType.ERROR, NOTIFICATION_DURATION);
        } finally {
            dispatch(removeLoadingMessage(CERTIFICATE_MESSAGE.SAVE.LOADING));
        }
    };

    const saveScopeCertificate = async (request: ScopeCertificateRequest) => {
        if (!certificateManagerService) return;

        try {
            const { delegatedOrganizationIds, urlStructure, resourceSpec } = _preliminaryCertificateSaving(request);

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
                    filename: request.document!.filename,
                    fileType: request.document!.fileType,
                    fileContent: request.document!.fileContent,
                    documentReferenceId: request.documentReferenceId
                },
                urlStructure,
                resourceSpec,
                delegatedOrganizationIds
            );
            await waitForTransactions(txHash, Number(process.env.REACT_APP_BC_CONFIRMATION_NUMBER || 0));
            await loadRawCertificates();
        } catch (e: any) {
            console.log('Error while saving scope certificate', e);
            openNotification('Error', CERTIFICATE_MESSAGE.SAVE.ERROR, NotificationType.ERROR, NOTIFICATION_DURATION);
        } finally {
            dispatch(removeLoadingMessage(CERTIFICATE_MESSAGE.SAVE.LOADING));
        }
    };

    const saveMaterialCertificate = async (request: MaterialCertificateRequest) => {
        if (!certificateManagerService) return;

        try {
            const { delegatedOrganizationIds, urlStructure, resourceSpec } = _preliminaryCertificateSaving(request);

            const [_, txHash] = await certificateManagerService.registerMaterialCertificate(
                roleProof,
                request.issuer,
                request.subject,
                request.assessmentStandard,
                new Date().getTime(),
                request.materialId,
                request.documentType,
                {
                    filename: request.document!.filename,
                    fileType: request.document!.fileType,
                    fileContent: request.document!.fileContent,
                    documentReferenceId: request.documentReferenceId
                },
                urlStructure,
                resourceSpec,
                delegatedOrganizationIds
            );
            await waitForTransactions(txHash, Number(process.env.REACT_APP_BC_CONFIRMATION_NUMBER || 0));
            await loadRawCertificates();
        } catch (e: any) {
            console.log('Error while saving material certificate', e);
            openNotification('Error', CERTIFICATE_MESSAGE.SAVE.ERROR, NotificationType.ERROR, NOTIFICATION_DURATION);
        } finally {
            dispatch(removeLoadingMessage(CERTIFICATE_MESSAGE.SAVE.LOADING));
        }
    };

    const updateCompanyCertificate = async (request: CompanyCertificateRequest) => {
        if (!certificateManagerService || !detailedCertificate) return;

        try {
            dispatch(addLoadingMessage(CERTIFICATE_MESSAGE.UPDATE.LOADING));
            const delegatedOrganizationIds: number[] = organizationId === 0 ? [1] : [0];

            if (_areEthFieldsChanged(request, ['validFrom', 'validUntil'])) {
                await certificateManagerService.updateCompanyCertificate(
                    roleProof,
                    detailedCertificate.certificate.id,
                    request.documentType,
                    request.assessmentStandard,
                    detailedCertificate.certificate.issueDate,
                    request.validFrom,
                    request.validUntil
                );
            }
            await _updateDocument(delegatedOrganizationIds, request.documentReferenceId, request.document);
            await loadData();
        } catch (e: any) {
            console.log('Error while updating company certificate', e);
            openNotification('Error', CERTIFICATE_MESSAGE.UPDATE.ERROR, NotificationType.ERROR, NOTIFICATION_DURATION);
        } finally {
            dispatch(removeLoadingMessage(CERTIFICATE_MESSAGE.UPDATE.LOADING));
        }
    };

    const updateScopeCertificate = async (request: ScopeCertificateRequest) => {
        if (!certificateManagerService || !detailedCertificate) return;

        try {
            dispatch(addLoadingMessage(CERTIFICATE_MESSAGE.UPDATE.LOADING));
            const delegatedOrganizationIds: number[] = organizationId === 0 ? [1] : [0];

            if (_areEthFieldsChanged(request, ['validFrom', 'validUntil', 'processTypes'])) {
                await certificateManagerService.updateScopeCertificate(
                    roleProof,
                    detailedCertificate.certificate.id,
                    request.documentType,
                    request.assessmentStandard,
                    detailedCertificate.certificate.issueDate,
                    request.validFrom,
                    request.validUntil,
                    request.processTypes
                );
            }
            await _updateDocument(delegatedOrganizationIds, request.documentReferenceId, request.document);
            await loadData();
        } catch (e: any) {
            console.log('Error while updating scope certificate', e);
            openNotification('Error', CERTIFICATE_MESSAGE.UPDATE.ERROR, NotificationType.ERROR, NOTIFICATION_DURATION);
        } finally {
            dispatch(removeLoadingMessage(CERTIFICATE_MESSAGE.UPDATE.LOADING));
        }
    };

    const updateMaterialCertificate = async (request: MaterialCertificateRequest) => {
        if (!certificateManagerService || !detailedCertificate) return;

        try {
            dispatch(addLoadingMessage(CERTIFICATE_MESSAGE.UPDATE.LOADING));
            const delegatedOrganizationIds: number[] = organizationId === 0 ? [1] : [0];

            if (_areEthFieldsChanged(request, ['materialId'])) {
                await certificateManagerService.updateMaterialCertificate(
                    roleProof,
                    detailedCertificate.certificate.id,
                    request.documentType,
                    request.assessmentStandard,
                    detailedCertificate.certificate.issueDate,
                    request.materialId
                );
            }
            await _updateDocument(delegatedOrganizationIds, request.documentReferenceId, request.document);
            await loadData();
        } catch (e: any) {
            console.log('Error while updating material certificate', e);
            openNotification('Error', CERTIFICATE_MESSAGE.UPDATE.ERROR, NotificationType.ERROR, NOTIFICATION_DURATION);
        } finally {
            dispatch(removeLoadingMessage(CERTIFICATE_MESSAGE.UPDATE.LOADING));
        }
    };

    useEffect(() => {
        if (!id || !type) return;
        if (Number(id) !== detailedCertificate?.certificate.id) {
            setDetailedCertificate(null);
            loadData();
        }
    }, [id, type]);

    return (
        <EthCertificateContext.Provider
            value={{
                detailedCertificate,
                saveCompanyCertificate,
                saveScopeCertificate,
                saveMaterialCertificate,
                updateCompanyCertificate,
                updateScopeCertificate,
                updateMaterialCertificate
            }}
            {...props}
        />
    );
}
