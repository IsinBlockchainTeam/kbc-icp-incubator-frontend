import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CertificationsModal, CertificationsModalProps } from '../CertificationsModal';
import { useCertification } from '@/providers/entities/icp/CertificationProvider';
import {
    ICPAssessmentReferenceStandard,
    ICPCertificateDocumentInfo,
    ICPCertificateDocumentType,
    EvaluationStatus,
    ICPBaseCertificate
} from '@kbc-lib/coffee-trading-management-lib';
import { createDownloadWindow } from '@/utils/page';
import { CertificateDocumentNames } from '@/constants/certificationDocument';

jest.mock('@/providers/entities/icp/CertificationProvider');
jest.mock('@/utils/page');

describe('CertificationsModal', () => {
    const mockGetDocument = jest.fn();
    const mockCreateDownloadWindow = createDownloadWindow as jest.Mock;
    const mockOnClose = jest.fn();

    beforeEach(() => {
        (useCertification as jest.Mock).mockReturnValue({
            getDocument: mockGetDocument
        });
        jest.clearAllMocks();
    });

    const defaultProps: CertificationsModalProps = {
        open: true,
        title: 'Certifications',
        certifications: [
            {
                id: 1,
                assessmentReferenceStandard: {
                    name: 'ISO 9001',
                    logoUrl: 'https://via.placeholder.com/50',
                    siteUrl: 'https://example.com'
                } as ICPAssessmentReferenceStandard,
                issueDate: new Date(),
                issuer: 'Certifier A',
                assessmentAssuranceLevel: 'Third party',
                evaluationStatus: EvaluationStatus.NOT_EVALUATED,
                document: {
                    documentType: ICPCertificateDocumentType.CERTIFICATE_OF_CONFORMITY,
                    metadata: {
                        filename: 'cert-123.pdf',
                        fileType: 'application/pdf'
                    }
                } as ICPCertificateDocumentInfo
            } as ICPBaseCertificate
        ],
        onClose: mockOnClose
    };

    it('should render the modal', () => {
        render(<CertificationsModal {...defaultProps} />);

        expect(screen.getByText(defaultProps.title)).toBeInTheDocument();
        expect(screen.getByText(CertificateDocumentNames[defaultProps.certifications[0].document.documentType as ICPCertificateDocumentType]));
        expect(screen.getByText(defaultProps.certifications[0].assessmentReferenceStandard.name)).toBeInTheDocument();
        expect(screen.getByText(`Issue Date: ${new Date(defaultProps.certifications[0].issueDate).toLocaleDateString()}`)).toBeInTheDocument();
        expect(screen.getByText(`Certifier: ${defaultProps.certifications[0].issuer}`)).toBeInTheDocument();
        expect(screen.getByText(`Assurance Level: ${defaultProps.certifications[0].assessmentAssuranceLevel}`)).toBeInTheDocument();
        expect(screen.getByText(defaultProps.certifications[0].evaluationStatus)).toBeInTheDocument();
    });

    it('should calls onClose when the modal is closed', () => {
        render(<CertificationsModal {...defaultProps} />);
        const closeButton = screen.getByRole('button', { name: /close/i });

        fireEvent.click(closeButton);
        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('should opens the assessment reference standard URL when avatar is clicked', () => {
        render(<CertificationsModal {...defaultProps} />);
        const avatar = screen.getByAltText(`Avatar for ${defaultProps.certifications[0].assessmentReferenceStandard.name}`);

        Object.defineProperty(window, 'open', { value: jest.fn(), writable: true });
        fireEvent.click(avatar);

        expect(window.open).toHaveBeenCalledWith(defaultProps.certifications[0].assessmentReferenceStandard.siteUrl, '_blank');
    });

    it('should downloads the certification document when the download button is clicked', async () => {
        mockGetDocument.mockResolvedValueOnce({
            fileContent: new Uint8Array([1, 2, 3])
        });

        render(<CertificationsModal {...defaultProps} />);
        const downloadButton = screen.getByRole('button', { name: /download/i });

        fireEvent.click(downloadButton);

        await waitFor(() => {
            expect(mockGetDocument).toHaveBeenCalledWith(1);
        });
        expect(mockCreateDownloadWindow).toHaveBeenCalledWith(
            new Blob([new Uint8Array([1, 2, 3])]),
            defaultProps.certifications[0].document.metadata.filename
        );
    });

    it('should renders the correct document type as a tag', () => {
        render(<CertificationsModal {...defaultProps} />);
        expect(screen.getByText(CertificateDocumentNames[defaultProps.certifications[0].document.documentType])).toBeInTheDocument();
    });
});
