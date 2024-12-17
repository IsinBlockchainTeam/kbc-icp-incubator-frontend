import { CardPage } from '@/components/CardPage/CardPage';
import { paths } from '@/constants/paths';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FormElement, FormElementType, GenericForm } from '@/components/GenericForm/GenericForm';
import { CertificateDocumentNames } from '@/constants/certificationDocument';
import { ICPCompanyCertificate, ICPCertificateDocumentType } from '@kbc-lib/coffee-trading-management-lib';
import { validateDates } from '@/utils/date';
import dayjs from 'dayjs';
import { useSigner } from '@/providers/auth/SignerProvider';
import { CompanyCertificateRequest, useCertification } from '@/providers/entities/icp/CertificationProvider';
import { CertificateViewProps } from '@/pages/Certification/View/CertificateView';
import { useEnumeration } from '@/providers/entities/icp/EnumerationProvider';

export const CompanyCertificateView = (props: CertificateViewProps) => {
    const { commonElements, editElements, detailedCertificate, disabled } = props;
    const companyCertificate = detailedCertificate.certificate as ICPCompanyCertificate;

    const { signer } = useSigner();
    const navigate = useNavigate();
    const { assessmentStandards, assessmentAssuranceLevels } = useEnumeration();
    const { updateCompanyCertificate } = useCertification();

    const elements: FormElement[] = [
        ...commonElements,
        {
            type: FormElementType.TITLE,
            span: 24,
            label: 'Information'
        },
        {
            type: FormElementType.DATE,
            span: 12,
            name: 'validFrom',
            label: 'Valid From',
            required: true,
            defaultValue: dayjs.unix(companyCertificate.validFrom.getTime()),
            disabled
        },
        {
            type: FormElementType.DATE,
            span: 12,
            name: 'validUntil',
            label: 'Valid Until',
            required: true,
            defaultValue: dayjs.unix(companyCertificate.validUntil.getTime()),
            disabled,
            dependencies: ['validFrom'],
            validationCallback: validateDates('validUntil', 'validFrom', 'greater', 'This must be after Valid From date')
        },
        {
            type: FormElementType.SELECT,
            span: 12,
            name: 'assessmentStandard',
            label: 'Assessment Standard',
            required: true,
            defaultValue: companyCertificate.assessmentStandard,
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
            defaultValue: companyCertificate.assessmentAssuranceLevel,
            options: assessmentAssuranceLevels.map((assuranceLevel) => ({
                value: assuranceLevel,
                label: assuranceLevel
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
            defaultValue: companyCertificate.document.referenceId,
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
                content: new Blob([detailedCertificate.documentContent]),
                contentType: detailedCertificate.certificate.document.metadata.fileType,
                filename: detailedCertificate.certificate.document.metadata.filename
            }
        },
        ...editElements
    ];

    const onSubmit = async (values: any) => {
        const updatedRequest: CompanyCertificateRequest = {
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
        };
        await updateCompanyCertificate(updatedRequest);
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
                    Company Certificate
                </div>
            }>
            <GenericForm elements={elements} onSubmit={onSubmit} submittable={!disabled} />
        </CardPage>
    );
};
