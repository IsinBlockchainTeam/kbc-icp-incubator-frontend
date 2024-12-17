import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSigner } from '@/providers/SignerProvider';
import { render, screen } from '@testing-library/react';
import { FormElement, FormElementType, GenericForm } from '@/components/GenericForm/GenericForm';
import { Button } from 'antd';
import { paths } from '@/constants/paths';
import { MaterialCertificateNew } from '@/pages/Certification/New/MaterialCertificateNew';
import { useCertification } from '@/providers/icp/CertificationProvider';
import { useMaterial } from '@/providers/icp/MaterialProvider';
import { useEnumeration } from '@/providers/icp/EnumerationProvider';
import { ICPAssessmentReferenceStandard, ICPCertificateDocumentType } from '../../../../../../coffee-trading-management-lib/src/index';

jest.mock('@/providers/SignerProvider');
jest.mock('react-router-dom');
jest.mock('@/components/GenericForm/GenericForm');
jest.mock('@/providers/icp/EnumerationProvider');
jest.mock('@/providers/icp/CertificationProvider');
jest.mock('@/providers/icp/MaterialProvider');
jest.mock('@/utils/date');
jest.mock('antd', () => ({
    ...jest.requireActual('antd'),
    Button: jest.fn()
}));

describe('Material Certificate New', () => {
    const signer = { _address: '0x123' };
    const navigate = jest.fn();
    const assessmentReferenceStandards = [{ id: 1 } as ICPAssessmentReferenceStandard];
    const assessmentAssuranceLevels = ['assessmentAssuranceLevel'];
    const materials = [{ id: 1, productCategory: { name: 'Product Category 1' } }];
    const saveMaterialCertificate = jest.fn();
    const commonElements: FormElement[] = [{ type: FormElementType.SPACE, span: 24 }];

    beforeEach(() => {
        jest.clearAllMocks();

        (useSigner as jest.Mock).mockReturnValue({ signer });
        (useNavigate as jest.Mock).mockReturnValue(navigate);
        (useEnumeration as jest.Mock).mockReturnValue({ assessmentReferenceStandards, assessmentAssuranceLevels });
        (useMaterial as jest.Mock).mockReturnValue({ materials });
        (useCertification as jest.Mock).mockReturnValue({
            saveMaterialCertificate
        });
    });

    it('should render correctly', async () => {
        render(<MaterialCertificateNew commonElements={commonElements} />);

        expect(screen.getByText('New Material Certificate')).toBeInTheDocument();

        expect(GenericForm).toHaveBeenCalled();
        expect((GenericForm as jest.Mock).mock.calls[0][0].elements).toHaveLength(commonElements.length + 9);
        expect((GenericForm as jest.Mock).mock.calls[0][0].submittable).toBeTruthy();

        expect(Button).toHaveBeenCalled();
        expect((Button as unknown as jest.Mock).mock.calls[0][0].children).toBe('Delete Certificate');
    });

    it('onSubmit', async () => {
        render(<MaterialCertificateNew commonElements={commonElements} />);
        const values = {
            issuer: 'issuer',
            subject: 'subject',
            assessmentReferenceStandard: assessmentReferenceStandards[0].id,
            assessmentAssuranceLevel: assessmentAssuranceLevels[0],
            document: new File([new Blob(['document'])], 'example.txt', {
                type: 'application/pdf'
            }),
            documentType: ICPCertificateDocumentType.CERTIFICATE_OF_CONFORMITY,
            documentReferenceId: 'documentReferenceId',
            materialId: 3
        };

        await (GenericForm as jest.Mock).mock.calls[0][0].onSubmit(values);

        expect(saveMaterialCertificate).toHaveBeenCalled();
        expect(saveMaterialCertificate).toHaveBeenCalledWith({
            issuer: values.issuer,
            subject: signer._address,
            assessmentReferenceStandardId: values.assessmentReferenceStandard,
            assessmentAssuranceLevel: values.assessmentAssuranceLevel,
            document: {
                filename: values.document.name,
                fileType: values.document.type,
                fileContent: new Uint8Array(await new Response(values.document).arrayBuffer()),
                documentType: values.documentType,
                referenceId: values.documentReferenceId
            },
            materialId: values.materialId
        });

        expect(navigate).toHaveBeenCalled();
        expect(navigate).toHaveBeenCalledWith(paths.CERTIFICATIONS);
    });

    it('should navigate to certifications page when delete button is clicked', async () => {
        render(<MaterialCertificateNew commonElements={commonElements} />);
        (Button as unknown as jest.Mock).mock.calls[0][0].onClick();
        expect(navigate).toHaveBeenCalled();
        expect(navigate).toHaveBeenCalledWith(paths.CERTIFICATIONS);
    });
});
