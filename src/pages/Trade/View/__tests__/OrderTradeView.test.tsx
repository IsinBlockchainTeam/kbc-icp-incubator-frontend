import { act, render } from '@testing-library/react';
import '@testing-library/jest-dom';
import OrderTradeView from '../OrderTradeView';
import { useNavigate } from 'react-router-dom';
import { useOrder } from '@/providers/entities/icp/OrderProvider';
import { useEnumeration } from '@/providers/entities/icp/EnumerationProvider';
import { useMaterial } from '@/providers/entities/icp/MaterialProvider';
import { GenericForm } from '@/components/GenericForm/GenericForm';
import dayjs from 'dayjs';
import { paths } from '@/constants/paths';
import { Material, ProductCategory, Organization } from '@kbc-lib/coffee-trading-management-lib';
import { useSession } from '@/providers/auth/SessionProvider';

jest.mock('react-router-dom', () => ({
    useNavigate: jest.fn()
}));
jest.mock('@/providers/auth/SessionProvider', () => ({
    useSession: jest.fn()
}));
jest.mock('@/providers/entities/icp/OrderProvider', () => ({
    useOrder: jest.fn()
}));
jest.mock('@/providers/entities/icp/EnumerationProvider', () => ({
    useEnumeration: jest.fn()
}));
jest.mock('@/providers/entities/icp/MaterialProvider', () => ({
    useMaterial: jest.fn()
}));
jest.mock('@/components/GenericForm/GenericForm', () => ({
    ...jest.requireActual('@/components/GenericForm/GenericForm'),
    GenericForm: jest.fn(() => null)
}));
jest.mock('@/hooks/documentGenerator/useOrderGenerator', () => jest.fn());
jest.mock('@/components/PDFViewer/PDFGenerationView', () => jest.fn(() => null));

describe('OrderTradeView', () => {
    const mockNavigate = jest.fn();
    const mockToggleDisabled = jest.fn();
    const mockUpdate = jest.fn();
    const mockSign = jest.fn();
    const supplierMaterial = new Material(1, 'owner1', 'Material1', new ProductCategory(1, 'Product Category 1'), 'typology', '85', '20%', false);
    const commissionerMaterial = new Material(2, 'owner2', 'Material2', new ProductCategory(2, 'Product Category 2'), 'typology2', '90', '15%', true);
    const mockUseOrder = {
        order: {
            id: '1',
            status: 'PENDING',
            supplier: '0xSupplier',
            customer: '0xCustomer',
            commissioner: '0xCommissioner',
            paymentDeadline: new Date(),
            documentDeliveryDeadline: new Date(),
            arbiter: '0xArbiter',
            token: '0xToken',
            shippingDeadline: new Date(),
            deliveryDeadline: new Date(),
            agreedAmount: 1000,
            incoterms: 'FOB',
            shipper: 'Shipper',
            shippingPort: 'ShippingPort',
            deliveryPort: 'DeliveryPort',
            lines: [
                {
                    supplierMaterial,
                    commissionerMaterial,
                    quantity: 10,
                    unit: 'kg',
                    price: { amount: 100, fiat: 'USD' }
                }
            ],
            signatures: []
        },
        updateOrder: mockUpdate,
        signOrder: mockSign
    };
    const mockOrganization = { ethAddress: '0xSigner' } as Organization;
    const mockGetLoggedOrganization = jest.fn();
    const mockUseSession = { getLoggedOrganization: mockGetLoggedOrganization };
    const mockUseEnumeration = { units: ['kg'], fiats: ['USD'] };
    const mockUseMaterial = { materials: [supplierMaterial, commissionerMaterial] };
    const mockGenericForm = GenericForm as jest.Mock;

    beforeEach(() => {
        mockGetLoggedOrganization.mockReturnValue(mockOrganization);
        (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
        (useSession as jest.Mock).mockReturnValue(mockUseSession);
        (useOrder as jest.Mock).mockReturnValue(mockUseOrder);
        (useEnumeration as jest.Mock).mockReturnValue(mockUseEnumeration);
        (useMaterial as jest.Mock).mockReturnValue(mockUseMaterial);
    });

    it('renders OrderTradeView with order data', () => {
        render(<OrderTradeView disabled={false} toggleDisabled={mockToggleDisabled} commonElements={[]} />);
        const formProps = mockGenericForm.mock.calls[0][0];
        expect(formProps.elements).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ label: 'Constraints' }),
                expect.objectContaining({ label: 'Incoterms' }),
                expect.objectContaining({ label: 'Arbiter' }),
                expect.objectContaining({ label: 'Payment Deadline' }),
                expect.objectContaining({ label: 'Document Delivery Deadline' }),
                expect.objectContaining({ label: 'Shipper' }),
                expect.objectContaining({ label: 'Shipping Port' }),
                expect.objectContaining({ label: 'Shipping Deadline' }),
                expect.objectContaining({ label: 'Delivery Port' }),
                expect.objectContaining({ label: 'Delivery Deadline' }),
                expect.objectContaining({ label: 'Agreed Amount' }),
                expect.objectContaining({ label: 'Token Address' }),
                expect.objectContaining({ label: 'Supplier Material' }),
                expect.objectContaining({ label: 'Commissioner Material' }),
                expect.objectContaining({ label: 'Quantity' }),
                expect.objectContaining({ label: 'Unit' }),
                expect.objectContaining({ label: 'Price' }),
                expect.objectContaining({ label: 'Fiat' }),
                expect.objectContaining({ name: 'back' }),
                expect.objectContaining({ name: 'edit' }),
                expect.objectContaining({ name: 'generateDocument' })
            ])
        );
    });

    it('toggles editing mode from disabled to enabled', async () => {
        render(<OrderTradeView disabled={true} toggleDisabled={mockToggleDisabled} commonElements={[]} />);
        const formProps = mockGenericForm.mock.calls[0][0];
        await act(async () => {
            await formProps.elements.find((element: any) => element.name === 'edit').onClick();
        });
        expect(mockToggleDisabled).toHaveBeenCalled();
        const newFormProps = mockGenericForm.mock.calls[1][0];
        expect(newFormProps.elements.find((element: any) => element.name === 'back').hidden).toBe(false);
    });

    it('toggles editing mode from enabled to disabled', async () => {
        render(<OrderTradeView disabled={false} toggleDisabled={mockToggleDisabled} commonElements={[]} />);
        const formProps = mockGenericForm.mock.calls[0][0];
        await act(async () => {
            await formProps.elements.find((element: any) => element.name === 'back').onClick();
        });
        expect(mockToggleDisabled).toHaveBeenCalled();
        const newFormProps = mockGenericForm.mock.calls[1][0];
        expect(newFormProps.elements.find((element: any) => element.name === 'edit').hidden).toBe(true);
    });

    it('submits the form with valid values', async () => {
        render(<OrderTradeView disabled={false} toggleDisabled={mockToggleDisabled} commonElements={[]} />);
        const formProps = mockGenericForm.mock.calls[0][0];
        await act(async () => {
            await formProps.onSubmit({
                'payment-deadline': dayjs().add(1, 'day').toISOString(),
                'document-delivery-deadline': dayjs().add(2, 'days').toISOString(),
                arbiter: '0xArbiter',
                'token-address': '0xToken',
                'shipping-deadline': dayjs().add(3, 'days').toISOString(),
                'delivery-deadline': dayjs().add(4, 'days').toISOString(),
                'agreed-amount': '1000',
                incoterms: 'FOB',
                shipper: 'Shipper',
                'shipping-port': 'ShippingPort',
                'delivery-port': 'DeliveryPort',
                'supplier-material': '1',
                'commissioner-material': '2',
                quantity: '10',
                unit: 'kg',
                price: '100',
                fiat: 'USD'
            });
        });
        expect(mockUpdate).toHaveBeenCalledWith({
            supplier: '0xSupplier',
            customer: '0xCustomer',
            commissioner: '0xCommissioner',
            paymentDeadline: expect.any(Date),
            documentDeliveryDeadline: expect.any(Date),
            arbiter: '0xArbiter',
            token: '0xToken',
            shippingDeadline: expect.any(Date),
            deliveryDeadline: expect.any(Date),
            agreedAmount: 1000,
            incoterms: 'FOB',
            shipper: 'Shipper',
            shippingPort: 'ShippingPort',
            deliveryPort: 'DeliveryPort',
            lines: [
                {
                    supplierMaterialId: '1',
                    commissionerMaterialId: '2',
                    quantity: 10,
                    unit: 'kg',
                    price: {
                        amount: 100,
                        fiat: 'USD'
                    }
                }
            ]
        });
        expect(mockToggleDisabled).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith(paths.TRADES);
    });

    it('renders supplier material select with correct options when signer is commissioner', () => {
        mockUseOrder.order.commissioner = '0xSigner';
        render(<OrderTradeView disabled={false} toggleDisabled={mockToggleDisabled} commonElements={[]} />);
        const formProps = mockGenericForm.mock.calls[0][0];
        const supplierMaterialSelect = formProps.elements.find((element: any) => element.name === 'supplier-material');
        expect(supplierMaterialSelect.options).toEqual([{ label: 'Material1', value: 1 }]);
        mockUseOrder.order.commissioner = '0xCommissioner';
    });

    it('renders supplier material select with correct options when signer is supplier', () => {
        mockUseOrder.order.supplier = '0xSigner';
        render(<OrderTradeView disabled={false} toggleDisabled={mockToggleDisabled} commonElements={[]} />);
        const formProps = mockGenericForm.mock.calls[0][0];
        const supplierMaterialSelect = formProps.elements.find((element: any) => element.name === 'supplier-material');
        expect(supplierMaterialSelect.options).toEqual([{ label: 'Material1', value: 1 }]);
        mockUseOrder.order.supplier = '0xSupplier';
    });

    it('renders commissioner material select with correct options when signer is commissioner', () => {
        mockUseOrder.order.commissioner = '0xSigner';
        render(<OrderTradeView disabled={false} toggleDisabled={mockToggleDisabled} commonElements={[]} />);
        const formProps = mockGenericForm.mock.calls[0][0];
        const commissionerMaterialSelect = formProps.elements.find((element: any) => element.name === 'commissioner-material');
        expect(commissionerMaterialSelect.options).toEqual([{ label: 'Material2', value: 2 }]);
        mockUseOrder.order.commissioner = '0xCommissioner';
    });

    it('renders supplier material details card with correct content when signer is the commissioner', () => {
        mockUseOrder.order.commissioner = '0xSigner';
        render(<OrderTradeView disabled={false} toggleDisabled={mockToggleDisabled} commonElements={[]} />);
        const formProps = mockGenericForm.mock.calls[0][0];
        const supplierMaterialDetailsCard = formProps.elements.find((element: any) => element.name === 'supplier-material-details');
        const { getByText } = render(supplierMaterialDetailsCard.content({}));
        expect(getByText(supplierMaterial.name)).toBeInTheDocument();
        mockUseOrder.order.commissioner = '0xCommissioner';
    });

    it('renders supplier material details card with correct content when signer is supplier', () => {
        mockUseOrder.order.supplier = '0xSigner';
        render(<OrderTradeView disabled={false} toggleDisabled={mockToggleDisabled} commonElements={[]} />);
        const formProps = mockGenericForm.mock.calls[0][0];
        const supplierMaterialDetailsCard = formProps.elements.find((element: any) => element.name === 'supplier-material-details');
        const { getByText } = render(supplierMaterialDetailsCard.content({ 'supplier-material': 1 }));
        expect(getByText(supplierMaterial.name)).toBeInTheDocument();
        mockUseOrder.order.supplier = '0xSupplier';
    });

    it('renders empty supplier material details card when supplier material is not selected', () => {
        mockUseOrder.order.supplier = '0xSigner';
        render(<OrderTradeView disabled={false} toggleDisabled={mockToggleDisabled} commonElements={[]} />);
        const formProps = mockGenericForm.mock.calls[0][0];
        const supplierMaterialDetailsCard = formProps.elements.find((element: any) => element.name === 'supplier-material-details');
        const { queryByText } = render(supplierMaterialDetailsCard.content({}));
        expect(queryByText(supplierMaterial.name)).toBeNull();
        mockUseOrder.order.supplier = '0xSupplier';
    });

    it('renders commissioner material details card with correct content when signer is the supplier', () => {
        mockUseOrder.order.supplier = '0xSigner';
        render(<OrderTradeView disabled={false} toggleDisabled={mockToggleDisabled} commonElements={[]} />);
        const formProps = mockGenericForm.mock.calls[0][0];
        const commissionerMaterialDetailsCard = formProps.elements.find((element: any) => element.name === 'commissioner-material-details');
        const { getByText } = render(commissionerMaterialDetailsCard.content({}));
        expect(getByText(commissionerMaterial.name)).toBeInTheDocument();
        mockUseOrder.order.supplier = '0xSupplier';
    });

    it('renders commissioner material details card with correct content when signer is commissioner', () => {
        mockUseOrder.order.commissioner = '0xSigner';
        render(<OrderTradeView disabled={false} toggleDisabled={mockToggleDisabled} commonElements={[]} />);
        const formProps = mockGenericForm.mock.calls[0][0];
        const commissionerMaterialDetailsCard = formProps.elements.find((element: any) => element.name === 'commissioner-material-details');
        const { getByText } = render(commissionerMaterialDetailsCard.content({ 'commissioner-material': 2 }));
        expect(getByText(commissionerMaterial.name)).toBeInTheDocument();
        mockUseOrder.order.commissioner = '0xCommissioner';
    });

    it('renders empty commissioner material details card when commissioner material is not selected', () => {
        mockUseOrder.order.commissioner = '0xSigner';
        render(<OrderTradeView disabled={false} toggleDisabled={mockToggleDisabled} commonElements={[]} />);
        const formProps = mockGenericForm.mock.calls[0][0];
        const commissionerMaterialDetailsCard = formProps.elements.find((element: any) => element.name === 'commissioner-material-details');
        const { queryByText } = render(commissionerMaterialDetailsCard.content({}));
        expect(queryByText(commissionerMaterial.name)).toBeNull();
        mockUseOrder.order.commissioner = '0xSupplier';
    });
});
