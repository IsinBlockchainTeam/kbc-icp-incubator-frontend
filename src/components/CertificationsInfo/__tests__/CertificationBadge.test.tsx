import React from 'react';
import { act, render } from '@testing-library/react';
import { CertificationsInfoGroup } from '@/components/CertificationsInfo/CertificationsInfoGroup';
import {
    EvaluationStatus,
    ICPAssessmentReferenceStandard,
    ICPBaseCertificate,
    ICPCertificateDocumentInfo,
    ICPCertificateDocumentType
} from '@kbc-lib/coffee-trading-management-lib';
import { Badge, Space, Tooltip } from 'antd';
import { CertificationsModal } from '@/components/CertificationsInfo/CertificationsModal';
import { renderChildren } from '@/__testUtils__/renderChildren';
import { CertificationBadge } from '../CertificationBadge';


jest.mock('../CertificationsModal');
jest.mock('antd', () => ({
    ...jest.requireActual('antd'),
    Space: jest.fn(),
    Tooltip: jest.fn(),
    Badge: jest.fn()
}));



describe('CertificationBadge', () => {
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
    const BadgeMocked = Badge as unknown as jest.Mock;
    const CertificationsModalMocked = CertificationsModal as unknown as jest.Mock;
    const icon = <div />;


    beforeEach(() => {
        (Space as unknown as jest.Mock).mockImplementation(renderChildren);
        (Tooltip as unknown as jest.Mock).mockImplementation(renderChildren);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should renders the component and loads company certificates', async () => {
        render(<CertificationBadge certType="company" certs={mockCertificates} icon={icon} color="red" />);

        expect(CertificationsModalMocked).toHaveBeenCalled();
        expect(CertificationsModalMocked).toHaveBeenCalledWith(
            {
                open: false,
                title: '',
                certifications: [],
                onClose: expect.any(Function)
            },
            {}
        );
        expect(Tooltip).toHaveBeenCalledTimes(2);
        expect(Tooltip).toHaveBeenNthCalledWith(
            1,
            {
                title: `Company Certifications`,
                children: icon
            },
            {}
        );
        expect(Tooltip).toHaveBeenNthCalledWith(
            2,
            {
                title: mockCertificates.map((c) => c.assessmentReferenceStandard.name).join(', '),
                children: expect.anything()
            },
            {}
        );
        expect(BadgeMocked).toHaveBeenCalledTimes(1);
        expect(BadgeMocked.mock.calls[0][0].count).toEqual(mockCertificates.length);
    });

    it('opens the modal with the correct title and certifications when the badge is clicked', async () => {
        render(<CertificationBadge certType="scope" certs={mockCertificates} icon={icon} color="red" />);

        expect(CertificationsModalMocked).toHaveBeenCalledTimes(1);
        expect(CertificationsModalMocked).toHaveBeenNthCalledWith(1,
            {
                open: false,
                title: '',
                certifications: [],
                onClose: expect.any(Function)
            },
            {}
        );

        expect(BadgeMocked).toHaveBeenCalledTimes(1);
        act(() => {
            BadgeMocked.mock.calls[0][0].onClick();
        });
        expect(CertificationsModalMocked).toHaveBeenCalledTimes(2);
        expect(CertificationsModalMocked).toHaveBeenNthCalledWith(2,
            {
                open: true,
                title: 'Scope Certifications',
                certifications: mockCertificates,
                onClose: expect.any(Function)
            },
            {}
        );

    });

    it('should closes the modal when the close button is clicked', async () => {
        render(<CertificationBadge certType="company" certs={mockCertificates} icon={icon} color="red" />);
        act(() => {
            BadgeMocked.mock.calls[0][0].onClick();
        });
        expect(CertificationsModalMocked).toHaveBeenCalledTimes(2);
        expect(CertificationsModalMocked).toHaveBeenNthCalledWith(2,
            {
                open: true,
                title: 'Company Certifications',
                certifications: mockCertificates,
                onClose: expect.any(Function)
            },
            {}
        );

        act(() => {
            CertificationsModalMocked.mock.calls[1][0].onClose();
        });
        expect(CertificationsModalMocked).toHaveBeenCalledTimes(3);
        expect(CertificationsModalMocked).toHaveBeenNthCalledWith(3,
            {
                open: false,
                title: '',
                certifications: [],
                onClose: expect.any(Function)
            },
            {}
        );
    });
});
