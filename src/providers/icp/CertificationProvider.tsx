import {
    ICPBaseCertificate,
    ICPCertificateDocument,
    ICPCertificateDocumentType,
    ICPCertificationDriver,
    ICPCertificationService,
    URLStructure
} from '@kbc-lib/coffee-trading-management-lib';
import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { useSigner } from '@/providers/SignerProvider';
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
import { useSiweIdentity } from '@/providers/SiweIdentityProvider';
import { checkAndGetEnvironmentVariable } from '@/utils/env';
import { Typography } from 'antd';
import { useRawCertification } from '@/providers/icp/RawCertificationProvider';
import { useICP } from '@/providers/ICPProvider';

type DocumentRequest = {
    documentType: ICPCertificateDocumentType;
    referenceId: string;
    filename: string;
    fileType: string;
    fileContent: Uint8Array;
};

type BaseCertificateRequest = {
    issuer: string;
    subject: string;
    assessmentStandard: string;
    assessmentAssuranceLevel: string;
    document: DocumentRequest;
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
    certificate: ICPBaseCertificate; // based on runtime type it will be either CompanyCertificate, ScopeCertificate or MaterialCertificate
    documentContent: Uint8Array;
};

export type CertificationContextState = {
    detailedCertificate: DetailedCertificate | null;

    saveCompanyCertificate: (request: CompanyCertificateRequest) => Promise<void>;
    saveScopeCertificate: (request: ScopeCertificateRequest) => Promise<void>;
    saveMaterialCertificate: (request: MaterialCertificateRequest) => Promise<void>;
    updateCompanyCertificate: (request: CompanyCertificateRequest) => Promise<void>;
    updateScopeCertificate: (request: ScopeCertificateRequest) => Promise<void>;
    updateMaterialCertificate: (request: MaterialCertificateRequest) => Promise<void>;
};

export const CertificationContext = createContext<CertificationContextState>({} as CertificationContextState);

export const useCertification = (): CertificationContextState => {
    const context = useContext(CertificationContext);
    if (!context || Object.keys(context).length === 0) {
        throw new Error('useCertification must be used within an CertificationProvider.');
    }
    return context;
};

export function CertificationProvider(props: { children: ReactNode }) {
    const { id, type } = useParams();
    const { identity } = useSiweIdentity();
    const entityManagerCanisterId = checkAndGetEnvironmentVariable(ICP.CANISTER_ID_ENTITY_MANAGER);
    const { signer, waitForTransactions } = useSigner();
    const { fileDriver } = useICP();
    const { loadData: loadRawCertificates } = useRawCertification();
    const [detailedCertificate, setDetailedCertificate] = useState<DetailedCertificate | null>(null);

    const dispatch = useDispatch();
    const userInfo = useSelector((state: RootState) => state.userInfo);
    const organizationId = parseInt(userInfo.companyClaims.organizationId);

    if (!identity) {
        return <Typography.Text>Siwe identity not initialized</Typography.Text>;
    }

    const certificationService = useMemo(
        () => new ICPCertificationService(new ICPCertificationDriver(identity, entityManagerCanisterId), fileDriver),
        [identity]
    );

    const getCompanyCertificate = async (id: number): Promise<DetailedCertificate> => {
        const certificate = await certificationService.getCompanyCertificate(signer._address, id);
        return {
            certificate,
            documentContent: (await certificationService.getDocument(id)).fileContent
        };
    };

    const getScopeCertificate = async (id: number): Promise<DetailedCertificate> => {
        const certificate = await certificationService.getScopeCertificate(signer._address, id);
        return {
            certificate,
            documentContent: (await certificationService.getDocument(id)).fileContent
        };
    };

    const getMaterialCertificate = async (id: number): Promise<DetailedCertificate> => {
        const certificate = await certificationService.getMaterialCertificate(signer._address, id);
        return {
            certificate,
            documentContent: (await certificationService.getDocument(id)).fileContent
        };
    };

    const loadData = async () => {
        if (!certificationService) return;

        try {
            dispatch(addLoadingMessage(CERTIFICATE_MESSAGE.RETRIEVE.LOADING));
            const certificateByType = [
                () => getCompanyCertificate(Number(id)),
                () => getScopeCertificate(Number(id)),
                () => getMaterialCertificate(Number(id))
            ];
            setDetailedCertificate(await certificateByType[Number(type)]());
        } catch (e: any) {
            console.log('Error while loading certificate', e);
            openNotification('Error', CERTIFICATE_MESSAGE.RETRIEVE.ERROR, NotificationType.ERROR, NOTIFICATION_DURATION);
        } finally {
            dispatch(removeLoadingMessage(CERTIFICATE_MESSAGE.RETRIEVE.LOADING));
        }
    };

    const _computeDocumentStoreInfo = (
        documentRequest: DocumentRequest
    ): {
        delegatedOrganizationIds: number[];
        urlStructure: URLStructure;
        resourceSpec: ICPResourceSpec;
    } => {
        if (!documentRequest) throw new Error('Document is required');
        // TODO: remove this harcoded value
        const delegatedOrganizationIds: number[] = organizationId === 0 ? [1] : [0];
        const urlStructure: URLStructure = {
            prefix: getICPCanisterURL(ICP.CANISTER_ID_ORGANIZATION),
            organizationId
        };
        const resourceSpec = {
            name: documentRequest.filename,
            type: documentRequest.fileType
        };
        return { delegatedOrganizationIds, urlStructure, resourceSpec };
    };

    const _updateDocument = async (updatedDocument: DocumentRequest) => {
        if (!certificationService || !detailedCertificate) return;

        const { delegatedOrganizationIds, urlStructure, resourceSpec } = _computeDocumentStoreInfo(updatedDocument);
        await certificationService.updateDocument(detailedCertificate.certificate.id, {
            filename: updatedDocument.filename,
            fileType: updatedDocument.fileType,
            fileContent: updatedDocument.fileContent,
            referenceId: updatedDocument.referenceId,
            documentType: updatedDocument.documentType,
            storageConfig: {
                urlStructure,
                resourceSpec,
                delegatedOrganizationIds
            }
        });
    };

    const _areFieldsChanged = (request: BaseCertificateRequest, certificateSpecificFields: string[]): boolean => {
        if (!detailedCertificate) return false;
        const certificate = detailedCertificate.certificate;
        return (
            request.document.documentType !== certificate.document.documentType ||
            request.assessmentStandard !== certificate.assessmentStandard ||
            request.assessmentAssuranceLevel !== certificate.assessmentAssuranceLevel ||
            JSON.stringify(request.document.documentType) !== JSON.stringify(certificate.document.documentType) ||
            certificateSpecificFields.some(
                (field) => request[field as keyof BaseCertificateRequest] !== certificate[field as keyof ICPBaseCertificate]
            )
        );
    };

    const saveCompanyCertificate = async (request: CompanyCertificateRequest) => {
        if (!certificationService) return;

        try {
            dispatch(addLoadingMessage(CERTIFICATE_MESSAGE.SAVE.LOADING));
            const { delegatedOrganizationIds, urlStructure, resourceSpec } = _computeDocumentStoreInfo(request.document);
            await certificationService.registerCompanyCertificate(
                request.issuer,
                request.subject,
                request.assessmentStandard,
                request.assessmentAssuranceLevel,
                {
                    referenceId: request.document.referenceId,
                    documentType: request.document.documentType,
                    filename: request.document.filename,
                    fileType: request.document.fileType,
                    fileContent: request.document.fileContent,
                    storageConfig: {
                        urlStructure,
                        resourceSpec,
                        delegatedOrganizationIds
                    }
                },
                new Date(request.validFrom),
                new Date(request.validUntil)
            );
            await loadRawCertificates();
        } catch (e: any) {
            console.log('Error while saving company certificate', e);
            openNotification('Error', CERTIFICATE_MESSAGE.SAVE.ERROR, NotificationType.ERROR, NOTIFICATION_DURATION);
        } finally {
            dispatch(removeLoadingMessage(CERTIFICATE_MESSAGE.SAVE.LOADING));
        }
    };

    const saveScopeCertificate = async (request: ScopeCertificateRequest) => {
        if (!certificationService) return;

        try {
            dispatch(addLoadingMessage(CERTIFICATE_MESSAGE.SAVE.LOADING));
            const { delegatedOrganizationIds, urlStructure, resourceSpec } = _computeDocumentStoreInfo(request.document);
            await certificationService.registerScopeCertificate(
                request.issuer,
                request.subject,
                request.assessmentStandard,
                request.assessmentAssuranceLevel,
                {
                    referenceId: request.document.referenceId,
                    documentType: request.document.documentType,
                    filename: request.document.filename,
                    fileType: request.document.fileType,
                    fileContent: request.document.fileContent,
                    storageConfig: {
                        urlStructure,
                        resourceSpec,
                        delegatedOrganizationIds
                    }
                },
                new Date(request.validFrom),
                new Date(request.validUntil),
                request.processTypes
            );
            await loadRawCertificates();
        } catch (e: any) {
            console.log('Error while saving scope certificate', e);
            openNotification('Error', CERTIFICATE_MESSAGE.SAVE.ERROR, NotificationType.ERROR, NOTIFICATION_DURATION);
        } finally {
            dispatch(removeLoadingMessage(CERTIFICATE_MESSAGE.SAVE.LOADING));
        }
    };

    const saveMaterialCertificate = async (request: MaterialCertificateRequest) => {
        if (!certificationService) return;

        try {
            dispatch(addLoadingMessage(CERTIFICATE_MESSAGE.SAVE.LOADING));
            const { delegatedOrganizationIds, urlStructure, resourceSpec } = _computeDocumentStoreInfo(request.document);
            await certificationService.registerMaterialCertificate(
                request.issuer,
                request.subject,
                request.assessmentStandard,
                request.assessmentAssuranceLevel,
                {
                    referenceId: request.document.referenceId,
                    documentType: request.document.documentType,
                    filename: request.document.filename,
                    fileType: request.document.fileType,
                    fileContent: request.document.fileContent,
                    storageConfig: {
                        urlStructure,
                        resourceSpec,
                        delegatedOrganizationIds
                    }
                },
                request.materialId
            );
            await loadRawCertificates();
        } catch (e: any) {
            console.log('Error while saving material certificate', e);
            openNotification('Error', CERTIFICATE_MESSAGE.SAVE.ERROR, NotificationType.ERROR, NOTIFICATION_DURATION);
        } finally {
            dispatch(removeLoadingMessage(CERTIFICATE_MESSAGE.SAVE.LOADING));
        }
    };

    const updateCompanyCertificate = async (request: CompanyCertificateRequest) => {
        if (!certificationService || !detailedCertificate) return;

        try {
            dispatch(addLoadingMessage(CERTIFICATE_MESSAGE.UPDATE.LOADING));

            if (_areFieldsChanged(request, ['validFrom', 'validUntil'])) {
                await certificationService.updateCompanyCertificate(
                    detailedCertificate.certificate.id,
                    request.assessmentStandard,
                    request.assessmentAssuranceLevel,
                    new Date(request.validFrom),
                    new Date(request.validUntil)
                );
                await _updateDocument(request.document);
                await loadData();
            }
        } catch (e: any) {
            console.log('Error while updating company certificate', e);
            openNotification('Error', CERTIFICATE_MESSAGE.UPDATE.ERROR, NotificationType.ERROR, NOTIFICATION_DURATION);
        } finally {
            dispatch(removeLoadingMessage(CERTIFICATE_MESSAGE.UPDATE.LOADING));
        }
    };

    const updateScopeCertificate = async (request: ScopeCertificateRequest) => {
        if (!certificationService || !detailedCertificate) return;

        try {
            dispatch(addLoadingMessage(CERTIFICATE_MESSAGE.UPDATE.LOADING));

            if (_areFieldsChanged(request, ['validFrom', 'validUntil', 'processTypes'])) {
                await certificationService.updateScopeCertificate(
                    detailedCertificate.certificate.id,
                    request.assessmentStandard,
                    request.assessmentAssuranceLevel,
                    new Date(request.validFrom),
                    new Date(request.validUntil),
                    request.processTypes
                );
                await _updateDocument(request.document);
                await loadData();
            }
        } catch (e: any) {
            console.log('Error while updating scope certificate', e);
            openNotification('Error', CERTIFICATE_MESSAGE.UPDATE.ERROR, NotificationType.ERROR, NOTIFICATION_DURATION);
        } finally {
            dispatch(removeLoadingMessage(CERTIFICATE_MESSAGE.UPDATE.LOADING));
        }
    };

    const updateMaterialCertificate = async (request: MaterialCertificateRequest) => {
        if (!certificationService || !detailedCertificate) return;

        try {
            dispatch(addLoadingMessage(CERTIFICATE_MESSAGE.UPDATE.LOADING));

            if (_areFieldsChanged(request, ['materialId'])) {
                await certificationService.updateMaterialCertificate(
                    detailedCertificate.certificate.id,
                    request.assessmentStandard,
                    request.assessmentAssuranceLevel,
                    request.materialId
                );
                await _updateDocument(request.document);
                await loadData();
            }
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
        <CertificationContext.Provider
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
