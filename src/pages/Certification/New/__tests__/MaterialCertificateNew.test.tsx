import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSigner } from '@/providers/SignerProvider';
import { useEthEnumerable } from '@/providers/entities/EthEnumerableProvider';
import { useEthCertificate } from '@/providers/entities/EthCertificateProvider';
import { render, screen } from '@testing-library/react';
import { FormElement, FormElementType, GenericForm } from '@/components/GenericForm/GenericForm';
import { Button } from 'antd';
import { paths } from '@/constants/paths';
import { useEthMaterial } from '@/providers/entities/EthMaterialProvider';
import { MaterialCertificateNew } from '@/pages/Certification/New/MaterialCertificateNew';

jest.mock('@/providers/SignerProvider');
jest.mock('react-router-dom');
jest.mock('@/components/GenericForm/GenericForm');
jest.mock('@/providers/entities/EthEnumerableProvider');
jest.mock('@/providers/entities/EthCertificateProvider');
jest.mock('@/providers/entities/EthMaterialProvider');
jest.mock('@/utils/date');
jest.mock('antd', () => ({
    ...jest.requireActual('antd'),
    Button: jest.fn()
}));

describe('Material Certificate New', () => {
    const signer = { _address: '0x123' };
    const navigate = jest.fn();
    const assessmentStandards = ['assessmentStandard'];
    const materials = [{ id: 1, productCategory: { name: 'Product Category 1' } }];
    const saveMaterialCertificate = jest.fn();
    const commonElements: FormElement[] = [{ type: FormElementType.SPACE, span: 24 }];

    beforeEach(() => {
        jest.clearAllMocks();

        (useSigner as jest.Mock).mockReturnValue({ signer });
        (useNavigate as jest.Mock).mockReturnValue(navigate);
        (useEthEnumerable as jest.Mock).mockReturnValue({ assessmentStandards });
        (useEthMaterial as jest.Mock).mockReturnValue({ materials });
        (useEthCertificate as jest.Mock).mockReturnValue({
            saveMaterialCertificate
        });
    });

    it('should render correctly', async () => {
        render(<MaterialCertificateNew commonElements={commonElements} />);

        expect(screen.getByText('New Material Certificate')).toBeInTheDocument();

        expect(GenericForm).toHaveBeenCalled();
        expect((GenericForm as jest.Mock).mock.calls[0][0].elements).toHaveLength(
            commonElements.length + 8
        );
        expect((GenericForm as jest.Mock).mock.calls[0][0].submittable).toBeTruthy();

        expect(Button).toHaveBeenCalled();
        expect((Button as unknown as jest.Mock).mock.calls[0][0].children).toBe(
            'Delete Certificate'
        );
    });

    it('onSubmit', async () => {
        render(<MaterialCertificateNew commonElements={commonElements} />);
        const values = {
            issuer: 'issuer',
            assessmentStandard: assessmentStandards[0],
            document: new File([new Blob(['document'])], 'example.txt', {
                type: 'application/pdf'
            }),
            documentType: 'documentType',
            documentReferenceId: 'documentReferenceId',
            materialId: materials[0].id
        };

        await (GenericForm as jest.Mock).mock.calls[0][0].onSubmit(values);

        expect(saveMaterialCertificate).toHaveBeenCalled();
        expect(saveMaterialCertificate).toHaveBeenCalledWith({
            issuer: values.issuer,
            subject: signer._address,
            assessmentStandard: values.assessmentStandard,
            document: {
                fileName: values.document.name,
                fileType: values.document.type,
                fileContent: new Uint8Array(await new Response(values.document).arrayBuffer())
            },
            documentType: values.documentType,
            documentReferenceId: values.documentReferenceId,
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
