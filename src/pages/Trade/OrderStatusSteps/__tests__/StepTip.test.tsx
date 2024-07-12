import { render } from '@testing-library/react';
import { OrderStatus, OrderTrade } from '@kbc-lib/coffee-trading-management-lib';
import { useEthOrderTrade } from '@/providers/entities/EthOrderTradeProvider';
import React from 'react';
import { StepTip } from '@/pages/Trade/OrderStatusSteps/StepTip';
import { differenceInDaysFromToday, fromTimestampToDate } from '@/utils/date';
import { useNavigate } from 'react-router-dom';

jest.mock('@/providers/entities/EthOrderTradeProvider');
jest.mock('@/utils/date');
jest.mock('react-router-dom');

describe('StepTip', () => {
    const getOrderStatus = jest.fn();
    const notifyExpiration = jest.fn();
    const navigate = jest.fn();
    beforeEach(() => {
        jest.clearAllMocks();
        (useEthOrderTrade as jest.Mock).mockReturnValue({ getOrderStatus, notifyExpiration });
        (useNavigate as jest.Mock).mockReturnValue(navigate);
    });

    it('renders correct step tip based on order status - days left', () => {
        getOrderStatus.mockReturnValue(OrderStatus.PRODUCTION);
        (differenceInDaysFromToday as jest.Mock).mockReturnValue(1);
        (fromTimestampToDate as jest.Mock).mockReturnValue({
            toLocaleDateString: jest.fn().mockReturnValue('2022-01-01')
        });

        const { getByText } = render(
            <StepTip
                orderTrade={
                    {
                        tradeId: 1,
                        supplier: '0x123',
                        commissioner: '0x456',
                        documentDeliveryDeadline: 123
                    } as OrderTrade
                }
                message="Test message"
                deadline={Date.now() + 1000 * 60 * 60 * 24}
                status={OrderStatus.PRODUCTION}
            />
        );

        expect(getByText('Test message')).toBeInTheDocument();
        expect(getByText('2022-01-01')).toBeInTheDocument();
        expect(getByText('--> Left 1 days')).toBeInTheDocument();
    });

    it('renders correct step tip based on order status - expired', () => {
        getOrderStatus.mockReturnValue(OrderStatus.PRODUCTION);
        (differenceInDaysFromToday as jest.Mock).mockReturnValue(-1);
        (fromTimestampToDate as jest.Mock).mockReturnValue({
            toLocaleDateString: jest.fn().mockReturnValue('2022-01-01')
        });

        const { getByText } = render(
            <StepTip
                orderTrade={
                    {
                        tradeId: 1,
                        supplier: '0x123',
                        commissioner: '0x456',
                        documentDeliveryDeadline: 123
                    } as OrderTrade
                }
                message="Test message"
                deadline={Date.now() + 1000 * 60 * 60 * 24}
                status={OrderStatus.PRODUCTION}
            />
        );

        expect(getByText('EXPIRED')).toBeInTheDocument();
    });
});
