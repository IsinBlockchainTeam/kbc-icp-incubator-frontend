import { CardPage } from '@/components/structure/CardPage/CardPage';
import { paths } from '@/constants/paths';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FormElement, FormElementType, GenericForm } from '@/components/GenericForm/GenericForm';
import { useEthEnumerable } from '@/providers/entities/EthEnumerableProvider';
import { CertificateDocumentNames } from '@/constants/certificationDocument';
import { ICPMaterialCertificate, ICPCertificateDocumentType } from '@kbc-lib/coffee-trading-management-lib';
import { useSigner } from '@/providers/SignerProvider';
import { CertificateViewProps } from '@/pages/Certification/View/CertificateView';
import { useEthMaterial } from '@/providers/entities/EthMaterialProvider';
import { MaterialCertificateRequest, useCertification } from '@/providers/icp/CertificationProvider';
import { useEnumeration } from '@/providers/icp/EnumerationProvider';

export const MaterialCertificateView = (props: CertificateViewProps) => {
    const { commonElements, editElements, detailedCertificate, disabled } = props;
    const materialCertificate = detailedCertificate.certificate as ICPMaterialCertificate;

    const { signer } = useSigner();
    const navigate = useNavigate();
    const { assessmentAssuranceLevels, assessmentStandards } = useEnumeration();
    // TODO: use icp material provider to retrieve materials
    const { materials } = useEthMaterial();
    const { updateMaterialCertificate } = useCertification();

    const elements: FormElement[] = [
        ...commonElements,
        {
            type: FormElementType.TITLE,
            span: 24,
            label: 'Information'
        },
        {
            type: FormElementType.SELECT,
            span: 12,
            name: 'assessmentStandard',
            label: 'Assessment Standard',
            required: true,
            defaultValue: materialCertificate.assessmentStandard,
            options: assessmentStandards.map((standard) => ({
                value: standard,
                label: standard
            })),
            disabled
        },
        {
            type: FormElementType.SELECT,
            span: 12,
            name: 'assessmentAssuranceLevel',
            label: 'Assessment Assurance Level',
            required: true,
            defaultValue: materialCertificate.assessmentAssuranceLevel,
            options: assessmentAssuranceLevels.map((assuranceLevel) => ({
                value: assuranceLevel,
                label: assuranceLevel
            })),
            disabled
        },
        {
            type: FormElementType.SELECT,
            span: 12,
            name: 'materialId',
            label: 'Material ID',
            required: true,
            defaultValue: materialCertificate.materialId,
            options: materials.map((material) => ({
                value: material.id,
                label: material.productCategory.name
            })),
            disabled
        },
        { type: FormElementType.SPACE, span: 12 },
        {
            type: FormElementType.TITLE,
            span: 24,
            label: 'Document'
        },
        {
            type: FormElementType.INPUT,
            span: 12,
            name: 'documentReferenceId',
            label: 'Reference ID',
            defaultValue: materialCertificate.document.referenceId,
            required: true,
            disabled
        },
        {
            type: FormElementType.SELECT,
            span: 12,
            name: 'documentType',
            label: 'Document Type',
            required: true,
            defaultValue: detailedCertificate.certificate.document.documentType,
            options: Object.keys(CertificateDocumentNames).map((key) => ({
                value: key,
                label: CertificateDocumentNames[key as ICPCertificateDocumentType]
            })),
            disabled
        },
        {
            type: FormElementType.DOCUMENT,
            span: 24,
            name: 'document',
            label: 'Document',
            loading: false,
            uploadable: !disabled,
            required: true,
            height: '500px',
            content: {
                content: new Blob([detailedCertificate.document.fileContent]),
                contentType: detailedCertificate.document.metadata.fileType,
                filename: detailedCertificate.document.metadata.filename
            }
        },
        ...editElements
    ];

    const onSubmit = async (values: any) => {
        const updatedRequest: MaterialCertificateRequest = {
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
            materialId: values.materialId
        };
        await updateMaterialCertificate(updatedRequest);
        navigate(paths.CERTIFICATIONS);
    };

    return (
        <CardPage
            title={
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                    Material Certificate
                </div>
            }>
            <GenericForm elements={elements} onSubmit={onSubmit} submittable={!disabled} />
        </CardPage>
    );
};
