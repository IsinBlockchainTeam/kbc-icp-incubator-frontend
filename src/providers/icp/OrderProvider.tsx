import React, { createContext, useMemo, useState } from 'react';
import {
    Order,
    OrderDriver,
    OrderParams,
    OrderService
} from '@kbc-lib/coffee-trading-management-lib';
import { useSiweIdentity } from '@/providers/SiweIdentityProvider';
import { Typography } from 'antd';
import { checkAndGetEnvironmentVariable } from '@/utils/env';
import { ICP } from '@/constants/icp';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addLoadingMessage, removeLoadingMessage } from '@/redux/reducers/loadingSlice';
import { ORDER_TRADE_MESSAGE, OrderMessage } from '@/constants/message';
import { NotificationType, openNotification } from '@/utils/notification';
import { NOTIFICATION_DURATION } from '@/constants/notification';

export type OrderContextState = {
    dataLoaded: boolean;
    orders: Order[];
    order: Order | null;
    loadData: () => Promise<void>;
    create: (params: OrderParams) => Promise<void>;
    update: (params: OrderParams) => Promise<void>;
    sign: (id: number) => Promise<void>;
};
export const OrderContext = createContext<OrderContextState>({} as OrderContextState);
export const useOrder = (): OrderContextState => {
    const context = React.useContext(OrderContext);
    if (!context || Object.keys(context).length === 0) {
        throw new Error('useOrder must be used within an OrderProvider.');
    }
    return context;
};
export function OrderProvider({ children }: { children: React.ReactNode }) {
    const { identity } = useSiweIdentity();
    const entityManagerCanisterId = checkAndGetEnvironmentVariable(ICP.CANISTER_ID_ENTITY_MANAGER);
    const { id } = useParams();
    const dispatch = useDispatch();
    const [dataLoaded, setDataLoaded] = useState<boolean>(false);
    const [orders, setOrders] = React.useState<Order[]>([]);

    if (!identity) {
        return <Typography.Text>Siwe identity not initialized</Typography.Text>;
    }

    const orderService = useMemo(
        () => new OrderService(new OrderDriver(identity, entityManagerCanisterId)),
        [identity]
    );

    const loadData = async () => {
        await loadOrders();
        setDataLoaded(true);
    };

    const order = orders.find((order) => order.id === Number(id)) || null;

    const loadOrders = async () => {
        if (!orderService) return;

        try {
            dispatch(addLoadingMessage('Retrieving orders'));
            const resp = await orderService.getOrders();
            setOrders(resp);
        } catch (e) {
            console.log('Error loading orders', e);
            openNotification(
                'Error',
                ORDER_TRADE_MESSAGE.RETRIEVE.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage('Retrieving orders'));
        }
    };

    const writeTransaction = async (transaction: () => Promise<Order>, message: OrderMessage) => {
        try {
            dispatch(addLoadingMessage(message.LOADING));
            await transaction();
            await loadOrders();
            openNotification(
                'Success',
                message.OK,
                NotificationType.SUCCESS,
                NOTIFICATION_DURATION
            );
        } catch (e) {
            console.log('Error writing transaction', e);
            openNotification('Error', message.ERROR, NotificationType.ERROR, NOTIFICATION_DURATION);
        } finally {
            dispatch(removeLoadingMessage(message.LOADING));
        }
    };

    const create = async (params: OrderParams) => {
        if (!orderService) throw new Error('Order service not initialized');
        await writeTransaction(() => orderService.createOrder(params), ORDER_TRADE_MESSAGE.SAVE);
    };

    const update = async (params: OrderParams) => {
        if (!orderService) throw new Error('Order service not initialized');
        if (!order) throw new Error('Order not found');

        await writeTransaction(
            () => orderService.updateOrder(order.id, params),
            ORDER_TRADE_MESSAGE.UPDATE
        );
    };

    const sign = async (id: number) => {
        if (!orderService) throw new Error('Order service not initialized');
        await writeTransaction(
            () => orderService.signOrder(id),
            ORDER_TRADE_MESSAGE.CONFIRM_NEGOTIATION
        );
    };

    return (
        <OrderContext.Provider
            value={{
                dataLoaded,
                orders,
                order,
                loadData,
                create,
                update,
                sign
            }}>
            {children}
        </OrderContext.Provider>
    );
}
