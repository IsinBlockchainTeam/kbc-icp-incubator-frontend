import { useLocation, useNavigate } from 'react-router-dom';
import { act, render, screen } from '@testing-library/react';
import { paths } from '@/constants/paths';
import { FormElement, GenericForm } from '@/components/GenericForm/GenericForm';
import { OrderLineRequest, OrderLinePrice } from '@kbc-lib/coffee-trading-management-lib';
import userEvent from '@testing-library/user-event';
import { OrderTradeNew } from '@/pages/Trade/New/OrderTradeNew';
import { useEthMaterial } from '@/providers/entities/EthMaterialProvider';
import { useEthEnumerable } from '@/providers/entities/EthEnumerableProvider';
import { useEthOrderTrade } from '@/providers/entities/EthOrderTradeProvider';
import dayjs from 'dayjs';

jest.mock('react-router-dom');
jest.mock('@/providers/entities/EthMaterialProvider');
jest.mock('@/providers/entities/EthEnumerableProvider');
jest.mock('@/providers/entities/EthOrderTradeProvider');
jest.mock('@/components/GenericForm/GenericForm');

describe('Basic Trade New', () => {
    const supplierAddress = '0xsupplierAddress';
    const customerAddress = '0xcustomerAddress';
    const productCategoryId = 1;
    const commonElements: FormElement[] = [];
    const productCategories = [{ id: 1, name: 'Product Category 1' }];
    const fiats = ['fiat1', 'fiat2'];
    const units = ['unit1', 'unit2'];
    const saveOrderTrade = jest.fn();
    const navigate = jest.fn();

    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.clearAllMocks();

        (useLocation as jest.Mock).mockReturnValue({
            state: { productCategoryId: 1 }
        });
        (useNavigate as jest.Mock).mockReturnValue(navigate);
        (useEthMaterial as jest.Mock).mockReturnValue({ productCategories });
        (useEthEnumerable as jest.Mock).mockReturnValue({ fiats, units });
        (useEthOrderTrade as jest.Mock).mockReturnValue({ saveOrderTrade });
    });

    it('should render correctly', async () => {
        render(
            <OrderTradeNew
                supplierAddress={supplierAddress}
                customerAddress={customerAddress}
                productCategoryId={productCategoryId}
                commonElements={commonElements}
            />
        );

        expect(GenericForm).toHaveBeenCalled();
        expect(GenericForm).toHaveBeenCalledWith(
            {
                elements: expect.any(Array),
                submittable: true,
                onSubmit: expect.any(Function)
            },
            {}
        );
        expect((GenericForm as jest.Mock).mock.calls[0][0].elements).toHaveLength(18);
        const paymentDeadline = (GenericForm as jest.Mock).mock.calls[0][0].elements[3];
        const pastDate = dayjs().subtract(1, 'day');
        const futureDate = dayjs().add(1, 'day');
        expect(paymentDeadline.disableValues(pastDate)).toBeTruthy();
        expect(paymentDeadline.disableValues(futureDate)).toBeFalsy();
    });
    it('onSubmit', async () => {
        render(
            <OrderTradeNew
                supplierAddress={supplierAddress}
                customerAddress={customerAddress}
                productCategoryId={productCategoryId}
                commonElements={commonElements}
            />
        );
        const values = {
            supplier: supplierAddress,
            customer: customerAddress,
            commissioner: customerAddress,
            'product-category-id-1': productCategoryId,
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
        await (GenericForm as jest.Mock).mock.calls[0][0].onSubmit(values);

        expect(saveOrderTrade).toHaveBeenCalledTimes(1);
        expect(saveOrderTrade).toHaveBeenCalledWith({
            supplier: supplierAddress,
            customer: customerAddress,
            commissioner: customerAddress,
            lines: [
                new OrderLineRequest(1, 5, 'unit1', new OrderLinePrice(3, 'fiat1')),
                new OrderLineRequest(2, 10, 'unit2', new OrderLinePrice(4, 'fiat2'))
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
        render(
            <OrderTradeNew
                supplierAddress={supplierAddress}
                customerAddress={customerAddress}
                productCategoryId={productCategoryId}
                commonElements={commonElements}
            />
        );

        act(() => userEvent.click(screen.getByRole('button', { name: 'delete Delete Trade' })));

        expect(navigate).toHaveBeenCalledTimes(1);
        expect(navigate).toHaveBeenCalledWith(paths.TRADES);
    });
});
