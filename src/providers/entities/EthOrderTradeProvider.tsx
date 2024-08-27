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
import { useParams } from 'react-router-dom';

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
    detailedOrderTrade: DetailedOrderTrade | null;
    saveOrderTrade: (orderTradeRequest: OrderTradeRequest) => Promise<void>;
    updateOrderTrade: (orderTradeRequest: OrderTradeRequest) => Promise<void>;
    confirmNegotiation: () => Promise<void>;
    notifyExpiration: (email: string, message: string) => Promise<void>;
    createShipment: (
        expirationDate: Date,
        quantity: number,
        weight: number,
        price: number
    ) => Promise<void>;
    // Call these functions only if the order is not already loaded
    getOrderTradeService: (address: string) => OrderTradeService;
    getNegotiationStatusAsync: (orderId: number) => Promise<NegotiationStatus>;
    getSupplierAsync: (orderId: number) => Promise<string>;
    getCustomerAsync: (orderId: number) => Promise<string>;
    getDetailedTradesAsync: () => Promise<DetailedOrderTrade[]>;
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
export type DetailedOrderTrade = {
    trade: OrderTrade;
    service: OrderTradeService;
    negotiationStatus: NegotiationStatus;
    shipmentAddress: string | undefined;
    escrowAddress: string | undefined;
};
export function EthOrderTradeProvider(props: { children: ReactNode }) {
    const { id } = useParams();
    const { signer, waitForTransactions } = useSigner();
    const { rawTrades, loadData: loadRawTrades } = useEthRawTrade();
    const { productCategories } = useEthMaterial();
    const { getName } = useICPName();
    const dispatch = useDispatch();
    const [detailedOrderTrade, setDetailedOrderTrade] = useState<DetailedOrderTrade | null>(null);
    const { fileDriver } = useICP();
    const userInfo = useSelector((state: RootState) => state.userInfo);

    const organizationId = parseInt(userInfo.companyClaims.organizationId);
    const roleProof = useSelector((state: RootState) => state.userInfo.roleProof);

    const rawTrade = useMemo(() => {
        return rawTrades.find(
            (t) => id !== undefined && t.id === Number(id) && t.type == TradeType.ORDER
        );
    }, [rawTrades, id]);

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

    const orderTradeService = useMemo(() => {
        if (!rawTrade) return undefined;
        return getOrderTradeService(rawTrade.address);
    }, [signer, rawTrade]);

    // Update basic trades if raw trades change
    useEffect(() => {
        if (rawTrade) loadData();
        else setDetailedOrderTrade(null);
    }, [rawTrade, id]);

    const computeDetailedTrade = async (
        orderTradeService: OrderTradeService
    ): Promise<DetailedOrderTrade> => {
        const trade = await orderTradeService.getCompleteTrade(roleProof);
        const negotiationStatus = await orderTradeService.getNegotiationStatus();
        const shipmentAddress = await orderTradeService.getShipmentAddress(roleProof);
        const escrowAddress = await orderTradeService.getEscrowAddress(roleProof);
        return {
            trade,
            service: orderTradeService,
            negotiationStatus,
            shipmentAddress,
            escrowAddress
        };
    };

    const loadData = async () => {
        if (!orderTradeService) return;

        try {
            dispatch(addLoadingMessage(ORDER_TRADE_MESSAGE.RETRIEVE.LOADING));
            setDetailedOrderTrade(await computeDetailedTrade(orderTradeService));
        } catch (e) {
            console.log('Error loading order trade', e);
            openNotification(
                'Error',
                ORDER_TRADE_MESSAGE.RETRIEVE.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(ORDER_TRADE_MESSAGE.RETRIEVE.LOADING));
        }
    };

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
                    roleProof,
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
                await orderTradeService.addLine(roleProof, line);
            }
            await loadRawTrades();
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
    const updateOrderTrade = async (orderTradeRequest: OrderTradeRequest) => {
        if (!orderTradeService) throw new Error('Order trade service not initialized');
        if (!detailedOrderTrade) throw new Error('Trade not found');
        try {
            dispatch(addLoadingMessage(ORDER_TRADE_MESSAGE.UPDATE.LOADING));
            const oldTrade = detailedOrderTrade.trade;

            if (oldTrade.paymentDeadline !== orderTradeRequest.paymentDeadline)
                await orderTradeService.updatePaymentDeadline(
                    roleProof,
                    orderTradeRequest.paymentDeadline
                );
            if (oldTrade.documentDeliveryDeadline !== orderTradeRequest.documentDeliveryDeadline)
                await orderTradeService.updateDocumentDeliveryDeadline(
                    roleProof,
                    orderTradeRequest.documentDeliveryDeadline
                );
            if (oldTrade.arbiter !== orderTradeRequest.arbiter)
                await orderTradeService.updateArbiter(roleProof, orderTradeRequest.arbiter);
            if (oldTrade.shippingDeadline !== orderTradeRequest.shippingDeadline)
                await orderTradeService.updateShippingDeadline(
                    roleProof,
                    orderTradeRequest.shippingDeadline
                );
            if (oldTrade.deliveryDeadline !== orderTradeRequest.deliveryDeadline)
                await orderTradeService.updateDeliveryDeadline(
                    roleProof,
                    orderTradeRequest.deliveryDeadline
                );
            if (oldTrade.agreedAmount !== orderTradeRequest.agreedAmount)
                await orderTradeService.updateAgreedAmount(
                    roleProof,
                    orderTradeRequest.agreedAmount
                );
            if (oldTrade.tokenAddress !== orderTradeRequest.tokenAddress)
                await orderTradeService.updateTokenAddress(
                    roleProof,
                    orderTradeRequest.tokenAddress
                );

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
                    roleProof,
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
            await loadData();
            openNotification(
                'Success',
                ORDER_TRADE_MESSAGE.UPDATE.OK,
                NotificationType.SUCCESS,
                NOTIFICATION_DURATION
            );
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

    const confirmNegotiation = async () => {
        if (!orderTradeService) throw new Error('Order trade service not initialized');
        try {
            dispatch(addLoadingMessage(ORDER_TRADE_MESSAGE.CONFIRM_NEGOTIATION.LOADING));
            await orderTradeService.confirmOrder(roleProof);
            openNotification(
                'Success',
                ORDER_TRADE_MESSAGE.CONFIRM_NEGOTIATION.OK,
                NotificationType.SUCCESS,
                NOTIFICATION_DURATION
            );
            await loadData();
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

    const notifyExpiration = async (email: string, message: string) => {
        if (!detailedOrderTrade) throw new Error('Trade not found');
        try {
            dispatch(addLoadingMessage(ORDER_TRADE_MESSAGE.NOTIFY_EXPIRATION.LOADING));
            const recipientCompanyName =
                detailedOrderTrade.trade.supplier === signer._address
                    ? getName(detailedOrderTrade.trade.commissioner)
                    : getName(detailedOrderTrade.trade.supplier);
            const response = await fetch(`${requestPath.EMAIL_SENDER_URL}/email/deadline-expired`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    recipientCompanyName,
                    senderCompanyName: userInfo.companyClaims.legalName,
                    senderEmailAddress: userInfo.companyClaims.email,
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

    const createShipment = async (
        expirationDate: Date,
        quantity: number,
        weight: number,
        price: number
    ) => {
        if (!orderTradeService) throw new Error('Order trade service not initialized');
        try {
            dispatch(addLoadingMessage(ORDER_TRADE_MESSAGE.CREATE_SHIPMENT.LOADING));
            await orderTradeService.createShipment(
                roleProof,
                expirationDate,
                quantity,
                weight,
                price
            );
            await loadData();
            openNotification(
                'Success',
                ORDER_TRADE_MESSAGE.CREATE_SHIPMENT.OK,
                NotificationType.SUCCESS,
                NOTIFICATION_DURATION
            );
        } catch (e) {
            console.log('Error creating shipment', e);
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

    const getNegotiationStatusAsync = async (orderId: number) => {
        const rawTrade = rawTrades.find((t) => t.id === orderId);
        if (!rawTrade) throw new Error('Trade not found');
        const service = getOrderTradeService(rawTrade.address);
        return service.getNegotiationStatus();
    };

    const getSupplierAsync = async (orderId: number) => {
        const rawTrade = rawTrades.find((t) => t.id === orderId);
        if (!rawTrade) throw new Error('Trade not found');
        const service = getOrderTradeService(rawTrade.address);
        const orderTrade = await service.getCompleteTrade(roleProof);
        return orderTrade.supplier;
    };

    const getCustomerAsync = async (orderId: number) => {
        const rawTrade = rawTrades.find((t) => t.id === orderId);
        if (!rawTrade) throw new Error('Trade not found');
        const service = getOrderTradeService(rawTrade.address);
        const orderTrade = await service.getCompleteTrade(roleProof);
        return orderTrade.customer;
    };

    const getDetailedTradesAsync = async (): Promise<DetailedOrderTrade[]> => {
        return Promise.all(
            rawTrades.map(async (rawTrade) => {
                const service = getOrderTradeService(rawTrade.address);
                return await computeDetailedTrade(service);
            })
        );
    };

    return (
        <EthOrderTradeContext.Provider
            value={{
                detailedOrderTrade,
                getOrderTradeService,
                saveOrderTrade,
                updateOrderTrade,
                confirmNegotiation,
                notifyExpiration,
                createShipment,
                getNegotiationStatusAsync,
                getSupplierAsync,
                getCustomerAsync,
                getDetailedTradesAsync
            }}>
            {props.children}
        </EthOrderTradeContext.Provider>
    );
}
