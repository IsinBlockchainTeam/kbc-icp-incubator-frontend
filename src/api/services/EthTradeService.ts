import {
    BasicTrade,
    BasicTradeService,
    DocumentType,
    IConcreteTradeService,
    Line,
    NegotiationStatus,
    OrderLine,
    OrderLinePrice,
    OrderTrade,
    OrderTradeMetadata,
    OrderTradeService,
    TradeManagerService,
    TradeService,
    TradeType,
    URLStructure
} from "@kbc-lib/coffee-trading-management-lib";
import {CustomError} from "../../utils/error/CustomError";
import {HttpStatusCode} from "../../utils/error/HttpStatusCode";
import {ICPResourceSpec} from "@blockchain-lib/common";
import {getICPCanisterURL, getNameByDID} from "../../utils/utils";
import {DID_METHOD, ICP} from "../../constants";
import {store} from "../../redux/store";
import {
    BasicTradePresentable,
    DetailedTradePresentable,
    OrderTradePresentable,
    TradePreviewPresentable
} from "../types/TradePresentable";
import {DocumentPresentable} from "../types/DocumentPresentable";
import {BasicTradeRequest, OrderTradeRequest} from "../types/TradeRequest";
import {EthMaterialService} from "./EthMaterialService";
import {DocumentRequest} from "../types/DocumentRequest";
import {EthDocumentService} from "./EthDocumentService";

export class EthTradeService {
    private readonly _walletAddress: string;
    private readonly _ethMaterialService: EthMaterialService;
    private readonly _tradeManagerService: TradeManagerService;
    private readonly _ethDocumentService: EthDocumentService;
    private readonly _getTradeService: (address: string) => TradeService;
    private readonly _getBasicTradeService: (address: string) => BasicTradeService;
    private readonly _getOrderTradeService: (address: string) => OrderTradeService;
    private readonly _waitForTransactions: (transactionHash: string, confirmations: number) => Promise<void>;

    constructor(
        walletAddress: string,
        materialService: EthMaterialService,
        tradeManagerService: TradeManagerService,
        ethDocumentService: EthDocumentService,
        getTradeService: (address: string) => TradeService,
        getBasicTradeService: (address: string) => BasicTradeService,
        getOrderTradeService: (address: string) => OrderTradeService,
        waitForTransactions: (transactionHash: string, confirmations: number) => Promise<void>
    ) {
        this._walletAddress = walletAddress;
        this._ethMaterialService = materialService;
        this._tradeManagerService = tradeManagerService;
        this._ethDocumentService = ethDocumentService;
        this._getTradeService = getTradeService;
        this._getBasicTradeService = getBasicTradeService;
        this._getOrderTradeService = getOrderTradeService;
        this._waitForTransactions = waitForTransactions;
    }

    async getGeneralTrades(): Promise<TradePreviewPresentable[]> {
        const names: Map<string, string> = new Map<string, string>();

        const tradeIds: number[] = await this._tradeManagerService.getTradeIdsOfSupplier(this._walletAddress);
        tradeIds.push(...await this._tradeManagerService.getTradeIdsOfCommissioner(this._walletAddress));
        let tradePresentables: TradePreviewPresentable[] = [];

        if (!tradeIds.length) return tradePresentables;

        const tradeContractAddresses = await Promise.all(tradeIds.map(async id => this._tradeManagerService.getTrade(id)));
        for (const tradeAddress of tradeContractAddresses) {
            const tradeService = this._getTradeService(tradeAddress);
            let tradeInstanceService: IConcreteTradeService;
            const tradeType = await tradeService.getTradeType();

            if (tradeType === TradeType.BASIC) {
                tradeInstanceService = this._getBasicTradeService(tradeAddress);
            } else if (tradeType === TradeType.ORDER) {
                tradeInstanceService = this._getOrderTradeService(tradeAddress);
            } else {
                throw new CustomError(HttpStatusCode.INTERNAL_SERVER, "Received an invalid trade type");
            }

            const {tradeId, supplier, commissioner} = await tradeInstanceService.getTrade();
            const trade = await tradeInstanceService.getTrade();

            let actionRequired ;
            if (tradeType === TradeType.ORDER) {
                const documentsInfo = (await tradeService.getAllDocuments()).filter(doc => !doc.externalUrl.includes("metadata.json"));
                const order = trade as OrderTrade;
                const orderService = tradeInstanceService as OrderTradeService;
                const whoSigned = await orderService.getWhoSigned();
                if (!whoSigned.includes(this._walletAddress) && order.negotiationStatus === NegotiationStatus.PENDING)
                    actionRequired = "This negotiation needs your sign to proceed";

                // if (documentsInfo.length && documentsInfo.some((doc) => doc.status === DocumentStatus.NOT_EVALUATED)) {
                // //     TODO: per ora si ipotizza che solo il supplier debba caricare i documenti e quindi che sia il commissioner a validarli
                // //     nel caso di caricamenti da entrambi i lati, si potrà verificare in base al trade status
                // //     const status = await orderService.getOrderStatus();
                //     if (this._walletAddress === commissioner)
                //         actionRequired = "Some documents need to be evaluated";
                // }
            }


            let supplierName = names.get(supplier);
            if(! supplierName) {
                supplierName = await getNameByDID(DID_METHOD + ':' + supplier) || "Unknown";
                names.set(supplier, supplierName);
            }
            let commissionerName = names.get(commissioner);
            if(! commissionerName) {
                commissionerName = await getNameByDID(DID_METHOD + ':' + commissioner) || "Unknown";
                names.set(commissioner, commissionerName);
            }

            const newTradePresentable: TradePreviewPresentable = {
                id: tradeId,
                supplier: supplierName,
                commissioner: commissionerName,
                type: tradeType,
                actionRequired
            };

            if (tradeType === TradeType.ORDER) {
                newTradePresentable.negotiationStatus = await (tradeInstanceService as OrderTradeService).getNegotiationStatus();
            }
            tradePresentables.push(newTradePresentable)
        }

        return tradePresentables;
    }

    private async getDocumentMap(tradeId: number): Promise<Map<DocumentType, DocumentPresentable>> {
        const documents = await this._ethDocumentService.getDocumentsByTransactionId(tradeId);
        const documentMap = new Map<DocumentType, DocumentPresentable>();
        documents?.forEach(doc => documentMap.set(doc.documentType, doc));
        return documentMap;
    }

    async getTradeById(id: number): Promise<DetailedTradePresentable> {
        const address: string = await this._tradeManagerService.getTrade(id);
        const type: TradeType = await this._tradeManagerService.getTradeType(id);

        if (!address)
            throw new Error("Trade not found");

        switch (type) {
            case TradeType.BASIC:
                const basicTradeService = this._getBasicTradeService(address);
                const basicTrade = await basicTradeService.getTrade();
                basicTrade.lines = await basicTradeService.getLines();

                return new BasicTradePresentable(basicTrade, await this.getDocumentMap(id));

            case TradeType.ORDER:
                const orderTradeService = this._getOrderTradeService(address);
                const orderTrade = await orderTradeService.getCompleteTrade();
                orderTrade.lines = await orderTradeService.getLines();

                return new OrderTradePresentable(orderTrade, await orderTradeService.getOrderStatus(), await this.getDocumentMap(id));

            default:
                throw new CustomError(HttpStatusCode.BAD_REQUEST, "Wrong trade type");
        }
    }

    async saveBasicTrade(trade: BasicTradeRequest, documents?: DocumentRequest[]): Promise<void> {
        const organizationId = parseInt(store.getState().userInfo.organizationId);
        // TODO: remove this harcoded value
        const delegatedOrganizationIds: number[] = organizationId === 0 ? [1] : [0];

        const urlStructure: URLStructure = {
            prefix: getICPCanisterURL(ICP.CANISTER_ID_ORGANIZATION),
            organizationId,
        }
        const metadata = {
            date: new Date(),
        }

        const [, newTradeAddress, transactionHash] =
            await this._tradeManagerService.registerBasicTrade(trade.supplier, trade.customer, trade.commissioner, trade.name,
                metadata, urlStructure, delegatedOrganizationIds);

        await this._waitForTransactions(transactionHash, Number(process.env.REACT_APP_BC_CONFIRMATION_NUMBER || 0));

        const basicTradeService = this._getBasicTradeService(newTradeAddress);
        const deliveryNote = documents?.find(doc => doc.documentType === DocumentType.DELIVERY_NOTE);
        if (deliveryNote) {
            const externalUrl = (await basicTradeService.getTrade()).externalUrl;
            const resourceSpec: ICPResourceSpec = {
                name: deliveryNote.filename,
                type: deliveryNote.content.type,
            }
            const bytes = new Uint8Array(await new Response(deliveryNote.content).arrayBuffer());

            await basicTradeService.addDocument(deliveryNote.documentType, bytes, externalUrl, resourceSpec, delegatedOrganizationIds);
        }

        for (const line of trade.lines) {
            await basicTradeService.addLine(line)
        }
    }

    async putBasicTrade(id: number, trade: BasicTradeRequest): Promise<void> {
        const tradeService = this._getBasicTradeService(await this._tradeManagerService.getTrade(id));
        const oldTrade: BasicTrade = await tradeService.getTrade();

        oldTrade.name !== trade.name && await tradeService.setName(trade.name!);

        // update one single line because at this time we manage only one line per trade
        const oldLine = oldTrade.lines[0];
        const newLine = trade.lines[0];
        if (!oldLine || !newLine)
            return;

        // Note assigned material is ignored as it is not changeable in the UI
        if (oldLine.productCategory.id !== newLine.productCategoryId
            || oldLine.unit !== newLine.unit
            || oldLine.quantity !== newLine.quantity
        ) {
            const productCategory = await this._ethMaterialService.getProductCategory(newLine.productCategoryId)
            await tradeService.updateLine(new Line(oldLine.id, oldLine.material, productCategory, newLine.quantity, newLine.unit));
        }
    }

    async saveOrderTrade(trade: OrderTradeRequest, documents?: DocumentRequest[]): Promise<void> {
        const organizationId = parseInt(store.getState().userInfo.organizationId);
        // TODO: remove this harcoded value
        const delegatedOrganizationIds: number[] = organizationId === 0 ? [1] : [0];

        const urlStructure: URLStructure = {
            prefix: getICPCanisterURL(ICP.CANISTER_ID_ORGANIZATION),
            organizationId,
        }
        const metadata: OrderTradeMetadata = {
            incoterms: trade.incoterms,
            shipper: trade.shipper,
            shippingPort: trade.shippingPort,
            deliveryPort: trade.deliveryPort,
        }

        const [, newTradeAddress, transactionHash] = await this._tradeManagerService.registerOrderTrade(
            trade.supplier, trade.customer, trade.commissioner, trade.paymentDeadline, trade.documentDeliveryDeadline,
            trade.arbiter!, trade.shippingDeadline, trade.deliveryDeadline, trade.agreedAmount!, trade.tokenAddress!,
            metadata, urlStructure, delegatedOrganizationIds
        );

        await this._waitForTransactions(transactionHash, Number(process.env.REACT_APP_BC_CONFIRMATION_NUMBER || 0));

        const orderTradeService = this._getOrderTradeService(newTradeAddress);
        const paymentInvoice = documents?.find(doc => doc.documentType === DocumentType.PAYMENT_INVOICE);
        if (paymentInvoice) {
            const externalUrl = (await orderTradeService.getTrade()).externalUrl;
            const resourceSpec: ICPResourceSpec = {
                name: paymentInvoice.filename,
                type: paymentInvoice.content.type,
            }
            const bytes = new Uint8Array(await new Response(paymentInvoice.content).arrayBuffer());

            await orderTradeService.addDocument(paymentInvoice.documentType, bytes, externalUrl, resourceSpec, delegatedOrganizationIds);
        }

        for (const line of trade.lines) {
            await orderTradeService.addLine(line);
        }
    }

    async putOrderTrade(id: number, trade: OrderTradeRequest): Promise<void> {
        const tradeService = this._getOrderTradeService(await this._tradeManagerService.getTrade(id));
        const oldTrade = await tradeService.getTrade();

        oldTrade.paymentDeadline !== trade.paymentDeadline && await tradeService.updatePaymentDeadline(trade.paymentDeadline);
        oldTrade.documentDeliveryDeadline !== trade.documentDeliveryDeadline && await tradeService.updateDocumentDeliveryDeadline(trade.documentDeliveryDeadline);
        oldTrade.arbiter !== trade.arbiter && await tradeService.updateArbiter(trade.arbiter);
        oldTrade.shippingDeadline !== trade.shippingDeadline && await tradeService.updateShippingDeadline(trade.shippingDeadline);
        oldTrade.deliveryDeadline !== trade.deliveryDeadline && await tradeService.updateDeliveryDeadline(trade.deliveryDeadline);
        oldTrade.agreedAmount !== trade.agreedAmount && await tradeService.updateAgreedAmount(trade.agreedAmount);
        oldTrade.tokenAddress !== trade.tokenAddress && await tradeService.updateTokenAddress(trade.tokenAddress);

        // update one single line because at this time we manage only one line per trade
        const oldLine = oldTrade.lines[0] as OrderLine;
        const newLine = trade.lines[0];
        if (!oldLine || !newLine)
            return;

        // Note assigned material is ignored as it is not changeable in the UI
        if (oldLine.productCategory.id !== newLine.productCategoryId
            || oldLine.unit !== newLine.unit
            || oldLine.quantity !== newLine.quantity
            || oldLine.price.amount !== newLine.price.amount
            || oldLine.price.fiat !== newLine.price.fiat
        ) {
            const productCategory = await this._ethMaterialService.getProductCategory(newLine.productCategoryId)
            await tradeService.updateLine(new OrderLine(oldLine.id, oldLine.material, productCategory, newLine.quantity,
                newLine.unit, new OrderLinePrice(newLine.price.amount, newLine.price.fiat)));
        }
    }

    async addDocument(tradeId: number, tradeType: TradeType, document: DocumentRequest, externalUrl: string): Promise<void> {
        const tradeAddress = await this._tradeManagerService.getTrade(tradeId);
        const organizationId = parseInt(store.getState().userInfo.organizationId);
        // TODO: remove this harcoded value
        const delegatedOrganizationIds: number[] = organizationId === 0 ? [1] : [0];
        let tradeService: TradeService;
        if (tradeType === TradeType.BASIC) tradeService = this._getBasicTradeService(tradeAddress);
        else tradeService = this._getOrderTradeService(tradeAddress);

        const resourceSpec: ICPResourceSpec = {
            name: document.filename,
            type: document.content.type,
        }

        await tradeService.addDocument(document.documentType, new Uint8Array(await new Response(document.content).arrayBuffer()), externalUrl, resourceSpec, delegatedOrganizationIds);
    }

    async confirmOrderTrade(id: number): Promise<void> {
        const tradeService = this._getOrderTradeService(await this._tradeManagerService.getTrade(id));
        await tradeService.confirmOrder();
    }
}
