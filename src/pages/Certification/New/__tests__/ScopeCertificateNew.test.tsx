import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSigner } from '@/providers/SignerProvider';
import { render, screen } from '@testing-library/react';
import { ScopeCertificateNew } from '@/pages/Certification/New/ScopeCertificateNew';
import { FormElement, FormElementType, GenericForm } from '@/components/GenericForm/GenericForm';
import { Button } from 'antd';
import dayjs from 'dayjs';
import { paths } from '@/constants/paths';
import { useCertification } from '@/providers/icp/CertificationProvider';
import { useEnumeration } from '@/providers/icp/EnumerationProvider';
import { ICPCertificateDocumentType } from '@kbc-lib/coffee-trading-management-lib';

jest.mock('@/providers/SignerProvider');
jest.mock('react-router-dom');
jest.mock('@/components/GenericForm/GenericForm');
jest.mock('@/providers/icp/EnumerationProvider');
jest.mock('@/providers/icp/CertificationProvider');
jest.mock('@/utils/date');
jest.mock('antd', () => ({
    ...jest.requireActual('antd'),
    Button: jest.fn()
}));

describe('Scope Certificate New', () => {
    const signer = { _address: '0x123' };
    const navigate = jest.fn();
    const assessmentStandards = ['assessmentStandard'];
    const assessmentAssuranceLevels = ['assessmentAssuranceLevel'];
    const processTypes = ['processType'];
    const saveScopeCertificate = jest.fn();
    const commonElements: FormElement[] = [{ type: FormElementType.SPACE, span: 24 }];

    beforeEach(() => {
        jest.clearAllMocks();

        (useSigner as jest.Mock).mockReturnValue({ signer });
        (useNavigate as jest.Mock).mockReturnValue(navigate);
        (useEnumeration as jest.Mock).mockReturnValue({ assessmentStandards, assessmentAssuranceLevels, processTypes });
        (useCertification as jest.Mock).mockReturnValue({ saveScopeCertificate });
    });

    it('should render correctly', async () => {
        render(<ScopeCertificateNew commonElements={commonElements} />);

        expect(screen.getByText('New Scope Certificate')).toBeInTheDocument();

        expect(GenericForm).toHaveBeenCalled();
        expect((GenericForm as jest.Mock).mock.calls[0][0].elements).toHaveLength(commonElements.length + 11);
        expect((GenericForm as jest.Mock).mock.calls[0][0].submittable).toBeTruthy();

        expect(Button).toHaveBeenCalled();
        expect((Button as unknown as jest.Mock).mock.calls[0][0].children).toBe('Delete Certificate');
    });

    it('onSubmit', async () => {
        render(<ScopeCertificateNew commonElements={commonElements} />);
        const values = {
            issuer: 'issuer',
            assessmentStandard: assessmentStandards[0],
            assessmentAssuranceLevel: assessmentAssuranceLevels[0],
            document: new File([new Blob(['document'])], 'example.txt', {
                type: 'application/pdf'
            }),
            documentType: ICPCertificateDocumentType.CERTIFICATE_OF_CONFORMITY,
            documentReferenceId: 'documentReferenceId',
            validFrom: new Date(),
            validUntil: new Date(new Date().setDate(new Date().getDate() + 1)),
            processTypes: processTypes
        };

        await (GenericForm as jest.Mock).mock.calls[0][0].onSubmit(values);

        expect(saveScopeCertificate).toHaveBeenCalled();
        expect(saveScopeCertificate).toHaveBeenCalledWith({
            issuer: values.issuer,
            subject: signer._address,
            assessmentStandard: values.assessmentStandard,
            assessmentAssuranceLevel: values.assessmentAssuranceLevel,
            document: {
                filename: values.document.name,
                fileType: values.document.type,
                fileContent: new Uint8Array(await new Response(values.document).arrayBuffer()),
                documentType: values.documentType,
                referenceId: values.documentReferenceId
            },
            validFrom: dayjs(values.validFrom).unix(),
            validUntil: dayjs(values.validUntil).unix(),
            processTypes: values.processTypes
        });

        expect(navigate).toHaveBeenCalled();
        expect(navigate).toHaveBeenCalledWith(paths.CERTIFICATIONS);
    });

    it('should navigate to certifications page when delete button is clicked', async () => {
        render(<ScopeCertificateNew commonElements={commonElements} />);
        (Button as unknown as jest.Mock).mock.calls[0][0].onClick();
        expect(navigate).toHaveBeenCalled();
        expect(navigate).toHaveBeenCalledWith(paths.CERTIFICATIONS);
    });
});
