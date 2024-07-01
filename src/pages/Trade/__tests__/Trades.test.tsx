import { act, render, waitFor } from '@testing-library/react';
import useTrade from '@/hooks/useTrade';
import { TradePreviewPresentable } from '@/api/types/TradePresentable';
import Trades from '@/pages/Trade/Trades';
import { Table, Tag, Tooltip } from 'antd';
import { TradeType } from '@kbc-lib/coffee-trading-management-lib';
import { Link } from 'react-router-dom';

jest.mock('antd', () => {
    return {
        ...jest.requireActual('antd'),
        Table: jest.fn(() => <div />),
        Tag: jest.fn(() => <div />),
        Tooltip: jest.fn(() => <div />)
    };
});
jest.mock('@/hooks/useTrade');
jest.mock('@/utils/page');
jest.mock('react-router-dom', () => {
    return {
        ...jest.requireActual('react-router-dom'),
        Link: jest.fn(() => <div />)
    };
});

describe('Trades', () => {
    const trades = [{} as TradePreviewPresentable];
    const loadTrades = jest.fn();

    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.clearAllMocks();

        (useTrade as jest.Mock).mockReturnValue({
            loadTrades,
            tradesLoaded: true,
            trades
        });
    });

    it('should render correctly', async () => {
        await act(async () => {
            render(<Trades />);
        });
        await waitFor(() => {
            expect(Table).toHaveBeenCalledTimes(1);
        });
        const dataSource = (Table as unknown as jest.Mock).mock.calls[0][0].dataSource;
        expect(dataSource).toHaveLength(1);
    });

    it('should render nothing if trades are not available', async () => {
        (useTrade as jest.Mock).mockReturnValue({
            loadTrades,
            tradesLoaded: false,
            trades
        });
        await act(async () => {
            render(<Trades />);
        });
        expect(Table).not.toHaveBeenCalled();
        expect(loadTrades).toHaveBeenCalledTimes(1);
    });

    it('columns sorting', async () => {
        await act(async () => {
            render(<Trades />);
        });
        await waitFor(() => {
            expect(Table).toHaveBeenCalledTimes(1);
        });
        const columns = (Table as unknown as jest.Mock).mock.calls[0][0].columns;
        expect(columns[0].sorter({ id: 1 }, { id: 2 })).toBeLessThan(0);
        expect(columns[1].sorter({ supplier: 'a' }, { supplier: 'b' })).toBeLessThan(0);
        expect(columns[2].sorter({ commissioner: 'a' }, { commissioner: 'b' })).toBeLessThan(0);
        expect(columns[4].sorter({ orderStatus: 'a' }, { orderStatus: 'b' })).toBeLessThan(0);
    });

    it('columns render', async () => {
        await act(async () => {
            render(<Trades />);
        });
        await waitFor(() => {
            expect(Table).toHaveBeenCalledTimes(1);
        });
        const columns = (Table as unknown as jest.Mock).mock.calls[0][0].columns;
        render(columns[0].render(1, TradeType.BASIC));
        expect(Link).toHaveBeenCalled();
        let resp = columns[2].render('customer');
        expect(resp).toEqual('customer');
        resp = columns[3].render(0);
        expect(resp).toEqual(TradeType[0]);
        render(columns[4].render(null, { negotiationStatus: 0, orderStatus: 0 }));
        expect(Tag).toHaveBeenCalled();
        render(columns[5].render(null, { actionRequired: 'actionRequired' }));
        expect(Tooltip).toHaveBeenCalled();
    });
});
