import { useSigner } from '@/providers/auth/SignerProvider';
import { useNavigate } from 'react-router-dom';
import { EvaluationStatus, ICPCertificateDocumentType, ICPCertificateType, ICPCompanyCertificate } from '@kbc-lib/coffee-trading-management-lib';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { CompanyCertificateView } from '@/pages/Certification/View/CompanyCertificateView';
import { FormElement, FormElementType, GenericForm } from '@/components/GenericForm/GenericForm';
import dayjs from 'dayjs';
import { DetailedCertificate, useCertification } from '@/providers/entities/icp/CertificationProvider';
import { useEnumeration } from '@/providers/entities/icp/EnumerationProvider';

jest.mock('@/providers/auth/SignerProvider');
jest.mock('react-router-dom');
jest.mock('@/providers/entities/icp/EnumerationProvider');
jest.mock('@/providers/entities/icp/CertificationProvider');
jest.mock('@/components/GenericForm/GenericForm');

describe('CompanyCertificateView', () => {
    const signer = { _address: '0x123' };
    const navigate = jest.fn();
    const assessmentStandards = ['assessmentStandard'];
    const assessmentAssuranceLevels = ['assessmentAssuranceLevel'];
    const updateCompanyCertificate = jest.fn();
    const detailedCertificate: DetailedCertificate = {
        certificate: new ICPCompanyCertificate(
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
            new Date(),
            new Date(),
            new Date(new Date().setDate(new Date().getDate() + 1))
        ),
        documentContent: new Uint8Array()
    };
    const commonElements: FormElement[] = [
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
            defaultValue: detailedCertificate.certificate.subject,
            disabled: true
        },
        {
            type: FormElementType.INPUT,
            span: 12,
            name: 'issuer',
            label: 'Certifier',
            required: true,
            defaultValue: detailedCertificate.certificate.issuer,
            disabled: true
        }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        (useSigner as jest.Mock).mockReturnValue({ signer });
        (useNavigate as jest.Mock).mockReturnValue(navigate);
        (useEnumeration as jest.Mock).mockReturnValue({ assessmentStandards, assessmentAssuranceLevels });
        (useCertification as jest.Mock).mockReturnValue({ updateCompanyCertificate });
    });

    it('should render correctly', async () => {
        render(
            <CompanyCertificateView detailedCertificate={detailedCertificate} commonElements={commonElements} editElements={[]} disabled={true} />
        );

        expect(screen.getByText('Company Certificate')).toBeInTheDocument();

        expect(GenericForm).toHaveBeenCalled();
        expect((GenericForm as jest.Mock).mock.calls[0][0].elements).toHaveLength(commonElements.length + 10);
        expect((GenericForm as jest.Mock).mock.calls[0][0].submittable).toBeFalsy();
    });

    it('onSubmit', async () => {
        render(
            <CompanyCertificateView commonElements={commonElements} editElements={[]} disabled={false} detailedCertificate={detailedCertificate} />
        );
        const values = {
            issuer: 'issuer',
            assessmentStandard: assessmentStandards[0],
            assessmentAssuranceLevel: assessmentAssuranceLevels[0],
            document: new File([new Blob(['document'])], 'example.txt', {
                type: 'application/pdf'
            }),
            documentType: ICPCertificateDocumentType.CERTIFICATE_OF_CONFORMITY,
            documentReferenceId: 'documentReferenceId',
            validFrom: new Date(),
            validUntil: new Date(new Date().setDate(new Date().getDate() + 1))
        };
        await (GenericForm as jest.Mock).mock.calls[0][0].onSubmit(values);

        expect(updateCompanyCertificate).toHaveBeenCalled();
        expect(updateCompanyCertificate).toHaveBeenCalledWith({
            issuer: values.issuer,
            subject: signer._address,
            assessmentStandard: values.assessmentStandard,
            assessmentAssuranceLevel: values.assessmentAssuranceLevel,
            document: {
                filename: values.document.name,
                fileType: values.document.type,
                fileContent: new Uint8Array(await new Response(values.document).arrayBuffer()),
                documentType: values.documentType,
                referenceId: values.documentReferenceId
            },
            validFrom: dayjs(values.validFrom).unix(),
            validUntil: dayjs(values.validUntil).unix()
        });
    });
});
