import { BaseCertificate, CertificateDocument } from '@kbc-lib/coffee-trading-management-lib';
import { createContext, ReactNode, useContext } from 'react';

type BaseCertificateRequest = {
    issuer: string;
    subject: string;
    assessmentStandard: string;
    document: CertificateDocument;
};
export type CompanyCertificateRequest = BaseCertificateRequest & {
    validFrom: Date;
    validUntil: Date;
};
export type ScopeCertificateRequest = BaseCertificateRequest & {
    validFrom: Date;
    validUntil: Date;
    processTypes: string[];
};
export type MaterialCertificateRequest = BaseCertificateRequest & {
    materialId: number;
};

export type EthCertificateContextState = {
    saveCompanyCertificate: (request: CompanyCertificateRequest) => Promise<void>;
    saveScopeCertificate: (request: ScopeCertificateRequest) => Promise<void>;
    saveMaterialCertificate: (request: MaterialCertificateRequest) => Promise<void>;
};

export const EthCertificateContext = createContext<EthCertificateContextState>(
    {} as EthCertificateContextState
);

export const useEthCertificate = (): EthCertificateContextState => {
    const context = useContext(EthCertificateContext);
    if (!context || Object.keys(context).length === 0) {
        throw new Error('useEthCertificate must be used within an EthCertificateProvider.');
    }
    return context;
};

export function EthCertificateProvider(props: { children: ReactNode }) {
    return (
        <EthCertificateContext.Provider
            value={{
                saveCompanyCertificate: async (request: CompanyCertificateRequest) => {
                    console.log('saveCompanyCertificate', request);
                },
                saveScopeCertificate: async (request: ScopeCertificateRequest) => {
                    console.log('saveScopeCertificate', request);
                },
                saveMaterialCertificate: async (request: MaterialCertificateRequest) => {
                    console.log('saveMaterialCertificate', request);
                }
            }}
            {...props}
        />
    );
}
