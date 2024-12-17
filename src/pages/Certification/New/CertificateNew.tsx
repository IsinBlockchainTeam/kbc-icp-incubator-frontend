import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormElement, FormElementType } from '@/components/GenericForm/GenericForm';
import { useSigner } from '@/providers/auth/SignerProvider';
import { paths } from '@/constants/paths';
import { CompanyCertificateNew } from '@/pages/Certification/New/CompanyCertificateNew';
import { regex } from '@/constants/regex';
import { ScopeCertificateNew } from '@/pages/Certification/New/ScopeCertificateNew';
import { MaterialCertificateNew } from '@/pages/Certification/New/MaterialCertificateNew';
import { useOrganization } from '@/providers/entities/icp/OrganizationProvider';

export type CertificateNewProps = {
    commonElements: FormElement[];
};

export const CertificateNew = () => {
    const { type } = useParams();
    const navigate = useNavigate();
    const { getOrganization } = useOrganization();
    const { signer } = useSigner();
    const elements: FormElement[] = [];
    const signerName = getOrganization(signer._address)!.legalName;

    elements.push(
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
            defaultValue: signerName,
            disabled: true
        },
        {
            type: FormElementType.INPUT,
            span: 12,
            name: 'issuer',
            label: 'Certifier',
            required: true,
            defaultValue: '',
            disabled: false,
            regex: regex.ETHEREUM_ADDRESS
        }
    );

    const newCertificatesByType = [
        <CompanyCertificateNew commonElements={elements} />,
        <ScopeCertificateNew commonElements={elements} />,
        <MaterialCertificateNew commonElements={elements} />
    ];

    if (type === undefined) navigate(paths.HOME);
    return newCertificatesByType[Number(type)];
};
