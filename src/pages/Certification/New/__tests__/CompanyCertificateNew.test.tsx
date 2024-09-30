import { useSigner } from '@/providers/SignerProvider';
import { useNavigate } from 'react-router-dom';
import { useEthEnumerable } from '@/providers/entities/EthEnumerableProvider';
import { useEthCertificate } from '@/providers/entities/EthCertificateProvider';
import { render, screen } from '@testing-library/react';
import { CompanyCertificateNew } from '@/pages/Certification/New/CompanyCertificateNew';
import { FormElement, FormElementType, GenericForm } from '@/components/GenericForm/GenericForm';
import { Button } from 'antd';
import dayjs from 'dayjs';
import { paths } from '@/constants/paths';

jest.mock('@/providers/SignerProvider');
jest.mock('react-router-dom');
jest.mock('@/components/GenericForm/GenericForm');
jest.mock('@/providers/entities/EthEnumerableProvider');
jest.mock('@/providers/entities/EthCertificateProvider');
jest.mock('@/utils/date');
jest.mock('antd', () => ({
    ...jest.requireActual('antd'),
    Button: jest.fn((children) => <div>{children}</div>)
}));

describe('CompanyCertificateNew', () => {
    const signer = { _address: '0x123' };
    const navigate = jest.fn();
    const assessmentStandards = ['assessmentStandard'];
    const saveCompanyCertificate = jest.fn();
    const commonElements: FormElement[] = [{ type: FormElementType.SPACE, span: 24 }];

    beforeEach(() => {
        jest.clearAllMocks();

        (useSigner as jest.Mock).mockReturnValue({ signer });
        (useNavigate as jest.Mock).mockReturnValue(navigate);
        (useEthEnumerable as jest.Mock).mockReturnValue({ assessmentStandards });
        (useEthCertificate as jest.Mock).mockReturnValue({ saveCompanyCertificate });
    });

    it('should render correctly', async () => {
        render(<CompanyCertificateNew commonElements={commonElements} />);

        expect(screen.getByText('New Company Certificate')).toBeInTheDocument();

        expect(GenericForm).toHaveBeenCalled();
        expect((GenericForm as jest.Mock).mock.calls[0][0].elements).toHaveLength(
            commonElements.length + 9
        );
        expect((GenericForm as jest.Mock).mock.calls[0][0].submittable).toBeTruthy();

        expect(Button).toHaveBeenCalled();
        expect((Button as unknown as jest.Mock).mock.calls[0][0].children).toBe(
            'Delete Certificate'
        );
    });

    it('onSubmit', async () => {
        render(<CompanyCertificateNew commonElements={commonElements} />);
        const values = {
            issuer: 'issuer',
            assessmentStandard: assessmentStandards[0],
            document: new File([new Blob(['document'])], 'example.txt', {
                type: 'application/pdf'
            }),
            documentType: 'documentType',
            documentReferenceId: 'documentReferenceId',
            validFrom: new Date(),
            validUntil: new Date(new Date().setDate(new Date().getDate() + 1))
        };
        await (GenericForm as jest.Mock).mock.calls[0][0].onSubmit(values);

        expect(saveCompanyCertificate).toHaveBeenCalled();
        expect(saveCompanyCertificate).toHaveBeenCalledWith({
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
            validFrom: dayjs(values.validFrom).unix(),
            validUntil: dayjs(values.validUntil).unix()
        });
    });

    it('should navigate to CERTIFICATIONS on delete', () => {
        render(<CompanyCertificateNew commonElements={commonElements} />);
        (Button as unknown as jest.Mock).mock.calls[0][0].onClick();
        expect(navigate).toHaveBeenCalled();
        expect(navigate).toHaveBeenCalledWith(paths.CERTIFICATIONS);
    });
});
