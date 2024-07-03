import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import {
    OrderTrade,
    OrderTradeDriver,
    OrderTradeService,
    DocumentDriver,
    DocumentInfo,
    DocumentType,
    TradeManagerDriver,
    TradeManagerService,
    TradeType,
    URLStructure,
    DocumentStatus,
    NegotiationStatus,
    OrderStatus,
    OrderLine,
    OrderLinePrice
} from '@kbc-lib/coffee-trading-management-lib';
import { useEthRawTrade } from '@/providers/entities/EthRawTradeProvider';
import { contractAddresses } from '@/constants/evm';
import { useSigner } from '@/providers/SignerProvider';
import { ICPContext } from '@/providers/ICPProvider';
import { addLoadingMessage, removeLoadingMessage } from '@/redux/reducers/loadingSlice';
import { ACTION_MESSAGE, ORDER_TRADE_MESSAGE } from '@/constants/message';
import { NotificationType, openNotification } from '@/utils/notification';
import { NOTIFICATION_DURATION } from '@/constants/notification';
import { useDispatch, useSelector } from 'react-redux';
import { OrderTradeRequest } from '@/api/types/TradeRequest';
import { DocumentRequest } from '@/api/types/DocumentRequest';
import { getICPCanisterURL } from '@/utils/icp';
import { ICP } from '@/constants/icp';
import { ICPResourceSpec } from '@blockchain-lib/common';
import { useEthMaterial } from '@/providers/entities/EthMaterialProvider';
import { RootState } from '@/redux/store';
import { useEthDocument } from '@/providers/entities/EthDocumentProvider';

export type EthOrderTradeContextState = {
    orderTrades: OrderTrade[];
    saveOrderTrade: (
        orderTradeRequest: OrderTradeRequest,
        documentRequests: DocumentRequest[]
    ) => Promise<void>;
    updateOrderTrade: (tradeId: number, orderTradeRequest: OrderTradeRequest) => Promise<void>;
    getActionRequired: (orderId: number) => string;
    getNegotiationStatus: (orderId: number) => NegotiationStatus;
    getOrderRequiredDocuments: (
        orderId: number
    ) => Map<DocumentType, [DocumentInfo, DocumentStatus] | null>;
    getOrderStatus: (orderId: number) => OrderStatus;
    confirmNegotiation: (orderId: number) => Promise<void>;
    validateOrderDocument: (
        orderId: number,
        documentId: number,
        validationStatus: DocumentStatus
    ) => Promise<void>;
};
export const EthOrderTradeContext = createContext<EthOrderTradeContextState>(
    {} as EthOrderTradeContextState
);
export const useEthOrderTrade = (): EthOrderTradeContextState => {
    const context = useContext(EthOrderTradeContext);
    if (!context) {
        throw new Error('useEthOrderTrade must be used within an EthOrderTradeProvider.');
    }
    return context;
};
type DetailedOrderTrade = {
    trade: OrderTrade;
    service: OrderTradeService;
    requiredDocuments: Map<DocumentType, [DocumentInfo, DocumentStatus] | null>;
    actionRequired: string;
    negotiationStatus: NegotiationStatus;
    orderStatus: OrderStatus;
};
export function EthOrderTradeProvider(props: { children: ReactNode }) {
    const { signer, waitForTransactions } = useSigner();
    const { rawTrades } = useEthRawTrade();
    const { productCategories } = useEthMaterial();
    const { getRequiredDocumentsTypes, validateDocument } = useEthDocument();
    const dispatch = useDispatch();
    const [detailedOrderTrades, setDetailedOrderTrades] = useState<DetailedOrderTrade[]>([]);
    const { fileDriver } = useContext(ICPContext);
    const userInfo = useSelector((state: RootState) => state.userInfo);
    const organizationId = parseInt(userInfo.organizationId);

    const tradeManagerService = useMemo(
        () =>
            new TradeManagerService({
                tradeManagerDriver: new TradeManagerDriver(
                    signer,
                    contractAddresses.TRADE(),
                    contractAddresses.MATERIAL(),
                    contractAddresses.PRODUCT_CATEGORY()
                ),
                icpFileDriver: fileDriver
            }),
        [signer]
    );
    const documentDriver = useMemo(
        () => new DocumentDriver(signer, contractAddresses.DOCUMENT()),
        [signer]
    );

    // Update basic trades if raw trades change
    useEffect(() => {
        loadDetailedTrades();
    }, [rawTrades]);

    const loadDetailedTrades = async () => {
        try {
            dispatch(addLoadingMessage(ORDER_TRADE_MESSAGE.RETRIEVE.LOADING));
            const detailedOrderTrades: DetailedOrderTrade[] = [];
            await Promise.all(
                rawTrades
                    .filter((rT) => rT.type === TradeType.ORDER)
                    .map(async (rT) => {
                        const service = getOrderTradeService(rT.address);
                        const trade = await service.getTrade();
                        const negotiationStatus = trade.negotiationStatus;
                        const orderStatus = await service.getOrderStatus();
                        const signatures = await service.getWhoSigned();
                        const requiredDocuments = await getRequiredDocumentsDetail(
                            orderStatus,
                            service
                        );
                        const actionRequired = await getActionMessage(
                            trade,
                            requiredDocuments,
                            negotiationStatus,
                            orderStatus,
                            signatures
                        );

                        detailedOrderTrades.push({
                            trade,
                            service,
                            requiredDocuments,
                            actionRequired,
                            negotiationStatus,
                            orderStatus
                        });
                    })
            );
            setDetailedOrderTrades(detailedOrderTrades);
        } catch (e) {
            console.error(e);
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

    const getOrderTradeService = (address: string) =>
        new OrderTradeService(
            new OrderTradeDriver(
                signer,
                address,
                contractAddresses.MATERIAL(),
                contractAddresses.PRODUCT_CATEGORY()
            ),
            documentDriver,
            fileDriver
        );

    const getRequiredDocumentsDetail = async (
        orderStatus: OrderStatus,
        service: OrderTradeService
    ) => {
        const requiredDocumentsTypes = getRequiredDocumentsTypes(orderStatus);
        const documentMap = new Map<DocumentType, [DocumentInfo, DocumentStatus] | null>();
        await Promise.all(
            requiredDocumentsTypes.map(async (type) => {
                const documents = await service.getDocumentsByType(type);
                if (documents.length === 0) {
                    documentMap.set(type, null);
                    return;
                }
                const document = documents[documents.length - 1];
                const status = await service.getDocumentStatus(document.id);
                documentMap.set(type, [document, status]);
            })
        );
        return documentMap;
    };

    const getDesignatedPartyAddress = (orderStatus: OrderStatus, orderTrade: OrderTrade) => {
        switch (orderStatus) {
            case OrderStatus.PRODUCTION:
            case OrderStatus.PAYED:
            case OrderStatus.EXPORTED:
                return orderTrade.supplier;
            case OrderStatus.SHIPPED:
            default:
                return orderTrade.commissioner;
        }
    };

    const getActionMessage = async (
        orderTrade: OrderTrade,
        requiredDocuments: Map<DocumentType, [DocumentInfo, DocumentStatus] | null>,
        negotiationStatus: NegotiationStatus,
        orderStatus: OrderStatus,
        signatures: string[]
    ) => {
        if (!signatures.includes(signer.address) && negotiationStatus === NegotiationStatus.PENDING)
            return ACTION_MESSAGE.SIGNATURE_REQUIRED;

        const requiredDocumentsTypes = [...requiredDocuments.keys()];
        if (requiredDocuments.size === 0) return ACTION_MESSAGE.NO_ACTION;

        const designatedPartyAddress = getDesignatedPartyAddress(orderStatus, orderTrade);

        if (signer.address === designatedPartyAddress) {
            const isUploadRequired = requiredDocumentsTypes.some((docType) => {
                const value = requiredDocuments.get(docType);
                if (!value) return true;
                const [_, documentStatus] = value;
                return documentStatus === DocumentStatus.NOT_APPROVED;
            });

            if (isUploadRequired) {
                return ACTION_MESSAGE.UPLOAD_REQUIRED;
            }
        } else {
            const isValidationRequired = requiredDocumentsTypes.some((docType) => {
                const value = requiredDocuments.get(docType);
                if (!value) return false;
                const [_, documentStatus] = value;
                return documentStatus === DocumentStatus.NOT_EVALUATED;
            });

            if (isValidationRequired) return ACTION_MESSAGE.VALIDATION_REQUIRED;
        }
        return ACTION_MESSAGE.NO_ACTION;
    };

    const saveOrderTrade = async (
        orderTradeRequest: OrderTradeRequest,
        documentRequests: DocumentRequest[]
    ) => {
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
            const paymentInvoice = documentRequests?.find(
                (doc) => doc.documentType === DocumentType.PAYMENT_INVOICE
            );
            if (paymentInvoice) {
                const externalUrl = (await orderTradeService.getTrade()).externalUrl;
                const resourceSpec: ICPResourceSpec = {
                    name: paymentInvoice.filename,
                    type: paymentInvoice.content.type
                };
                const bytes = new Uint8Array(
                    await new Response(paymentInvoice.content).arrayBuffer()
                );
                await orderTradeService.addDocument(
                    paymentInvoice.documentType,
                    bytes,
                    externalUrl,
                    resourceSpec,
                    delegatedOrganizationIds
                );
            }
            for (const line of orderTradeRequest.lines) {
                await orderTradeService.addLine(line);
            }
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
    const updateOrderTrade = async (tradeId: number, orderTradeRequest: OrderTradeRequest) => {
        try {
            dispatch(addLoadingMessage(ORDER_TRADE_MESSAGE.UPDATE.LOADING));
            const detailedOrderTrade = detailedOrderTrades.find((t) => t.trade.tradeId === tradeId);
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
            const orderService = detailedOrderTrades.find(
                (t) => t.trade.tradeId === orderId
            )?.service;
            if (!orderService) return Promise.reject('Trade not found');
            dispatch(addLoadingMessage(ORDER_TRADE_MESSAGE.CONFIRM_NEGOTIATION.LOADING));
            await orderService.confirmOrder();
            openNotification(
                'Success',
                ORDER_TRADE_MESSAGE.CONFIRM_NEGOTIATION.OK,
                NotificationType.SUCCESS,
                NOTIFICATION_DURATION
            );
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

    const validateOrderDocument = async (
        orderId: number,
        documentId: number,
        validationStatus: DocumentStatus
    ) => {
        const orderService = detailedOrderTrades.find((t) => t.trade.tradeId === orderId)?.service;
        if (!orderService) return Promise.reject('Trade not found');
        return validateDocument(documentId, validationStatus, orderService);
    };

    const orderTrades = detailedOrderTrades.map((detailedTrade) => detailedTrade.trade);
    const getActionRequired = (orderId: number) =>
        detailedOrderTrades.find((t) => t.trade.tradeId === orderId)?.actionRequired || '';
    const getNegotiationStatus = (orderId: number) =>
        detailedOrderTrades.find((t) => t.trade.tradeId === orderId)?.negotiationStatus ||
        NegotiationStatus.INITIALIZED;
    const getOrderStatus = (orderId: number) =>
        detailedOrderTrades.find((t) => t.trade.tradeId === orderId)?.orderStatus ||
        OrderStatus.CONTRACTING;
    const getOrderRequiredDocuments = (orderId: number) =>
        detailedOrderTrades.find((t) => t.trade.tradeId === orderId)?.requiredDocuments ||
        new Map<DocumentType, [DocumentInfo, DocumentStatus] | null>();
    return (
        <EthOrderTradeContext.Provider
            value={{
                orderTrades,
                saveOrderTrade,
                updateOrderTrade,
                getActionRequired,
                getNegotiationStatus,
                getOrderStatus,
                getOrderRequiredDocuments,
                confirmNegotiation,
                validateOrderDocument
            }}>
            {props.children}
        </EthOrderTradeContext.Provider>
    );
}
