import { act, fireEvent, render } from '@testing-library/react';
import { FormElement } from '@/components/GenericForm/GenericForm';
import { OrderTradeView } from '@/pages/Trade/View/OrderTradeView';
import OrderStatusSteps from '@/pages/Trade/OrderStatusSteps/OrderStatusSteps';
import { useNavigate } from 'react-router-dom';
import {
    OrderLinePrice,
    OrderLineRequest,
    OrderTrade
} from '@kbc-lib/coffee-trading-management-lib';
import { useSigner } from '@/providers/SignerProvider';
import { useEthMaterial } from '@/providers/entities/EthMaterialProvider';
import { useEthEnumerable } from '@/providers/entities/EthEnumerableProvider';
import { useEthOrderTrade } from '@/providers/entities/EthOrderTradeProvider';
import { JsonRpcSigner } from '@ethersproject/providers';
import PDFGenerationView from '@/components/PDFViewer/PDFGenerationView';
import useOrderGenerator from '@/hooks/documentGenerator/useOrderGenerator';

jest.mock('react-router-dom');
jest.mock('@/providers/SignerProvider');
jest.mock('@/pages/Trade/OrderStatusSteps/OrderStatusSteps');
jest.mock('@/components/PDFViewer/PDFGenerationView');
jest.mock('@/providers/entities/EthMaterialProvider');
jest.mock('@/providers/entities/EthEnumerableProvider');
jest.mock('@/providers/entities/EthOrderTradeProvider');
jest.mock('@/hooks/documentGenerator/useOrderGenerator');

describe('Basic Trade View', () => {
    const supplierAddress = '0xsupplierAddress';
    const customerAddress = '0xcustomerAddress';
    const commonElements: FormElement[] = [];

    const updateOrderTrade = jest.fn();
    const confirmNegotiation = jest.fn();
    const getOrderStatus = jest.fn();
    const toggleDisabled = jest.fn();
    const navigate = jest.fn();
    const mockedUseOrderGenerator = jest.fn();

    const signer = { _address: '0x123' } as JsonRpcSigner;
    const productCategories = [{ id: 1, name: 'Product Category 1' }];
    const fiats = ['fiat1', 'fiat2'];
    const units = ['unit1', 'unit2'];
    const orderTrade = {
        tradeId: 1,
        metadata: {
            incoterms: 'incoterms',
            shipper: 'shipper',
            shippingPort: 'shipping-port',
            deliveryPort: 'delivery-port'
        },
        arbiter: 'arbiter',
        paymentDeadline: '2021-01-01',
        documentDeliveryDeadline: '2021-01-02',
        shippingDeadline: '2021-01-03',
        deliveryDeadline: '2021-01-04',
        agreedAmount: 100,
        tokenAddress: '0xtokenAddress',
        supplier: supplierAddress,
        commissioner: customerAddress,
        hasSupplierSigned: true,
        hasCommissionerSigned: true,
        lines: [
            {
                productCategory: { id: 1 },
                quantity: 5,
                unit: 'unit1',
                price: { amount: 1, fiat: 'fiat1' }
            }
        ],
        negotiationStatus: 0
    } as unknown as OrderTrade;

    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.clearAllMocks();

        (useNavigate as jest.Mock).mockReturnValue(navigate);
        (useSigner as jest.Mock).mockReturnValue({ signer });
        (useEthMaterial as jest.Mock).mockReturnValue({ productCategories });
        (useEthEnumerable as jest.Mock).mockReturnValue({ fiats, units });
        (useEthOrderTrade as jest.Mock).mockReturnValue({
            updateOrderTrade,
            confirmNegotiation,
            getOrderStatus
        });
        (useOrderGenerator as jest.Mock).mockReturnValue(mockedUseOrderGenerator);
    });

    it('should render correctly', async () => {
        render(
            <OrderTradeView
                orderTrade={orderTrade}
                disabled={true}
                toggleDisabled={toggleDisabled}
                commonElements={commonElements}
            />
        );
        expect(OrderStatusSteps).toHaveBeenCalledTimes(1);
        const negotiationElements = (OrderStatusSteps as jest.Mock).mock.calls[0][0]
            .negotiationElements;
        expect(negotiationElements).toHaveLength(23);
        expect(PDFGenerationView).toHaveBeenCalledTimes(1);
        expect(PDFGenerationView).toHaveBeenCalledWith(
            {
                title: 'Generated Order',
                visible: false,
                centered: true,
                downloadable: true,
                handleClose: expect.any(Function),
                useGeneration: mockedUseOrderGenerator,
                filename: 'order_1.pdf'
            },
            {}
        );
    });
    it('onSubmit', async () => {
        render(
            <OrderTradeView
                orderTrade={orderTrade}
                disabled={true}
                toggleDisabled={toggleDisabled}
                commonElements={commonElements}
            />
        );

        expect(OrderStatusSteps).toHaveBeenCalledTimes(1);
        const onSubmit = (OrderStatusSteps as jest.Mock).mock.calls[0][0].onSubmit;
        const values = {
            supplier: supplierAddress,
            customer: customerAddress,
            commissioner: customerAddress,
            'payment-deadline': '2021-01-01',
            'document-delivery-deadline': '2021-01-02',
            arbiter: 'arbiter',
            'shipping-deadline': '2021-01-03',
            'delivery-deadline': '2021-01-04',
            'agreed-amount': 100,
            'token-address': '0xtokenAddress',
            incoterms: 'incoterms',
            shipper: 'shipper',
            'shipping-port': 'shipping-port',
            'delivery-port': 'delivery-port',
            'product-category-id-1': 1,
            'quantity-1': 5,
            'quantity-2': 10,
            'fiat-1': 'fiat1',
            'fiat-2': 'fiat2',
            'unit-1': 'unit1',
            'unit-2': 'unit2',
            'price-1': 3,
            'price-2': 4,
            'certificate-of-shipping': {
                name: 'file.pdf'
            }
        };
        await onSubmit(values);
        expect(updateOrderTrade).toHaveBeenCalledTimes(1);
        expect(updateOrderTrade).toHaveBeenCalledWith(orderTrade.tradeId, {
            supplier: supplierAddress,
            customer: customerAddress,
            commissioner: customerAddress,
            lines: [new OrderLineRequest(1, 5, 'unit1', new OrderLinePrice(3, 'fiat1'))],
            paymentDeadline: 1609455600,
            documentDeliveryDeadline: 1609542000,
            arbiter: 'arbiter',
            shippingDeadline: 1609628400,
            deliveryDeadline: 1609714800,
            agreedAmount: 100,
            tokenAddress: '0xtokenAddress',
            incoterms: 'incoterms',
            shipper: 'shipper',
            shippingPort: 'shipping-port',
            deliveryPort: 'delivery-port'
        });
        expect(navigate).toHaveBeenCalledTimes(1);
        expect(toggleDisabled).toHaveBeenCalledTimes(1);
    });
    it('should confirm negotiation on Confirm click', async () => {
        render(
            <OrderTradeView
                orderTrade={orderTrade}
                disabled={true}
                toggleDisabled={toggleDisabled}
                commonElements={commonElements}
            />
        );
        const negotiationElements = (OrderStatusSteps as jest.Mock).mock.calls[0][0]
            .negotiationElements;
        negotiationElements[21].onClick();
        expect(confirmNegotiation).toHaveBeenCalledTimes(1);
    });
    it("should show generated document on 'Generate document' click", async () => {
        render(
            <OrderTradeView
                orderTrade={orderTrade}
                disabled={true}
                toggleDisabled={toggleDisabled}
                commonElements={commonElements}
            />
        );
        const negotiationElements = (OrderStatusSteps as jest.Mock).mock.calls[0][0]
            .negotiationElements;
        act(() => {
            negotiationElements[22].onClick();
        });
        expect(PDFGenerationView).toHaveBeenCalledTimes(2);
        expect((PDFGenerationView as jest.Mock).mock.calls[1][0].visible).toBe(true);
    });
});
