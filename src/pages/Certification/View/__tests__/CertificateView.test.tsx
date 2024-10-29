import { render, screen } from '@testing-library/react';
import React from 'react';
import { FormElementType } from '@/components/GenericForm/GenericForm';
import { DetailedCertificate, useEthCertificate } from '@/providers/entities/EthCertificateProvider';
import {
    BaseCertificate,
    CertificateDocumentType,
    CertificateType,
    CompanyCertificate,
    DocumentEvaluationStatus,
    MaterialCertificate,
    ScopeCertificate
} from '@kbc-lib/coffee-trading-management-lib';
import { CertificateView } from '@/pages/Certification/View/CertificateView';
import { CompanyCertificateView } from '@/pages/Certification/View/CompanyCertificateView';
import { ScopeCertificateView } from '@/pages/Certification/View/ScopeCertificateView';
import { MaterialCertificateView } from '@/pages/Certification/View/MaterialCertificateView';

jest.mock('react-router-dom');
jest.mock('@/pages/Certification/View/CompanyCertificateView');
jest.mock('@/pages/Certification/View/ScopeCertificateView');
jest.mock('@/pages/Certification/View/MaterialCertificateView');
jest.mock('@/providers/entities/EthCertificateProvider');

describe('CertificateView', () => {
    const detailedBaseCertificate: DetailedCertificate = {
        certificate: new BaseCertificate(
            1,
            'issuer',
            'subject',
            'assessmentStandard',
            { id: 1, documentType: CertificateDocumentType.CERTIFICATE_OF_CONFORMITY },
            DocumentEvaluationStatus.NOT_EVALUATED,
            CertificateType.COMPANY,
            new Date().getTime()
        ),
        document: {
            filename: 'file.pdf',
            fileType: 'application/pdf',
            documentReferenceId: '123456',
            fileContent: new Uint8Array()
        }
    };

    it('should shows no specific components if detailed certificate is not found', async () => {
        (useEthCertificate as jest.Mock).mockReturnValue({ detailedCertificate: null });
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
                certificate: new CompanyCertificate(
                    detailedBaseCertificate.certificate.id,
                    detailedBaseCertificate.certificate.issuer,
                    detailedBaseCertificate.certificate.subject,
                    detailedBaseCertificate.certificate.assessmentStandard,
                    detailedBaseCertificate.certificate.document,
                    detailedBaseCertificate.certificate.evaluationStatus,
                    CertificateType.COMPANY,
                    detailedBaseCertificate.certificate.issueDate,
                    new Date().getTime(),
                    new Date(new Date().setDate(new Date().getDate() + 1)).getTime()
                ),
                document: detailedBaseCertificate.document
            };
            (useEthCertificate as jest.Mock).mockReturnValue({ detailedCertificate });

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
                certificate: new ScopeCertificate(
                    detailedBaseCertificate.certificate.id,
                    detailedBaseCertificate.certificate.issuer,
                    detailedBaseCertificate.certificate.subject,
                    detailedBaseCertificate.certificate.assessmentStandard,
                    detailedBaseCertificate.certificate.document,
                    detailedBaseCertificate.certificate.evaluationStatus,
                    CertificateType.SCOPE,
                    detailedBaseCertificate.certificate.issueDate,
                    ['process1', 'process2'],
                    new Date().getTime(),
                    new Date(new Date().setDate(new Date().getDate() + 1)).getTime()
                ),
                document: detailedBaseCertificate.document
            };
            (useEthCertificate as jest.Mock).mockReturnValue({ detailedCertificate });

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
                certificate: new MaterialCertificate(
                    detailedBaseCertificate.certificate.id,
                    detailedBaseCertificate.certificate.issuer,
                    detailedBaseCertificate.certificate.subject,
                    detailedBaseCertificate.certificate.assessmentStandard,
                    detailedBaseCertificate.certificate.document,
                    detailedBaseCertificate.certificate.evaluationStatus,
                    CertificateType.MATERIAL,
                    detailedBaseCertificate.certificate.issueDate,
                    1
                ),
                document: detailedBaseCertificate.document
            };
            (useEthCertificate as jest.Mock).mockReturnValue({ detailedCertificate });

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
