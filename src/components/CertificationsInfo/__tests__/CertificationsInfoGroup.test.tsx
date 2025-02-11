import React from 'react';
import { act, render } from '@testing-library/react';
import { CertificationsInfoGroup } from '@/components/CertificationsInfo/CertificationsInfoGroup';
import { useCertification } from '@/providers/entities/icp/CertificationProvider';
import {
    EvaluationStatus,
    ICPAssessmentReferenceStandard,
    ICPBaseCertificate,
    ICPCertificateDocumentInfo,
    ICPCertificateDocumentType
} from '@kbc-lib/coffee-trading-management-lib';
import { Space } from 'antd';
import { renderChildren } from '@/__testUtils__/renderChildren';
import { CertificationBadge } from '../CertificationBadge';


jest.mock('@/providers/entities/icp/CertificationProvider');
jest.mock('antd', () => ({
    ...jest.requireActual('antd'),
    Space: jest.fn(),
}));
jest.mock('../CertificationBadge');


describe('CertificationsInfoGroup', () => {
    const mockedUseCertification = {
        getCompanyCertificates: jest.fn()
    };

    const mockCertificates: ICPBaseCertificate[] = [
        {
            id: 1,
            issueDate: new Date(),
            issuer: 'Certifier A',
            assessmentAssuranceLevel: 'Third party',
            assessmentReferenceStandard: {
                name: 'ISO 9001',
                logoUrl: 'https://via.placeholder.com/50',
                siteUrl: 'https://example.com'
            } as ICPAssessmentReferenceStandard,
            evaluationStatus: EvaluationStatus.NOT_EVALUATED,
            document: {
                documentType: ICPCertificateDocumentType.CERTIFICATE_OF_CONFORMITY,
                metadata: {
                    filename: 'cert-123.pdf',
                    fileType: 'application/pdf'
                }
            } as ICPCertificateDocumentInfo
        } as ICPBaseCertificate,
        {
            id: 2,
            issueDate: new Date(),
            issuer: 'Certifier B',
            assessmentAssuranceLevel: 'Third party',
            assessmentReferenceStandard: {
                name: 'BCorp',
                logoUrl: 'https://via.placeholder.com/10',
                siteUrl: 'https://example.com'
            } as ICPAssessmentReferenceStandard,
            evaluationStatus: EvaluationStatus.NOT_EVALUATED,
            document: {
                documentType: ICPCertificateDocumentType.PRODUCTION_REPORT,
                metadata: {
                    filename: 'cert-123456.pdf',
                    fileType: 'application/pdf'
                }
            } as ICPCertificateDocumentInfo
        } as ICPBaseCertificate
    ];

    beforeEach(() => {
        (useCertification as jest.Mock).mockReturnValue(mockedUseCertification);
        (Space as unknown as jest.Mock).mockImplementation(renderChildren);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should renders the component and loads company certificates', async () => {
        mockedUseCertification.getCompanyCertificates.mockResolvedValue(mockCertificates);

        await act(async () => render(<CertificationsInfoGroup company="Test Company" materialId={1} />));

        expect(mockedUseCertification.getCompanyCertificates).toHaveBeenCalledWith('Test Company');
        expect(CertificationBadge).toHaveBeenCalledTimes(2);
        expect(CertificationBadge).toHaveBeenNthCalledWith(2,
            {
                certType: 'company',
                certs: mockCertificates,
                color: '#1890ff',
                icon: expect.anything()
            },
            {}
        );
    });
});
