import { useNavigate } from 'react-router-dom';
import { act, render, screen } from '@testing-library/react';
import { BasicTradeView } from '@/pages/Trade/View/BasicTradeView';
import { FormElement, GenericForm } from '@/components/GenericForm/GenericForm';
import { LineRequest, BasicTrade } from '@kbc-lib/coffee-trading-management-lib';
import userEvent from '@testing-library/user-event';
import { useEthMaterial } from '@/providers/entities/EthMaterialProvider';
import { useEthEnumerable } from '@/providers/entities/EthEnumerableProvider';
import { useEthBasicTrade } from '@/providers/entities/EthBasicTradeProvider';
import { useEthOrderTrade } from '@/providers/entities/EthOrderTradeProvider';

jest.mock('react-router-dom');
jest.mock('@/providers/SignerProvider');
jest.mock('@/components/GenericForm/GenericForm');
jest.mock('@/providers/entities/EthMaterialProvider');
jest.mock('@/providers/entities/EthEnumerableProvider');
jest.mock('@/providers/entities/EthBasicTradeProvider');
jest.mock('@/providers/entities/EthOrderTradeProvider');

describe('Basic Trade New', () => {
    const basicTrade = {
        tradeId: 1,
        name: 'name',
        lines: [{ productCategory: { id: 1 }, quantity: 5, unit: 'unit1' }]
    } as BasicTrade;
    const toggleDisabled = jest.fn();
    const commonElements: FormElement[] = [];

    const updateBasicTrade = jest.fn();
    const confirmNegotiation = jest.fn();
    const navigate = jest.fn();
    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.clearAllMocks();

        (useNavigate as jest.Mock).mockReturnValue(navigate);
        (useEthMaterial as jest.Mock).mockReturnValue({
            productCategories: [{ id: 1, name: 'Product Category 1' }]
        });
        (useEthEnumerable as jest.Mock).mockReturnValue({
            units: ['unit1', 'unit2']
        });
        (useEthBasicTrade as jest.Mock).mockReturnValue({
            updateBasicTrade
        });
        (useEthOrderTrade as jest.Mock).mockReturnValue({
            confirmNegotiation
        });
    });

    it('should render correctly', async () => {
        render(
            <BasicTradeView
                basicTrade={basicTrade}
                disabled={true}
                toggleDisabled={toggleDisabled}
                commonElements={commonElements}
            />
        );
        expect(GenericForm).toHaveBeenCalledTimes(1);
        const elements = (GenericForm as jest.Mock).mock.calls[0][0].elements;
        expect(elements).toHaveLength(8);
    });
    it('onSubmit', async () => {
        render(
            <BasicTradeView
                basicTrade={basicTrade}
                disabled={true}
                toggleDisabled={toggleDisabled}
                commonElements={commonElements}
            />
        );
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
        expect(updateBasicTrade).toHaveBeenCalledWith(basicTrade.tradeId, {
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
        render(
            <BasicTradeView
                basicTrade={basicTrade}
                disabled={true}
                toggleDisabled={toggleDisabled}
                commonElements={commonElements}
            />
        );

        act(() => userEvent.click(screen.getByRole('confirm')));

        expect(confirmNegotiation).toHaveBeenCalledTimes(1);
        expect(confirmNegotiation).toHaveBeenCalledWith(basicTrade.tradeId);
    });
});
