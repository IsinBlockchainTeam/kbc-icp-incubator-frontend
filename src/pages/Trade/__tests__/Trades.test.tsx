import { act, render } from '@testing-library/react';
import Trades from '@/pages/Trade/Trades';
import { Table, Tag } from 'antd';
import { NegotiationStatus, Order, TradeType } from '@kbc-lib/coffee-trading-management-lib';
import { Link } from 'react-router-dom';
import { AsyncComponent } from '@/components/AsyncComponent/AsyncComponent';
import { useOrder } from '@/providers/icp/OrderProvider';
import { useOrganization } from '@/providers/icp/OrganizationProvider';
import { useShipment } from '@/providers/icp/ShipmentProvider';

jest.mock('antd', () => {
    return {
        ...jest.requireActual('antd'),
        Table: jest.fn(),
        Tag: jest.fn(),
        Tooltip: jest.fn()
    };
});
jest.mock('@/providers/icp/OrderProvider');
jest.mock('@/providers/icp/OrganizationProvider');
jest.mock('@/providers/icp/ShipmentProvider');
jest.mock('@/utils/page');
jest.mock('react-router-dom', () => {
    return {
        ...jest.requireActual('react-router-dom'),
        Link: jest.fn(() => <div />)
    };
});
jest.mock('@/components/AsyncComponent/AsyncComponent', () => ({
    AsyncComponent: jest.fn()
}));

describe('Trades', () => {
    const orders = [{ id: 1 } as Order, { id: 2 } as Order];
    const getOrganization = jest.fn();
    const getNegotiationStatusAsync = jest.fn();
    const getShipmentPhaseAsync = jest.fn();
    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.clearAllMocks();

        (useOrder as jest.Mock).mockReturnValue({
            orders
        });
        (useOrganization as jest.Mock).mockReturnValue({ getOrganization });
        (useShipment as jest.Mock).mockReturnValue({ getShipmentPhaseAsync });
        getOrganization.mockReturnValue({ legalName: 'actor' });
        getNegotiationStatusAsync.mockReturnValue(NegotiationStatus.CONFIRMED);
        getShipmentPhaseAsync.mockReturnValue('phase');
        (Tag as unknown as jest.Mock).mockImplementation(({ children }) => <div>{children}</div>);
    });

    it('should render correctly', async () => {
        render(<Trades />);
        expect(Table).toHaveBeenCalledTimes(1);
        const dataSource = (Table as unknown as jest.Mock).mock.calls[0][0].dataSource;
        expect(dataSource).toHaveLength(orders.length);
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
        render(columns[0].render(1, { type: TradeType.BASIC }));
        expect(Link).toHaveBeenCalled();

        render(columns[1].render(0, { id: 1 }));
        expect(getOrganization).toHaveBeenCalledTimes(1);

        render(columns[2].render(null, { id: 1 }));
        expect(getOrganization).toHaveBeenCalledTimes(2);

        const resp = columns[3].render(TradeType.BASIC);
        expect(resp).toEqual(TradeType[TradeType.BASIC]);

        render(columns[4].render(null, { id: 1 }));
        expect(Tag).toHaveBeenCalledTimes(1);

        render(columns[5].render(null, { id: 1 }));
        expect(Tag).toHaveBeenCalledTimes(2);
        expect(AsyncComponent).toHaveBeenCalledTimes(2);
    });

    it('should render "NOT CREATED" when shipment phase is null', async () => {
        getShipmentPhaseAsync.mockReturnValue(null);
        render(<Trades />);
        const columns = (Table as unknown as jest.Mock).mock.calls[0][0].columns;

        render(columns[5].render(null, { id: 1 }));
        expect(Tag).toHaveBeenCalledTimes(1);
        expect(AsyncComponent).toHaveBeenCalledTimes(1);
        await act(async () => {
            const result = await (AsyncComponent as jest.Mock).mock.calls[0][0].asyncFunction();
            expect(result).toEqual('NOT CREATED');
        });
    });
});
