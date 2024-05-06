import {Service} from "./Service";
import {SolidSpec} from "../types/storage";
import {BlockchainLibraryUtils} from "../BlockchainLibraryUtils";
import {TradePresentable} from "../types/TradePresentable";
import {
    BasicTrade,
    Line,
    LineRequest,
    IConcreteTradeService,
    OrderLinePrice,
    OrderLineRequest,
    TradeType,
    OrderTrade, OrderTradeMetadata
} from "@kbc-lib/coffee-trading-management-lib";
import {CustomError} from "../../utils/error/CustomError";
import {HttpStatusCode} from "../../utils/error/HttpStatusCode";
import {TradeLinePresentable, TradeLinePrice} from "../types/TradeLinePresentable";
import {MaterialPresentable} from "../types/MaterialPresentable";

export class EthTradeService extends Service {
    private readonly _tradeManagerService;
    private readonly _storageSpec?: SolidSpec;

    constructor(storageSpec?: SolidSpec) {
        super();
        this._storageSpec = storageSpec;
        this._tradeManagerService = BlockchainLibraryUtils.getTradeManagerService(this._storageSpec);
    }

    async getGeneralTrades(): Promise<TradePresentable[]> {
        const tradeIds: number[] = await this._tradeManagerService.getTradeIdsOfSupplier(this._walletAddress);
        tradeIds.push(...await this._tradeManagerService.getTradeIdsOfCommissioner(this._walletAddress));
        let tradePresentables: TradePresentable[] = [];

        if (!tradeIds.length) return tradePresentables;

        const tradeContractAddresses = await Promise.all(tradeIds.map(async id => this._tradeManagerService.getTrade(id)));
        for (const tradeAddress of tradeContractAddresses) {
            // const tradeService = BlockchainLibraryUtils.getTradeService(tradeAddress, this._storageSpec);
            const tradeService = BlockchainLibraryUtils.getTradeService(tradeAddress);
            let tradeInstanceService: IConcreteTradeService;
            const tradeType = await tradeService.getTradeType();
            if(tradeType === TradeType.ORDER) {
                // tradeInstanceService = BlockchainLibraryUtils.getOrderTradeService(tradeAddress, this._storageSpec);
                tradeInstanceService = BlockchainLibraryUtils.getOrderTradeService(tradeAddress);
            } else if(tradeType === TradeType.BASIC) {
                // tradeInstanceService = BlockchainLibraryUtils.getBasicTradeService(tradeAddress, this._storageSpec);
                tradeInstanceService = BlockchainLibraryUtils.getBasicTradeService(tradeAddress);
            } else {
                throw new CustomError(HttpStatusCode.INTERNAL_SERVER, "Received an invalid trade type");
            }

            const lines: Line[] = await tradeInstanceService.getLines();
            const {tradeId, supplier, customer, commissioner} = await tradeInstanceService.getTrade();

            tradePresentables.push(new TradePresentable()
                .setId(tradeId)
                .setSupplier(supplier)
                .setCustomer(customer)
                .setCommissioner(commissioner)
                .setLines(lines.map(tl => new TradeLinePresentable()
                    .setId(tl.id)
                    .setMaterial(tl.material ? new MaterialPresentable()
                        .setId(tl.material.id)
                        .setName(tl.productCategory.name): undefined)))
                .setType(tradeType));
        }

        return tradePresentables;
    }

    async getTradeByIdAndType(id: number, type: number): Promise<TradePresentable | undefined> {
        const trade = new TradePresentable();
        const address: string = await this._tradeManagerService.getTrade(id);

        if(!address) return;

        let resp;
        switch (type) {
            case TradeType.BASIC:
                // const basicTradeService = BlockchainLibraryUtils.getBasicTradeService(address, this._storageSpec);
                const basicTradeService = BlockchainLibraryUtils.getBasicTradeService(address);
                resp = await basicTradeService.getTrade();

                if (resp) {
                    const lines: Line[] = await basicTradeService.getLines();
                    trade
                        .setId(resp.tradeId)
                        .setName(resp.name)
                        .setSupplier(resp.supplier)
                        .setCustomer(resp.customer)
                        .setLines(lines ? lines.map(tl => new TradeLinePresentable()
                            .setId(tl.id)
                            .setMaterial(tl.material ? new MaterialPresentable()
                                .setId(tl.material.id)
                                .setName(tl.productCategory.name): undefined)): [])
                        .setType(TradeType.BASIC)
                        .setStatus(await basicTradeService.getTradeStatus())
                }
                break;
            case TradeType.ORDER:
                // const orderTradeService = BlockchainLibraryUtils.getOrderTradeService(address, this._storageSpec);
                const orderTradeService = BlockchainLibraryUtils.getOrderTradeService(address);
                resp = await orderTradeService.getTrade();

                if (resp) {
                    // TODO: Implement this
                    throw new Error("Not implemented")
                    // const orderTrade = await orderTradeService.getCompleteTrade({
                    //     entireResourceUrl: resp.externalUrl,
                    // })
                    // const orderLines = await orderTradeService.getLines();
                    //
                    // trade
                    //     .setId(orderTrade.tradeId)
                    //     .setCommissioner(orderTrade.commissioner)
                    //     .setCustomer(orderTrade.customer)
                    //     .setIncoterms(orderTrade.incoterms)
                    //     .setPaymentDeadline(new Date(orderTrade.paymentDeadline))
                    //     .setDocumentDeliveryDeadline(new Date(orderTrade.documentDeliveryDeadline))
                    //     .setShipper(orderTrade.shipper)
                    //     .setArbiter(orderTrade.arbiter)
                    //     .setShippingPort(orderTrade.shippingPort)
                    //     .setShippingDeadline(new Date(orderTrade.shippingDeadline))
                    //     .setDeliveryPort(orderTrade.deliveryPort)
                    //     .setDeliveryDeadline(new Date(orderTrade.deliveryDeadline))
                    //     .setEscrow(orderTrade.escrow)
                    //     .setSupplier(orderTrade.supplier)
                    //     .setLines(orderLines.map(ol => new TradeLinePresentable()
                    //         .setId(ol.id)
                    //         .setMaterial(ol.material ? new MaterialPresentable()
                    //             .setId(ol.material.id)
                    //             .setName(ol.productCategory.name): undefined)
                    //         .setQuantity(ol.quantity)
                    //         .setPrice(new TradeLinePrice().setAmount(ol.price.amount).setFiat(ol.price.fiat))))
                    //     .setType(TradeType.ORDER)
                    //     .setStatus(await orderTradeService.getTradeStatus())
                }
                break;
            default:
                throw new CustomError(HttpStatusCode.BAD_REQUEST, "Wrong trade type");
        }
        return trade;
    }

    async saveBasicTrade(trade: TradePresentable): Promise<void> {
        const newTrade: BasicTrade = await this._tradeManagerService.registerBasicTrade(trade.supplier, trade.customer!, trade.commissioner!, trade.name!,
            // {
            // value: { issueDate: new Date() },
            // aclRules: [
            //     {
            //         agents: [basicTrade.supplierWebId],
            //         modes: [AccessMode.READ, AccessMode.WRITE, AccessMode.CONTROL],
            //     },
            //     {
            //         agents: [basicTrade.commissionerWebId],
            //         modes: [AccessMode.READ],
            //     },
            // ],
        // }
        );
        if (trade.lines) {
            const basicTradeService = BlockchainLibraryUtils.getBasicTradeService(await this._tradeManagerService.getTrade(newTrade.tradeId));
            await Promise.all(trade.lines.map(async line => {
                await basicTradeService.addLine(new LineRequest(line.material?.id!));
            }));
        }
    }

    async putBasicTrade(id: number, trade: TradePresentable): Promise<void> {
        // const tradeService = BlockchainLibraryUtils.getBasicTradeService(await this._tradeManagerService.getTrade(id), this._storageSpec);
        const tradeService = BlockchainLibraryUtils.getBasicTradeService(await this._tradeManagerService.getTrade(id));
        const oldTrade: BasicTrade = await tradeService.getTrade();
        oldTrade.name !== trade.name && await tradeService.setName(trade.name!);
    }

    async saveOrderTrade(trade: TradePresentable, storageSpec?: SolidSpec): Promise<void> {
        const metadata: OrderTradeMetadata = {
            incoterms: trade.incoterms!,
            shipper: trade.shipper!,
            shippingPort: trade.shippingPort!,
            deliveryPort: trade.deliveryPort!,
        }
        const newTrade: OrderTrade = await this._tradeManagerService.registerOrderTrade(
            trade.supplier, trade.customer!, trade.commissioner!, (trade.paymentDeadline!).getTime(), (trade.documentDeliveryDeadline!).getTime(),
            trade.arbiter!, (trade.shippingDeadline!).getTime(), (trade.deliveryDeadline!).getTime(), trade.agreedAmount!, trade.tokenAddress!,
            metadata,
        );
        // const orderTradeService = BlockchainLibraryUtils.getOrderTradeService(await this._tradeManagerService.getTrade(newTrade.tradeId), this._storageSpec);
        const orderTradeService = BlockchainLibraryUtils.getOrderTradeService(await this._tradeManagerService.getTrade(newTrade.tradeId));

        const externalUrlSegments = newTrade.externalUrl.split('/');
        const externalStorageTradeId = externalUrlSegments[externalUrlSegments.length - 1] === '' ? externalUrlSegments[externalUrlSegments.length - 2] : externalUrlSegments[externalUrlSegments.length - 1];

        // TODO: implement this
        // if (trade.paymentInvoice)
        //     await orderTradeService.addDocument(trade.paymentInvoice.documentType, {spec: {filename: trade.paymentInvoice.filename, bcResourceId: externalStorageTradeId}, fileBuffer: trade.paymentInvoice.content}, {spec: {resourceName: trade.paymentInvoice.filename, bcResourceId: externalStorageTradeId}, value: {filename: trade.paymentInvoice.filename}});
        // if (trade.swissDecode)
        //     await orderTradeService.addDocument(trade.swissDecode.documentType, {spec: {filename: trade.swissDecode.filename, bcResourceId: externalStorageTradeId}, fileBuffer: trade.swissDecode.content}, {spec: {resourceName: trade.swissDecode.filename, bcResourceId: externalStorageTradeId}, value: {filename: trade.swissDecode.filename}});
        // if (trade.deliveryNote)
        //     await orderTradeService.addDocument(trade.deliveryNote.documentType, {spec: {filename: trade.deliveryNote.filename, bcResourceId: externalStorageTradeId}, fileBuffer: trade.deliveryNote.content}, {spec: {resourceName: trade.deliveryNote.filename, bcResourceId: externalStorageTradeId}, value: {filename: trade.deliveryNote.filename}});
        // if (trade.billOfLading)
        //     await orderTradeService.addDocument(trade.billOfLading.documentType, {spec: {filename: trade.billOfLading.filename, bcResourceId: externalStorageTradeId}, fileBuffer: trade.billOfLading.content}, {spec: {resourceName: trade.billOfLading.filename, bcResourceId: externalStorageTradeId}, value: {filename: trade.billOfLading.filename}});
        // if (trade.weightCertificate)
        //     await orderTradeService.addDocument(trade.weightCertificate.documentType, {spec: {filename: trade.weightCertificate.filename, bcResourceId: externalStorageTradeId}, fileBuffer: trade.weightCertificate.content}, {spec: {resourceName: trade.weightCertificate.filename, bcResourceId: externalStorageTradeId}, value: {filename: trade.weightCertificate.filename}});
        // if (trade.preferentialEntryCertificate)
        //     await orderTradeService.addDocument(trade.preferentialEntryCertificate.documentType, {spec: {filename: trade.preferentialEntryCertificate.filename, bcResourceId: externalStorageTradeId}, fileBuffer: trade.preferentialEntryCertificate.content}, {spec: {resourceName: trade.preferentialEntryCertificate.filename, bcResourceId: externalStorageTradeId}, value: {filename: trade.preferentialEntryCertificate.filename}});
        // if (trade.fumigationCertificate)
        //     await orderTradeService.addDocument(trade.fumigationCertificate.documentType, {spec: {filename: trade.fumigationCertificate.filename, bcResourceId: externalStorageTradeId}, fileBuffer: trade.fumigationCertificate.content}, {spec: {resourceName: trade.fumigationCertificate.filename, bcResourceId: externalStorageTradeId}, value: {filename: trade.fumigationCertificate.filename}});
        // if (trade.phytosanitaryCertificate)
        //     await orderTradeService.addDocument(trade.phytosanitaryCertificate.documentType, {spec: {filename: trade.phytosanitaryCertificate.filename, bcResourceId: externalStorageTradeId}, fileBuffer: trade.phytosanitaryCertificate.content}, {spec: {resourceName: trade.phytosanitaryCertificate.filename, bcResourceId: externalStorageTradeId}, value: {filename: trade.phytosanitaryCertificate.filename}});
        // if (trade.insuranceCertificate)
        //     await orderTradeService.addDocument(trade.insuranceCertificate.documentType, {spec: {filename: trade.insuranceCertificate.filename, bcResourceId: externalStorageTradeId}, fileBuffer: trade.insuranceCertificate.content}, {spec: {resourceName: trade.insuranceCertificate.filename, bcResourceId: externalStorageTradeId}, value: {filename: trade.insuranceCertificate.filename}});

        if (trade.lines) {
            await Promise.all(trade.lines.map(async line => {
                await orderTradeService.addLine(new OrderLineRequest(line.material?.id!, line.quantity!, new OrderLinePrice(line.price!.amount, line.price!.fiat)));
            }));
        }
    }
}
