import {
    ICPBaseCertificate,
    ICPCertificateDocumentType,
    ICPCertificationDriver,
    ICPCertificationService,
    ResourceSpec,
    URLStructure
} from '@kbc-lib/coffee-trading-management-lib';
import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { useSigner } from '@/providers/auth/SignerProvider';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { getICPCanisterURL } from '@/utils/icp';
import { ICP } from '@/constants/icp';
import { NotificationType, openNotification } from '@/utils/notification';
import { CERTIFICATION_MESSAGE } from '@/constants/message';
import { NOTIFICATION_DURATION } from '@/constants/notification';
import { useParams } from 'react-router-dom';
import { useSiweIdentity } from '@/providers/auth/SiweIdentityProvider';
import { checkAndGetEnvironmentVariable } from '@/utils/env';
import { Typography } from 'antd';
import { useICP } from '@/providers/storage/IcpStorageProvider';
import { useCallHandler } from '@/providers/icp/CallHandlerProvider';
import { useRawCertification } from '@/providers/icp/RawCertificationProvider';

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
    assessmentReferenceStandardId: number;
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
    dataLoaded: boolean;
    loadData: () => Promise<void>;
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
    const [dataLoaded, setDataLoaded] = useState<boolean>(false);
    const { identity } = useSiweIdentity();
    const entityManagerCanisterId = checkAndGetEnvironmentVariable(ICP.CANISTER_ID_ENTITY_MANAGER);
    const { signer } = useSigner();
    const { fileDriver } = useICP();
    const { loadData: loadCertificates } = useRawCertification();
    const [detailedCertificate, setDetailedCertificate] = useState<DetailedCertificate | null>(null);
    const { handleICPCall } = useCallHandler();

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
        await loadCertificate();
        setDataLoaded(true);
    };

    const loadCertificate = async () => {
        if (!certificationService) return;

        await handleICPCall(async () => {
            const certificateByType = [
                () => getCompanyCertificate(Number(id)),
                () => getScopeCertificate(Number(id)),
                () => getMaterialCertificate(Number(id))
            ];
            setDetailedCertificate(await certificateByType[Number(type)]());
        }, CERTIFICATION_MESSAGE.RETRIEVE.LOADING);
    };

    const writeTransaction = async (transaction: () => Promise<any>) => {
        await handleICPCall(async () => {
            await transaction();
            await loadCertificates();
            openNotification('Success', CERTIFICATION_MESSAGE.SAVE.OK, NotificationType.SUCCESS, NOTIFICATION_DURATION);
        }, CERTIFICATION_MESSAGE.SAVE.LOADING);
    };

    const updateTransaction = async (transaction: () => Promise<any>, request: BaseCertificateRequest) => {
        await handleICPCall(async () => {
            await transaction();
            await _updateDocument(request.document);
            await loadCertificate();
            await loadCertificates();
            openNotification('Success', CERTIFICATION_MESSAGE.UPDATE.OK, NotificationType.SUCCESS, NOTIFICATION_DURATION);
        }, CERTIFICATION_MESSAGE.UPDATE.LOADING);
    };

    const _computeDocumentStoreInfo = (
        documentRequest: DocumentRequest
    ): {
        delegatedOrganizationIds: number[];
        urlStructure: URLStructure;
        resourceSpec: ResourceSpec;
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
            request.assessmentReferenceStandardId !== certificate.assessmentReferenceStandard.id ||
            request.assessmentAssuranceLevel !== certificate.assessmentAssuranceLevel ||
            JSON.stringify(request.document.documentType) !== JSON.stringify(certificate.document.documentType) ||
            certificateSpecificFields.some(
                (field) => request[field as keyof BaseCertificateRequest] !== certificate[field as keyof ICPBaseCertificate]
            )
        );
    };

    const saveCompanyCertificate = async (request: CompanyCertificateRequest) => {
        if (!certificationService) return;

        const { delegatedOrganizationIds, urlStructure, resourceSpec } = _computeDocumentStoreInfo(request.document);
        await writeTransaction(() =>
            certificationService.registerCompanyCertificate(
                request.issuer,
                request.subject,
                request.assessmentReferenceStandardId,
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
            )
        );
    };

    const saveScopeCertificate = async (request: ScopeCertificateRequest) => {
        if (!certificationService) return;

        const { delegatedOrganizationIds, urlStructure, resourceSpec } = _computeDocumentStoreInfo(request.document);
        await writeTransaction(() =>
            certificationService.registerScopeCertificate(
                request.issuer,
                request.subject,
                request.assessmentReferenceStandardId,
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
            )
        );
    };

    const saveMaterialCertificate = async (request: MaterialCertificateRequest) => {
        if (!certificationService) return;

        const { delegatedOrganizationIds, urlStructure, resourceSpec } = _computeDocumentStoreInfo(request.document);
        await writeTransaction(() =>
            certificationService.registerMaterialCertificate(
                request.issuer,
                request.subject,
                request.assessmentReferenceStandardId,
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
            )
        );
    };

    const updateCompanyCertificate = async (request: CompanyCertificateRequest) => {
        if (!certificationService || !detailedCertificate) return;

        if (_areFieldsChanged(request, ['validFrom', 'validUntil'])) {
            await updateTransaction(
                () =>
                    certificationService.updateCompanyCertificate(
                        detailedCertificate.certificate.id,
                        request.assessmentReferenceStandardId,
                        request.assessmentAssuranceLevel,
                        new Date(request.validFrom),
                        new Date(request.validUntil)
                    ),
                request
            );
        }
    };

    const updateScopeCertificate = async (request: ScopeCertificateRequest) => {
        if (!certificationService || !detailedCertificate) return;

        if (_areFieldsChanged(request, ['validFrom', 'validUntil', 'processTypes'])) {
            await updateTransaction(
                () =>
                    certificationService.updateScopeCertificate(
                        detailedCertificate.certificate.id,
                        request.assessmentReferenceStandardId,
                        request.assessmentAssuranceLevel,
                        new Date(request.validFrom),
                        new Date(request.validUntil),
                        request.processTypes
                    ),
                request
            );
        }
    };

    const updateMaterialCertificate = async (request: MaterialCertificateRequest) => {
        if (!certificationService || !detailedCertificate) return;

        if (_areFieldsChanged(request, ['materialId'])) {
            await updateTransaction(
                () =>
                    certificationService.updateMaterialCertificate(
                        detailedCertificate.certificate.id,
                        request.assessmentReferenceStandardId,
                        request.assessmentAssuranceLevel,
                        request.materialId
                    ),
                request
            );
        }
    };

    useEffect(() => {
        if (!id || !type) return;
        if (Number(id) !== detailedCertificate?.certificate.id) {
            setDetailedCertificate(null);
            setDataLoaded(false);
        }
    }, [id, type]);

    return (
        <CertificationContext.Provider
            value={{
                dataLoaded,
                loadData,
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
