import { render } from '@testing-library/react';
import { useSigner } from '@/providers/SignerProvider';
import { useEthOrderTrade } from '@/providers/entities/EthOrderTradeProvider';
import { DOCUMENT_DUTY, useEthDocument } from '@/providers/entities/EthDocumentProvider';
import { CoffeeShipment } from '@/pages/Trade/OrderStatusSteps/CoffeeShipment';
import { Wallet } from 'ethers';
import { useNavigate } from 'react-router-dom';
import { DocumentStatus, DocumentType, OrderTrade } from '@kbc-lib/coffee-trading-management-lib';
import { GenericForm } from '@/components/GenericForm/GenericForm';
import { paths } from '@/constants/paths';
import TradeDutiesWaiting from '@/pages/Trade/OrderStatusSteps/TradeDutiesWaiting';

jest.mock('react-redux');
jest.mock('react-router-dom');
jest.mock('@/providers/SignerProvider');
jest.mock('@/providers/entities/EthOrderTradeProvider');
jest.mock('@/providers/entities/EthDocumentProvider');
jest.mock('@/pages/Trade/OrderStatusSteps/StepTip');
jest.mock('@/components/GenericForm/GenericForm');
jest.mock('@/pages/Trade/OrderStatusSteps/TradeDutiesWaiting');

describe('CoffeeShipment', () => {
    const orderTrade = {
        tradeId: 1,
        supplier: '0x123',
        commissioner: '0x456',
        documentDeliveryDeadline: 123,
        externalUrl: 'externalUrl'
    } as OrderTrade;
    const getDocumentDetail = jest.fn();
    const uploadOrderDocument = jest.fn();
    const validateOrderDocument = jest.fn();
    const getDocumentDuty = jest.fn();
    const signer = { address: '0x123' } as Wallet;
    const navigate = jest.fn();

    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.clearAllMocks();

        (useEthOrderTrade as jest.Mock).mockReturnValue({
            getDocumentDetail,
            uploadOrderDocument,
            validateOrderDocument
        });
        (useEthDocument as jest.Mock).mockReturnValue({ getDocumentDuty });
        (useSigner as jest.Mock).mockReturnValue({ signer });
        (useNavigate as jest.Mock).mockReturnValue(navigate);
    });

    it('should render fancy message if no document is approved', () => {
        getDocumentDetail.mockReturnValue({
            content: null,
            status: DocumentStatus.APPROVED,
            info: { uploadedBy: signer.address }
        });
        getDocumentDuty.mockReturnValue(DOCUMENT_DUTY.NO_ACTION_NEEDED);

        render(<CoffeeShipment orderTrade={orderTrade} />);
        expect(TradeDutiesWaiting as jest.Mock).toHaveBeenCalledTimes(1);
    });

    it.each([['bill-of-lading', 'Bill of lading']])(
        'should contain document: %s',
        (name, label) => {
            getDocumentDetail.mockReturnValue({
                content: 'content',
                status: DocumentStatus.NOT_EVALUATED,
                info: { uploadedBy: signer.address }
            });
            getDocumentDuty.mockReturnValue(DOCUMENT_DUTY.UPLOAD_NEEDED);

            render(<CoffeeShipment orderTrade={orderTrade} />);
            const mockedGenericForm = GenericForm as jest.Mock;
            expect(mockedGenericForm).toHaveBeenCalledTimes(1);
            const elements = mockedGenericForm.mock.calls[0][0].elements;

            expect(elements).toContainEqual({
                type: 'document',
                span: 12,
                name,
                label,
                required: true,
                loading: false,
                uploadable: true,
                content: 'content',
                status: DocumentStatus.NOT_EVALUATED,
                height: '45vh',
                validationCallbacks: undefined
            });
        }
    );

    it.each([['bill-of-lading', 'Bill of lading']])(
        'should approve document: %s',
        (name, label) => {
            getDocumentDetail.mockReturnValue({
                content: 'content',
                status: DocumentStatus.NOT_EVALUATED,
                info: { id: 1, uploadedBy: '0xother' }
            });
            getDocumentDuty.mockReturnValue(DOCUMENT_DUTY.UPLOAD_NEEDED);

            render(<CoffeeShipment orderTrade={orderTrade} />);
            const mockedGenericForm = GenericForm as jest.Mock;
            expect(mockedGenericForm).toHaveBeenCalledTimes(1);
            const elements = mockedGenericForm.mock.calls[0][0].elements;

            expect(elements).toContainEqual({
                type: 'document',
                span: 12,
                name,
                label,
                required: true,
                loading: false,
                uploadable: true,
                content: 'content',
                status: DocumentStatus.NOT_EVALUATED,
                height: '45vh',
                validationCallbacks: expect.any(Object)
            });
            const onApprove = elements.find((element: any) => element.name === name)
                ?.validationCallbacks?.onApprove;
            onApprove();
            expect(validateOrderDocument).toHaveBeenCalledTimes(1);
            expect(validateOrderDocument).toHaveBeenCalledWith(
                orderTrade.tradeId,
                1,
                DocumentStatus.APPROVED
            );
        }
    );

    it.each([['bill-of-lading', 'Bill of lading']])('should reject document: %s', (name, label) => {
        getDocumentDetail.mockReturnValue({
            content: 'content',
            status: DocumentStatus.NOT_EVALUATED,
            info: { id: 1, uploadedBy: '0xother' }
        });
        getDocumentDuty.mockReturnValue(DOCUMENT_DUTY.UPLOAD_NEEDED);

        render(<CoffeeShipment orderTrade={orderTrade} />);
        const mockedGenericForm = GenericForm as jest.Mock;
        expect(mockedGenericForm).toHaveBeenCalledTimes(1);
        const elements = mockedGenericForm.mock.calls[0][0].elements;

        expect(elements).toContainEqual({
            type: 'document',
            span: 12,
            name,
            label,
            required: true,
            loading: false,
            uploadable: true,
            content: 'content',
            status: DocumentStatus.NOT_EVALUATED,
            height: '45vh',
            validationCallbacks: expect.any(Object)
        });
        const onReject = elements.find((element: any) => element.name === name)?.validationCallbacks
            ?.onReject;
        onReject();
        expect(validateOrderDocument).toHaveBeenCalledTimes(1);
        expect(validateOrderDocument).toHaveBeenCalledWith(
            orderTrade.tradeId,
            1,
            DocumentStatus.NOT_APPROVED
        );
    });

    it.each([['bill-of-lading', DocumentType.BILL_OF_LADING]])(
        'should submit documents: %s',
        async (name, documentType) => {
            getDocumentDetail.mockReturnValue({
                content: 'content',
                status: DocumentStatus.NOT_EVALUATED,
                info: { id: 1, uploadedBy: '0xother' }
            });
            getDocumentDuty.mockReturnValue(DOCUMENT_DUTY.UPLOAD_NEEDED);

            render(<CoffeeShipment orderTrade={orderTrade} />);
            const mockedGenericForm = GenericForm as jest.Mock;
            expect(mockedGenericForm).toHaveBeenCalledTimes(1);
            const onSubmit = mockedGenericForm.mock.calls[0][0].onSubmit;

            const values = {
                'bill-of-lading': { name: 'fileName' }
            };
            await onSubmit(values);
            expect(uploadOrderDocument).toHaveBeenCalledTimes(1);
            expect(uploadOrderDocument).toHaveBeenCalledWith(
                orderTrade.tradeId,
                {
                    content: { name: 'fileName' },
                    filename: 'fileName',
                    documentType: documentType
                },
                'externalUrl'
            );
            expect(navigate).toHaveBeenCalledTimes(1);
            expect(navigate).toHaveBeenCalledWith(paths.TRADES);
        }
    );
});
