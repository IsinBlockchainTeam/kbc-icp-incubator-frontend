import { render, screen } from '@testing-library/react';
import React from 'react';
import { FormElementType } from '@/components/GenericForm/GenericForm';
import {
    ICPCertificateDocumentType,
    ICPBaseCertificate,
    EvaluationStatus,
    ICPCertificateType,
    ICPCompanyCertificate,
    ICPScopeCertificate,
    ICPMaterialCertificate,
    Material,
    ProductCategory
} from '@kbc-lib/coffee-trading-management-lib';
import { CertificateView } from '@/pages/Certification/View/CertificateView';
import { CompanyCertificateView } from '@/pages/Certification/View/CompanyCertificateView';
import { ScopeCertificateView } from '@/pages/Certification/View/ScopeCertificateView';
import { MaterialCertificateView } from '@/pages/Certification/View/MaterialCertificateView';
import { DetailedCertificate, useCertification } from '@/providers/icp/CertificationProvider';

jest.mock('react-router-dom');
jest.mock('@/pages/Certification/View/CompanyCertificateView');
jest.mock('@/pages/Certification/View/ScopeCertificateView');
jest.mock('@/pages/Certification/View/MaterialCertificateView');
jest.mock('@/providers/icp/CertificationProvider');

describe('CertificateView', () => {
    const detailedBaseCertificate: DetailedCertificate = {
        certificate: new ICPBaseCertificate(
            1,
            'issuer',
            'subject',
            'uploadedBy',
            'assessmentStandard',
            'assessmentAssuranceLevel',
            {
                referenceId: '123456',
                documentType: ICPCertificateDocumentType.PRODUCTION_FACILITY_LICENSE,
                externalUrl: 'url',
                metadata: { filename: 'file.pdf', fileType: 'application/pdf' }
            },
            EvaluationStatus.NOT_EVALUATED,
            ICPCertificateType.COMPANY,
            new Date()
        ),
        documentContent: new Uint8Array()
    };

    it('should shows no specific components if detailed certificate is not found', async () => {
        (useCertification as jest.Mock).mockReturnValue({ detailedCertificate: null });
        render(<CertificateView />);
        expect(CompanyCertificateView).not.toHaveBeenCalled();
        expect(ScopeCertificateView).not.toHaveBeenCalled();
        expect(MaterialCertificateView).not.toHaveBeenCalled();
        expect(screen.getByText('No certificate found')).toBeInTheDocument();
    });

    describe('should render certificate page based on type', () => {
        const commonElements = [
            {
                type: FormElementType.TITLE,
                span: 24,
                label: 'Actors'
            },
            {
                type: FormElementType.INPUT,
                span: 12,
                name: 'subject',
                label: 'Subject',
                required: true,
                defaultValue: detailedBaseCertificate.certificate.subject,
                disabled: true
            },
            {
                type: FormElementType.INPUT,
                span: 12,
                name: 'issuer',
                label: 'Certifier',
                required: true,
                defaultValue: detailedBaseCertificate.certificate.issuer,
                disabled: true
            }
        ];
        // TODO: expect.any(Function) does not work
        // const editElements: FormElement[] = [
        //     {
        //         type: FormElementType.BUTTON,
        //         span: 24,
        //         name: 'back',
        //         label: (
        //             <div>
        //                 Back <RollbackOutlined />
        //             </div>
        //         ),
        //         buttonType: 'primary',
        //         hidden: true,
        //         onClick: expect.any(Function),
        //         resetFormValues: true
        //     },
        //     {
        //         type: FormElementType.BUTTON,
        //         span: 24,
        //         name: 'edit',
        //         label: (
        //             <div>
        //                 Edit <EditOutlined style={{ fontSize: 'large' }} />
        //             </div>
        //         ),
        //         buttonType: 'primary',
        //         hidden: false,
        //         onClick: expect.any(Function)
        //     }
        // ];

        it('should render company certificate view', async () => {
            const detailedCertificate: DetailedCertificate = {
                certificate: new ICPCompanyCertificate(
                    detailedBaseCertificate.certificate.id,
                    detailedBaseCertificate.certificate.issuer,
                    detailedBaseCertificate.certificate.subject,
                    detailedBaseCertificate.certificate.uploadedBy,
                    detailedBaseCertificate.certificate.assessmentStandard,
                    detailedBaseCertificate.certificate.assessmentAssuranceLevel,
                    detailedBaseCertificate.certificate.document,
                    detailedBaseCertificate.certificate.evaluationStatus,
                    ICPCertificateType.COMPANY,
                    detailedBaseCertificate.certificate.issueDate,
                    new Date(),
                    new Date(new Date().setDate(new Date().getDate() + 1))
                ),
                documentContent: detailedBaseCertificate.documentContent
            };
            (useCertification as jest.Mock).mockReturnValue({ detailedCertificate });

            render(<CertificateView />);
            expect(CompanyCertificateView).toHaveBeenCalled();
            expect(CompanyCertificateView).toHaveBeenCalledWith(
                {
                    commonElements,
                    editElements: expect.any(Array),
                    detailedCertificate,
                    disabled: true
                },
                {}
            );
        });

        it('should render scope certificate view', async () => {
            const detailedCertificate: DetailedCertificate = {
                certificate: new ICPScopeCertificate(
                    detailedBaseCertificate.certificate.id,
                    detailedBaseCertificate.certificate.issuer,
                    detailedBaseCertificate.certificate.subject,
                    detailedBaseCertificate.certificate.uploadedBy,
                    detailedBaseCertificate.certificate.assessmentStandard,
                    detailedBaseCertificate.certificate.assessmentAssuranceLevel,
                    detailedBaseCertificate.certificate.document,
                    detailedBaseCertificate.certificate.evaluationStatus,
                    ICPCertificateType.SCOPE,
                    detailedBaseCertificate.certificate.issueDate,
                    ['process1', 'process2'],
                    new Date(),
                    new Date(new Date().setDate(new Date().getDate() + 1))
                ),
                documentContent: detailedBaseCertificate.documentContent
            };
            (useCertification as jest.Mock).mockReturnValue({ detailedCertificate });

            render(<CertificateView />);
            expect(ScopeCertificateView).toHaveBeenCalled();
            expect(ScopeCertificateView).toHaveBeenCalledWith(
                {
                    commonElements,
                    editElements: expect.any(Array),
                    detailedCertificate,
                    disabled: true
                },
                {}
            );
        });

        it('should render material certificate view', async () => {
            const detailedCertificate: DetailedCertificate = {
                certificate: new ICPMaterialCertificate(
                    detailedBaseCertificate.certificate.id,
                    detailedBaseCertificate.certificate.issuer,
                    detailedBaseCertificate.certificate.subject,
                    detailedBaseCertificate.certificate.uploadedBy,
                    detailedBaseCertificate.certificate.assessmentStandard,
                    detailedBaseCertificate.certificate.assessmentAssuranceLevel,
                    detailedBaseCertificate.certificate.document,
                    detailedBaseCertificate.certificate.evaluationStatus,
                    ICPCertificateType.MATERIAL,
                    detailedBaseCertificate.certificate.issueDate,
                    new Material(1, new ProductCategory(1, 'category', 80, 'description'))
                ),
                documentContent: detailedBaseCertificate.documentContent
            };
            (useCertification as jest.Mock).mockReturnValue({ detailedCertificate });

            render(<CertificateView />);
            expect(MaterialCertificateView).toHaveBeenCalled();
            expect(MaterialCertificateView).toHaveBeenCalledWith(
                {
                    commonElements,
                    editElements: expect.any(Array),
                    detailedCertificate,
                    disabled: true
                },
                {}
            );
        });
    });
});
