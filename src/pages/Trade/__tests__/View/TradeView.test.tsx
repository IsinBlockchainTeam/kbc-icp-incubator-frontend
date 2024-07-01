import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { act, render, waitFor } from '@testing-library/react';
import { TradeView } from '@/pages/Trade/View/TradeView';
import { OrderTradeView } from '@/pages/Trade/View/OrderTradeView';
import useActorName from '@/hooks/useActorName';
import { TradeType } from '@kbc-lib/coffee-trading-management-lib';
import useTrade from '@/hooks/useTrade';
import { OrderTradePresentable } from '@/api/types/TradePresentable';
import { paths } from '@/constants/paths';
import { BasicTradeView } from '@/pages/Trade/View/BasicTradeView';

jest.mock('react-router-dom');
jest.mock('@/providers/SignerProvider');
jest.mock('@/hooks/useActorName');
jest.mock('@/hooks/useTrade');
jest.mock('@/pages/Trade/View/BasicTradeView');
jest.mock('@/pages/Trade/View/OrderTradeView');
jest.mock('@/utils/notification');

describe('Trade View', () => {
    const trade = {
        trade: {
            supplier: '0xaddress',
            customer: '0xaddress'
        }
    } as OrderTradePresentable;

    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.clearAllMocks();

        (useLocation as jest.Mock).mockReturnValue({
            search: 'q=URLUtils.searchParams&type=' + TradeType.ORDER
        });
        (useParams as jest.Mock).mockReturnValue({
            id: 1
        });
        (useActorName as jest.Mock).mockReturnValue({ getActorName: () => 'Actor Name' });
    });

    it('should render correctly - ORDER', async () => {
        (useTrade as jest.Mock).mockReturnValue({
            loadTrade: jest.fn(),
            tradeLoaded: true,
            trade
        });
        await act(async () => {
            render(<TradeView />);
        });
        await waitFor(() => {
            expect(OrderTradeView).toHaveBeenCalledTimes(1);
        });
        const commonElements = (OrderTradeView as jest.Mock).mock.calls[0][0].commonElements;
        expect(commonElements).toHaveLength(4);
        expect(commonElements[1].defaultValue).toEqual('Actor Name');
        expect(commonElements[2].defaultValue).toEqual('Actor Name');
        expect(commonElements[3].defaultValue).toEqual('Actor Name');
    });

    it('should render correctly - BASIC', async () => {
        (useLocation as jest.Mock).mockReturnValue({
            search: 'q=URLUtils.searchParams&type=' + TradeType.BASIC
        });
        (useTrade as jest.Mock).mockReturnValue({
            loadTrade: jest.fn(),
            tradeLoaded: true,
            trade
        });
        await act(async () => {
            render(<TradeView />);
        });
        await waitFor(() => {
            expect(BasicTradeView).toHaveBeenCalledTimes(1);
        });
        const commonElements = (BasicTradeView as jest.Mock).mock.calls[0][0].commonElements;
        expect(commonElements).toHaveLength(4);
        expect(commonElements[1].defaultValue).toEqual('Actor Name');
        expect(commonElements[2].defaultValue).toEqual('Actor Name');
        expect(commonElements[3].defaultValue).toEqual('Actor Name');
    });

    it('toggleDisabled', async () => {
        (useTrade as jest.Mock).mockReturnValue({
            loadTrade: jest.fn(),
            tradeLoaded: true,
            trade
        });
        await act(async () => {
            render(<TradeView />);
        });
        await waitFor(() => {
            expect(OrderTradeView).toHaveBeenCalledTimes(1);
        });
        const toggleDisabled = (OrderTradeView as jest.Mock).mock.calls[0][0].toggleDisabled;
        expect((OrderTradeView as jest.Mock).mock.calls[0][0].disabled).toBeTruthy();
        await act(async () => {
            toggleDisabled();
        });
        expect(OrderTradeView).toHaveBeenCalledTimes(2);
        expect((OrderTradeView as jest.Mock).mock.calls[1][0].disabled).toBeFalsy();
    });

    it('should navigate to HOME if order type is not valid', async () => {
        const mockedNavigate = jest.fn();
        (useNavigate as jest.Mock).mockReturnValue(mockedNavigate);
        (useLocation as jest.Mock).mockReturnValue({
            search: 'q=URLUtils.searchParams&type=' + 'other'
        });
        (useTrade as jest.Mock).mockReturnValue({
            loadTrade: jest.fn(),
            tradeLoaded: true,
            trade
        });
        await act(async () => {
            render(<TradeView />);
        });
        expect(mockedNavigate).toHaveBeenCalledTimes(2);
        expect(mockedNavigate).toHaveBeenCalledWith(paths.HOME);
    });
    it('should render nothing if trade is not available', async () => {
        const mockedNavigate = jest.fn();
        (useNavigate as jest.Mock).mockReturnValue(mockedNavigate);
        (useTrade as jest.Mock).mockReturnValue({
            loadTrade: jest.fn(),
            tradeLoaded: true,
            trade: undefined
        });
        await act(async () => {
            render(<TradeView />);
        });
        expect(OrderTradeView).not.toHaveBeenCalled();
    });
});
