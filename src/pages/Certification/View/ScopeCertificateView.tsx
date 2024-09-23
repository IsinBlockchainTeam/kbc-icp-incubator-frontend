import { CardPage } from '@/components/structure/CardPage/CardPage';
import { Button } from 'antd';
import { DeleteOutlined, EditOutlined, RollbackOutlined } from '@ant-design/icons';
import { paths } from '@/constants/paths';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FormElement, FormElementType, GenericForm } from '@/components/GenericForm/GenericForm';
import { useEthEnumerable } from '@/providers/entities/EthEnumerableProvider';
import { CertificateDocumentNames } from '@/constants/certificationDocument';
import {
    CertificateDocumentType,
    CompanyCertificate,
    ScopeCertificate
} from '@kbc-lib/coffee-trading-management-lib';
import {
    CompanyCertificateRequest,
    ScopeCertificateRequest,
    useEthCertificate
} from '@/providers/entities/EthCertificateProvider';
import { validateDates } from '@/utils/date';
import dayjs from 'dayjs';
import { useSigner } from '@/providers/SignerProvider';
import { CertificateViewProps } from '@/pages/Certification/View/CertificateView';

export const ScopeCertificateView = (props: CertificateViewProps) => {
    const { commonElements, editElements, detailedCertificate, disabled } = props;
    const scopeCertificate = detailedCertificate.certificate as ScopeCertificate;

    const { signer } = useSigner();
    const navigate = useNavigate();
    const { assessmentStandards, processTypes } = useEthEnumerable();
    const { updateScopeCertificate } = useEthCertificate();

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
            defaultValue: dayjs.unix(scopeCertificate.validFrom),
            disabled
        },
        {
            type: FormElementType.DATE,
            span: 12,
            name: 'validUntil',
            label: 'Valid Until',
            required: true,
            defaultValue: dayjs.unix(scopeCertificate.validUntil),
            disabled,
            dependencies: ['validFrom'],
            validationCallback: validateDates(
                'validUntil',
                'validFrom',
                'greater',
                'This must be after Valid From date'
            )
        },
        {
            type: FormElementType.SELECT,
            span: 12,
            name: 'assessmentStandard',
            label: 'Assessment Standard',
            required: true,
            defaultValue: scopeCertificate.assessmentStandard,
            options: assessmentStandards.map((standard) => ({
                value: standard,
                label: standard
            })),
            disabled
        },
        {
            type: FormElementType.SELECT,
            span: 12,
            name: 'processTypes',
            label: 'Process Types',
            required: true,
            defaultValue: scopeCertificate.processTypes,
            options: processTypes.map((processType) => ({
                value: processType,
                label: processType
            })),
            mode: 'multiple',
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
            defaultValue: detailedCertificate.document.documentReferenceId,
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
                value: Number(key),
                label: CertificateDocumentNames[Number(key) as CertificateDocumentType]
            })),
            disabled
        },
        {
            type: FormElementType.DOCUMENT,
            span: 24,
            name: 'document',
            label: 'Document',
            loading: false,
            uploadable: true,
            required: true,
            height: '500px',
            content: {
                content: new Blob([detailedCertificate.document.fileContent]),
                contentType: detailedCertificate.document.fileType,
                filename: detailedCertificate.document.fileName
            }
        },
        ...editElements
    ];

    const onSubmit = async (values: any) => {
        const updatedRequest: ScopeCertificateRequest = {
            issuer: values.issuer,
            subject: signer._address,
            assessmentStandard: values.assessmentStandard,
            document: {
                fileName: values.document.name,
                fileType: values.document.type,
                fileContent: new Uint8Array(await new Response(values.document).arrayBuffer())
            },
            documentType: values.documentType,
            documentReferenceId: values.documentReferenceId,
            validFrom: dayjs(values.validFrom).unix(),
            validUntil: dayjs(values.validUntil).unix(),
            processTypes: values.processTypes
        };
        console.log('updatedRequest', updatedRequest);
        await updateScopeCertificate(updatedRequest);
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
                    Scope Certificate
                </div>
            }>
            <GenericForm elements={elements} onSubmit={onSubmit} submittable={!disabled} />
        </CardPage>
    );
};
