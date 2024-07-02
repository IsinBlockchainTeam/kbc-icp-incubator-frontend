import { act, render, waitFor } from '@testing-library/react';
import { FormElement } from '@/components/GenericForm/GenericForm';
import useTrade from '@/hooks/useTrade';
import { OrderTradeView } from '@/pages/Trade/View/OrderTradeView';
import OrderStatusSteps from '@/pages/Trade/OrderStatusSteps/OrderStatusSteps';
import { OrderTradePresentable } from '@/api/types/TradePresentable';
import useDocument from '@/hooks/useDocument';
import { useNavigate } from 'react-router-dom';
import {
    DocumentStatus,
    DocumentType,
    OrderLinePrice,
    OrderLineRequest
} from '@kbc-lib/coffee-trading-management-lib';
import { SignerContext, SignerContextState } from '@/providers/SignerProvider';
import { useEthMaterial } from '@/providers/entities/EthMaterialProvider';
import { useEthEnumerable } from '@/providers/entities/EthEnumerableProvider';

jest.mock('react-router-dom');
jest.mock('@/providers/SignerProvider');
jest.mock('@/hooks/useTrade');
jest.mock('@/hooks/useDocument');
jest.mock('@/pages/Trade/OrderStatusSteps/OrderStatusSteps');
jest.mock('@/providers/entities/EthMaterialProvider');
jest.mock('@/providers/entities/EthEnumerableProvider');

describe('Basic Trade View', () => {
    const signerContextValue = {
        signer: {
            address: '0x123'
        }
    } as unknown as SignerContextState;
    const supplierAddress = '0xsupplierAddress';
    const customerAddress = '0xcustomerAddress';
    const commonElements: FormElement[] = [];

    const loadData = jest.fn();
    const updateOrderTrade = jest.fn();
    const confirmNegotiation = jest.fn();
    const validateDocument = jest.fn();
    const toggleDisabled = jest.fn();

    const orderTradePresentable = {
        trade: {
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
        },
        status: 0
    } as unknown as OrderTradePresentable;

    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.clearAllMocks();

        (useDocument as jest.Mock).mockReturnValue({
            validateDocument
        });
        (useEthMaterial as jest.Mock).mockReturnValue({
            loadData,
            dataLoaded: true,
            productCategories: [{ id: 1, name: 'Product Category 1' }]
        });
        (useEthEnumerable as jest.Mock).mockReturnValue({
            fiats: ['fiat1', 'fiat2'],
            units: ['unit1', 'unit2']
        });
        (useTrade as jest.Mock).mockReturnValue({
            updateOrderTrade,
            confirmNegotiation
        });
    });

    it('should render correctly', async () => {
        await act(async () => {
            render(
                <OrderTradeView
                    orderTradePresentable={orderTradePresentable}
                    disabled={true}
                    toggleDisabled={toggleDisabled}
                    commonElements={commonElements}
                />
            );
        });
        await waitFor(() => {
            expect(OrderStatusSteps).toHaveBeenCalledTimes(1);
        });
        const negotiationElements = (OrderStatusSteps as jest.Mock).mock.calls[0][0]
            .negotiationElements;
        expect(negotiationElements).toHaveLength(22);
    });
    it('onSubmit', async () => {
        const navigate = jest.fn();
        (useNavigate as jest.Mock).mockReturnValue(navigate);
        render(
            <OrderTradeView
                orderTradePresentable={orderTradePresentable}
                disabled={true}
                toggleDisabled={toggleDisabled}
                commonElements={commonElements}
            />
        );

        expect(OrderStatusSteps).toHaveBeenCalledTimes(1);
        const onSubmit = (OrderStatusSteps as jest.Mock).mock.calls[0][0].onSubmitView;
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
        expect(updateOrderTrade).toHaveBeenCalledWith(orderTradePresentable.trade.tradeId, {
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
                orderTradePresentable={orderTradePresentable}
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
    it('validationCallback', async () => {
        render(
            <SignerContext.Provider value={signerContextValue}>
                <OrderTradeView
                    orderTradePresentable={orderTradePresentable}
                    disabled={true}
                    toggleDisabled={toggleDisabled}
                    commonElements={commonElements}
                />
            </SignerContext.Provider>
        );

        const validationCallback = (OrderStatusSteps as jest.Mock).mock.calls[0][0]
            .validationCallback;
        const resp = validationCallback(
            {
                trade: {
                    tradeId: 1
                },
                documents: new Map().set(DocumentType.DELIVERY_NOTE, {
                    id: 1,
                    name: 'file.pdf',
                    status: DocumentStatus.NOT_EVALUATED,
                    uploadedBy: 'signer'
                })
            },
            DocumentType.DELIVERY_NOTE
        );
        expect(resp).toHaveProperty('approve');
        expect(resp).toHaveProperty('reject');

        resp.approve();
        expect(validateDocument).toHaveBeenCalledTimes(1);
        expect(validateDocument).toHaveBeenCalledWith(1, 1, DocumentStatus.APPROVED);

        resp.reject();
        expect(validateDocument).toHaveBeenCalledTimes(2);
        expect(validateDocument).toHaveBeenCalledWith(1, 1, DocumentStatus.NOT_APPROVED);
    });
});
