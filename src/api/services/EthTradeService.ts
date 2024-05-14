import {Service} from "./Service";
import {BlockchainLibraryUtils} from "../BlockchainLibraryUtils";
import {
    BasicTrade,
    Line,
    IConcreteTradeService,
    OrderLinePrice,
    TradeType,
    OrderTradeMetadata,
    URLStructure,
    OrderTradeService,
    OrderLine,
    DocumentType
} from "@kbc-lib/coffee-trading-management-lib";
import {CustomError} from "../../utils/error/CustomError";
import {HttpStatusCode} from "../../utils/error/HttpStatusCode";
import {ICPResourceSpec} from "@blockchain-lib/common";
import {getICPCanisterURL} from "../../utils/utils";
import {ICP} from "../../constants";
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

export class EthTradeService extends Service {
    private readonly _tradeManagerService;

    private readonly _ethDocumentService;

    constructor() {
        super();
        this._tradeManagerService = BlockchainLibraryUtils.getTradeManagerService();
        this._ethDocumentService = new EthDocumentService();
    }

    async getGeneralTrades(): Promise<TradePreviewPresentable[]> {
        const tradeIds: number[] = await this._tradeManagerService.getTradeIdsOfSupplier(this._walletAddress);
        tradeIds.push(...await this._tradeManagerService.getTradeIdsOfCommissioner(this._walletAddress));
        let tradePresentables: TradePreviewPresentable[] = [];

        if (!tradeIds.length) return tradePresentables;

        const tradeContractAddresses = await Promise.all(tradeIds.map(async id => this._tradeManagerService.getTrade(id)));
        for (const tradeAddress of tradeContractAddresses) {
            const tradeService = BlockchainLibraryUtils.getTradeService(tradeAddress);
            let tradeInstanceService: IConcreteTradeService;
            const tradeType = await tradeService.getTradeType();

            if (tradeType === TradeType.BASIC) {
                tradeInstanceService = BlockchainLibraryUtils.getBasicTradeService(tradeAddress);
            } else if (tradeType === TradeType.ORDER) {
                tradeInstanceService = BlockchainLibraryUtils.getOrderTradeService(tradeAddress);
            } else {
                throw new CustomError(HttpStatusCode.INTERNAL_SERVER, "Received an invalid trade type");
            }

            const {tradeId, supplier, commissioner} = await tradeInstanceService.getTrade();

            const newTradePresentable: TradePreviewPresentable = {
                id: tradeId,
                supplier,
                commissioner,
                type: tradeType
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
                const basicTradeService = BlockchainLibraryUtils.getBasicTradeService(address);
                const basicTrade = await basicTradeService.getTrade();
                basicTrade.lines = await basicTradeService.getLines();

                return new BasicTradePresentable(basicTrade, await this.getDocumentMap(id));

            case TradeType.ORDER:
                const orderTradeService = BlockchainLibraryUtils.getOrderTradeService(address);
                const orderTrade = await orderTradeService.getCompleteTrade();
                orderTrade.lines = await orderTradeService.getLines();

                return new OrderTradePresentable(orderTrade, await orderTradeService.getTradeStatus(), await this.getDocumentMap(id));

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

        await BlockchainLibraryUtils.waitForTransactions(transactionHash, Number(process.env.REACT_APP_BC_CONFIRMATION_NUMBER || 0));

        const basicTradeService = BlockchainLibraryUtils.getBasicTradeService(newTradeAddress);
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
        const tradeService = BlockchainLibraryUtils.getBasicTradeService(await this._tradeManagerService.getTrade(id));
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
            const productCategory = await new EthMaterialService().getProductCategory(newLine.productCategoryId)
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

        await BlockchainLibraryUtils.waitForTransactions(transactionHash, Number(process.env.REACT_APP_BC_CONFIRMATION_NUMBER || 0));

        const orderTradeService = BlockchainLibraryUtils.getOrderTradeService(newTradeAddress);
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
        const tradeService = BlockchainLibraryUtils.getOrderTradeService(await this._tradeManagerService.getTrade(id));
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
            const productCategory = await new EthMaterialService().getProductCategory(newLine.productCategoryId)
            await tradeService.updateLine(new OrderLine(oldLine.id, oldLine.material, productCategory, newLine.quantity,
                newLine.unit, new OrderLinePrice(newLine.price.amount, newLine.price.fiat)));
        }
    }

    async confirmOrderTrade(id: number): Promise<void> {
        const tradeService = BlockchainLibraryUtils.getOrderTradeService(await this._tradeManagerService.getTrade(id));
        await tradeService.confirmOrder();
    }
}
