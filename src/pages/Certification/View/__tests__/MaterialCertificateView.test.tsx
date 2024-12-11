import { useSigner } from '@/providers/SignerProvider';
import { useNavigate } from 'react-router-dom';
import {
    EvaluationStatus,
    ICPCertificateDocumentType,
    ICPCertificateType,
    ICPMaterialCertificate,
    Material,
    ProductCategory
} from '@kbc-lib/coffee-trading-management-lib';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { FormElement, FormElementType, GenericForm } from '@/components/GenericForm/GenericForm';
import { MaterialCertificateView } from '@/pages/Certification/View/MaterialCertificateView';
import { DetailedCertificate, useCertification } from '@/providers/icp/CertificationProvider';
import { useMaterial } from '@/providers/icp/MaterialProvider';
import { useEnumeration } from '@/providers/icp/EnumerationProvider';

jest.mock('@/providers/SignerProvider');
jest.mock('react-router-dom');
jest.mock('@/providers/icp/EnumerationProvider');
jest.mock('@/providers/icp/CertificationProvider');
jest.mock('@/providers/icp/MaterialProvider');
jest.mock('@/components/GenericForm/GenericForm');

describe('MaterialCertificateView', () => {
    const signer = { _address: '0x123' };
    const navigate = jest.fn();
    const assessmentReferenceStandards = ['assessmentReferenceStandard'];
    const assessmentAssuranceLevels = ['assessmentAssuranceLevel'];
    const materials = [{ id: 3, productCategory: { name: 'productCategory' } }];
    const updateMaterialCertificate = jest.fn();
    const detailedCertificate: DetailedCertificate = {
        certificate: new ICPMaterialCertificate(
            1,
            'issuer',
            'subject',
            'uploadedBy',
            'assessmentReferenceStandard',
            'assessmentAssuranceLevel',
            {
                referenceId: '123456',
                documentType: ICPCertificateDocumentType.PRODUCTION_FACILITY_LICENSE,
                externalUrl: 'url',
                metadata: { filename: 'file.pdf', fileType: 'application/pdf' }
            },
            EvaluationStatus.NOT_EVALUATED,
            ICPCertificateType.MATERIAL,
            new Date(),
            new Material(2, new ProductCategory(3, 'productCategory', 85, 'description'))
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
        (useEnumeration as jest.Mock).mockReturnValue({ assessmentReferenceStandards, assessmentAssuranceLevels });
        (useMaterial as jest.Mock).mockReturnValue({ materials });
        (useCertification as jest.Mock).mockReturnValue({
            updateMaterialCertificate
        });
    });

    it('should render correctly', async () => {
        render(
            <MaterialCertificateView detailedCertificate={detailedCertificate} commonElements={commonElements} editElements={[]} disabled={true} />
        );

        expect(screen.getByText('Material Certificate')).toBeInTheDocument();

        expect(GenericForm).toHaveBeenCalled();
        expect((GenericForm as jest.Mock).mock.calls[0][0].elements).toHaveLength(commonElements.length + 9);
        expect((GenericForm as jest.Mock).mock.calls[0][0].submittable).toBeFalsy();
    });

    it('onSubmit', async () => {
        render(
            <MaterialCertificateView commonElements={commonElements} editElements={[]} disabled={false} detailedCertificate={detailedCertificate} />
        );
        const values = {
            issuer: 'issuer',
            subject: 'subject',
            assessmentReferenceStandard: assessmentReferenceStandards[0],
            assessmentAssuranceLevel: assessmentAssuranceLevels[0],
            document: new File([new Blob(['document'])], 'example.txt', {
                type: 'application/pdf'
            }),
            documentType: ICPCertificateDocumentType.CERTIFICATE_OF_CONFORMITY,
            documentReferenceId: 'documentReferenceId',
            materialId: 3
        };
        await (GenericForm as jest.Mock).mock.calls[0][0].onSubmit(values);

        expect(updateMaterialCertificate).toHaveBeenCalled();
        expect(updateMaterialCertificate).toHaveBeenCalledWith({
            issuer: values.issuer,
            subject: signer._address,
            assessmentReferenceStandard: values.assessmentReferenceStandard,
            assessmentAssuranceLevel: values.assessmentAssuranceLevel,
            document: {
                filename: values.document.name,
                fileType: values.document.type,
                fileContent: new Uint8Array(await new Response(values.document).arrayBuffer()),
                documentType: values.documentType,
                referenceId: values.documentReferenceId
            },
            materialId: values.materialId
        });
    });
});
