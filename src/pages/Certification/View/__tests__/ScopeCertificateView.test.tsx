import { useSigner } from '@/providers/auth/SignerProvider';
import { useNavigate } from 'react-router-dom';
import {
    EvaluationStatus,
    ICPAssessmentReferenceStandard,
    ICPCertificateDocumentType,
    ICPCertificateType,
    ICPScopeCertificate
} from '@kbc-lib/coffee-trading-management-lib';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { FormElement, FormElementType, GenericForm } from '@/components/GenericForm/GenericForm';
import dayjs from 'dayjs';
import { ScopeCertificateView } from '@/pages/Certification/View/ScopeCertificateView';
import { DetailedCertificate, useCertification } from '@/providers/entities/icp/CertificationProvider';
import { useEnumeration } from '@/providers/entities/icp/EnumerationProvider';

jest.mock('@/providers/auth/SignerProvider');
jest.mock('react-router-dom');
jest.mock('@/providers/entities/icp/EnumerationProvider');
jest.mock('@/providers/entities/icp/CertificationProvider');
jest.mock('@/components/GenericForm/GenericForm');

describe('ScopeCertificateView', () => {
    const signer = { _address: '0x123' };
    const navigate = jest.fn();
    const assessmentReferenceStandards = [{ id: 1 } as ICPAssessmentReferenceStandard];
    const assessmentAssuranceLevels = ['assessmentAssuranceLevel'];
    const processTypes = ['processType'];
    const updateScopeCertificate = jest.fn();
    const detailedCertificate: DetailedCertificate = {
        certificate: new ICPScopeCertificate(
            1,
            'issuer',
            'subject',
            'uploadedBy',
            assessmentReferenceStandards[0],
            assessmentAssuranceLevels[0],
            {
                referenceId: '123456',
                documentType: ICPCertificateDocumentType.PRODUCTION_FACILITY_LICENSE,
                externalUrl: 'url',
                metadata: { filename: 'file.pdf', fileType: 'application/pdf' }
            },
            EvaluationStatus.NOT_EVALUATED,
            ICPCertificateType.SCOPE,
            new Date(),
            processTypes,
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
        (useEnumeration as jest.Mock).mockReturnValue({ assessmentReferenceStandards, assessmentAssuranceLevels, processTypes });
        (useCertification as jest.Mock).mockReturnValue({
            updateScopeCertificate
        });
    });

    it('should render correctly', async () => {
        render(<ScopeCertificateView detailedCertificate={detailedCertificate} commonElements={commonElements} editElements={[]} disabled={true} />);

        expect(screen.getByText('Scope Certificate')).toBeInTheDocument();

        expect(GenericForm).toHaveBeenCalled();
        expect((GenericForm as jest.Mock).mock.calls[0][0].elements).toHaveLength(commonElements.length + 11);
        expect((GenericForm as jest.Mock).mock.calls[0][0].submittable).toBeFalsy();
    });

    it('onSubmit', async () => {
        render(<ScopeCertificateView commonElements={commonElements} editElements={[]} disabled={false} detailedCertificate={detailedCertificate} />);
        const values = {
            issuer: 'issuer',
            assessmentReferenceStandard: assessmentReferenceStandards[0].id,
            assessmentAssuranceLevel: assessmentAssuranceLevels[0],
            document: new File([new Blob(['document'])], 'example.txt', {
                type: 'application/pdf'
            }),
            documentType: ICPCertificateDocumentType.CERTIFICATE_OF_CONFORMITY,
            documentReferenceId: 'documentReferenceId',
            validFrom: new Date(),
            validUntil: new Date(new Date().setDate(new Date().getDate() + 1)),
            processTypes: [processTypes[0]]
        };
        await (GenericForm as jest.Mock).mock.calls[0][0].onSubmit(values);

        expect(updateScopeCertificate).toHaveBeenCalled();
        expect(updateScopeCertificate).toHaveBeenCalledWith({
            issuer: values.issuer,
            subject: signer._address,
            assessmentReferenceStandardId: values.assessmentReferenceStandard,
            assessmentAssuranceLevel: values.assessmentAssuranceLevel,
            document: {
                filename: values.document.name,
                fileType: values.document.type,
                fileContent: new Uint8Array(await new Response(values.document).arrayBuffer()),
                documentType: values.documentType,
                referenceId: values.documentReferenceId
            },
            validFrom: dayjs(values.validFrom).unix(),
            validUntil: dayjs(values.validUntil).unix(),
            processTypes: values.processTypes
        });
    });
});
