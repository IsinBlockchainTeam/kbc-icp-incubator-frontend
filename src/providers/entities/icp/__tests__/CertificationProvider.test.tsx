import React from 'react';
import { JsonRpcSigner } from '@ethersproject/providers';
import { act, renderHook } from '@testing-library/react';
import { ICPBaseCertificate, ICPCertificateDocumentType, ICPCertificateType, ICPCertificationService } from '@kbc-lib/coffee-trading-management-lib';
import { CertificationProvider, CompanyCertificateRequest, MaterialCertificateRequest, ScopeCertificateRequest, useCertification } from '@/providers/entities/icp/CertificationProvider';
import { useSiweIdentity } from '@/providers/auth/SiweIdentityProvider';
import { checkAndGetEnvironmentVariable } from '@/utils/env';
import { useCallHandler } from '@/providers/errors/CallHandlerProvider';
import { Typography } from 'antd';
import { NotificationType, openNotification } from '@/utils/notification';
import { CERTIFICATION_MESSAGE } from '@/constants/message';
import { NOTIFICATION_DURATION } from '@/constants/notification';
import { useParams } from 'react-router-dom';
import { useSigner } from '@/providers/auth/SignerProvider';
import { UserInfoState } from '@/redux/reducers/userInfoSlice';
import { useSelector } from 'react-redux';
import { useRawCertification } from '../RawCertificationProvider';
import { getICPCanisterURL } from '@/utils/icp';
import { useICP } from '@/providers/storage/IcpStorageProvider';

jest.mock('@kbc-lib/coffee-trading-management-lib');
jest.mock('react-router-dom');
jest.mock('react-redux');
jest.mock('@/utils/notification');
jest.mock('@/providers/auth/SiweIdentityProvider');
jest.mock('@/providers/auth/SignerProvider');
jest.mock('@/providers/errors/CallHandlerProvider');
jest.mock('@/providers/entities/icp/RawCertificationProvider');
jest.mock('@/providers/storage/IcpStorageProvider');
jest.mock('@/utils/env');
jest.mock('@/utils/icp');
jest.mock('antd', () => {
    const originalModule = jest.requireActual('antd');
    return {
        ...originalModule,
        Typography: {
            ...originalModule.Typography,
            Text: jest.fn((props) => <span {...props} />)
        }
    };
});
describe('CertificationProvider', () => {
    const signer = { _address: '0x123' } as JsonRpcSigner;
    const userInfo = { companyClaims: { organizationId: '1' } } as UserInfoState;

    const certificationServiceMethods = {
        getCompanyCertificate: jest.fn(),
        getScopeCertificate: jest.fn(),
        getMaterialCertificate: jest.fn(),
        getDocument: jest.fn(),
        updateDocument: jest.fn(),
        registerCompanyCertificate: jest.fn(),
        registerScopeCertificate: jest.fn(),
        registerMaterialCertificate: jest.fn(),
        updateCompanyCertificate: jest.fn(),
        updateScopeCertificate: jest.fn(),
        updateMaterialCertificate: jest.fn(),
    }
    const handleICPCall = jest.fn();
    const loadCertificates = jest.fn();
    const fileDriver = jest.fn();

    const certificate = {} as ICPBaseCertificate;
    const documentFileContent = new Uint8Array([1, 2, 3]);
    const certificationId = 1;
    const canisterICPUrl = 'url';

    const baseCertificateRequest = {
        issuer: 'issuer',
        subject: 'subject',
        assessmentReferenceStandardId: 1,
        assessmentAssuranceLevel: 'level',
        document: {
            documentType: ICPCertificateDocumentType.CERTIFICATE_OF_CONFORMITY,
            referenceId: 'refId',
            filename: 'filename',
            fileType: 'fileType',
            fileContent: documentFileContent
        }
    };


    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.spyOn(console, 'log').mockImplementation(jest.fn());

        (useSiweIdentity as jest.Mock).mockReturnValue({ identity: 'identity' });
        (checkAndGetEnvironmentVariable as jest.Mock).mockReturnValue('canisterId');
        (useCallHandler as jest.Mock).mockReturnValue({ handleICPCall });
        (useParams as jest.Mock).mockReturnValue({ id: certificationId, type: Object.keys(ICPCertificateType).indexOf(ICPCertificateType.COMPANY).toString() });
        (useSigner as jest.Mock).mockReturnValue({ signer });
        (useSelector as jest.Mock).mockImplementation((fn) => fn({ userInfo }));
        (useRawCertification as jest.Mock).mockReturnValue({ loadData: loadCertificates });
        (useICP as jest.Mock).mockReturnValue({ fileDriver });

        certificationServiceMethods.getDocument.mockResolvedValue({ fileContent: documentFileContent });
        (ICPCertificationService as jest.Mock).mockImplementation(() => ({
            ...certificationServiceMethods
        }));
        (getICPCanisterURL as jest.Mock).mockReturnValue(canisterICPUrl);
    });

    it('should throw error if hook is used outside the provider', async () => {
        expect(() => renderHook(() => useCertification())).toThrow();
    });

    it('should render error message if identity is not initialized', async () => {
        (useSiweIdentity as jest.Mock).mockReturnValue({ identity: null });
        const mockTypographyText = Typography.Text as unknown as jest.Mock;
        renderHook(() => useCertification(), {
            wrapper: CertificationProvider
        });
        expect(mockTypographyText).toHaveBeenCalledTimes(1);
        expect(mockTypographyText).toHaveBeenCalledWith(
            expect.objectContaining({
                children: 'Siwe identity not initialized'
            }),
            {}
        );
    });

    it('should load certificate - company', async () => {
        handleICPCall.mockImplementation(async (callback) => {
            await callback();
        });
        certificationServiceMethods.getCompanyCertificate.mockResolvedValue(certificate);
        const { result } = renderHook(() => useCertification(), {
            wrapper: CertificationProvider
        });
        await act(async () => {
            await result.current.loadData();
        });

        expect(handleICPCall).toHaveBeenCalledTimes(1);
        expect(certificationServiceMethods.getCompanyCertificate).toHaveBeenCalledTimes(1);
        expect(certificationServiceMethods.getCompanyCertificate).toHaveBeenCalledWith(signer._address, certificationId);
        expect(certificationServiceMethods.getDocument).toHaveBeenCalledTimes(1);
        expect(certificationServiceMethods.getDocument).toHaveBeenCalledWith(certificationId);

        expect(result.current.dataLoaded).toBe(true);
        expect(result.current.detailedCertificate).toEqual({ certificate, documentContent: documentFileContent });
    });

    it('should load certificate - scope', async () => {
        (useParams as jest.Mock).mockReturnValue({ id: certificationId, type: Object.keys(ICPCertificateType).indexOf(ICPCertificateType.SCOPE).toString() });

        handleICPCall.mockImplementation(async (callback) => {
            await callback();
        });
        certificationServiceMethods.getScopeCertificate.mockResolvedValue(certificate);
        const { result } = renderHook(() => useCertification(), {
            wrapper: CertificationProvider
        });
        await act(async () => {
            await result.current.loadData();
        });

        expect(handleICPCall).toHaveBeenCalledTimes(1);
        expect(certificationServiceMethods.getScopeCertificate).toHaveBeenCalledTimes(1);
        expect(certificationServiceMethods.getScopeCertificate).toHaveBeenCalledWith(signer._address, certificationId);
        expect(certificationServiceMethods.getDocument).toHaveBeenCalledTimes(1);
        expect(certificationServiceMethods.getDocument).toHaveBeenCalledWith(certificationId);

        expect(result.current.dataLoaded).toBe(true);
        expect(result.current.detailedCertificate).toEqual({ certificate, documentContent: documentFileContent });
    });

    it('should load certificate - material', async () => {
        (useParams as jest.Mock).mockReturnValue({ id: certificationId, type: Object.keys(ICPCertificateType).indexOf(ICPCertificateType.MATERIAL).toString() });

        handleICPCall.mockImplementation(async (callback) => {
            await callback();
        });
        certificationServiceMethods.getMaterialCertificate.mockResolvedValue(certificate);
        const { result } = renderHook(() => useCertification(), {
            wrapper: CertificationProvider
        });
        await act(async () => {
            await result.current.loadData();
        });

        expect(handleICPCall).toHaveBeenCalledTimes(1);
        expect(certificationServiceMethods.getMaterialCertificate).toHaveBeenCalledTimes(1);
        expect(certificationServiceMethods.getMaterialCertificate).toHaveBeenCalledWith(signer._address, certificationId);
        expect(certificationServiceMethods.getDocument).toHaveBeenCalledTimes(1);
        expect(certificationServiceMethods.getDocument).toHaveBeenCalledWith(certificationId);

        expect(result.current.dataLoaded).toBe(true);
        expect(result.current.detailedCertificate).toEqual({ certificate, documentContent: documentFileContent });
    });

    it('should save a company certificate', async () => {
        const companyCertificateRequest: CompanyCertificateRequest = {
            ...baseCertificateRequest,
            validFrom: new Date().getTime(),
            validUntil: new Date().getTime(),
        };
        handleICPCall.mockImplementation(async (callback) => {
            await callback();
        });
        const { result } = renderHook(() => useCertification(), {
            wrapper: CertificationProvider
        });
        await act(async () => {
            await result.current.saveCompanyCertificate(companyCertificateRequest);
        });

        expect(handleICPCall).toHaveBeenCalledTimes(1);
        expect(certificationServiceMethods.registerCompanyCertificate).toHaveBeenCalledTimes(1);
        expect(certificationServiceMethods.registerCompanyCertificate).toHaveBeenCalledWith(
            companyCertificateRequest.issuer,
            companyCertificateRequest.subject,
            companyCertificateRequest.assessmentReferenceStandardId,
            companyCertificateRequest.assessmentAssuranceLevel,
            {
                referenceId: companyCertificateRequest.document.referenceId,
                documentType: companyCertificateRequest.document.documentType,
                filename: companyCertificateRequest.document.filename,
                fileType: companyCertificateRequest.document.fileType,
                fileContent: companyCertificateRequest.document.fileContent,
                storageConfig: {
                    urlStructure: { prefix: canisterICPUrl, organizationId: Number(userInfo.companyClaims.organizationId) },
                    resourceSpec: { name: companyCertificateRequest.document.filename, type: companyCertificateRequest.document.fileType },
                    delegatedOrganizationIds: [0]
                },
            },
            new Date(companyCertificateRequest.validFrom),
            new Date(companyCertificateRequest.validUntil),
        );
        expect(openNotification).toHaveBeenCalledTimes(1);
        expect(openNotification).toHaveBeenCalledWith('Success', CERTIFICATION_MESSAGE.SAVE.OK, NotificationType.SUCCESS, NOTIFICATION_DURATION);
        expect(loadCertificates).toHaveBeenCalledTimes(1);
    });

    it('should save a scope certificate', async () => {
        const scopeCertificateRequest: ScopeCertificateRequest = {
            ...baseCertificateRequest,
            validFrom: new Date().getTime(),
            validUntil: new Date().getTime(),
            processTypes: ['type1', 'type2']
        };
        handleICPCall.mockImplementation(async (callback) => {
            await callback();
        });
        const { result } = renderHook(() => useCertification(), {
            wrapper: CertificationProvider
        });
        await act(async () => {
            await result.current.saveScopeCertificate(scopeCertificateRequest);
        });

        expect(handleICPCall).toHaveBeenCalledTimes(1);
        expect(certificationServiceMethods.registerScopeCertificate).toHaveBeenCalledTimes(1);
        expect(certificationServiceMethods.registerScopeCertificate).toHaveBeenCalledWith(
            scopeCertificateRequest.issuer,
            scopeCertificateRequest.subject,
            scopeCertificateRequest.assessmentReferenceStandardId,
            scopeCertificateRequest.assessmentAssuranceLevel,
            {
                referenceId: scopeCertificateRequest.document.referenceId,
                documentType: scopeCertificateRequest.document.documentType,
                filename: scopeCertificateRequest.document.filename,
                fileType: scopeCertificateRequest.document.fileType,
                fileContent: scopeCertificateRequest.document.fileContent,
                storageConfig: {
                    urlStructure: { prefix: canisterICPUrl, organizationId: Number(userInfo.companyClaims.organizationId) },
                    resourceSpec: { name: scopeCertificateRequest.document.filename, type: scopeCertificateRequest.document.fileType },
                    delegatedOrganizationIds: [0]
                },
            },
            new Date(scopeCertificateRequest.validFrom),
            new Date(scopeCertificateRequest.validUntil),
            scopeCertificateRequest.processTypes
        );
        expect(openNotification).toHaveBeenCalledTimes(1);
        expect(openNotification).toHaveBeenCalledWith('Success', CERTIFICATION_MESSAGE.SAVE.OK, NotificationType.SUCCESS, NOTIFICATION_DURATION);
        expect(loadCertificates).toHaveBeenCalledTimes(1);
    });

    it('should save a material certificate', async () => {
        const materialCertificateRequest: MaterialCertificateRequest = {
            ...baseCertificateRequest,
            materialId: 123
        };
        handleICPCall.mockImplementation(async (callback) => {
            await callback();
        });
        const { result } = renderHook(() => useCertification(), {
            wrapper: CertificationProvider
        });
        await act(async () => {
            await result.current.saveMaterialCertificate(materialCertificateRequest);
        });

        expect(handleICPCall).toHaveBeenCalledTimes(1);
        expect(certificationServiceMethods.registerMaterialCertificate).toHaveBeenCalledTimes(1);
        expect(certificationServiceMethods.registerMaterialCertificate).toHaveBeenCalledWith(
            materialCertificateRequest.issuer,
            materialCertificateRequest.subject,
            materialCertificateRequest.assessmentReferenceStandardId,
            materialCertificateRequest.assessmentAssuranceLevel,
            {
                referenceId: materialCertificateRequest.document.referenceId,
                documentType: materialCertificateRequest.document.documentType,
                filename: materialCertificateRequest.document.filename,
                fileType: materialCertificateRequest.document.fileType,
                fileContent: materialCertificateRequest.document.fileContent,
                storageConfig: {
                    urlStructure: { prefix: canisterICPUrl, organizationId: Number(userInfo.companyClaims.organizationId) },
                    resourceSpec: { name: materialCertificateRequest.document.filename, type: materialCertificateRequest.document.fileType },
                    delegatedOrganizationIds: [0]
                },
            },
            materialCertificateRequest.materialId
        );
        expect(openNotification).toHaveBeenCalledTimes(1);
        expect(openNotification).toHaveBeenCalledWith('Success', CERTIFICATION_MESSAGE.SAVE.OK, NotificationType.SUCCESS, NOTIFICATION_DURATION);
        expect(loadCertificates).toHaveBeenCalledTimes(1);
    });
});

