import { render, fireEvent } from '@testing-library/react';
import { OrderStatus, OrderTrade } from '@kbc-lib/coffee-trading-management-lib';
import OrderStatusSteps from '@/pages/Trade/OrderStatusSteps/OrderStatusSteps';
import { CoffeeProduction } from '@/pages/Trade/OrderStatusSteps/CoffeeProduction';
import { CoffeeExport } from '@/pages/Trade/OrderStatusSteps/CoffeeExport';
import { CoffeeShipment } from '@/pages/Trade/OrderStatusSteps/CoffeeShipment';
import { CoffeeImport } from '@/pages/Trade/OrderStatusSteps/CoffeeImport';
import { GenericForm } from '@/components/GenericForm/GenericForm';

jest.mock('@/components/GenericForm/GenericForm');
jest.mock('@/components/EscrowPanel/EscrowPanel');
jest.mock('@/pages/Trade/OrderStatusSteps/CoffeeProduction');
jest.mock('@/pages/Trade/OrderStatusSteps/CoffeeExport');
jest.mock('@/pages/Trade/OrderStatusSteps/CoffeeShipment');
jest.mock('@/pages/Trade/OrderStatusSteps/CoffeeImport');

describe('OrderStatusSteps', () => {
    it.each([
        [OrderStatus.CONTRACTING, GenericForm],
        [OrderStatus.PRODUCTION, CoffeeProduction],
        [OrderStatus.PAYED, CoffeeExport],
        [OrderStatus.EXPORTED, CoffeeShipment],
        [OrderStatus.SHIPPED, CoffeeImport],
        [OrderStatus.COMPLETED, CoffeeImport]
    ])('renders correct step based on order status: %s', (orderStatus, mockedComponent) => {
        render(
            <OrderStatusSteps
                status={orderStatus}
                submittable={true}
                negotiationElements={[]}
                orderTrade={
                    {
                        tradeId: 1,
                        supplier: '0x123',
                        commissioner: '0x456',
                        documentDeliveryDeadline: 123
                    } as OrderTrade
                }
                onSubmit={jest.fn()}
            />
        );

        expect(mockedComponent).toHaveBeenCalled();
    });

    it('does not allow to go to next step if current step is not completed', () => {
        const { getByText } = render(
            <OrderStatusSteps
                status={OrderStatus.PRODUCTION}
                submittable={true}
                negotiationElements={[]}
                orderTrade={
                    {
                        tradeId: 1,
                        supplier: '0x123',
                        commissioner: '0x456',
                        documentDeliveryDeadline: 123
                    } as OrderTrade
                }
                onSubmit={jest.fn()}
            />
        );

        fireEvent.click(getByText('Coffee Export'));

        expect(getByText('Coffee Production')).toBeInTheDocument();
    });

    it('allows to go to previous step even if current step is not completed', () => {
        const { getByText } = render(
            <OrderStatusSteps
                status={OrderStatus.EXPORTED}
                submittable={true}
                negotiationElements={[]}
                orderTrade={
                    {
                        tradeId: 1,
                        supplier: '0x123',
                        commissioner: '0x456',
                        documentDeliveryDeadline: 123
                    } as OrderTrade
                }
                onSubmit={jest.fn()}
            />
        );

        fireEvent.click(getByText('Coffee Production'));

        expect(getByText('Coffee Production')).toBeInTheDocument();
    });
});
