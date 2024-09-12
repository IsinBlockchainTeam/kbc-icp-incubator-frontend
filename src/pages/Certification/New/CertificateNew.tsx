import { useNavigate, useParams } from 'react-router-dom';
import { FormElement, FormElementType } from '@/components/GenericForm/GenericForm';
import { useICPOrganization } from '@/providers/entities/ICPOrganizationProvider';
import { useSigner } from '@/providers/SignerProvider';
import { paths } from '@/constants/paths';
import { CertificateType } from '@kbc-lib/coffee-trading-management-lib';
import { ReactElement, ReactNode } from 'react';

export const CertificateNew = () => {
    const { type } = useParams();
    const navigate = useNavigate();
    const { getCompany } = useICPOrganization();
    const { signer } = useSigner();
    const elements: FormElement[] = [];
    const issuerName = getCompany(signer._address).legalName;

    elements.push(
        {
            type: FormElementType.TITLE,
            span: 24,
            label: 'Actors'
        },
        {
            type: FormElementType.INPUT,
            span: 8,
            name: 'issuer',
            label: 'Issuer',
            required: true,
            defaultValue: issuerName,
            disabled: true
        }
    );

    const newCertificateByType = new Map<CertificateType, ReactElement>([
        [CertificateType.COMPANY, <div>Company</div>],
        [CertificateType.SCOPE, <div>Scope</div>],
        [CertificateType.MATERIAL, <div>Material</div>]
    ]);

    if (type === undefined) navigate(paths.HOME);
    return newCertificateByType.get(Number(type)) || <div>Unknown certificate type</div>;
};
