import {
    CertificateDocument,
    ICPBaseCertificate,
    ICPCertificateDocumentInfo,
    ICPCertificateDocumentType,
    ICPCertificationManagerDriver,
    ICPCertificationManagerService,
    UpdatedRoleProof,
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
import { getProof } from '@/providers/icp/tempProof';
import { useEthRawCertificate } from '@/providers/entities/EthRawCertificateProvider';
import { useRawCertification } from '@/providers/icp/RawCertificationProvider';

type DocumentRequest = {
    fileName: string;
    fileType: string;
    fileContent: Uint8Array;
};

type BaseCertificateRequest = {
    issuer: string;
    subject: string;
    assessmentStandard: string;
    assessmentAssuranceLevel: string;
    document: DocumentRequest;
    documentType: ICPCertificateDocumentType;
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
    certificate: ICPBaseCertificate; // based on runtime type it will be either CompanyCertificate, ScopeCertificate or MaterialCertificate
    // TODO: it has to be replaced with the CertificateDocument entity where there is also the uint8array content
    document: ICPCertificateDocumentInfo;
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

export const CertificationContext = createContext<CertificationContextState>(
    {} as CertificationContextState
);

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
    const { loadData: loadRawCertificates } = useRawCertification();
    const [detailedCertificate, setDetailedCertificate] = useState<DetailedCertificate | null>(
        null
    );

    const dispatch = useDispatch();
    const userInfo = useSelector((state: RootState) => state.userInfo);
    const organizationId = parseInt(userInfo.companyClaims.organizationId);

    if (!identity) {
        return <Typography.Text>Siwe identity not initialized</Typography.Text>;
    }

    const certificateManagerService = useMemo(
        () =>
            new ICPCertificationManagerService(
                new ICPCertificationManagerDriver(identity, entityManagerCanisterId)
            ),
        [signer]
    );

    const getCompanyCertificate = async (
        roleProof: UpdatedRoleProof,
        id: number
    ): Promise<DetailedCertificate> => {
        const certificate = await certificateManagerService.getCompanyCertificate(
            roleProof,
            signer._address,
            id
        );
        return {
            certificate,
            document: {
                id: certificate.document.id,
                documentType: certificate.document.documentType,
                externalUrl: certificate.document.externalUrl
            }
        };
    };

    const getScopeCertificate = async (
        roleProof: UpdatedRoleProof,
        id: number
    ): Promise<DetailedCertificate> => {
        const certificate = await certificateManagerService.getScopeCertificate(
            roleProof,
            signer._address,
            id
        );
        return {
            certificate,
            document: {
                id: certificate.document.id,
                documentType: certificate.document.documentType,
                externalUrl: certificate.document.externalUrl
            }
        };
    };

    const getMaterialCertificate = async (
        roleProof: UpdatedRoleProof,
        id: number
    ): Promise<DetailedCertificate> => {
        const certificate = await certificateManagerService.getMaterialCertificate(
            roleProof,
            signer._address,
            id
        );
        return {
            certificate,
            document: {
                id: certificate.document.id,
                documentType: certificate.document.documentType,
                externalUrl: certificate.document.externalUrl
            }
        };
    };

    const loadData = async () => {
        if (!certificateManagerService) return;

        try {
            dispatch(addLoadingMessage(CERTIFICATE_MESSAGE.RETRIEVE.LOADING));
            const roleProof = await getProof();
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

    const _updateDocument = async (
        delegatedOrganizationIds: number[],
        updatedDocumentReferenceId: string,
        updatedDocument: DocumentRequest
    ) => {
        if (!certificateManagerService || !detailedCertificate) return;

        // if (updatedDocument.fileName) {
        //     await certificateManagerService.updateDocument(
        //         roleProof,
        //         detailedCertificate.certificate.id,
        //         detailedCertificate.certificate.document.id,
        //         {
        //             fileName: updatedDocument.fileName,
        //             fileType: updatedDocument.fileType,
        //             fileContent: updatedDocument.fileContent,
        //             documentReferenceId: updatedDocumentReferenceId
        //         },
        //         {
        //             name: updatedDocument.fileName,
        //             type: updatedDocument.fileType
        //         },
        //         delegatedOrganizationIds
        //     );
        // } else if (
        //     detailedCertificate.document.documentReferenceId !== updatedDocumentReferenceId
        // ) {
        //     await certificateManagerService.updateDocumentMetadata(
        //         roleProof,
        //         detailedCertificate.certificate.document.id,
        //         {
        //             fileName: detailedCertificate.document.fileName,
        //             fileType: detailedCertificate.document.fileType,
        //             documentReferenceId: updatedDocumentReferenceId
        //         },
        //         {
        //             name: detailedCertificate.document.fileName,
        //             type: detailedCertificate.document.fileType
        //         },
        //         delegatedOrganizationIds
        //     );
        // }
    };

    const _areFieldsChanged = (
        request: BaseCertificateRequest,
        certificateSpecificFields: string[]
    ): boolean => {
        if (!detailedCertificate) return false;
        const certificate = detailedCertificate.certificate;
        const document = detailedCertificate.document;
        return (
            request.documentType !== certificate.document.documentType ||
            request.assessmentStandard !== certificate.assessmentStandard ||
            certificateSpecificFields.some(
                (field) =>
                    request[field as keyof BaseCertificateRequest] !==
                    certificate[field as keyof ICPBaseCertificate]
            )
        );
    };

    const saveCompanyCertificate = async (request: CompanyCertificateRequest) => {
        if (!certificateManagerService) return;

        try {
            const { delegatedOrganizationIds, urlStructure, resourceSpec } =
                _preliminaryCertificateSaving(request);
            const roleProof = await getProof();
            console.log('request: ', request);
            console.log('roleProof: ', roleProof);
            await certificateManagerService.registerCompanyCertificate(
                roleProof,
                request.issuer,
                request.subject,
                request.assessmentStandard,
                request.assessmentAssuranceLevel,
                request.documentReferenceId,
                {
                    id: 0,
                    documentType: request.documentType,
                    externalUrl: ''
                },
                new Date(request.validFrom),
                new Date(request.validUntil)
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

            const roleProof = await getProof();
            await certificateManagerService.registerScopeCertificate(
                roleProof,
                request.issuer,
                request.subject,
                request.assessmentStandard,
                request.assessmentAssuranceLevel,
                request.documentReferenceId,
                {
                    id: 0,
                    documentType: request.documentType,
                    externalUrl: ''
                },
                new Date(request.validFrom),
                new Date(request.validUntil),
                request.processTypes
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

            const roleProof = await getProof();
            await certificateManagerService.registerMaterialCertificate(
                roleProof,
                request.issuer,
                request.subject,
                request.assessmentStandard,
                request.assessmentAssuranceLevel,
                request.documentReferenceId,
                {
                    id: 0,
                    documentType: request.documentType,
                    externalUrl: ''
                },
                request.materialId
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

            if (_areFieldsChanged(request, ['validFrom', 'validUntil'])) {
                const roleProof = await getProof();
                await certificateManagerService.updateCompanyCertificate(
                    roleProof,
                    detailedCertificate.certificate.id,
                    request.assessmentStandard,
                    request.assessmentAssuranceLevel,
                    request.documentReferenceId,
                    new Date(request.validFrom),
                    new Date(request.validUntil)
                );
            }
            await _updateDocument(
                delegatedOrganizationIds,
                request.documentReferenceId,
                request.document
            );
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

    const updateScopeCertificate = async (request: ScopeCertificateRequest) => {
        if (!certificateManagerService || !detailedCertificate) return;

        try {
            dispatch(addLoadingMessage(CERTIFICATE_MESSAGE.UPDATE.LOADING));
            const delegatedOrganizationIds: number[] = organizationId === 0 ? [1] : [0];

            if (_areFieldsChanged(request, ['validFrom', 'validUntil', 'processTypes'])) {
                const roleProof = await getProof();
                await certificateManagerService.updateScopeCertificate(
                    roleProof,
                    detailedCertificate.certificate.id,
                    request.assessmentStandard,
                    request.assessmentAssuranceLevel,
                    request.documentReferenceId,
                    new Date(request.validFrom),
                    new Date(request.validUntil),
                    request.processTypes
                );
            }
            await _updateDocument(
                delegatedOrganizationIds,
                request.documentReferenceId,
                request.document
            );
            await loadData();
        } catch (e: any) {
            console.log('Error while updating scope certificate', e);
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

    const updateMaterialCertificate = async (request: MaterialCertificateRequest) => {
        if (!certificateManagerService || !detailedCertificate) return;

        try {
            dispatch(addLoadingMessage(CERTIFICATE_MESSAGE.UPDATE.LOADING));
            const delegatedOrganizationIds: number[] = organizationId === 0 ? [1] : [0];

            if (_areFieldsChanged(request, ['materialId'])) {
                const roleProof = await getProof();
                await certificateManagerService.updateMaterialCertificate(
                    roleProof,
                    detailedCertificate.certificate.id,
                    request.assessmentStandard,
                    request.assessmentAssuranceLevel,
                    request.documentReferenceId,
                    request.materialId
                );
            }
            await _updateDocument(
                delegatedOrganizationIds,
                request.documentReferenceId,
                request.document
            );
            await loadData();
        } catch (e: any) {
            console.log('Error while updating material certificate', e);
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
