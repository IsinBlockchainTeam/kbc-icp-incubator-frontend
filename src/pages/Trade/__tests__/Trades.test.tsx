import { render } from '@testing-library/react';
import Trades from '@/pages/Trade/Trades';
import { Table, Tag, Tooltip } from 'antd';
import {
    BasicTrade,
    NegotiationStatus,
    OrderStatus,
    OrderTrade,
    TradeType
} from '@kbc-lib/coffee-trading-management-lib';
import { Link } from 'react-router-dom';
import { useEthBasicTrade } from '@/providers/entities/EthBasicTradeProvider';
import { useEthOrderTrade } from '@/providers/entities/EthOrderTradeProvider';
import { useICPName } from '@/providers/entities/ICPNameProvider';

jest.mock('antd', () => {
    return {
        ...jest.requireActual('antd'),
        Table: jest.fn(() => <div />),
        Tag: jest.fn(() => <div />),
        Tooltip: jest.fn(() => <div />)
    };
});
jest.mock('@/providers/entities/EthBasicTradeProvider');
jest.mock('@/providers/entities/EthOrderTradeProvider');
jest.mock('@/providers/entities/ICPNameProvider');
jest.mock('@/utils/page');
jest.mock('react-router-dom', () => {
    return {
        ...jest.requireActual('react-router-dom'),
        Link: jest.fn(() => <div />)
    };
});

describe('Trades', () => {
    const basicTrades = [{} as BasicTrade];
    const orderTrades = [{} as OrderTrade];
    const getName = jest.fn();
    const getActionRequired = jest.fn();
    const getNegotiationStatus = jest.fn();
    const getOrderStatus = jest.fn();
    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.clearAllMocks();

        (useEthBasicTrade as jest.Mock).mockReturnValue({ basicTrades });
        (useEthOrderTrade as jest.Mock).mockReturnValue({
            orderTrades,
            getActionRequired,
            getNegotiationStatus,
            getOrderStatus
        });
        (useICPName as jest.Mock).mockReturnValue({ getName });
        getName.mockReturnValue('actor');
        getActionRequired.mockReturnValue('actionRequired');
        getNegotiationStatus.mockReturnValue(NegotiationStatus.CONFIRMED);
        getOrderStatus.mockReturnValue(OrderStatus.CONTRACTING);
    });

    it('should render correctly', async () => {
        render(<Trades />);
        expect(Table).toHaveBeenCalledTimes(1);
        const dataSource = (Table as unknown as jest.Mock).mock.calls[0][0].dataSource;
        expect(dataSource).toHaveLength(2);
        expect(getName).toHaveBeenCalledTimes(4);
        expect(getActionRequired).toHaveBeenCalledTimes(1);
        expect(getNegotiationStatus).toHaveBeenCalledTimes(1);
        expect(getOrderStatus).toHaveBeenCalledTimes(1);
    });

    it('columns sorting', async () => {
        render(<Trades />);
        expect(Table).toHaveBeenCalledTimes(1);
        const columns = (Table as unknown as jest.Mock).mock.calls[0][0].columns;
        expect(columns[0].sorter({ id: 1 }, { id: 2 })).toBeLessThan(0);
        expect(columns[1].sorter({ supplier: 'a' }, { supplier: 'b' })).toBeLessThan(0);
        expect(columns[2].sorter({ commissioner: 'a' }, { commissioner: 'b' })).toBeLessThan(0);
        expect(columns[4].sorter({ orderStatus: 'a' }, { orderStatus: 'b' })).toBeLessThan(0);
    });

    it('columns render', async () => {
        render(<Trades />);
        expect(Table).toHaveBeenCalledTimes(1);
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
