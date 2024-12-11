import { FormElement, FormElementType } from '@/components/GenericForm/GenericForm';
import React, { useMemo } from 'react';
import { CompanyCertificateView } from '@/pages/Certification/View/CompanyCertificateView';
import { EditOutlined, RollbackOutlined } from '@ant-design/icons';
import { ScopeCertificateView } from '@/pages/Certification/View/ScopeCertificateView';
import { MaterialCertificateView } from '@/pages/Certification/View/MaterialCertificateView';
import { DetailedCertificate, useCertification } from '@/providers/icp/CertificationProvider';
import { ICPCertificateType } from '@kbc-lib/coffee-trading-management-lib';

export type CertificateViewProps = {
    commonElements: FormElement[];
    editElements: FormElement[];
    disabled: boolean;
    detailedCertificate: DetailedCertificate;
};

export const CertificateView = () => {
    const { detailedCertificate } = useCertification();
    const [disabled, setDisabled] = React.useState(true);
    const [isEditing, setIsEditing] = React.useState(false);

    const toggleEditing = () => {
        setDisabled(!disabled);
        setIsEditing(!isEditing);
    };

    const elements: FormElement[] = useMemo(
        () => [
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
                defaultValue: detailedCertificate?.certificate.subject,
                disabled: true
            },
            {
                type: FormElementType.INPUT,
                span: 12,
                name: 'issuer',
                label: 'Certifier',
                required: true,
                defaultValue: detailedCertificate?.certificate.issuer,
                disabled: true
            }
        ],
        [detailedCertificate]
    );

    const editElements: FormElement[] = [
        {
            type: FormElementType.BUTTON,
            span: 24,
            name: 'back',
            label: (
                <div>
                    Back <RollbackOutlined />
                </div>
            ),
            buttonType: 'primary',
            hidden: !isEditing,
            onClick: toggleEditing,
            resetFormValues: true
        },
        {
            type: FormElementType.BUTTON,
            span: 24,
            name: 'edit',
            label: (
                <div>
                    {disabled ? 'Edit ' : 'Editing.. '}
                    <EditOutlined style={{ fontSize: 'large' }} />
                </div>
            ),
            buttonType: 'primary',
            hidden: isEditing,
            onClick: toggleEditing
        }
    ];

    if (!detailedCertificate) return <div>No certificate found</div>;

    const certificatesViewByType = [
        <CompanyCertificateView
            commonElements={elements}
            editElements={editElements}
            detailedCertificate={detailedCertificate}
            disabled={disabled}
        />,
        <ScopeCertificateView commonElements={elements} editElements={editElements} detailedCertificate={detailedCertificate} disabled={disabled} />,
        <MaterialCertificateView
            commonElements={elements}
            editElements={editElements}
            detailedCertificate={detailedCertificate}
            disabled={disabled}
        />
    ];
    return certificatesViewByType[Number(Object.keys(ICPCertificateType).indexOf(detailedCertificate?.certificate.certificateType))];
};
