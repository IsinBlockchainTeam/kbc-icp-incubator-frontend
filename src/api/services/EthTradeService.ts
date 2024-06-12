import {
    BasicTrade,
    BasicTradeService,
    DocumentStatus,
    DocumentType,
    IConcreteTradeService,
    Line,
    NegotiationStatus,
    OrderLine,
    OrderLinePrice,
    OrderStatus,
    OrderTrade,
    OrderTradeMetadata,
    OrderTradeService,
    TradeManagerService,
    TradeService,
    TradeType,
    URLStructure
} from '@kbc-lib/coffee-trading-management-lib';
import { CustomError } from '@/utils/error/CustomError';
import { HttpStatusCode } from '@/utils/error/HttpStatusCode';
import { ICPResourceSpec } from '@blockchain-lib/common';
import { DID_METHOD, ICP } from '@/constants/index';
import {
    BasicTradePresentable,
    DetailedTradePresentable,
    OrderTradePresentable,
    TradePreviewPresentable
} from '@/api/types/TradePresentable';
import { DocumentInfoPresentable, DocumentPresentable } from '@/api/types/DocumentPresentable';
import { BasicTradeRequest, OrderTradeRequest } from '@/api/types/TradeRequest';
import { EthMaterialService } from '@/api/services/EthMaterialService';
import { DocumentRequest } from '@/api/types/DocumentRequest';
import { EthDocumentService } from '@/api/services/EthDocumentService';
import { getICPCanisterURL } from '@/utils/icp';

export class EthTradeService {
    private readonly _walletAddress: string;
    private readonly _organizationId: number;
    private readonly _ethMaterialService: EthMaterialService;
    private readonly _tradeManagerService: TradeManagerService;
    private readonly _ethDocumentService: EthDocumentService;
    private readonly _getTradeService: (address: string) => TradeService;
    private readonly _getBasicTradeService: (address: string) => BasicTradeService;
    private readonly _getOrderTradeService: (address: string) => OrderTradeService;
    private readonly _waitForTransactions: (
        transactionHash: string,
        confirmations: number
    ) => Promise<void>;
    private readonly _getNameByDID: (did: string) => Promise<string>;

    constructor(
        walletAddress: string,
        organizationId: number,
        materialService: EthMaterialService,
        tradeManagerService: TradeManagerService,
        ethDocumentService: EthDocumentService,
        getTradeService: (address: string) => TradeService,
        getBasicTradeService: (address: string) => BasicTradeService,
        getOrderTradeService: (address: string) => OrderTradeService,
        waitForTransactions: (transactionHash: string, confirmations: number) => Promise<void>,
        getNameByDID: (did: string) => Promise<string>
    ) {
        this._walletAddress = walletAddress;
        this._organizationId = organizationId;
        this._ethMaterialService = materialService;
        this._tradeManagerService = tradeManagerService;
        this._ethDocumentService = ethDocumentService;
        this._getTradeService = getTradeService;
        this._getBasicTradeService = getBasicTradeService;
        this._getOrderTradeService = getOrderTradeService;
        this._waitForTransactions = waitForTransactions;
        this._getNameByDID = getNameByDID;
    }
    private _getRequiredDocumentsTypes = (orderStatus: OrderStatus): DocumentType[] => {
        switch (orderStatus) {
            case OrderStatus.PRODUCTION:
                return [DocumentType.PAYMENT_INVOICE];
            case OrderStatus.PAYED:
                return [
                    DocumentType.ORIGIN_SWISS_DECODE,
                    DocumentType.WEIGHT_CERTIFICATE,
                    DocumentType.FUMIGATION_CERTIFICATE,
                    DocumentType.PREFERENTIAL_ENTRY_CERTIFICATE,
                    DocumentType.PHYTOSANITARY_CERTIFICATE,
                    DocumentType.INSURANCE_CERTIFICATE
                ];
            case OrderStatus.EXPORTED:
                return [DocumentType.BILL_OF_LADING];
            case OrderStatus.SHIPPED:
                return [DocumentType.COMPARISON_SWISS_DECODE];
            default:
                return [];
        }
    };

    private _getDesignatedPartyAddress = async (
        orderStatus: OrderStatus,
        orderTrade: OrderTrade
    ): Promise<string> => {
        switch (orderStatus) {
            case OrderStatus.PRODUCTION:
            case OrderStatus.PAYED:
            case OrderStatus.EXPORTED:
                return orderTrade.supplier;
            case OrderStatus.SHIPPED:
                return orderTrade.commissioner;
            default:
                return orderTrade.supplier;
        }
    };

    private async _getTradeIds(): Promise<number[]> {
        return [
            ...(await this._tradeManagerService.getTradeIdsOfSupplier(this._walletAddress)),
            ...(await this._tradeManagerService.getTradeIdsOfCommissioner(this._walletAddress))
        ];
    }

    private _getConcreteTradeService(
        tradeType: TradeType,
        tradeAddress: string
    ): IConcreteTradeService {
        if (tradeType === TradeType.BASIC) return this._getBasicTradeService(tradeAddress);
        return this._getOrderTradeService(tradeAddress);
    }

    private async _getDocumentsInfoMapByTypes(
        tradeId: number,
        types: DocumentType[]
    ): Promise<Map<DocumentType, DocumentInfoPresentable | undefined>> {
        const documentMap = new Map<DocumentType, DocumentInfoPresentable | undefined>();
        for (const type of types) {
            const documents =
                await this._ethDocumentService.getDocumentsInfoByTransactionIdAndDocumentType(
                    tradeId,
                    type
                );
            documentMap.set(type, documents[documents.length - 1]);
        }
        return documentMap;
    }

    private _getActionMessage = async (
        orderTradeService: OrderTradeService
    ): Promise<string | undefined> => {
        const orderTrade = await orderTradeService.getTrade();
        const tradeId = orderTrade.tradeId;
        const orderStatus = await orderTradeService.getOrderStatus();
        const signatures = await orderTradeService.getWhoSigned();

        if (
            !signatures.includes(this._walletAddress) &&
            orderTrade.negotiationStatus === NegotiationStatus.PENDING
        )
            return 'This negotiation needs your sign to proceed';

        const requiredDocumentsTypes = this._getRequiredDocumentsTypes(orderStatus);
        if (requiredDocumentsTypes.length === 0) return undefined;

        const designatedPartyAddress = await this._getDesignatedPartyAddress(
            orderStatus,
            orderTrade
        );
        const documentsInfoMapByType = await this._getDocumentsInfoMapByTypes(
            tradeId,
            requiredDocumentsTypes
        );
        if (this._walletAddress === designatedPartyAddress) {
            const isUploadRequired =
                documentsInfoMapByType.size === 0 ||
                requiredDocumentsTypes.some((docType) => {
                    const documentInfo = documentsInfoMapByType.get(docType);
                    return !documentInfo || documentInfo.status === DocumentStatus.NOT_APPROVED;
                });

            if (isUploadRequired) return `You have to upload some documents`;
        } else {
            const isValidationRequired = requiredDocumentsTypes.some(
                (docType) =>
                    documentsInfoMapByType.get(docType)?.status === DocumentStatus.NOT_EVALUATED
            );

            if (isValidationRequired) return `Some documents need to be validated`;
        }
        return undefined;
    };

    async getGeneralTrades(): Promise<TradePreviewPresentable[]> {
        const names: Map<string, string> = new Map<string, string>();

        const tradeIds = await this._getTradeIds();
        let tradePresentables: TradePreviewPresentable[] = [];

        if (!tradeIds.length) return tradePresentables;

        const tradeContractAddresses = await Promise.all(
            tradeIds.map(async (id) => this._tradeManagerService.getTrade(id))
        );
        for (const tradeAddress of tradeContractAddresses) {
            const tradeService = this._getTradeService(tradeAddress);
            const tradeType = await tradeService.getTradeType();
            let tradeInstanceService = this._getConcreteTradeService(tradeType, tradeAddress);

            const { tradeId, supplier, commissioner } = await tradeInstanceService.getTrade();

            if (!names.has(supplier))
                names.set(
                    supplier,
                    (await this._getNameByDID(DID_METHOD + ':' + supplier)) || 'Unknown'
                );
            if (!names.has(commissioner))
                names.set(
                    commissioner,
                    (await this._getNameByDID(DID_METHOD + ':' + commissioner)) || 'Unknown'
                );

            const newTradePresentable: TradePreviewPresentable = {
                id: tradeId,
                supplier: names.get(supplier)!,
                commissioner: names.get(commissioner)!,
                type: tradeType,
                actionRequired:
                    tradeType === TradeType.ORDER
                        ? await this._getActionMessage(tradeInstanceService as OrderTradeService)
                        : undefined,
                negotiationStatus:
                    tradeType === TradeType.ORDER
                        ? await (tradeInstanceService as OrderTradeService).getNegotiationStatus()
                        : undefined,
                orderStatus:
                    tradeType === TradeType.ORDER
                        ? await (tradeInstanceService as OrderTradeService).getOrderStatus()
                        : undefined
            };

            tradePresentables.push(newTradePresentable);
        }

        return tradePresentables;
    }

    private async _getCompleteDocumentsMap(
        tradeId: number
    ): Promise<Map<DocumentType, DocumentPresentable>> {
        const documents = await this._ethDocumentService.getDocumentsByTransactionId(tradeId);
        const documentMap = new Map<DocumentType, DocumentPresentable>();
        documents?.forEach((doc) => documentMap.set(doc.documentType, doc));
        return documentMap;
    }

    async getTradeById(id: number): Promise<DetailedTradePresentable> {
        const address: string = await this._tradeManagerService.getTrade(id);
        const type: TradeType = await this._tradeManagerService.getTradeType(id);

        if (!address) throw new Error('Trade not found');

        switch (type) {
            case TradeType.BASIC:
                const basicTradeService = this._getBasicTradeService(address);
                const basicTrade = await basicTradeService.getTrade();
                basicTrade.lines = await basicTradeService.getLines();

                return new BasicTradePresentable(
                    basicTrade,
                    await this._getCompleteDocumentsMap(id)
                );

            case TradeType.ORDER:
                const orderTradeService = this._getOrderTradeService(address);
                const orderTrade = await orderTradeService.getCompleteTrade();
                orderTrade.lines = await orderTradeService.getLines();

                return new OrderTradePresentable(
                    orderTrade,
                    await orderTradeService.getOrderStatus(),
                    await this._getCompleteDocumentsMap(id)
                );

            default:
                throw new CustomError(HttpStatusCode.BAD_REQUEST, 'Wrong trade type');
        }
    }

    async saveBasicTrade(trade: BasicTradeRequest, documents?: DocumentRequest[]): Promise<void> {
        // TODO: remove this harcoded value
        const delegatedOrganizationIds: number[] = this._organizationId === 0 ? [1] : [0];

        const urlStructure: URLStructure = {
            prefix: getICPCanisterURL(ICP.CANISTER_ID_ORGANIZATION),
            organizationId: this._organizationId
        };
        const metadata = {
            date: new Date()
        };

        const [, newTradeAddress, transactionHash] =
            await this._tradeManagerService.registerBasicTrade(
                trade.supplier,
                trade.customer,
                trade.commissioner,
                trade.name,
                metadata,
                urlStructure,
                delegatedOrganizationIds
            );

        await this._waitForTransactions(
            transactionHash,
            Number(process.env.REACT_APP_BC_CONFIRMATION_NUMBER || 0)
        );

        const basicTradeService = this._getBasicTradeService(newTradeAddress);
        const deliveryNote = documents?.find(
            (doc) => doc.documentType === DocumentType.DELIVERY_NOTE
        );
        if (deliveryNote) {
            const externalUrl = (await basicTradeService.getTrade()).externalUrl;
            const resourceSpec: ICPResourceSpec = {
                name: deliveryNote.filename,
                type: deliveryNote.content.type
            };
            const bytes = new Uint8Array(await new Response(deliveryNote.content).arrayBuffer());

            await basicTradeService.addDocument(
                deliveryNote.documentType,
                bytes,
                externalUrl,
                resourceSpec,
                delegatedOrganizationIds
            );
        }

        for (const line of trade.lines) {
            await basicTradeService.addLine(line);
        }
    }

    async putBasicTrade(id: number, trade: BasicTradeRequest): Promise<void> {
        const tradeService = this._getBasicTradeService(
            await this._tradeManagerService.getTrade(id)
        );
        const oldTrade: BasicTrade = await tradeService.getTrade();

        oldTrade.name !== trade.name && (await tradeService.setName(trade.name!));

        // update one single line because at this time we manage only one line per trade
        const oldLine = oldTrade.lines[0];
        const newLine = trade.lines[0];
        if (!oldLine || !newLine) return;

        // Note assigned material is ignored as it is not changeable in the UI
        if (
            oldLine.productCategory.id !== newLine.productCategoryId ||
            oldLine.unit !== newLine.unit ||
            oldLine.quantity !== newLine.quantity
        ) {
            const productCategory = await this._ethMaterialService.getProductCategory(
                newLine.productCategoryId
            );
            await tradeService.updateLine(
                new Line(
                    oldLine.id,
                    oldLine.material,
                    productCategory,
                    newLine.quantity,
                    newLine.unit
                )
            );
        }
    }

    async saveOrderTrade(trade: OrderTradeRequest, documents?: DocumentRequest[]): Promise<void> {
        // TODO: remove this harcoded value
        const delegatedOrganizationIds: number[] = this._organizationId === 0 ? [1] : [0];

        const urlStructure: URLStructure = {
            prefix: getICPCanisterURL(ICP.CANISTER_ID_ORGANIZATION),
            organizationId: this._organizationId
        };
        const metadata: OrderTradeMetadata = {
            incoterms: trade.incoterms,
            shipper: trade.shipper,
            shippingPort: trade.shippingPort,
            deliveryPort: trade.deliveryPort
        };

        const [, newTradeAddress, transactionHash] =
            await this._tradeManagerService.registerOrderTrade(
                trade.supplier,
                trade.customer,
                trade.commissioner,
                trade.paymentDeadline,
                trade.documentDeliveryDeadline,
                trade.arbiter!,
                trade.shippingDeadline,
                trade.deliveryDeadline,
                trade.agreedAmount!,
                trade.tokenAddress!,
                metadata,
                urlStructure,
                delegatedOrganizationIds
            );

        await this._waitForTransactions(
            transactionHash,
            Number(process.env.REACT_APP_BC_CONFIRMATION_NUMBER || 0)
        );

        const orderTradeService = this._getOrderTradeService(newTradeAddress);
        const paymentInvoice = documents?.find(
            (doc) => doc.documentType === DocumentType.PAYMENT_INVOICE
        );
        if (paymentInvoice) {
            const externalUrl = (await orderTradeService.getTrade()).externalUrl;
            const resourceSpec: ICPResourceSpec = {
                name: paymentInvoice.filename,
                type: paymentInvoice.content.type
            };
            const bytes = new Uint8Array(await new Response(paymentInvoice.content).arrayBuffer());

            await orderTradeService.addDocument(
                paymentInvoice.documentType,
                bytes,
                externalUrl,
                resourceSpec,
                delegatedOrganizationIds
            );
        }

        for (const line of trade.lines) {
            await orderTradeService.addLine(line);
        }
    }

    // TODO: BUG! -> Right now metadata of the trade are not updated, is it possible to update metadata file in ICP or it must be replaced?
    async putOrderTrade(id: number, trade: OrderTradeRequest): Promise<void> {
        const tradeService = this._getOrderTradeService(
            await this._tradeManagerService.getTrade(id)
        );
        const oldTrade = await tradeService.getTrade();

        oldTrade.paymentDeadline !== trade.paymentDeadline &&
            (await tradeService.updatePaymentDeadline(trade.paymentDeadline));
        oldTrade.documentDeliveryDeadline !== trade.documentDeliveryDeadline &&
            (await tradeService.updateDocumentDeliveryDeadline(trade.documentDeliveryDeadline));
        oldTrade.arbiter !== trade.arbiter && (await tradeService.updateArbiter(trade.arbiter));
        oldTrade.shippingDeadline !== trade.shippingDeadline &&
            (await tradeService.updateShippingDeadline(trade.shippingDeadline));
        oldTrade.deliveryDeadline !== trade.deliveryDeadline &&
            (await tradeService.updateDeliveryDeadline(trade.deliveryDeadline));
        oldTrade.agreedAmount !== trade.agreedAmount &&
            (await tradeService.updateAgreedAmount(trade.agreedAmount));
        oldTrade.tokenAddress !== trade.tokenAddress &&
            (await tradeService.updateTokenAddress(trade.tokenAddress));

        // update one single line because at this time we manage only one line per trade
        const oldLine = oldTrade.lines[0] as OrderLine;
        const newLine = trade.lines[0];
        if (!oldLine || !newLine) return;

        // Note assigned material is ignored as it is not changeable in the UI
        if (
            oldLine.productCategory.id !== newLine.productCategoryId ||
            oldLine.unit !== newLine.unit ||
            oldLine.quantity !== newLine.quantity ||
            oldLine.price.amount !== newLine.price.amount ||
            oldLine.price.fiat !== newLine.price.fiat
        ) {
            const productCategory = await this._ethMaterialService.getProductCategory(
                newLine.productCategoryId
            );
            await tradeService.updateLine(
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
    }

    async addDocument(
        tradeId: number,
        tradeType: TradeType,
        document: DocumentRequest,
        externalUrl: string
    ): Promise<void> {
        const tradeAddress = await this._tradeManagerService.getTrade(tradeId);
        // TODO: remove this harcoded value
        const delegatedOrganizationIds: number[] = this._organizationId === 0 ? [1] : [0];
        let tradeService: TradeService;
        if (tradeType === TradeType.BASIC) tradeService = this._getBasicTradeService(tradeAddress);
        else tradeService = this._getOrderTradeService(tradeAddress);

        const resourceSpec: ICPResourceSpec = {
            name: document.filename,
            type: document.content.type
        };
        console.log('addDocument - document: ', document);

        await tradeService.addDocument(
            document.documentType,
            new Uint8Array(await new Response(document.content).arrayBuffer()),
            externalUrl,
            resourceSpec,
            delegatedOrganizationIds
        );
    }

    async validateDocument(
        tradeId: number,
        documentId: number,
        validationStatus: DocumentStatus
    ): Promise<void> {
        const tradeAddress = await this._tradeManagerService.getTrade(tradeId);
        const tradeService = this._getTradeService(tradeAddress);
        await tradeService.validateDocument(documentId, validationStatus);
    }

    async confirmOrderTrade(id: number): Promise<void> {
        const tradeService = this._getOrderTradeService(
            await this._tradeManagerService.getTrade(id)
        );
        await tradeService.confirmOrder();
    }
}
