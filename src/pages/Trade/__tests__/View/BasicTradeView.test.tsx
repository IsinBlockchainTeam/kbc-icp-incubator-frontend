import { useNavigate } from 'react-router-dom';
import { act, render, screen, waitFor } from '@testing-library/react';
import { BasicTradeView } from '@/pages/Trade/View/BasicTradeView';
import useMaterial from '@/hooks/useMaterial';
import { FormElement, GenericForm } from '@/components/GenericForm/GenericForm';
import useTrade from '@/hooks/useTrade';
import useMeasure from '@/hooks/useMeasure';
import { LineRequest, DocumentType } from '@kbc-lib/coffee-trading-management-lib';
import userEvent from '@testing-library/user-event';
import { BasicTradePresentable } from '@/api/types/TradePresentable';

jest.mock('react-router-dom');
jest.mock('@/providers/SignerProvider');
jest.mock('@/hooks/useTrade');
jest.mock('@/hooks/useMeasure');
jest.mock('@/hooks/useMaterial');
jest.mock('@/components/GenericForm/GenericForm');

describe('Basic Trade New', () => {
    const basicTradePresentable = {
        trade: {
            tradeId: 1,
            name: 'name',
            lines: [{ productCategory: { id: 1 }, quantity: 5, unit: 'unit1' }]
        },
        documents: new Map().set(DocumentType.DELIVERY_NOTE, [{ id: 1, name: 'file.pdf' }])
    } as unknown as BasicTradePresentable;
    const toggleDisabled = jest.fn();
    const commonElements: FormElement[] = [];

    const updateBasicTrade = jest.fn();
    const confirmNegotiation = jest.fn();

    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.clearAllMocks();

        (useMeasure as jest.Mock).mockReturnValue({
            units: ['unit1', 'unit2']
        });
        (useMaterial as jest.Mock).mockReturnValue({
            dataLoaded: true,
            productCategories: [{ id: 1, name: 'Product Category 1' }]
        });
        (useTrade as jest.Mock).mockReturnValue({
            updateBasicTrade,
            confirmNegotiation
        });
    });

    it('should render correctly', async () => {
        await act(async () => {
            render(
                <BasicTradeView
                    basicTradePresentable={basicTradePresentable}
                    disabled={true}
                    toggleDisabled={toggleDisabled}
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
        (useMaterial as jest.Mock).mockReturnValue({
            dataLoaded: false,
            loadData,
            productCategories: [{ id: 1, name: 'Product Category 1' }]
        });
        await act(async () => {
            render(
                <BasicTradeView
                    basicTradePresentable={basicTradePresentable}
                    disabled={true}
                    toggleDisabled={toggleDisabled}
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
        const updateBasicTrade = jest.fn();
        (useNavigate as jest.Mock).mockReturnValue(navigate);
        (useTrade as jest.Mock).mockReturnValue({
            updateBasicTrade
        });
        await act(async () => {
            render(
                <BasicTradeView
                    basicTradePresentable={basicTradePresentable}
                    disabled={true}
                    toggleDisabled={toggleDisabled}
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
            supplier: 'supplier',
            customer: 'customer',
            commissioner: 'commissioner',
            'product-category-id-1': 2,
            'quantity-1': 5,
            'unit-1': 'unit1',
            'certificate-of-shipping': {
                name: 'file.pdf'
            }
        };
        await onSubmit(values);
        expect(updateBasicTrade).toHaveBeenCalledTimes(1);
        expect(updateBasicTrade).toHaveBeenCalledWith(basicTradePresentable.trade.tradeId, {
            supplier: 'supplier',
            customer: 'customer',
            commissioner: 'commissioner',
            lines: [new LineRequest(2, 5, 'unit1')],
            name: 'name'
        });
        expect(navigate).toHaveBeenCalledTimes(1);
        expect(toggleDisabled).toHaveBeenCalledTimes(1);
    });
    it('should confirmNegotiation when clicking on confirm button', async () => {
        const confirmNegotiation = jest.fn();
        (useTrade as jest.Mock).mockReturnValue({
            confirmNegotiation
        });
        await act(async () => {
            render(
                <BasicTradeView
                    basicTradePresentable={basicTradePresentable}
                    disabled={true}
                    toggleDisabled={toggleDisabled}
                    commonElements={commonElements}
                />
            );
        });
        await waitFor(() => {
            expect(GenericForm).toHaveBeenCalledTimes(1);
        });
        act(() => userEvent.click(screen.getByRole('confirm')));

        expect(confirmNegotiation).toHaveBeenCalledTimes(1);
        expect(confirmNegotiation).toHaveBeenCalledWith(basicTradePresentable.trade.tradeId);
    });
});
