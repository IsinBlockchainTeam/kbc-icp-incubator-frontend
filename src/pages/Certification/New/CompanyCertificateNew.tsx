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
import { CertificateDocumentType } from '@kbc-lib/coffee-trading-management-lib';
import { regex } from '@/constants/regex';
import {
    CompanyCertificateRequest,
    useEthCertificate
} from '@/providers/entities/EthCertificateProvider';
import { validateDates } from '@/utils/date';
import dayjs from 'dayjs';
import { useSigner } from '@/providers/SignerProvider';

export const CompanyCertificateNew = (props: CertificateNewProps) => {
    const { commonElements } = props;
    const { signer } = useSigner();
    const navigate = useNavigate();
    const { assessmentStandards } = useEthEnumerable();
    const { saveCompanyCertificate } = useEthCertificate();

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
            options: assessmentStandards.map((standard) => ({
                value: standard,
                label: standard
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
                label: CertificateDocumentNames[Number(key) as CertificateDocumentType]
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
        const saveRequest = {
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
            validUntil: dayjs(values.validUntil).unix()
        } as CompanyCertificateRequest;
        await saveCompanyCertificate(saveRequest);
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
                    New Company Certificate
                    <Button
                        type="primary"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => navigate(paths.CERTIFICATIONS)}>
                        Delete Certificate
                    </Button>
                </div>
            }>
            <GenericForm elements={elements} onSubmit={onSubmit} submittable={true} />
        </CardPage>
    );
};
