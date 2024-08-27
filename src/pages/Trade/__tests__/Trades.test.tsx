import { render } from '@testing-library/react';
import Trades from '@/pages/Trade/Trades';
import { Table, Tag, Tooltip } from 'antd';
import { NegotiationStatus, OrderTrade, TradeType } from '@kbc-lib/coffee-trading-management-lib';
import { Link } from 'react-router-dom';
import { useEthOrderTrade } from '@/providers/entities/EthOrderTradeProvider';
import { useICPName } from '@/providers/entities/ICPNameProvider';
import { RawTrade, useEthRawTrade } from '@/providers/entities/EthRawTradeProvider';
import { useEthShipment } from '@/providers/entities/EthShipmentProvider';
import { AsyncComponent } from '@/components/AsyncComponent/AsyncComponent';

jest.mock('antd', () => {
    return {
        ...jest.requireActual('antd'),
        Table: jest.fn(() => <div />),
        Tag: jest.fn(() => <div />),
        Tooltip: jest.fn(() => <div />)
    };
});
jest.mock('@/providers/entities/EthRawTradeProvider');
jest.mock('@/providers/entities/EthShipmentProvider');
jest.mock('@/providers/entities/EthOrderTradeProvider');
jest.mock('@/providers/entities/ICPNameProvider');
jest.mock('@/utils/page');
jest.mock('react-router-dom', () => {
    return {
        ...jest.requireActual('react-router-dom'),
        Link: jest.fn(() => <div />)
    };
});
jest.mock('@/components/AsyncComponent/AsyncComponent', () => ({
    AsyncComponent: jest.fn(() => <div />)
}));

describe('Trades', () => {
    const rawTrades = [{ id: 1 } as RawTrade, { id: 2 } as RawTrade];
    const orderTrades = [{} as OrderTrade];
    const getName = jest.fn();
    const getSupplierAsync = jest.fn();
    const getCustomerAsync = jest.fn();
    const getNegotiationStatusAsync = jest.fn();
    const getShipmentPhaseAsync = jest.fn();
    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.clearAllMocks();

        (useEthRawTrade as jest.Mock).mockReturnValue({ rawTrades });
        (useEthOrderTrade as jest.Mock).mockReturnValue({
            orderTrades,
            getSupplierAsync,
            getCustomerAsync,
            getNegotiationStatusAsync
        });
        (useEthShipment as jest.Mock).mockReturnValue({ getShipmentPhaseAsync });
        (useICPName as jest.Mock).mockReturnValue({ getName });
        getName.mockReturnValue('actor');
        getNegotiationStatusAsync.mockReturnValue(NegotiationStatus.CONFIRMED);
    });

    it('should render correctly', async () => {
        render(<Trades />);
        expect(Table).toHaveBeenCalledTimes(1);
        const dataSource = (Table as unknown as jest.Mock).mock.calls[0][0].dataSource;
        expect(dataSource).toHaveLength(rawTrades.length);
    });

    it('columns sorting', async () => {
        render(<Trades />);
        expect(Table).toHaveBeenCalledTimes(1);
        const columns = (Table as unknown as jest.Mock).mock.calls[0][0].columns;
        expect(columns[0].sorter({ id: 1 }, { id: 2 })).toBeLessThan(0);
    });

    it('columns render', async () => {
        render(<Trades />);
        expect(Table).toHaveBeenCalledTimes(1);
        const columns = (Table as unknown as jest.Mock).mock.calls[0][0].columns;
        render(columns[0].render(1, TradeType.BASIC));
        expect(Link).toHaveBeenCalled();
        render(columns[1].render(0, { id: 1 }));
        expect(AsyncComponent).toHaveBeenCalledTimes(1);
        // expect(getName).toHaveBeenCalledTimes(1);
        // expect(getSupplierAsync).toHaveBeenCalledTimes(1);
        // expect(getSupplierAsync).toHaveBeenNthCalledWith(1, 1);
        // expect(resp).toEqual('actor');
        render(columns[2].render(null, 1));
        expect(AsyncComponent).toHaveBeenCalledTimes(2);
        // expect(getName).toHaveBeenCalledTimes(2);
        // expect(getCustomerAsync).toHaveBeenCalledTimes(1);
        // expect(getCustomerAsync).toHaveBeenNthCalledWith(1, 1);
        // expect(resp).toEqual('actor');
        const resp = columns[3].render(TradeType.BASIC);
        expect(resp).toEqual(TradeType[TradeType.BASIC]);

        render(columns[4].render(null, { id: 1 }));
        expect(Tag).toHaveBeenCalledTimes(1);
        // expect(AsyncComponent).toHaveBeenCalledTimes(3);
        // expect(getNegotiationStatusAsync).toHaveBeenCalledTimes(1);
        // expect(getNegotiationStatusAsync).toHaveBeenNthCalledWith(1, 1);

        render(columns[5].render(null, { id: 1 }));
        expect(Tag).toHaveBeenCalledTimes(2);
        // expect(AsyncComponent).toHaveBeenCalledTimes(4);
        // expect(getShipmentPhaseAsync).toHaveBeenCalledTimes(1);
        // expect(getShipmentPhaseAsync).toHaveBeenNthCalledWith(1, 1);
    });
});
