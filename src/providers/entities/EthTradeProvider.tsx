import {
    BasicTrade,
    BasicTradeDriver,
    BasicTradeService,
    DocumentDriver,
    DocumentInfo,
    DocumentStatus,
    DocumentType,
    Line,
    NegotiationStatus,
    OrderLine,
    OrderLinePrice,
    OrderStatus,
    OrderTrade,
    OrderTradeDriver,
    OrderTradeService,
    TradeDriver,
    TradeManagerDriver,
    TradeManagerService,
    TradeService,
    TradeType,
    URLStructure
} from '@kbc-lib/coffee-trading-management-lib';
import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { contractAddresses } from '@/constants/evm';
import { useSigner } from '@/providers/SignerProvider';
import { ICPContext } from '@/providers/ICPProvider';
import { addLoadingMessage, removeLoadingMessage } from '@/redux/reducers/loadingSlice';
import { ACTION_MESSAGE, TRADE_MESSAGE } from '@/constants/message';
import { useDispatch, useSelector } from 'react-redux';
import { NotificationType, openNotification } from '@/utils/notification';
import { NOTIFICATION_DURATION } from '@/constants/notification';
import { useEthDocument } from '@/providers/entities/EthDocumentProvider';
import { BasicTradeRequest, OrderTradeRequest } from '@/api/types/TradeRequest';
import { DocumentRequest } from '@/api/types/DocumentRequest';
import { RootState } from '@/redux/store';
import { getICPCanisterURL } from '@/utils/icp';
import { ICP } from '@/constants/icp';
import { ICPResourceSpec } from '@blockchain-lib/common';
import { useEthMaterial } from '@/providers/entities/EthMaterialProvider';

export type RawTrade = {
    address: string;
    type: TradeType;
};
export type EthTradeContextState = {
    dataLoaded: boolean;
    rawTrades: RawTrade[];
    basicTrades: BasicTrade[];
    orderTrades: OrderTrade[];
    loadData: () => Promise<void>;
    saveBasicTrade: (
        basicTradeRequest: BasicTradeRequest,
        documentRequests: DocumentRequest[]
    ) => Promise<void>;
    updateBasicTrade: (tradeId: number, basicTradeRequest: BasicTradeRequest) => Promise<void>;
    saveOrderTrade: (
        orderTradeRequest: OrderTradeRequest,
        documentRequests: DocumentRequest[]
    ) => Promise<void>;
    updateOrderTrade: (tradeId: number, orderTradeRequest: OrderTradeRequest) => Promise<void>;
    getBasicTradeDocuments: (tradeId: number) => DocumentInfo[];
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
export const EthTradeContext = createContext<EthTradeContextState>({} as EthTradeContextState);
export const useEthTrade = (): EthTradeContextState => {
    const context = useContext(EthTradeContext);
    if (!context) {
        throw new Error('useEthTrade must be used within an EthTradeProvider.');
    }
    return context;
};
type DetailedBasicTrade = {
    trade: BasicTrade;
    service: BasicTradeService;
    documents: DocumentInfo[];
};
type DetailedOrderTrade = {
    trade: OrderTrade;
    service: OrderTradeService;
    requiredDocuments: Map<DocumentType, [DocumentInfo, DocumentStatus] | null>;
    actionRequired: string;
    negotiationStatus: NegotiationStatus;
    orderStatus: OrderStatus;
};
export function EthTradeProvider(props: { children: ReactNode }) {
    const [dataLoaded, setDataLoaded] = useState<boolean>(false);
    const [detailedBasicTrades, setDetailedBasicTrades] = useState<DetailedBasicTrade[]>([]);
    const [detailedOrderTrades, setDetailedOrderTrades] = useState<DetailedOrderTrade[]>([]);
    const [rawTrades, setRawTrades] = useState<RawTrade[]>([]);

    const { signer, waitForTransactions } = useSigner();
    const { productCategories } = useEthMaterial();
    const { getRequiredDocumentsTypes, validateDocument } = useEthDocument();
    const { fileDriver } = useContext(ICPContext);
    const dispatch = useDispatch();
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

    const getBasicTradeService = (address: string) =>
        new BasicTradeService(
            new BasicTradeDriver(
                signer,
                address,
                contractAddresses.MATERIAL(),
                contractAddresses.PRODUCT_CATEGORY()
            ),
            documentDriver,
            fileDriver
        );
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

    const loadDetailedTrades = async () => {
        try {
            dispatch(addLoadingMessage(TRADE_MESSAGE.RETRIEVE.LOADING));
            const tradeIds = [
                ...(await tradeManagerService.getTradeIdsOfSupplier(signer.address)),
                ...(await tradeManagerService.getTradeIdsOfCommissioner(signer.address))
            ];
            const tradeAddresses = await Promise.all(
                tradeIds.map((id) => tradeManagerService.getTrade(id))
            );
            const detailedBasicTrades: DetailedBasicTrade[] = [];
            const detailedOrderTrades: DetailedOrderTrade[] = [];
            const rawTrades: RawTrade[] = [];
            await Promise.all(
                tradeAddresses.map(async (address) => {
                    const tradeService = new TradeService(
                        new TradeDriver(signer, address),
                        documentDriver,
                        fileDriver
                    );
                    const type = await tradeService.getTradeType();
                    rawTrades.push({ address, type });
                    if (type === TradeType.BASIC) {
                        const concreteService = getBasicTradeService(address);
                        detailedBasicTrades.push({
                            trade: (await concreteService.getTrade()) as BasicTrade,
                            service: concreteService,
                            documents: await concreteService.getDocumentsByType(
                                DocumentType.DELIVERY_NOTE
                            )
                        });
                        return;
                    }
                    const service = getOrderTradeService(address);
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
            setRawTrades(rawTrades);
            setDetailedBasicTrades(detailedBasicTrades);
            setDetailedOrderTrades(detailedOrderTrades);
        } catch (e) {
            console.error(e);
            openNotification(
                'Error',
                TRADE_MESSAGE.RETRIEVE.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(TRADE_MESSAGE.RETRIEVE.LOADING));
        }
    };

    const saveBasicTrade = async (
        basicTradeRequest: BasicTradeRequest,
        documentRequests: DocumentRequest[]
    ) => {
        try {
            dispatch(addLoadingMessage(TRADE_MESSAGE.SAVE_BASIC.LOADING));
            // TODO: remove this harcoded value
            const delegatedOrganizationIds: number[] = organizationId === 0 ? [1] : [0];
            const urlStructure: URLStructure = {
                prefix: getICPCanisterURL(ICP.CANISTER_ID_ORGANIZATION),
                organizationId
            };
            const metadata = {
                date: new Date()
            };
            const [, newTradeAddress, transactionHash] =
                await tradeManagerService.registerBasicTrade(
                    basicTradeRequest.supplier,
                    basicTradeRequest.customer,
                    basicTradeRequest.commissioner,
                    basicTradeRequest.name,
                    metadata,
                    urlStructure,
                    delegatedOrganizationIds
                );
            await waitForTransactions(
                transactionHash,
                Number(process.env.REACT_APP_BC_CONFIRMATION_NUMBER || 0)
            );
            const basicTradeService = getBasicTradeService(newTradeAddress);
            const deliveryNote = documentRequests?.find(
                (doc) => doc.documentType === DocumentType.DELIVERY_NOTE
            );
            if (deliveryNote) {
                const externalUrl = (await basicTradeService.getTrade()).externalUrl;
                const resourceSpec: ICPResourceSpec = {
                    name: deliveryNote.filename,
                    type: deliveryNote.content.type
                };
                const bytes = new Uint8Array(
                    await new Response(deliveryNote.content).arrayBuffer()
                );
                await basicTradeService.addDocument(
                    deliveryNote.documentType,
                    bytes,
                    externalUrl,
                    resourceSpec,
                    delegatedOrganizationIds
                );
            }
            for (const line of basicTradeRequest.lines) {
                await basicTradeService.addLine(line);
            }
            openNotification(
                'Success',
                TRADE_MESSAGE.SAVE_BASIC.OK,
                NotificationType.SUCCESS,
                NOTIFICATION_DURATION
            );
        } catch (e: any) {
            openNotification(
                'Error',
                TRADE_MESSAGE.SAVE_BASIC.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(TRADE_MESSAGE.SAVE_BASIC.LOADING));
        }
    };

    const updateBasicTrade = async (tradeId: number, basicTradeRequest: BasicTradeRequest) => {
        try {
            dispatch(addLoadingMessage(TRADE_MESSAGE.UPDATE_BASIC.LOADING));
            const detailedBasicTrade = detailedBasicTrades.find((t) => t.trade.tradeId === tradeId);
            if (!detailedBasicTrade) return Promise.reject('Trade not found');
            const oldTrade = detailedBasicTrade.trade;
            const basicTradeService = detailedBasicTrade.service;

            if (oldTrade.name !== basicTradeRequest.name)
                await basicTradeService.setName(basicTradeRequest.name);

            // update one single line because at this time we manage only one line per trade
            const oldLine = oldTrade.lines[0];
            const newLine = basicTradeRequest.lines[0];
            if (!oldLine || !newLine) return;

            // Note assigned material is ignored as it is not changeable in the UI
            if (
                oldLine.productCategory.id !== newLine.productCategoryId ||
                oldLine.unit !== newLine.unit ||
                oldLine.quantity !== newLine.quantity
            ) {
                const productCategory = productCategories.find(
                    (pc) => pc.id === newLine.productCategoryId
                );
                if (!productCategory) return Promise.reject('Product category not found');
                await basicTradeService.updateLine(
                    new Line(
                        oldLine.id,
                        oldLine.material,
                        productCategory,
                        newLine.quantity,
                        newLine.unit
                    )
                );
            }
            openNotification(
                'Success',
                TRADE_MESSAGE.UPDATE_ORDER.OK,
                NotificationType.SUCCESS,
                NOTIFICATION_DURATION
            );
        } catch (e: any) {
            openNotification(
                'Error',
                TRADE_MESSAGE.UPDATE_BASIC.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(TRADE_MESSAGE.UPDATE_BASIC.LOADING));
        }
    };

    const saveOrderTrade = async (
        orderTradeRequest: OrderTradeRequest,
        documentRequests: DocumentRequest[]
    ) => {
        try {
            dispatch(addLoadingMessage(TRADE_MESSAGE.SAVE_ORDER.LOADING));
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
                TRADE_MESSAGE.SAVE_ORDER.OK,
                NotificationType.SUCCESS,
                NOTIFICATION_DURATION
            );
        } catch (e: any) {
            openNotification(
                'Error',
                TRADE_MESSAGE.SAVE_ORDER.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(TRADE_MESSAGE.SAVE_ORDER.LOADING));
        }
    };

    // TODO: BUG! -> Right now metadata of the trade are not updated, is it possible to update metadata file in ICP or it must be replaced?
    const updateOrderTrade = async (tradeId: number, orderTradeRequest: OrderTradeRequest) => {
        try {
            dispatch(addLoadingMessage(TRADE_MESSAGE.UPDATE_ORDER.LOADING));
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
                TRADE_MESSAGE.UPDATE_ORDER.OK,
                NotificationType.SUCCESS,
                NOTIFICATION_DURATION
            );
        } catch (e: any) {
            openNotification(
                'Error',
                TRADE_MESSAGE.UPDATE_ORDER.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(TRADE_MESSAGE.UPDATE_ORDER.LOADING));
        }
    };

    const confirmNegotiation = async (orderId: number) => {
        try {
            const orderService = detailedOrderTrades.find(
                (t) => t.trade.tradeId === orderId
            )?.service;
            if (!orderService) return Promise.reject('Trade not found');
            dispatch(addLoadingMessage(TRADE_MESSAGE.CONFIRM_NEGOTIATION.LOADING));
            await orderService.confirmOrder();
            openNotification(
                'Success',
                TRADE_MESSAGE.CONFIRM_NEGOTIATION.OK,
                NotificationType.SUCCESS,
                NOTIFICATION_DURATION
            );
        } catch (e: any) {
            openNotification(
                'Error',
                TRADE_MESSAGE.CONFIRM_NEGOTIATION.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(TRADE_MESSAGE.CONFIRM_NEGOTIATION.LOADING));
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

    const loadData = async () => {
        await loadDetailedTrades();
        setDataLoaded(true);
    };

    const basicTrades = detailedBasicTrades.map((detailedTrade) => detailedTrade.trade);
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
    const getBasicTradeDocuments = (tradeId: number) =>
        detailedBasicTrades.find((t) => t.trade.tradeId === tradeId)?.documents || [];
    return (
        <EthTradeContext.Provider
            value={{
                dataLoaded,
                rawTrades,
                basicTrades,
                orderTrades,
                loadData,
                saveBasicTrade,
                updateBasicTrade,
                saveOrderTrade,
                updateOrderTrade,
                getBasicTradeDocuments,
                getActionRequired,
                getNegotiationStatus,
                getOrderStatus,
                getOrderRequiredDocuments,
                confirmNegotiation,
                validateOrderDocument
            }}>
            {props.children}
        </EthTradeContext.Provider>
    );
}
