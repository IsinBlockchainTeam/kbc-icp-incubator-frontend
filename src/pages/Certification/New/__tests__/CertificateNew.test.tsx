import { render } from '@testing-library/react';
import React from 'react';
import { CertificateNew } from '@/pages/Certification/New/CertificateNew';
import { useNavigate, useParams } from 'react-router-dom';
import { paths } from '@/constants/paths';
import { JsonRpcSigner } from '@ethersproject/providers';
import { useSigner } from '@/providers/auth/SignerProvider';
import { CompanyCertificateNew } from '@/pages/Certification/New/CompanyCertificateNew';
import { FormElementType } from '@/components/GenericForm/GenericForm';
import { ScopeCertificateNew } from '@/pages/Certification/New/ScopeCertificateNew';
import { MaterialCertificateNew } from '@/pages/Certification/New/MaterialCertificateNew';
import { useOrganization } from '@/providers/entities/icp/OrganizationProvider';

jest.mock('react-router-dom');
jest.mock('@/providers/entities/icp/OrganizationProvider');
jest.mock('@/providers/auth/SignerProvider');
jest.mock('@/pages/Certification/New/CompanyCertificateNew');
jest.mock('@/pages/Certification/New/ScopeCertificateNew');
jest.mock('@/pages/Certification/New/MaterialCertificateNew');

describe('CertificateNew', () => {
    const signer = { _address: '0x123' } as JsonRpcSigner;
    const signerName = 'signer';
    const navigate = jest.fn();

    beforeEach(() => {
        (useOrganization as jest.Mock).mockReturnValue({
            getOrganization: jest.fn().mockReturnValue({ legalName: signerName })
        });
        (useNavigate as jest.Mock).mockReturnValue(navigate);
        (useSigner as jest.Mock).mockReturnValue({ signer });
    });

    it('should redirect to homepage if type is not provided', async () => {
        (useParams as jest.Mock).mockReturnValue({ type: undefined });
        render(<CertificateNew />);
        expect(navigate).toHaveBeenCalled();
        expect(navigate).toHaveBeenCalledWith(paths.HOME);
    });

    describe('should render certificate page based on type', () => {
        const commonElements = [
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
                disabled: false
            }
        ];

        it('should render company certificate new', async () => {
            (useParams as jest.Mock).mockReturnValue({ type: '0' });
            render(<CertificateNew />);
            expect(navigate).not.toHaveBeenCalled();
            expect(CompanyCertificateNew).toHaveBeenCalled();
            expect(CompanyCertificateNew).toHaveBeenCalledWith({ commonElements }, {});
        });

        it('should render scope certificate new', async () => {
            (useParams as jest.Mock).mockReturnValue({ type: '1' });
            render(<CertificateNew />);
            expect(navigate).not.toHaveBeenCalled();
            expect(ScopeCertificateNew).toHaveBeenCalled();
            expect(ScopeCertificateNew).toHaveBeenCalledWith({ commonElements }, {});
        });

        it('should render material certificate new', async () => {
            (useParams as jest.Mock).mockReturnValue({ type: '2' });
            render(<CertificateNew />);
            expect(navigate).not.toHaveBeenCalled();
            expect(MaterialCertificateNew).toHaveBeenCalled();
            expect(MaterialCertificateNew).toHaveBeenCalledWith({ commonElements }, {});
        });
    });
});
