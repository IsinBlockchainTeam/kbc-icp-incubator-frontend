import { CardPage } from '@/components/CardPage/CardPage';
import { Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { paths } from '@/constants/paths';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CertificateNewProps } from '@/pages/Certification/New/CertificateNew';
import { FormElement, FormElementType, GenericForm } from '@/components/GenericForm/GenericForm';
import { CertificateDocumentNames } from '@/constants/certificationDocument';
import { ICPCertificateDocumentType } from '@kbc-lib/coffee-trading-management-lib';
import { useSigner } from '@/providers/auth/SignerProvider';
import { useEnumeration } from '@/providers/entities/icp/EnumerationProvider';
import { MaterialCertificateRequest, useCertification } from '@/providers/entities/icp/CertificationProvider';
import { useMaterial } from '@/providers/entities/icp/MaterialProvider';

export const MaterialCertificateNew = (props: CertificateNewProps) => {
    const { commonElements } = props;
    const { signer } = useSigner();
    const navigate = useNavigate();
    const { assessmentAssuranceLevels, assessmentReferenceStandards } = useEnumeration();
    const { saveMaterialCertificate } = useCertification();
    const { materials } = useMaterial();

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
            name: 'assessmentReferenceStandard',
            label: 'Assessment Reference Standard',
            required: true,
            options: assessmentReferenceStandards.map((standard) => ({
                value: standard.id,
                label: standard.name
            }))
        },
        {
            type: FormElementType.SELECT,
            span: 12,
            name: 'assessmentAssuranceLevel',
            label: 'Assessment Assurance Level',
            required: true,
            options: assessmentAssuranceLevels.map((assuranceLevel) => ({
                value: assuranceLevel,
                label: assuranceLevel
            }))
        },
        {
            type: FormElementType.SELECT,
            span: 12,
            name: 'materialId',
            label: 'Material',
            required: true,
            options: materials.map((material) => ({
                value: material.id,
                label: material.productCategory.name
            }))
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
            defaultValue: '',
            required: true
        },
        {
            type: FormElementType.SELECT,
            span: 12,
            name: 'documentType',
            label: 'Document Type',
            required: true,
            options: Object.keys(CertificateDocumentNames).map((key) => ({
                value: key,
                label: CertificateDocumentNames[key as ICPCertificateDocumentType]
            }))
        },
        {
            type: FormElementType.DOCUMENT,
            span: 24,
            name: 'document',
            label: 'Document',
            loading: false,
            uploadable: true,
            required: true,
            height: '500px'
        }
    ];

    const onSubmit = async (values: any) => {
        const saveRequest: MaterialCertificateRequest = {
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
            materialId: values.materialId
        };
        await saveMaterialCertificate(saveRequest);
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
                    New Material Certificate
                    <Button type="primary" danger icon={<DeleteOutlined />} onClick={() => navigate(paths.CERTIFICATIONS)}>
                        Delete Certificate
                    </Button>
                </div>
            }>
            <GenericForm elements={elements} onSubmit={onSubmit} submittable={true} />
        </CardPage>
    );
};
