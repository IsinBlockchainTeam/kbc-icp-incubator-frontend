import { useNavigate, useParams } from 'react-router-dom';
import { FormElement, FormElementType } from '@/components/GenericForm/GenericForm';
import { useICPOrganization } from '@/providers/entities/ICPOrganizationProvider';
import { useSigner } from '@/providers/SignerProvider';
import { paths } from '@/constants/paths';
import { CertificateType } from '@kbc-lib/coffee-trading-management-lib';
import {ReactElement, useMemo} from 'react';
import { CompanyCertificateNew } from '@/pages/Certification/New/CompanyCertificateNew';
import { useEthCertificate } from '@/providers/entities/EthCertificateProvider';

export type CertificateViewProps = {
    commonElements: FormElement[];
};

export const CertificateView = () => {
    const { certificate } = useEthCertificate();
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
            defaultValue: certificate.,
            disabled: true
        },
        {
            type: FormElementType.INPUT,
            span: 12,
            name: 'issuer',
            label: 'Certifier',
            required: true,
            defaultValue: '',
            disabled: true
        }
    );

    const newCertificateByType = useMemo(() => new Map<CertificateType, ReactElement>([
        [CertificateType.COMPANY, <CompanyCertificateNew commonElements={elements} />],
        [CertificateType.SCOPE, <div>Scope</div>],
        [CertificateType.MATERIAL, <div>Material</div>]
    ]), [certificate]);

    if (certificate === undefined) navigate(paths.HOME);
    return newCertificateByType.get(Number(type)) || <div>Unknown certificate type</div>;
};
