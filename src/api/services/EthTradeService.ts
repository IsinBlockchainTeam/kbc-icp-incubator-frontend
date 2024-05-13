import {Service} from "./Service";
import {BlockchainLibraryUtils} from "../BlockchainLibraryUtils";
import {
    BasicTrade,
    Line,
    LineRequest,
    IConcreteTradeService,
    OrderLinePrice,
    OrderLineRequest,
    TradeType,
    OrderTradeMetadata,
    URLStructure,
    OrderTradeService,
    OrderLine,
    Material,
    ProductCategory,
    Trade,
    OrderTrade, DocumentType
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
import {OrderTradeRequest} from "../types/TradeRequest";

export type BasicTradeRequest = Omit<typeof BasicTrade, "id">;

export class EthTradeService extends Service {
    private readonly _tradeManagerService;

    constructor() {
        super();
        this._tradeManagerService = BlockchainLibraryUtils.getTradeManagerService();
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

            const newTradePresentable = new TradePreviewPresentable(
                tradeId,
                supplier,
                commissioner,
                tradeType
            );

            if (tradeType === TradeType.ORDER) {
                newTradePresentable.negotiationStatus = await (BlockchainLibraryUtils.getOrderTradeService(tradeAddress)).getNegotiationStatus();
            }
            tradePresentables.push(newTradePresentable)
        }

        return tradePresentables;
    }

    async getTradeById(id: number): Promise<DetailedTradePresentable> {
        const address: string = await this._tradeManagerService.getTrade(id);
        const type: TradeType = await this._tradeManagerService.getTradeType(id);

        if (!address)
            throw new Error("Trade not found");

        let trade: DetailedTradePresentable;
        switch (type) {
            case TradeType.BASIC:
                const basicTradeService = BlockchainLibraryUtils.getBasicTradeService(address);
                const basicTrade = await basicTradeService.getTrade();
                basicTrade.lines = await basicTradeService.getLines();

                // TODO: check if there are documents

                return new BasicTradePresentable(basicTrade);
            case TradeType.ORDER:
                const orderTradeService = BlockchainLibraryUtils.getOrderTradeService(address);
                const orderTrade = await orderTradeService.getCompleteTrade();
                orderTrade.lines = await orderTradeService.getLines();

                // TODO: check if there are documents

                // trade
                //     .setId(orderTrade.tradeId)
                //     .setCommissioner(orderTrade.commissioner)
                //     .setCustomer(orderTrade.customer)
                //     .setIncoterms(orderTrade.metadata?.incoterms)
                //     .setPaymentDeadline(new Date(orderTrade.paymentDeadline))
                //     .setDocumentDeliveryDeadline(new Date(orderTrade.documentDeliveryDeadline))
                //     .setShipper(orderTrade.metadata?.shipper)
                //     .setArbiter(orderTrade.arbiter)
                //     .setShippingPort(orderTrade.metadata?.shippingPort)
                //     .setShippingDeadline(new Date(orderTrade.shippingDeadline))
                //     .setDeliveryPort(orderTrade.metadata?.deliveryPort)
                //     .setDeliveryDeadline(new Date(orderTrade.deliveryDeadline))
                //     .setEscrow(orderTrade.escrow)
                //     .setSupplier(orderTrade.supplier)
                //     .setLines(orderLines.map(ol => new TradeLinePresentable()
                //         .setId(ol.id)
                //         .setProductCategory(ol.productCategory ? new ProductCategoryPresentable()
                //             .setId(ol.productCategory.id)
                //             .setQuality(ol.productCategory.quality)
                //             .setName(ol.productCategory.name) : undefined)
                //         .setMaterial(ol.material ? new MaterialPresentable()
                //             .setId(ol.material.id)
                //             .setName(ol.productCategory.name) : undefined)
                //         .setProductCategory(ol.productCategory ? new ProductCategoryPresentable()
                //             .setId(ol.productCategory.id)
                //             .setQuality(ol.productCategory.quality)
                //             .setName(ol.productCategory.name) : undefined)
                //         .setQuantity(ol.quantity)
                //         .setUnit(ol.unit)
                //         .setPrice(new TradeLinePrice().setAmount(ol.price.amount).setFiat(ol.price.fiat))))
                //     .setType(TradeType.ORDER)
                //     .setStatus(await orderTradeService.getTradeStatus())
                //     .setNegotiationStatus(await orderTradeService.getNegotiationStatus())
                //     .setAgreedAmount(orderTrade.agreedAmount)
                //     .setTokenAddress(orderTrade.tokenAddress)

                console.log("order trade retrieved: ", orderTrade);
                return new OrderTradePresentable(orderTrade, await orderTradeService.getTradeStatus());
            default:
                throw new CustomError(HttpStatusCode.BAD_REQUEST, "Wrong trade type");
        }
    }

    async saveBasicTrade(trade: BasicTradeRequest): Promise<void> {
        const organizationId = parseInt(store.getState().userInfo.organizationId);
        // TODO: remove this harcoded value
        const delegatedOrganizationIds: number[] = organizationId === 0 ? [1] : [0];
        console.log("delegatedOrganizationIds", delegatedOrganizationIds);

        const urlStructure: URLStructure = {
            prefix: getICPCanisterURL(ICP.CANISTER_ID_ORGANIZATION),
            organizationId,
        }
        const metadata = {
            date: new Date(),
        }

        // TODO: refactor this

        // const [, newTradeAddress, transactionHash] =
        //     await this._tradeManagerService.registerBasicTrade(trade.supplier, trade.customer!, trade.commissioner!, trade.name!,
        //         metadata, urlStructure, delegatedOrganizationIds);
        //
        // await BlockchainLibraryUtils.waitForTransactions(transactionHash, Number(process.env.REACT_APP_BC_CONFIRMATION_NUMBER || 0));
        //
        // const basicTradeService = BlockchainLibraryUtils.getBasicTradeService(newTradeAddress);
        // if (trade.deliveryNote) {
        //     const externalUrl = (await basicTradeService.getTrade()).externalUrl;
        //     const resourceSpec: ICPResourceSpec = {
        //         name: trade.deliveryNote.filename,
        //         type: trade.deliveryNote.contentType,
        //     }
        //     const bytes = new Uint8Array(await new Response(trade.deliveryNote.content).arrayBuffer());
        //
        //     await basicTradeService.addDocument(trade.deliveryNote.documentType, bytes, externalUrl, resourceSpec, delegatedOrganizationIds);
        // }
        //
        // if (trade.lines) {
        //     await Promise.all(trade.lines.map(async line => {
        //         await basicTradeService.addLine(new LineRequest(line.productCategory!.id, line.quantity!, line.unit!));
        //     }));
        // }
    }

    async confirmOrderTrade(id: number): Promise<void> {
        const tradeService = BlockchainLibraryUtils.getOrderTradeService(await this._tradeManagerService.getTrade(id));
        await tradeService.confirmOrder();
    }

    async putBasicTrade(id: number, trade: TradePreviewPresentable): Promise<void> {
        // TODO: refactor this
        // const tradeService = BlockchainLibraryUtils.getBasicTradeService(await this._tradeManagerService.getTrade(id));
        // const oldTrade: BasicTrade = await tradeService.getTrade();
        // oldTrade.name !== trade.name && await tradeService.setName(trade.name!);
    }

    async putOrderTrade(id: number, trade: TradePreviewPresentable): Promise<void> {
        // TODO: refactor this
        // const tradeService = BlockchainLibraryUtils.getOrderTradeService(await this._tradeManagerService.getTrade(id));
        // const oldTrade = await tradeService.getTrade();
        //
        // oldTrade.paymentDeadline !== trade.paymentDeadline?.getTime() && await tradeService.updatePaymentDeadline(trade.paymentDeadline!.getTime());
        // oldTrade.documentDeliveryDeadline !== trade.documentDeliveryDeadline?.getTime() && await tradeService.updateDocumentDeliveryDeadline(trade.documentDeliveryDeadline!.getTime());
        // oldTrade.arbiter !== trade.arbiter && await tradeService.updateArbiter(trade.arbiter!);
        // oldTrade.shippingDeadline !== trade.shippingDeadline?.getTime() && await tradeService.updateShippingDeadline(trade.shippingDeadline!.getTime());
        // oldTrade.deliveryDeadline !== trade.deliveryDeadline?.getTime() && await tradeService.updateDeliveryDeadline(trade.deliveryDeadline!.getTime());
        // oldTrade.agreedAmount !== trade.agreedAmount && await tradeService.updateAgreedAmount(trade.agreedAmount!);
        // oldTrade.tokenAddress !== trade.tokenAddress && await tradeService.updateTokenAddress(trade.tokenAddress!);
        // // update one single line because at this time we manage only one line per trade
        // console.log("trade: ", trade)
        // console.log("oldTrade: ", oldTrade);
        //
        // // TODO: fix this
        // const productCategory = new ProductCategory(trade.lines[0].productCategory?.id!, trade.lines[0].productCategory?.name!, trade.lines[0].productCategory?.quality!, "description");
        // const material = new Material(trade.lines[0].material?.id!, productCategory);
        //
        // // await tradeService.updateLine(new OrderLine(trade.lines[0].id, material, productCategory, trade.lines[0].quantity!, trade.lines[0].unit!, new OrderLinePrice(trade.lines[0].price!.amount, trade.lines[0].price!.fiat)));
        // // TODO: is it better to check if every field (also price) is changed, so that no useless calls to chain are made
        // // if (oldTrade.lines[0].productCategory.id !== trade.lines[0].productCategory?.id || oldTrade.lines[0].quantity !== trade.lines[0].quantity || oldTrade.lines[0].unit !== trade.lines[0].unit)
        // // TODO: update line if something has changed
        // // await tradeService.updateLine(new OrderLineRequest(trade.lines[0].productCategory!.id, trade.lines[0].quantity!, trade.lines[0].unit!, new OrderLinePrice(trade.lines[0].price!.amount, trade.lines[0].price!.fiat), oldTrade.lines[0].id));
    }

    async saveOrderTrade(trade: OrderTradeRequest, documents?: DocumentPresentable[]): Promise<void> {
        const organizationId = parseInt(store.getState().userInfo.organizationId);
        // TODO: remove this harcoded value
        const delegatedOrganizationIds: number[] = organizationId === 0 ? [1] : [0];
        console.log("delegatedOrganizationIds", delegatedOrganizationIds);

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
                type: paymentInvoice.contentType,
            }
            const bytes = new Uint8Array(await new Response(paymentInvoice.content).arrayBuffer());

            await orderTradeService.addDocument(paymentInvoice.documentType, bytes, externalUrl, resourceSpec, delegatedOrganizationIds);
        }

        if (trade.lines) {
            // await Promise.all(trade.lines.map(async line => {
            //     await orderTradeService.addLine(new OrderLineRequest(line.productCategory!.id!, line.quantity!, line.unit!, new OrderLinePrice(line.price!.amount, line.price!.fiat)));
            // }));

            for (const line of trade.lines) {
                await orderTradeService.addLine(line);
            }
        }
    }
}
