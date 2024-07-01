import { useLocation, useNavigate } from 'react-router-dom';
import { act, render, screen, waitFor } from '@testing-library/react';
import { paths } from '@/constants/paths';
import { BasicTradeNew } from '@/pages/Trade/New/BasicTradeNew';
import useMaterial from '@/hooks/useMaterial';
import { FormElement, GenericForm } from '@/components/GenericForm/GenericForm';
import useTrade from '@/hooks/useTrade';
import useMeasure from '@/hooks/useMeasure';
import { LineRequest, DocumentType } from '@kbc-lib/coffee-trading-management-lib';
import userEvent from '@testing-library/user-event';

jest.mock('react-router-dom');
jest.mock('@/providers/SignerProvider');
jest.mock('@/hooks/useTrade');
jest.mock('@/hooks/useMeasure');
jest.mock('@/hooks/useMaterial');
jest.mock('@/components/GenericForm/GenericForm');

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
            units: ['unit1', 'unit2']
        });
        await act(async () => {
            render(
                <BasicTradeNew
                    supplierAddress={supplierAddress}
                    customerAddress={customerAddress}
                    productCategoryId={productCategoryId}
                    commonElements={commonElements}
                />
            );
        });
        await waitFor(() => {
            expect(GenericForm).toHaveBeenCalledTimes(1);
        });
        const elements = (GenericForm as jest.Mock).mock.calls[0][0].elements;
        expect(elements).toHaveLength(8);
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
            units: ['unit1', 'unit2']
        });
        await act(async () => {
            render(
                <BasicTradeNew
                    supplierAddress={supplierAddress}
                    customerAddress={customerAddress}
                    productCategoryId={productCategoryId}
                    commonElements={commonElements}
                />
            );
        });
        await waitFor(() => {
            expect(GenericForm).not.toHaveBeenCalled();
        });
        expect(loadData).toHaveBeenCalledTimes(1);
    });
    it('onSubmit', async () => {
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
            units: ['unit1', 'unit2']
        });
        await act(async () => {
            render(
                <BasicTradeNew
                    supplierAddress={supplierAddress}
                    customerAddress={customerAddress}
                    productCategoryId={productCategoryId}
                    commonElements={commonElements}
                />
            );
        });
        await waitFor(() => {
            expect(GenericForm).toHaveBeenCalledTimes(1);
        });
        const onSubmit = (GenericForm as jest.Mock).mock.calls[0][0].onSubmit;
        const values = {
            name: 'name',
            'product-category-id-2': 2,
            'quantity-1': 5,
            'quantity-2': 10,
            'unit-1': 'unit1',
            'unit-2': 'unit2',
            'certificate-of-shipping': {
                name: 'file.pdf'
            }
        };
        await onSubmit(values);
        expect(saveBasicTrade).toHaveBeenCalledTimes(1);
        expect(saveBasicTrade).toHaveBeenCalledWith(
            {
                supplier: supplierAddress,
                customer: customerAddress,
                commissioner: customerAddress,
                lines: [new LineRequest(2, 10, 'unit2'), new LineRequest(1, 5, 'unit1')],
                name: 'name'
            },
            [
                {
                    content: values['certificate-of-shipping'],
                    filename: 'file.pdf',
                    documentType: DocumentType.DELIVERY_NOTE
                }
            ]
        );
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
            units: ['unit1', 'unit2']
        });
        await act(async () => {
            render(
                <BasicTradeNew
                    supplierAddress={supplierAddress}
                    customerAddress={customerAddress}
                    productCategoryId={productCategoryId}
                    commonElements={commonElements}
                />
            );
        });
        await waitFor(() => {
            expect(GenericForm).toHaveBeenCalledTimes(1);
        });
        act(() => userEvent.click(screen.getByRole('button', { name: 'delete Delete Trade' })));

        expect(navigate).toHaveBeenCalledTimes(1);
        expect(navigate).toHaveBeenCalledWith(paths.TRADES);
    });
});
