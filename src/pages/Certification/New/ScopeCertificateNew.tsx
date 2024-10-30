import { CardPage } from '@/components/structure/CardPage/CardPage';
import { Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { paths } from '@/constants/paths';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CertificateNewProps } from '@/pages/Certification/New/CertificateNew';
import { FormElement, FormElementType, GenericForm } from '@/components/GenericForm/GenericForm';
import { useEthEnumerable } from '@/providers/entities/EthEnumerableProvider';
import { CertificateDocumentNames } from '@/constants/certificationDocument';
import { ICPCertificateDocumentType } from '@kbc-lib/coffee-trading-management-lib';
import { validateDates } from '@/utils/date';
import dayjs from 'dayjs';
import { useSigner } from '@/providers/SignerProvider';
import { ScopeCertificateRequest, useCertification } from '@/providers/icp/CertificationProvider';
import { useEnumeration } from '@/providers/icp/EnumerationProvider';

export const ScopeCertificateNew = (props: CertificateNewProps) => {
    const { commonElements } = props;
    const { signer } = useSigner();
    const navigate = useNavigate();
    const { assessmentAssuranceLevels, assessmentStandards, processTypes } = useEnumeration();
    const { saveScopeCertificate } = useCertification();

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
            defaultValue: undefined,
            disabled: false
        },
        {
            type: FormElementType.DATE,
            span: 12,
            name: 'validUntil',
            label: 'Valid Until',
            required: true,
            defaultValue: undefined,
            disabled: false,
            dependencies: ['validFrom'],
            validationCallback: validateDates('validUntil', 'validFrom', 'greater', 'This must be after Valid From date')
        },
        {
            type: FormElementType.SELECT,
            span: 12,
            name: 'assessmentStandard',
            label: 'Assessment Standard',
            required: true,
            options: assessmentStandards.map((standard) => ({
                value: standard,
                label: standard
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
            name: 'processTypes',
            label: 'Process Types',
            required: true,
            options: processTypes.map((processType) => ({
                value: processType,
                label: processType
            })),
            mode: 'multiple'
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
        const saveRequest: ScopeCertificateRequest = {
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
            validUntil: dayjs(values.validUntil).unix(),
            processTypes: values.processTypes
        };
        await saveScopeCertificate(saveRequest);
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
                    New Scope Certificate
                    <Button type="primary" danger icon={<DeleteOutlined />} onClick={() => navigate(paths.CERTIFICATIONS)}>
                        Delete Certificate
                    </Button>
                </div>
            }>
            <GenericForm elements={elements} onSubmit={onSubmit} submittable={true} />
        </CardPage>
    );
};
