import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { useSiweIdentity } from '@/providers/auth/SiweIdentityProvider';
import { checkAndGetEnvironmentVariable } from '@/utils/env';
import { useCallHandler } from '@/providers/errors/CallHandlerProvider';
import { Typography } from 'antd';
import { OrderProvider, useOrder } from '../OrderProvider';
import { useParams } from 'react-router-dom';
import { Order, OrderParams, ICPOrderService } from '@kbc-lib/coffee-trading-management-lib';

jest.mock('@kbc-lib/coffee-trading-management-lib');
jest.mock('@/providers/auth/SiweIdentityProvider');
jest.mock('@/providers/auth/SignerProvider');
jest.mock('react-router-dom');
jest.mock('@/providers/errors/CallHandlerProvider');
jest.mock('@/providers/storage/IcpStorageProvider');
jest.mock('@/utils/env');
jest.mock('antd', () => {
    const originalModule = jest.requireActual('antd');
    return {
        ...originalModule,
        Typography: {
            ...originalModule.Typography,
            Text: jest.fn((props) => <span {...props} />)
        }
    };
});
describe('OrderProvider', () => {
    const orderServiceMethods = {
        getOrders: jest.fn(),
        createOrder: jest.fn(),
        updateOrder: jest.fn(),
        signOrder: jest.fn()
    };
    const handleICPCall = jest.fn();

    const orderId = 2;
    const orders = [{ id: 1 }, { id: 2 }] as Order[];
    const orderParams: OrderParams = {
        supplier: 'supplier',
        customer: 'customer',
        commissioner: 'commissioner',
        paymentDeadline: new Date(),
        documentDeliveryDeadline: new Date(),
        shippingDeadline: new Date(),
        deliveryDeadline: new Date(),
        arbiter: 'arbiter',
        token: 'token',
        agreedAmount: 1,
        incoterms: 'incoterms',
        shipper: 'shipper',
        shippingPort: 'shippingPort',
        deliveryPort: 'deliveryPort',
        lines: [{ productCategoryId: 1, quantity: 1, unit: 'unit', price: { amount: 1, fiat: 'fiat' } }]
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.spyOn(console, 'log').mockImplementation(jest.fn());

        (useSiweIdentity as jest.Mock).mockReturnValue({ identity: 'identity' });
        (checkAndGetEnvironmentVariable as jest.Mock).mockReturnValue('canisterId');
        (useCallHandler as jest.Mock).mockReturnValue({ handleICPCall });
        (useParams as jest.Mock).mockReturnValue({ id: orderId });

        orderServiceMethods.getOrders.mockResolvedValue(orders);
        (ICPOrderService as jest.Mock).mockImplementation(() => ({ ...orderServiceMethods }));
    });

    it('should throw error if hook is used outside the provider', async () => {
        expect(() => renderHook(() => useOrder())).toThrow();
    });

    it('should render error message if identity is not initialized', async () => {
        (useSiweIdentity as jest.Mock).mockReturnValue({ identity: null });
        const mockTypographyText = Typography.Text as unknown as jest.Mock;
        renderHook(() => useOrder(), {
            wrapper: OrderProvider
        });
        expect(mockTypographyText).toHaveBeenCalledTimes(1);
        expect(mockTypographyText).toHaveBeenCalledWith(
            expect.objectContaining({
                children: 'Siwe identity not initialized'
            }),
            {}
        );
    });

    it('should load data', async () => {
        handleICPCall.mockImplementation(async (callback) => {
            await callback();
        });
        const { result } = renderHook(() => useOrder(), {
            wrapper: OrderProvider
        });
        await act(async () => {
            await result.current.loadData();
        });

        expect(handleICPCall).toHaveBeenCalledTimes(1);
        expect(orderServiceMethods.getOrders).toHaveBeenCalledTimes(1);

        expect(result.current.dataLoaded).toBe(true);
        expect(result.current.order).toEqual(orders.find((order) => order.id === orderId));
        expect(result.current.orders).toEqual(orders);
    });

    it('should save order', async () => {
        handleICPCall.mockImplementation(async (callback) => {
            await callback();
        });
        const { result } = renderHook(() => useOrder(), {
            wrapper: OrderProvider
        });
        await act(async () => {
            await result.current.createOrder(orderParams);
        });

        expect(handleICPCall).toHaveBeenCalledTimes(2);
        expect(orderServiceMethods.createOrder).toHaveBeenCalledTimes(1);
        expect(orderServiceMethods.createOrder).toHaveBeenCalledWith(orderParams);
        expect(orderServiceMethods.getOrders).toHaveBeenCalledTimes(1);
    });

    it('should update order', async () => {
        handleICPCall.mockImplementation(async (callback) => {
            await callback();
        });
        const { result } = renderHook(() => useOrder(), {
            wrapper: OrderProvider
        });
        await act(async () => {
            await result.current.loadData();
        });

        jest.clearAllMocks();
        await act(async () => {
            await result.current.updateOrder(orderParams);
        });

        expect(handleICPCall).toHaveBeenCalledTimes(2);
        expect(orderServiceMethods.updateOrder).toHaveBeenCalledTimes(1);
        expect(orderServiceMethods.updateOrder).toHaveBeenCalledWith(orderId, orderParams);
        expect(orderServiceMethods.getOrders).toHaveBeenCalledTimes(1);
    });

    it('should sign order', async () => {
        handleICPCall.mockImplementation(async (callback) => {
            await callback();
        });
        const { result } = renderHook(() => useOrder(), {
            wrapper: OrderProvider
        });
        await act(async () => {
            await result.current.signOrder(orderId);
        });

        expect(handleICPCall).toHaveBeenCalledTimes(2);
        expect(orderServiceMethods.signOrder).toHaveBeenCalledTimes(1);
        expect(orderServiceMethods.signOrder).toHaveBeenCalledWith(orderId);
        expect(orderServiceMethods.getOrders).toHaveBeenCalledTimes(1);
    });
});
