import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { act, render } from '@testing-library/react';
import { TradeView } from '@/pages/Trade/View/TradeView';
import { OrderTradeView } from '@/pages/Trade/View/OrderTradeView';
import { TradeType } from '@kbc-lib/coffee-trading-management-lib';
import { paths } from '@/constants/paths';
import { useOrder } from '@/providers/icp/OrderProvider';
import { ShipmentPanel } from '@/components/ShipmentPanel/ShipmentPanel';
import { EscrowPanel } from '@/components/EscrowPanel/EscrowPanel';
import { useOrganization } from '@/providers/icp/OrganizationProvider';

jest.mock('react-router-dom');
jest.mock('@/providers/SignerProvider');
jest.mock('@/pages/Trade/View/BasicTradeView', () => ({
    BasicTradeView: jest.fn()
}));
jest.mock('@/pages/Trade/View/OrderTradeView', () => ({
    OrderTradeView: jest.fn()
}));
jest.mock('@/providers/icp/OrderProvider');
jest.mock('@/providers/icp/OrganizationProvider');
jest.mock('@/utils/notification');
jest.mock('@/components/ShipmentPanel/ShipmentPanel');
jest.mock('@/components/EscrowPanel/EscrowPanel');

describe('Trade View', () => {
    const order = {
        supplier: 'supplier',
        commissioner: 'commissioner'
    };
    const getOrganization = jest.fn();
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
        (useOrder as jest.Mock).mockReturnValue({ order });
        (useOrganization as jest.Mock).mockReturnValue({ getOrganization });
        getOrganization.mockReturnValue({ legalName: 'actor' });
    });

    it('should render correctly - ORDER', async () => {
        const { getByText } = render(<TradeView />);
        expect(OrderTradeView).toHaveBeenCalledTimes(1);
        const commonElements = (OrderTradeView as jest.Mock).mock.calls[0][0].commonElements;
        expect(commonElements).toHaveLength(4);
        expect(commonElements[1].defaultValue).toEqual('actor');
        expect(commonElements[2].defaultValue).toEqual('actor');
        expect(commonElements[3].defaultValue).toEqual('actor');

        expect(getByText('Shipment')).toBeInTheDocument();
        await act(async () => getByText('Shipment').click());
        expect(ShipmentPanel).toHaveBeenCalledTimes(1);

        expect(getByText('Escrow')).toBeInTheDocument();
        await act(async () => getByText('Escrow').click());
        expect(EscrowPanel).toHaveBeenCalledTimes(1);
    });

    // it('should render correctly - BASIC', async () => {
    //     (useLocation as jest.Mock).mockReturnValue({
    //         search: 'q=URLUtils.searchParams&type=' + TradeType.BASIC
    //     });
    //     render(<TradeView />);
    //     expect(BasicTradeView).toHaveBeenCalledTimes(0);
    //     const commonElements = (BasicTradeView as jest.Mock).mock.calls[0][0].commonElements;
    //     expect(commonElements).toHaveLength(4);
    //     expect(commonElements[1].defaultValue).toEqual('actor');
    //     expect(commonElements[2].defaultValue).toEqual('actor');
    //     expect(commonElements[3].defaultValue).toEqual('actor');
    // });

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
