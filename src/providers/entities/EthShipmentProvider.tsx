import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { useSigner } from '@/providers/SignerProvider';
import { useEthOrderTrade } from '@/providers/entities/EthOrderTradeProvider';
import { useDispatch } from 'react-redux';
import { SHIPMENT_MESSAGE } from '@/constants/message';
import { addLoadingMessage, removeLoadingMessage } from '@/redux/reducers/loadingSlice';
import {
    Shipment,
    ShipmentManagerDriver,
    ShipmentManagerService,
    ShipmentStatus
} from '@kbc-lib/coffee-trading-management-lib';
import { useParams } from 'react-router-dom';
import { NotificationType, openNotification } from '@/utils/notification';
import { NOTIFICATION_DURATION } from '@/constants/notification';
import { ethers } from 'ethers';

export type EthShipmentContextState = {
    shipments: Shipment[];
    getShipmentStatus: (shipmentId: number) => ShipmentStatus;
    addShipment: (date: number, quantity: number, weight: number, price: number) => Promise<void>;
    approveShipment: (shipmentId: number) => Promise<void>;
    lockFunds: (shipmentId: number) => Promise<void>;
};
export const EthShipmentContext = createContext<EthShipmentContextState>(
    {} as EthShipmentContextState
);
export const useEthShipment = (): EthShipmentContextState => {
    const context = useContext(EthShipmentContext);
    if (!context || Object.keys(context).length === 0) {
        throw new Error('useEthShipment must be used within an EthShipmentProvider.');
    }
    return context;
};
type DetailedShipment = {
    shipment: Shipment;
    status: ShipmentStatus;
};
export function EthShipmentProvider(props: { children: ReactNode }) {
    const { id } = useParams();
    const { signer } = useSigner();
    const { orderTrades, getShipmentManagerAddress } = useEthOrderTrade();
    const [detailedShipments, setDetailedShipments] = useState<DetailedShipment[]>([]);
    const dispatch = useDispatch();

    const orderTrade = useMemo(
        () => orderTrades.find((t) => t.tradeId === parseInt(id || '')),
        [orderTrades, id]
    );

    const shipmentManagerAddress = orderTrade
        ? getShipmentManagerAddress(orderTrade.tradeId)
        : undefined;

    const shipmentManagerService = useMemo(() => {
        if (!shipmentManagerAddress || shipmentManagerAddress == ethers.constants.AddressZero)
            return undefined;
        return new ShipmentManagerService(
            new ShipmentManagerDriver(signer, shipmentManagerAddress)
        );
    }, [signer, shipmentManagerAddress]);

    // Update shipments when order trades change
    useEffect(() => {
        if (orderTrade) loadShipments();
    }, [orderTrade]);

    const loadShipments = async () => {
        if (!shipmentManagerService) return;
        try {
            dispatch(addLoadingMessage(SHIPMENT_MESSAGE.RETRIEVE.LOADING));
            const shipmentCounter = await shipmentManagerService.getShipmentCounter();
            const detailedShipments: DetailedShipment[] = [];
            await Promise.allSettled(
                Array.from({ length: shipmentCounter }).map(async (_, i) => {
                    const shipment = await shipmentManagerService.getShipment(i + 1);
                    const status = await shipmentManagerService.getShipmentStatus(shipment.id);
                    detailedShipments.push({
                        shipment,
                        status
                    });
                })
            );
            setDetailedShipments(detailedShipments);
        } catch (e) {
            console.log(shipmentManagerAddress, e);
            openNotification(
                'Error',
                SHIPMENT_MESSAGE.RETRIEVE.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(SHIPMENT_MESSAGE.RETRIEVE.LOADING));
        }
    };

    const addShipment = async (date: number, quantity: number, weight: number, price: number) => {
        if (!shipmentManagerService) throw new Error('ShipmentManager service not initialized');
        try {
            dispatch(addLoadingMessage(SHIPMENT_MESSAGE.SAVE.LOADING));
            await shipmentManagerService.addShipment(date, quantity, weight, price);
            await loadShipments();
            openNotification(
                'Success',
                SHIPMENT_MESSAGE.SAVE.OK,
                NotificationType.SUCCESS,
                NOTIFICATION_DURATION
            );
        } catch (e) {
            openNotification(
                'Error',
                SHIPMENT_MESSAGE.SAVE.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(SHIPMENT_MESSAGE.SAVE.LOADING));
        }
    };

    const approveShipment = async (shipmentId: number) => {
        if (!shipmentManagerService) throw new Error('ShipmentManager service not initialized');
        if (!detailedShipments.find((d) => d.shipment.id === shipmentId))
            throw new Error(`Shipment with ID ${shipmentId} not found`);
        try {
            dispatch(addLoadingMessage(SHIPMENT_MESSAGE.APPROVE.LOADING));
            await shipmentManagerService.approveShipment(shipmentId);
            await loadShipments();
            openNotification(
                'Success',
                SHIPMENT_MESSAGE.APPROVE.OK,
                NotificationType.SUCCESS,
                NOTIFICATION_DURATION
            );
        } catch (e) {
            console.error(e);
            openNotification(
                'Error',
                SHIPMENT_MESSAGE.APPROVE.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(SHIPMENT_MESSAGE.APPROVE.LOADING));
        }
    };

    const lockFunds = async (shipmentId: number) => {
        if (!shipmentManagerService) throw new Error('ShipmentManager service not initialized');
        if (!detailedShipments.find((d) => d.shipment.id === shipmentId))
            throw new Error(`Shipment with ID ${shipmentId} not found`);
        try {
            dispatch(addLoadingMessage(SHIPMENT_MESSAGE.LOCK.LOADING));
            await shipmentManagerService.lockFunds(shipmentId);
            await loadShipments();
            openNotification(
                'Success',
                SHIPMENT_MESSAGE.LOCK.OK,
                NotificationType.SUCCESS,
                NOTIFICATION_DURATION
            );
        } catch (e) {
            console.error(e);
            openNotification(
                'Error',
                SHIPMENT_MESSAGE.LOCK.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(SHIPMENT_MESSAGE.LOCK.LOADING));
        }
    };

    const shipments = detailedShipments.map((d) => d.shipment);
    const getShipmentStatus = (shipmentId: number) => {
        const shipment = detailedShipments.find((d) => d.shipment.id === shipmentId);
        if (!shipment) throw new Error(`Shipment with ID ${shipmentId} not found`);
        return shipment.status;
    };

    return (
        <EthShipmentContext.Provider
            value={{ shipments, getShipmentStatus, addShipment, approveShipment, lockFunds }}>
            {props.children}
        </EthShipmentContext.Provider>
    );
}
