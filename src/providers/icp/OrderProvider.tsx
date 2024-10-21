import React, { createContext, useMemo, useState } from 'react';
import {
    computeRoleProof,
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
import { ORDER_TRADE_MESSAGE } from '@/constants/message';
import { NotificationType, openNotification } from '@/utils/notification';
import { NOTIFICATION_DURATION } from '@/constants/notification';
import { Wallet } from 'ethers';

const USER1_PRIVATE_KEY = '0c7e66e74f6666b514cc73ee2b7ffc518951cf1ca5719d6820459c4e134f2264';
const COMPANY1_PRIVATE_KEY = '538d7d8aec31a0a83f12461b1237ce6b00d8efc1d8b1c73566c05f63ed5e6d02';
const userWallet = new Wallet(USER1_PRIVATE_KEY);
const companyPrivateKey = COMPANY1_PRIVATE_KEY;
const DELEGATE_CREDENTIAL_ID_HASH =
    '0x2cc6c15c35500c4341eee2f9f5f8c39873b9c3737edb343ebc3d16424e99a0d4';
const DELEGATOR_CREDENTIAL_ID_HASH =
    '0xf19b6aebcdaba2222d3f2c818ff1ecda71c7ed93c3e0f958241787663b58bc4b';

export type OrderContextState = {
    dataLoaded: boolean;
    orders: Order[];
    order: Order | null;
    loadData: () => Promise<void>;
    create: (params: OrderParams) => Promise<void>;
    update: (params: OrderParams) => Promise<void>;
    sign: (params: OrderParams) => Promise<void>;
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
            const roleProof = await computeRoleProof(
                userWallet.address,
                'Signer',
                DELEGATE_CREDENTIAL_ID_HASH,
                DELEGATOR_CREDENTIAL_ID_HASH,
                companyPrivateKey
            );
            const resp = await orderService.getOrders(roleProof);
            console.log(resp);
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

    return (
        <OrderContext.Provider
            value={{
                dataLoaded,
                orders,
                order,
                loadData,
                create: async (params: OrderParams) => {},
                update: async (params: OrderParams) => {},
                sign: async (params: OrderParams) => {}
            }}>
            {children}
        </OrderContext.Provider>
    );
}
