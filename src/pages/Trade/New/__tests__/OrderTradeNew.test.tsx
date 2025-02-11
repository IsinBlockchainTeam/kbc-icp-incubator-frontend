import React from 'react';
import { act, fireEvent, render } from '@testing-library/react';
import { OrderTradeNew } from '@/pages/Trade/New/OrderTradeNew';
import { useNavigate } from 'react-router-dom';
import { useEnumeration } from '@/providers/entities/icp/EnumerationProvider';
import { useProductCategory } from '@/providers/entities/icp/ProductCategoryProvider';
import { useMaterial } from '@/providers/entities/icp/MaterialProvider';
import { useOrder } from '@/providers/entities/icp/OrderProvider';
import { GenericForm } from '@/components/GenericForm/GenericForm';
import dayjs from 'dayjs';
import { paths } from '@/constants/paths';
import { Material, ProductCategory } from '@kbc-lib/coffee-trading-management-lib';
import { useBusinessRelation } from '@/providers/entities/icp/BusinessRelationProvider';

jest.mock('react-router-dom', () => ({
    useNavigate: jest.fn()
}));

jest.mock('@/providers/entities/icp/EnumerationProvider', () => ({
    useEnumeration: jest.fn()
}));

jest.mock('@/providers/entities/icp/ProductCategoryProvider', () => ({
    useProductCategory: jest.fn()
}));

jest.mock('@/providers/entities/icp/MaterialProvider', () => ({
    useMaterial: jest.fn()
}));

jest.mock('@/providers/entities/icp/OrderProvider', () => ({
    useOrder: jest.fn()
}));

jest.mock('@/providers/entities/icp/BusinessRelationProvider', () => ({
    useBusinessRelation: jest.fn()
}));

jest.mock('@/components/GenericForm/GenericForm', () => ({
    ...jest.requireActual('@/components/GenericForm/GenericForm'),
    GenericForm: jest.fn(() => null)
}));
describe('Order Trade New', () => {
    const mockUseNavigate = useNavigate as jest.Mock;
    const mockUseEnumeration = useEnumeration as jest.Mock;
    const mockUseProductCategory = useProductCategory as jest.Mock;
    const mockUseMaterial = useMaterial as jest.Mock;
    const mockUseOrder = useOrder as jest.Mock;
    const mockUseBusinessRelation = useBusinessRelation as jest.Mock;

    const mockCreateOrder = jest.fn();
    const mockGetBusinessRelation = jest.fn();
    const mockDiscloseInformation = jest.fn();
    const mockNavigate = jest.fn();

    const mockGenericForm = GenericForm as jest.Mock;
    const supplierMaterial = new Material(1, 'owner1', 'name1', new ProductCategory(1, 'Product Category 1'), 'typology', '85', '20%', false);

    beforeEach(() => {
        mockNavigate.mockReset();
        mockUseNavigate.mockReturnValue(mockNavigate);
        mockUseEnumeration.mockReturnValue({ units: ['kg'], fiats: ['USD'] });
        mockUseProductCategory.mockReturnValue({ productCategories: [{ id: 1, name: 'Coffee' }] });
        mockUseMaterial.mockReturnValue({ materials: [{ id: 1, name: 'Arabica', productCategory: { id: 1, name: 'Coffee' }, isInput: true }] });
        mockUseOrder.mockReturnValue({ createOrder: mockCreateOrder });
        mockUseBusinessRelation.mockReturnValue({ getBusinessRelation: mockGetBusinessRelation, discloseInformation: mockDiscloseInformation });
    });

    it('renders GenericForm with correct props', () => {
        render(<OrderTradeNew supplierAddress="supplier" customerAddress="customer" commonElements={[]} supplierMaterial={supplierMaterial} />);
        expect(GenericForm).toHaveBeenCalledWith(
            expect.objectContaining({
                elements: expect.arrayContaining([
                    expect.objectContaining({ name: 'shipping-deadline', label: 'Shipping Deadline' }),
                    expect.objectContaining({ name: 'delivery-port', label: 'Delivery Port' }),
                    expect.objectContaining({ name: 'delivery-deadline', label: 'Delivery Deadline' }),
                    expect.objectContaining({ name: 'agreed-amount', label: 'Agreed Amount' }),
                    expect.objectContaining({ name: 'token-address', label: 'Token Address' }),
                    expect.objectContaining({ name: 'supplier-material', label: 'Supplier Material' }),
                    expect.objectContaining({ name: 'commissioner-material', label: 'Commissioner Material' }),
                    expect.objectContaining({ name: 'quantity', label: 'Quantity' }),
                    expect.objectContaining({ name: 'unit', label: 'Unit' }),
                    expect.objectContaining({ name: 'price', label: 'Price' }),
                    expect.objectContaining({ name: 'fiat', label: 'Fiat' })
                ]),
                onSubmit: expect.any(Function),
                submittable: true
            }),
            {}
        );
    });

    it('disables past dates in disabledDate function', () => {
        render(<OrderTradeNew supplierAddress="supplier" customerAddress="customer" commonElements={[]} supplierMaterial={supplierMaterial} />);
        const disabledDate = mockGenericForm.mock.calls[0][0].elements.find((element: any) => element.name === 'payment-deadline')?.disableValues;
        expect(disabledDate(dayjs().subtract(1, 'day'))).toBe(true);
        expect(disabledDate(dayjs().add(1, 'day'))).toBe(false);
    });

    it('renders contextualizedContent correctly', () => {
        render(<OrderTradeNew supplierAddress="supplier" customerAddress="customer" commonElements={[]} supplierMaterial={supplierMaterial} />);
        const content = mockGenericForm.mock.calls[0][0].elements.find((element: any) => element.name === 'commissioner-material-details')?.content;
        const values = { 'commissioner-material': 1 };
        const actualContent = content(values);
        const { getByText } = render(actualContent);
        expect(getByText('Arabica')).toBeInTheDocument();
    });

    it('calls onSubmit with correct values', async () => {
        const mockOnSubmit = jest.fn();
        mockGenericForm.mockImplementation(({ onSubmit }) => {
            mockOnSubmit.mockImplementation(onSubmit);
            return null;
        });
        mockGetBusinessRelation.mockImplementation(() => {
            throw new Error('No relation found');
        });

        render(<OrderTradeNew supplierAddress="supplier" customerAddress="customer" commonElements={[]} supplierMaterial={supplierMaterial} />);
        const values = {
            arbiter: '0x123',
            'payment-deadline': dayjs().add(1, 'day').format('YYYY-MM-DD'),
            'document-delivery-deadline': dayjs().add(2, 'day').format('YYYY-MM-DD'),
            shipper: 'Shipper',
            'shipping-port': 'Port A',
            'shipping-deadline': dayjs().add(3, 'day').format('YYYY-MM-DD'),
            'delivery-port': 'Port B',
            'delivery-deadline': dayjs().add(4, 'day').format('YYYY-MM-DD'),
            'agreed-amount': '1000',
            'token-address': '0x456',
            incoterms: 'incoterms',
            quantity: '10',
            unit: 'kg',
            price: '100',
            fiat: 'USD',
            'supplier-material': 0,
            'commissioner-material': 1
        };
        await mockOnSubmit(values);

        expect(mockCreateOrder).toHaveBeenCalledWith(
            expect.objectContaining({
                supplier: 'supplier',
                customer: 'customer',
                commissioner: 'customer',
                paymentDeadline: expect.any(Date),
                documentDeliveryDeadline: expect.any(Date),
                arbiter: '0x123',
                shippingDeadline: expect.any(Date),
                deliveryDeadline: expect.any(Date),
                agreedAmount: 1000,
                token: '0x456',
                incoterms: 'incoterms',
                shipper: 'Shipper',
                shippingPort: 'Port A',
                deliveryPort: 'Port B',
                lines: [
                    {
                        supplierMaterialId: 0,
                        commissionerMaterialId: 1,
                        quantity: 10,
                        unit: 'kg',
                        price: {
                            amount: 100,
                            fiat: 'USD'
                        }
                    }
                ]
            })
        );

        expect(mockGetBusinessRelation).toHaveBeenCalledTimes(1);
        expect(mockDiscloseInformation).toHaveBeenCalledTimes(1);

        expect(mockNavigate).toHaveBeenCalledWith(paths.TRADES);
    });

    it('navigates to trades page on delete button click', () => {
        const { getByText } = render(
            <OrderTradeNew supplierAddress="supplier" customerAddress="customer" commonElements={[]} supplierMaterial={supplierMaterial} />
        );
        act(() => {
            fireEvent.click(getByText('Delete Trade'));
        });
        expect(mockNavigate).toHaveBeenCalledWith(paths.TRADES);
    });
});
