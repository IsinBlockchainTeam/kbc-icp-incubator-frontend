import { useNavigate, useParams } from 'react-router-dom';
import { FormElement, FormElementType } from '@/components/GenericForm/GenericForm';
import { useICPOrganization } from '@/providers/entities/ICPOrganizationProvider';
import { useSigner } from '@/providers/SignerProvider';
import { paths } from '@/constants/paths';
import { CertificateType } from '@kbc-lib/coffee-trading-management-lib';
import { ReactElement } from 'react';
import { CompanyCertificateNew } from '@/pages/Certification/New/CompanyCertificateNew';
import { regex } from '@/constants/regex';

export type CertificateNewProps = {
    commonElements: FormElement[];
};

export const CertificateNew = () => {
    const { type } = useParams();
    const navigate = useNavigate();
    const { getCompany } = useICPOrganization();
    const { signer } = useSigner();
    const elements: FormElement[] = [];
    const signerName = getCompany(signer._address).legalName;

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

    const newCertificateByType = new Map<CertificateType, ReactElement>([
        [CertificateType.COMPANY, <CompanyCertificateNew commonElements={elements} />],
        [CertificateType.SCOPE, <div>Scope</div>],
        [CertificateType.MATERIAL, <div>Material</div>]
    ]);

    if (type === undefined) navigate(paths.HOME);
    return newCertificateByType.get(Number(type)) || <div>Unknown certificate type</div>;
};
