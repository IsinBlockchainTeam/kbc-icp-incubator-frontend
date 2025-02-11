import { ICPCertificateDocumentType } from '@kbc-lib/coffee-trading-management-lib';

export const CertificateDocumentNames: {
    [key in ICPCertificateDocumentType]: string;
} = {
    [ICPCertificateDocumentType.CERTIFICATE_OF_CONFORMITY]: 'Certificate of Conformity',
    [ICPCertificateDocumentType.COUNTRY_OF_ORIGIN]: 'Country of Origin',
    [ICPCertificateDocumentType.SWISS_DECODE]: 'Swiss Decode',
    [ICPCertificateDocumentType.PRODUCTION_REPORT]: 'Production Report',
    [ICPCertificateDocumentType.PRODUCTION_FACILITY_LICENSE]: 'Production Facility License'
};
