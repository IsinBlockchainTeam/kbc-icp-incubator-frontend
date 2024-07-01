import { useLocation, useNavigate } from 'react-router-dom';
import { act, render, screen, waitFor } from '@testing-library/react';
import { paths } from '@/constants/paths';
import useMaterial from '@/hooks/useMaterial';
import { FormElement } from '@/components/GenericForm/GenericForm';
import useTrade from '@/hooks/useTrade';
import useMeasure from '@/hooks/useMeasure';
import { OrderLineRequest, OrderLinePrice } from '@kbc-lib/coffee-trading-management-lib';
import userEvent from '@testing-library/user-event';
import { OrderTradeNew } from '@/pages/Trade/New/OrderTradeNew';
import OrderForm from '@/pages/Trade/OrderForm';

jest.mock('react-router-dom');
jest.mock('@/providers/SignerProvider');
jest.mock('@/hooks/useTrade');
jest.mock('@/hooks/useMeasure');
jest.mock('@/hooks/useMaterial');
jest.mock('@/pages/Trade/OrderForm');

describe('Basic Trade New', () => {
    const supplierAddress = '0xsupplierAddress';
    const customerAddress = '0xcustomerAddress';
    const productCategoryId = 1;
    const commonElements: FormElement[] = [];

    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.clearAllMocks();
    });

    it('should render correctly', async () => {
        (useLocation as jest.Mock).mockReturnValue({
            state: { productCategoryId: 1 }
        });
        (useTrade as jest.Mock).mockReturnValue({
            saveBasicTrade: jest.fn()
        });
        (useMaterial as jest.Mock).mockReturnValue({
            dataLoaded: true,
            productCategories: [{ id: 1, name: 'Product Category 1' }]
        });
        (useMeasure as jest.Mock).mockReturnValue({
            fiats: ['fiat1', 'fiat2'],
            units: ['unit1', 'unit2']
        });
        await act(async () => {
            render(
                <OrderTradeNew
                    supplierAddress={supplierAddress}
                    customerAddress={customerAddress}
                    productCategoryId={productCategoryId}
                    commonElements={commonElements}
                />
            );
        });
        await waitFor(() => {
            expect(OrderForm).toHaveBeenCalledTimes(1);
        });
        const negotiationElements = (OrderForm as jest.Mock).mock.calls[0][0].negotiationElements;
        expect(negotiationElements).toHaveLength(18);
    });
    it('should render nothing if data is not loaded', async () => {
        const loadData = jest.fn();
        (useLocation as jest.Mock).mockReturnValue({
            state: { productCategoryId: 1 }
        });
        (useTrade as jest.Mock).mockReturnValue({
            saveBasicTrade: jest.fn()
        });
        (useMaterial as jest.Mock).mockReturnValue({
            dataLoaded: false,
            loadData,
            productCategories: [{ id: 1, name: 'Product Category 1' }]
        });
        (useMeasure as jest.Mock).mockReturnValue({
            fiats: ['fiat1', 'fiat2'],
            units: ['unit1', 'unit2']
        });
        await act(async () => {
            render(
                <OrderTradeNew
                    supplierAddress={supplierAddress}
                    customerAddress={customerAddress}
                    productCategoryId={productCategoryId}
                    commonElements={commonElements}
                />
            );
        });
        await waitFor(() => {
            expect(OrderForm).not.toHaveBeenCalled();
        });
        expect(loadData).toHaveBeenCalledTimes(1);
    });
    it('onSubmit', async () => {
        const navigate = jest.fn();
        const saveOrderTrade = jest.fn();
        (useLocation as jest.Mock).mockReturnValue({
            state: { productCategoryId: 1 }
        });
        (useNavigate as jest.Mock).mockReturnValue(navigate);
        (useTrade as jest.Mock).mockReturnValue({
            saveOrderTrade
        });
        (useMaterial as jest.Mock).mockReturnValue({
            dataLoaded: true,
            productCategories: [{ id: 1, name: 'Product Category 1' }]
        });
        (useMeasure as jest.Mock).mockReturnValue({
            fiats: ['fiat1', 'fiat2'],
            units: ['unit1', 'unit2']
        });
        await act(async () => {
            render(
                <OrderTradeNew
                    supplierAddress={supplierAddress}
                    customerAddress={customerAddress}
                    productCategoryId={productCategoryId}
                    commonElements={commonElements}
                />
            );
        });
        await waitFor(() => {
            expect(OrderForm).toHaveBeenCalledTimes(1);
        });
        const onSubmit = (OrderForm as jest.Mock).mock.calls[0][0].onSubmitNew;
        const values = {
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
            'product-category-id-2': 2,
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
        expect(saveOrderTrade).toHaveBeenCalledTimes(1);
        expect(saveOrderTrade).toHaveBeenCalledWith({
            supplier: supplierAddress,
            customer: customerAddress,
            commissioner: customerAddress,
            lines: [
                new OrderLineRequest(2, 10, 'unit2', new OrderLinePrice(4, 'fiat2')),
                new OrderLineRequest(1, 5, 'unit1', new OrderLinePrice(3, 'fiat1'))
            ],
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
    });
    it('should navigate to Trades when clicking on Delete button', async () => {
        const navigate = jest.fn();
        const saveBasicTrade = jest.fn();
        (useLocation as jest.Mock).mockReturnValue({
            state: { productCategoryId: 1 }
        });
        (useNavigate as jest.Mock).mockReturnValue(navigate);
        (useTrade as jest.Mock).mockReturnValue({
            saveBasicTrade
        });
        (useMaterial as jest.Mock).mockReturnValue({
            dataLoaded: true,
            productCategories: [{ id: 1, name: 'Product Category 1' }]
        });
        (useMeasure as jest.Mock).mockReturnValue({
            fiats: ['fiat1', 'fiat2'],
            units: ['unit1', 'unit2']
        });
        await act(async () => {
            render(
                <OrderTradeNew
                    supplierAddress={supplierAddress}
                    customerAddress={customerAddress}
                    productCategoryId={productCategoryId}
                    commonElements={commonElements}
                />
            );
        });
        await waitFor(() => {
            expect(OrderForm).toHaveBeenCalledTimes(1);
        });
        act(() => userEvent.click(screen.getByRole('button', { name: 'delete Delete Trade' })));

        expect(navigate).toHaveBeenCalledTimes(1);
        expect(navigate).toHaveBeenCalledWith(paths.TRADES);
    });
});
