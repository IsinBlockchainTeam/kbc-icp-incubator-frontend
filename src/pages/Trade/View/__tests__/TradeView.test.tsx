import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { act, render } from '@testing-library/react';
import { TradeView } from '@/pages/Trade/View/TradeView';
import { OrderTradeView } from '@/pages/Trade/View/OrderTradeView';
import {
    BasicTrade,
    BasicTradeService,
    NegotiationStatus,
    OrderTrade,
    OrderTradeService,
    TradeType
} from '@kbc-lib/coffee-trading-management-lib';
import { paths } from '@/constants/paths';
import { BasicTradeView } from '@/pages/Trade/View/BasicTradeView';
import { useICPOrganization } from '@/providers/entities/ICPOrganizationProvider';
import { useEthBasicTrade } from '@/providers/entities/EthBasicTradeProvider';
import { useEthOrderTrade } from '@/providers/entities/EthOrderTradeProvider';
import { ShipmentPanel } from '@/components/ShipmentPanel/ShipmentPanel';
import { EscrowPanel } from '@/components/EscrowPanel/EscrowPanel';

jest.mock('react-router-dom');
jest.mock('@/providers/SignerProvider');
jest.mock('@/pages/Trade/View/BasicTradeView');
jest.mock('@/pages/Trade/View/OrderTradeView');
jest.mock('@/providers/entities/EthBasicTradeProvider');
jest.mock('@/providers/entities/EthOrderTradeProvider');
jest.mock('@/providers/entities/ICPOrganizationProvider');
jest.mock('@/utils/notification');
jest.mock('@/components/ShipmentPanel/ShipmentPanel');
jest.mock('@/components/EscrowPanel/EscrowPanel');

describe('Trade View', () => {
    const detailedBasicTrade = {
        trade: { tradeId: 1 } as BasicTrade,
        service: {} as BasicTradeService,
        documents: []
    };
    const detailedOrderTrade = {
        trade: { tradeId: 1 } as OrderTrade,
        service: {} as OrderTradeService,
        negotiationStatus: NegotiationStatus.INITIALIZED
    };
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
        (useEthBasicTrade as jest.Mock).mockReturnValue({ detailedBasicTrade });
        (useEthOrderTrade as jest.Mock).mockReturnValue({ detailedOrderTrade });
        (useICPOrganization as jest.Mock).mockReturnValue({ getCompany });
        getCompany.mockReturnValue({ legalName: 'actor' });
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
