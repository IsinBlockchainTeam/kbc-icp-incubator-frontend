import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import {
    DocumentDriver,
    NegotiationStatus,
    OrderLine,
    OrderLinePrice,
    OrderLineRequest,
    OrderTrade,
    OrderTradeDriver,
    OrderTradeService,
    TradeManagerDriver,
    TradeManagerService,
    TradeType,
    URLStructure
} from '@kbc-lib/coffee-trading-management-lib';
import { useEthRawTrade } from '@/providers/entities/EthRawTradeProvider';
import { CONTRACT_ADDRESSES } from '@/constants/evm';
import { useSigner } from '@/providers/SignerProvider';
import { useICP } from '@/providers/ICPProvider';
import { addLoadingMessage, removeLoadingMessage } from '@/redux/reducers/loadingSlice';
import { ORDER_TRADE_MESSAGE } from '@/constants/message';
import { NotificationType, openNotification } from '@/utils/notification';
import { NOTIFICATION_DURATION } from '@/constants/notification';
import { useDispatch, useSelector } from 'react-redux';
import { getICPCanisterURL } from '@/utils/icp';
import { ICP } from '@/constants/icp';
import { useEthMaterial } from '@/providers/entities/EthMaterialProvider';
import { RootState } from '@/redux/store';
import { useICPName } from '@/providers/entities/ICPNameProvider';
import { requestPath } from '@/constants/url';

export type OrderTradeRequest = {
    supplier: string;
    customer: string;
    commissioner: string;
    lines: OrderLineRequest[];
    paymentDeadline: number;
    documentDeliveryDeadline: number;
    arbiter: string;
    shippingDeadline: number;
    deliveryDeadline: number;
    agreedAmount: number;
    tokenAddress: string;
    incoterms: string;
    shipper: string;
    shippingPort: string;
    deliveryPort: string;
};
export type EthOrderTradeContextState = {
    orderTrades: OrderTrade[];
    saveOrderTrade: (orderTradeRequest: OrderTradeRequest) => Promise<void>;
    updateOrderTrade: (orderId: number, orderTradeRequest: OrderTradeRequest) => Promise<void>;
    getNegotiationStatus: (orderId: number) => NegotiationStatus;
    confirmNegotiation: (orderId: number) => Promise<void>;
    notifyExpiration: (orderId: number, email: string, message: string) => Promise<void>;
    createShipment: (
        orderId: number,
        expirationDate: Date,
        quantity: number,
        weight: number,
        price: number
    ) => Promise<void>;
    getShipmentAddress: (orderId: number) => string;
    getEscrowAddress: (orderId: number) => string;
};
export const EthOrderTradeContext = createContext<EthOrderTradeContextState>(
    {} as EthOrderTradeContextState
);
export const useEthOrderTrade = (): EthOrderTradeContextState => {
    const context = useContext(EthOrderTradeContext);
    if (!context || Object.keys(context).length === 0) {
        throw new Error('useEthOrderTrade must be used within an EthOrderTradeProvider.');
    }
    return context;
};
type DetailedOrderTrade = {
    trade: OrderTrade;
    service: OrderTradeService;
    negotiationStatus: NegotiationStatus;
    shipmentAddress: string;
    escrowAddress: string;
};
export function EthOrderTradeProvider(props: { children: ReactNode }) {
    const { signer, waitForTransactions } = useSigner();
    const { rawTrades } = useEthRawTrade();
    const { productCategories } = useEthMaterial();
    const { getName } = useICPName();
    const dispatch = useDispatch();
    const [detailedOrderTrades, setDetailedOrderTrades] = useState<DetailedOrderTrade[]>([]);
    const { fileDriver } = useICP();
    const userInfo = useSelector((state: RootState) => state.userInfo);
    const organizationId = parseInt(userInfo.organizationId);

    const tradeManagerService = useMemo(
        () =>
            new TradeManagerService({
                tradeManagerDriver: new TradeManagerDriver(
                    signer,
                    CONTRACT_ADDRESSES.TRADE(),
                    CONTRACT_ADDRESSES.MATERIAL(),
                    CONTRACT_ADDRESSES.PRODUCT_CATEGORY()
                ),
                icpFileDriver: fileDriver
            }),
        [signer]
    );
    const documentDriver = useMemo(
        () => new DocumentDriver(signer, CONTRACT_ADDRESSES.DOCUMENT()),
        [signer]
    );

    // Update basic trades if raw trades change
    useEffect(() => {
        loadDetailedTrades();
    }, [rawTrades]);

    const loadDetailedTrades = async () => {
        dispatch(addLoadingMessage(ORDER_TRADE_MESSAGE.RETRIEVE.LOADING));
        const detailedOrderTrades: DetailedOrderTrade[] = [];
        await Promise.allSettled(
            rawTrades
                .filter((rT) => rT.type === TradeType.ORDER)
                .map(async (rT) => {
                    const service = getOrderTradeService(rT.address);
                    const trade = await service.getCompleteTrade();
                    const negotiationStatus = trade.negotiationStatus;
                    const shipmentAddress = await service.getShipmentAddress();
                    const escrowAddress = await service.getEscrowAddress();

                    detailedOrderTrades.push({
                        trade,
                        service,
                        negotiationStatus,
                        shipmentAddress,
                        escrowAddress
                    });
                })
        );
        setDetailedOrderTrades(detailedOrderTrades);
        dispatch(removeLoadingMessage(ORDER_TRADE_MESSAGE.RETRIEVE.LOADING));
    };

    const getOrderTradeService = (address: string) =>
        new OrderTradeService(
            new OrderTradeDriver(
                signer,
                address,
                CONTRACT_ADDRESSES.MATERIAL(),
                CONTRACT_ADDRESSES.PRODUCT_CATEGORY()
            ),
            documentDriver,
            fileDriver
        );

    const saveOrderTrade = async (orderTradeRequest: OrderTradeRequest) => {
        try {
            dispatch(addLoadingMessage(ORDER_TRADE_MESSAGE.SAVE.LOADING));
            // TODO: remove this harcoded value
            const delegatedOrganizationIds: number[] = organizationId === 0 ? [1] : [0];
            const urlStructure: URLStructure = {
                prefix: getICPCanisterURL(ICP.CANISTER_ID_ORGANIZATION),
                organizationId
            };
            const metadata = {
                incoterms: orderTradeRequest.incoterms,
                shipper: orderTradeRequest.shipper,
                shippingPort: orderTradeRequest.shippingPort,
                deliveryPort: orderTradeRequest.deliveryPort
            };
            const [, newTradeAddress, transactionHash] =
                await tradeManagerService.registerOrderTrade(
                    orderTradeRequest.supplier,
                    orderTradeRequest.customer,
                    orderTradeRequest.commissioner,
                    orderTradeRequest.paymentDeadline,
                    orderTradeRequest.documentDeliveryDeadline,
                    orderTradeRequest.arbiter,
                    orderTradeRequest.shippingDeadline,
                    orderTradeRequest.deliveryDeadline,
                    orderTradeRequest.agreedAmount,
                    orderTradeRequest.tokenAddress,
                    metadata,
                    urlStructure,
                    delegatedOrganizationIds
                );
            await waitForTransactions(
                transactionHash,
                Number(process.env.REACT_APP_BC_CONFIRMATION_NUMBER || 0)
            );
            const orderTradeService = getOrderTradeService(newTradeAddress);
            for (const line of orderTradeRequest.lines) {
                await orderTradeService.addLine(line);
            }
            await loadDetailedTrades();
            openNotification(
                'Success',
                ORDER_TRADE_MESSAGE.SAVE.OK,
                NotificationType.SUCCESS,
                NOTIFICATION_DURATION
            );
        } catch (e: any) {
            openNotification(
                'Error',
                ORDER_TRADE_MESSAGE.SAVE.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(ORDER_TRADE_MESSAGE.SAVE.LOADING));
        }
    };

    // TODO: BUG! -> Right now metadata of the trade are not updated, is it possible to update metadata file in ICP or it must be replaced?
    const updateOrderTrade = async (orderId: number, orderTradeRequest: OrderTradeRequest) => {
        try {
            dispatch(addLoadingMessage(ORDER_TRADE_MESSAGE.UPDATE.LOADING));
            const detailedOrderTrade = detailedOrderTrades.find((t) => t.trade.tradeId === orderId);
            if (!detailedOrderTrade) return Promise.reject('Trade not found');
            const oldTrade = detailedOrderTrade.trade;
            const orderTradeService = detailedOrderTrade.service;

            if (oldTrade.paymentDeadline !== orderTradeRequest.paymentDeadline)
                await orderTradeService.updatePaymentDeadline(orderTradeRequest.paymentDeadline);
            if (oldTrade.documentDeliveryDeadline !== orderTradeRequest.documentDeliveryDeadline)
                await orderTradeService.updateDocumentDeliveryDeadline(
                    orderTradeRequest.documentDeliveryDeadline
                );
            if (oldTrade.arbiter !== orderTradeRequest.arbiter)
                await orderTradeService.updateArbiter(orderTradeRequest.arbiter);
            if (oldTrade.shippingDeadline !== orderTradeRequest.shippingDeadline)
                await orderTradeService.updateShippingDeadline(orderTradeRequest.shippingDeadline);
            if (oldTrade.deliveryDeadline !== orderTradeRequest.deliveryDeadline)
                await orderTradeService.updateDeliveryDeadline(orderTradeRequest.deliveryDeadline);
            if (oldTrade.agreedAmount !== orderTradeRequest.agreedAmount)
                await orderTradeService.updateAgreedAmount(orderTradeRequest.agreedAmount);
            if (oldTrade.tokenAddress !== orderTradeRequest.tokenAddress)
                await orderTradeService.updateTokenAddress(orderTradeRequest.tokenAddress);

            // update one single line because at this time we manage only one line per trade
            const oldLine = oldTrade.lines[0] as OrderLine;
            const newLine = orderTradeRequest.lines[0];
            if (!oldLine || !newLine) return;

            // Note assigned material is ignored as it is not changeable in the UI
            if (
                oldLine.productCategory.id !== newLine.productCategoryId ||
                oldLine.unit !== newLine.unit ||
                oldLine.quantity !== newLine.quantity ||
                oldLine.price.amount !== newLine.price.amount ||
                oldLine.price.fiat !== newLine.price.fiat
            ) {
                const productCategory = productCategories.find(
                    (pc) => pc.id === newLine.productCategoryId
                );
                if (!productCategory) return Promise.reject('Product category not found');
                await orderTradeService.updateLine(
                    new OrderLine(
                        oldLine.id,
                        oldLine.material,
                        productCategory,
                        newLine.quantity,
                        newLine.unit,
                        new OrderLinePrice(newLine.price.amount, newLine.price.fiat)
                    )
                );
            }
            openNotification(
                'Success',
                ORDER_TRADE_MESSAGE.UPDATE.OK,
                NotificationType.SUCCESS,
                NOTIFICATION_DURATION
            );
            // TODO: Reload only this trade instead of all trades
            await loadDetailedTrades();
        } catch (e: any) {
            openNotification(
                'Error',
                ORDER_TRADE_MESSAGE.UPDATE.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(ORDER_TRADE_MESSAGE.UPDATE.LOADING));
        }
    };

    const confirmNegotiation = async (orderId: number) => {
        try {
            dispatch(addLoadingMessage(ORDER_TRADE_MESSAGE.CONFIRM_NEGOTIATION.LOADING));
            const orderService = detailedOrderTrades.find(
                (t) => t.trade.tradeId === orderId
            )?.service;
            if (!orderService) return Promise.reject('Trade not found');
            await orderService.confirmOrder();
            openNotification(
                'Success',
                ORDER_TRADE_MESSAGE.CONFIRM_NEGOTIATION.OK,
                NotificationType.SUCCESS,
                NOTIFICATION_DURATION
            );
            await loadDetailedTrades();
        } catch (e: any) {
            openNotification(
                'Error',
                ORDER_TRADE_MESSAGE.CONFIRM_NEGOTIATION.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(ORDER_TRADE_MESSAGE.CONFIRM_NEGOTIATION.LOADING));
        }
    };

    const notifyExpiration = async (orderId: number, email: string, message: string) => {
        try {
            dispatch(addLoadingMessage(ORDER_TRADE_MESSAGE.NOTIFY_EXPIRATION.LOADING));
            const orderTrade = detailedOrderTrades.find((t) => t.trade.tradeId === orderId)?.trade;
            if (!orderTrade) return Promise.reject('Trade not found');
            const recipientCompanyName =
                orderTrade.supplier === signer._address
                    ? getName(orderTrade.commissioner)
                    : getName(orderTrade.supplier);
            const response = await fetch(`${requestPath.EMAIL_SENDER_URL}/email/deadline-expired`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    recipientCompanyName,
                    senderCompanyName: userInfo.legalName,
                    senderEmailAddress: userInfo.email,
                    message,
                    transactionUrl: window.location.href
                })
            });
            if (response.ok)
                openNotification(
                    'Success',
                    ORDER_TRADE_MESSAGE.NOTIFY_EXPIRATION.OK,
                    NotificationType.SUCCESS,
                    NOTIFICATION_DURATION
                );
        } catch (e: any) {
            openNotification(
                'Error',
                ORDER_TRADE_MESSAGE.NOTIFY_EXPIRATION.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(ORDER_TRADE_MESSAGE.NOTIFY_EXPIRATION.LOADING));
        }
    };

    const orderTrades = detailedOrderTrades.map((detailedTrade) => detailedTrade.trade);
    const getNegotiationStatus = (orderId: number) => {
        const detailedOrderTrade = detailedOrderTrades.find((t) => t.trade.tradeId === orderId);
        if (!detailedOrderTrade) throw new Error('Order trade not found.');
        return detailedOrderTrade.negotiationStatus;
    };

    const createShipment = async (
        orderId: number,
        expirationDate: Date,
        quantity: number,
        weight: number,
        price: number
    ) => {
        const detailedOrderTrade = detailedOrderTrades.find((t) => t.trade.tradeId === orderId);
        if (!detailedOrderTrade) throw new Error('Order trade not found.');
        try {
            dispatch(addLoadingMessage(ORDER_TRADE_MESSAGE.CREATE_SHIPMENT.LOADING));
            await detailedOrderTrade.service.createShipment(
                expirationDate,
                quantity,
                weight,
                price
            );
            await loadDetailedTrades();
            openNotification(
                'Success',
                ORDER_TRADE_MESSAGE.CREATE_SHIPMENT.OK,
                NotificationType.SUCCESS,
                NOTIFICATION_DURATION
            );
        } catch (e) {
            openNotification(
                'Error',
                ORDER_TRADE_MESSAGE.CREATE_SHIPMENT.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(ORDER_TRADE_MESSAGE.CREATE_SHIPMENT.LOADING));
        }
    };
    const getShipmentAddress = (orderId: number) => {
        const detailedOrderTrade = detailedOrderTrades.find((t) => t.trade.tradeId === orderId);
        if (!detailedOrderTrade) throw new Error('Order trade not found.');
        return detailedOrderTrade.shipmentAddress;
    };
    const getEscrowAddress = (orderId: number) => {
        const detailedOrderTrade = detailedOrderTrades.find((t) => t.trade.tradeId === orderId);
        if (!detailedOrderTrade) throw new Error('Order trade not found.');
        return detailedOrderTrade.escrowAddress;
    };
    return (
        <EthOrderTradeContext.Provider
            value={{
                orderTrades,
                getNegotiationStatus,
                saveOrderTrade,
                updateOrderTrade,
                confirmNegotiation,
                notifyExpiration,
                createShipment,
                getShipmentAddress,
                getEscrowAddress
            }}>
            {props.children}
        </EthOrderTradeContext.Provider>
    );
}
