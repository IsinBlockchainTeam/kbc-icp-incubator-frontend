import React from 'react';
import { JsonRpcSigner } from '@ethersproject/providers';
import { act, renderHook } from '@testing-library/react';
import { useSiweIdentity } from '@/providers/auth/SiweIdentityProvider';
import { checkAndGetEnvironmentVariable } from '@/utils/env';
import { useCallHandler } from '@/providers/errors/CallHandlerProvider';
import { Typography } from 'antd';
import { RawCertificationProvider, useRawCertification } from '../RawCertificationProvider';
import { CertificateDocumentType, CertificateType } from '@kbc-lib/coffee-trading-management-lib/dist/entities/Certificate';
import { EvaluationStatus, ICPBaseCertificate, ICPCertificationService } from '@kbc-lib/coffee-trading-management-lib';
import { useSigner } from '@/providers/auth/SignerProvider';
import { useICP } from '@/providers/storage/IcpStorageProvider';

jest.mock('@kbc-lib/coffee-trading-management-lib');
jest.mock('@/providers/auth/SiweIdentityProvider');
jest.mock('@/providers/auth/SignerProvider');
jest.mock('@/providers/errors/CallHandlerProvider');
jest.mock('@/providers/storage/IcpStorageProvider');
jest.mock('@/utils/env');
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
describe('RawCertificationProvider', () => {
    const signer = { _address: '0x123' } as JsonRpcSigner;
    const certificationServiceMethods = { getBaseCertificatesInfoBySubject: jest.fn() }
    const handleICPCall = jest.fn();
    const fileDriver = jest.fn();


    const rawCertificates = [{
        id: 1,
        issuer: 'issuer',
        subject: 'subject',
        uploadedBy: 'uploadedBy',
        assessmentReferenceStandard: { id: 1, name: 'standard1', sustainabilityCriteria: 'criteria', logoUrl: 'http://logourl', siteUrl: 'http://siteurl' },
        assessmentAssuranceLevel: 'level1',
        document: { referenceId: '1', documentType: CertificateDocumentType.CERTIFICATE_OF_CONFORMITY, externalUrl: 'http://externalUrl', metadata: { filename: 'filename', fileType: 'fileType' } },
        evaluationStatus: EvaluationStatus.APPROVED,
        certificateType: CertificateType.COMPANY,
        issueDate: new Date()
    } as ICPBaseCertificate]

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.spyOn(console, 'log').mockImplementation(jest.fn());

        (useSiweIdentity as jest.Mock).mockReturnValue({ identity: 'identity' });
        (checkAndGetEnvironmentVariable as jest.Mock).mockReturnValue('canisterId');
        (useCallHandler as jest.Mock).mockReturnValue({ handleICPCall });
        (useSigner as jest.Mock).mockReturnValue({ signer });
        (useICP as jest.Mock).mockReturnValue({ fileDriver });


        certificationServiceMethods.getBaseCertificatesInfoBySubject.mockResolvedValue(rawCertificates);
        (ICPCertificationService as jest.Mock).mockImplementation(() => ({ ...certificationServiceMethods }));
    });

    it('should throw error if hook is used outside the provider', async () => {
        expect(() => renderHook(() => useRawCertification())).toThrow();
    });

    it('should render error message if identity is not initialized', async () => {
        (useSiweIdentity as jest.Mock).mockReturnValue({ identity: null });
        const mockTypographyText = Typography.Text as unknown as jest.Mock;
        renderHook(() => useRawCertification(), {
            wrapper: RawCertificationProvider
        });
        expect(mockTypographyText).toHaveBeenCalledTimes(1);
        expect(mockTypographyText).toHaveBeenCalledWith(
            expect.objectContaining({
                children: 'Siwe identity not initialized'
            }),
            {}
        );
    });

    it('should load data', async () => {
        handleICPCall.mockImplementation(async (callback) => {
            await callback();
        });
        const { result } = renderHook(() => useRawCertification(), {
            wrapper: RawCertificationProvider
        });
        await act(async () => {
            await result.current.loadData();
        });

        expect(handleICPCall).toHaveBeenCalledTimes(1);
        expect(certificationServiceMethods.getBaseCertificatesInfoBySubject).toHaveBeenCalledTimes(1);
        expect(certificationServiceMethods.getBaseCertificatesInfoBySubject).toHaveBeenCalledWith(signer._address);

        expect(result.current.dataLoaded).toBe(true);
        expect(result.current.rawCertificates).toEqual(rawCertificates);
    });

});

