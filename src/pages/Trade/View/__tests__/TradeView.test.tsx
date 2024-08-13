import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { act, render } from '@testing-library/react';
import { TradeView } from '@/pages/Trade/View/TradeView';
import { OrderTradeView } from '@/pages/Trade/View/OrderTradeView';
import { BasicTrade, OrderTrade, TradeType } from '@kbc-lib/coffee-trading-management-lib';
import { paths } from '@/constants/paths';
import { BasicTradeView } from '@/pages/Trade/View/BasicTradeView';
import { useICPOrganization } from '@/providers/entities/ICPOrganizationProvider';
import { useEthBasicTrade } from '@/providers/entities/EthBasicTradeProvider';
import { useEthOrderTrade } from '@/providers/entities/EthOrderTradeProvider';

jest.mock('react-router-dom');
jest.mock('@/providers/SignerProvider');
jest.mock('@/pages/Trade/View/BasicTradeView');
jest.mock('@/pages/Trade/View/OrderTradeView');
jest.mock('@/providers/entities/EthBasicTradeProvider');
jest.mock('@/providers/entities/EthOrderTradeProvider');
jest.mock('@/providers/entities/ICPOrganizationProvider');
jest.mock('@/utils/notification');

describe('Trade View', () => {
    const basicTrades = [{ tradeId: 1 } as BasicTrade];
    const orderTrades = [{ tradeId: 1 } as OrderTrade];
    const getCompany = jest.fn();
    const navigate = jest.fn();

    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.clearAllMocks();

        (useNavigate as jest.Mock).mockReturnValue(navigate);
        (useLocation as jest.Mock).mockReturnValue({
            search: 'q=URLUtils.searchParams&type=' + TradeType.ORDER
        });
        (useParams as jest.Mock).mockReturnValue({
            id: 1
        });
        (useEthBasicTrade as jest.Mock).mockReturnValue({ basicTrades });
        (useEthOrderTrade as jest.Mock).mockReturnValue({ orderTrades });
        (useICPOrganization as jest.Mock).mockReturnValue({ getCompany });
        getCompany.mockReturnValue({ legalName: 'actor' });
    });

    it('should render correctly - ORDER', async () => {
        render(<TradeView />);
        expect(OrderTradeView).toHaveBeenCalledTimes(1);
        const commonElements = (OrderTradeView as jest.Mock).mock.calls[0][0].commonElements;
        expect(commonElements).toHaveLength(4);
        expect(commonElements[1].defaultValue).toEqual('actor');
        expect(commonElements[2].defaultValue).toEqual('actor');
        expect(commonElements[3].defaultValue).toEqual('actor');
    });

    it('should render correctly - BASIC', async () => {
        (useLocation as jest.Mock).mockReturnValue({
            search: 'q=URLUtils.searchParams&type=' + TradeType.BASIC
        });
        render(<TradeView />);
        expect(BasicTradeView).toHaveBeenCalledTimes(1);
        const commonElements = (BasicTradeView as jest.Mock).mock.calls[0][0].commonElements;
        expect(commonElements).toHaveLength(4);
        expect(commonElements[1].defaultValue).toEqual('actor');
        expect(commonElements[2].defaultValue).toEqual('actor');
        expect(commonElements[3].defaultValue).toEqual('actor');
    });

    it('toggleDisabled', async () => {
        render(<TradeView />);

        expect(OrderTradeView).toHaveBeenCalledTimes(1);
        const toggleDisabled = (OrderTradeView as jest.Mock).mock.calls[0][0].toggleDisabled;
        expect((OrderTradeView as jest.Mock).mock.calls[0][0].disabled).toBeTruthy();
        await act(async () => {
            toggleDisabled();
        });
        expect(OrderTradeView).toHaveBeenCalledTimes(2);
        expect((OrderTradeView as jest.Mock).mock.calls[1][0].disabled).toBeFalsy();
    });

    it('should navigate to HOME if order type is not valid', async () => {
        (useLocation as jest.Mock).mockReturnValue({
            search: 'q=URLUtils.searchParams&type=' + 'other'
        });
        await act(async () => {
            render(<TradeView />);
        });
        expect(navigate).toHaveBeenCalledTimes(1);
        expect(navigate).toHaveBeenCalledWith(paths.HOME);
    });
});
