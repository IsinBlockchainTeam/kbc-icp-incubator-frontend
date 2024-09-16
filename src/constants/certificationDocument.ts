import { CertificateDocumentType } from '@kbc-lib/coffee-trading-management-lib';

export const CertificateDocumentNames: {
    [key in CertificateDocumentType]: string;
} = {
    [CertificateDocumentType.CERTIFICATE_OF_CONFORMITY]: 'Certificate of Conformity',
    [CertificateDocumentType.COUNTRY_OF_ORIGIN]: 'Country of Origin',
    [CertificateDocumentType.SWISS_DECODE]: 'Swiss Decode',
    [CertificateDocumentType.PRODUCTION_REPORT]: 'Production Report',
    [CertificateDocumentType.PRODUCTION_FACILITY_LICENSE]: 'Production Facility License'
};
