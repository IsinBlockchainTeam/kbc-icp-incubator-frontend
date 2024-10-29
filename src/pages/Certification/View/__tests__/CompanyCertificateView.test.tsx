import { useSigner } from '@/providers/SignerProvider';
import { useNavigate } from 'react-router-dom';
import { useEthEnumerable } from '@/providers/entities/EthEnumerableProvider';
import { DetailedCertificate, useEthCertificate } from '@/providers/entities/EthCertificateProvider';
import { CertificateDocumentType, CertificateType, CompanyCertificate, DocumentEvaluationStatus } from '@kbc-lib/coffee-trading-management-lib';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { CompanyCertificateView } from '@/pages/Certification/View/CompanyCertificateView';
import { FormElement, FormElementType, GenericForm } from '@/components/GenericForm/GenericForm';
import dayjs from 'dayjs';

jest.mock('@/providers/SignerProvider');
jest.mock('react-router-dom');
jest.mock('@/providers/entities/EthEnumerableProvider');
jest.mock('@/providers/entities/EthCertificateProvider');
jest.mock('@/components/GenericForm/GenericForm');

describe('CompanyCertificateNew', () => {
    const signer = { _address: '0x123' };
    const navigate = jest.fn();
    const assessmentStandards = ['assessmentStandard'];
    const updateCompanyCertificate = jest.fn();
    const detailedCertificate: DetailedCertificate = {
        certificate: new CompanyCertificate(
            1,
            'issuer',
            'subject',
            'assessmentStandard',
            { id: 1, documentType: CertificateDocumentType.CERTIFICATE_OF_CONFORMITY },
            DocumentEvaluationStatus.NOT_EVALUATED,
            CertificateType.COMPANY,
            new Date().getTime(),
            new Date().getTime(),
            new Date(new Date().setDate(new Date().getDate() + 1)).getTime()
        ),
        document: {
            filename: 'file.pdf',
            fileType: 'application/pdf',
            documentReferenceId: '123456',
            fileContent: new Uint8Array()
        }
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
        (useEthEnumerable as jest.Mock).mockReturnValue({ assessmentStandards });
        (useEthCertificate as jest.Mock).mockReturnValue({ updateCompanyCertificate });
    });

    it('should render correctly', async () => {
        render(
            <CompanyCertificateView detailedCertificate={detailedCertificate} commonElements={commonElements} editElements={[]} disabled={true} />
        );

        expect(screen.getByText('Company Certificate')).toBeInTheDocument();

        expect(GenericForm).toHaveBeenCalled();
        expect((GenericForm as jest.Mock).mock.calls[0][0].elements).toHaveLength(commonElements.length + 9);
        expect((GenericForm as jest.Mock).mock.calls[0][0].submittable).toBeFalsy();
    });

    it('onSubmit', async () => {
        render(
            <CompanyCertificateView commonElements={commonElements} editElements={[]} disabled={false} detailedCertificate={detailedCertificate} />
        );
        const values = {
            issuer: 'issuer',
            assessmentStandard: assessmentStandards[0],
            document: new File([new Blob(['document'])], 'example.txt', {
                type: 'application/pdf'
            }),
            documentType: 'documentType',
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
            document: {
                filename: values.document.name,
                fileType: values.document.type,
                fileContent: new Uint8Array(await new Response(values.document).arrayBuffer())
            },
            documentType: values.documentType,
            documentReferenceId: values.documentReferenceId,
            validFrom: dayjs(values.validFrom).unix(),
            validUntil: dayjs(values.validUntil).unix()
        });
    });
});
