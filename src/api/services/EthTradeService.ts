import {Service} from "./Service";
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
    OrderLine, Material, OrderTrade, OrderTradeInfo
} from "@kbc-lib/coffee-trading-management-lib";
import {CustomError} from "../../utils/error/CustomError";
import {HttpStatusCode} from "../../utils/error/HttpStatusCode";
import {TradeLinePresentable, TradeLinePrice} from "../types/TradeLinePresentable";
import {MaterialPresentable} from "../types/MaterialPresentable";
import {ProductCategoryPresentable} from "../types/ProductCategoryPresentable";

export class EthTradeService extends Service {
    private readonly _tradeManagerService;

    constructor() {
        super();
        this._tradeManagerService = BlockchainLibraryUtils.getTradeManagerService();
    }

    async getGeneralTrades(): Promise<TradePresentable[]> {
        const tradeIds: number[] = await this._tradeManagerService.getTradeIdsOfSupplier(this._walletAddress);
        tradeIds.push(...await this._tradeManagerService.getTradeIdsOfCommissioner(this._walletAddress));
        let tradePresentables: TradePresentable[] = [];

        if (!tradeIds.length) return tradePresentables;

        const tradeContractAddresses = await Promise.all(tradeIds.map(async id => this._tradeManagerService.getTrade(id)));
        for (const tradeAddress of tradeContractAddresses) {
            const tradeService = BlockchainLibraryUtils.getTradeService(tradeAddress);
            let tradeInstanceService: IConcreteTradeService;
            const tradeType = await tradeService.getTradeType();
            if(tradeType === TradeType.ORDER) {
                tradeInstanceService = BlockchainLibraryUtils.getOrderTradeService(tradeAddress);
            } else if(tradeType === TradeType.BASIC) {
                tradeInstanceService = BlockchainLibraryUtils.getBasicTradeService(tradeAddress);
            } else {
                throw new CustomError(HttpStatusCode.INTERNAL_SERVER, "Received an invalid trade type");
            }

            const trade = await tradeInstanceService.getTrade();

            // TODO: cast trade in order
            tradePresentables.push(new TradePresentable()
                .setId(trade.tradeId)
                .setSupplier(trade.supplier)
                .setCustomer(trade.customer)
                .setCommissioner(trade.commissioner)
                .setLines(trade.lines.map(tl => new TradeLinePresentable()
                    .setId(tl.id)
                    .setMaterial(tl.material ? new MaterialPresentable()
                        .setId(tl.material.id)
                        .setName(tl.productCategory.name): undefined)))
                .setType(tradeType)
                .setNegotiationStatus((trade as OrderTradeInfo).negotiationStatus)
            );
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
                const basicTradeService = BlockchainLibraryUtils.getBasicTradeService(address);
                resp = await basicTradeService.getTrade();

                if (resp) {
                    const lines: Line[] = await basicTradeService.getLines();
                    trade
                        .setId(resp.tradeId)
                        .setName(resp.name)
                        .setSupplier(resp.supplier)
                        .setCustomer(resp.customer)
                        .setCommissioner(resp.commissioner)
                        .setLines(lines ? lines.map(tl => new TradeLinePresentable()
                            .setId(tl.id)
                            .setProductCategory(tl.productCategory ? new ProductCategoryPresentable()
                                .setId(tl.productCategory.id)
                                .setQuality(tl.productCategory.quality)
                                .setName(tl.productCategory.name) : undefined)
                            .setQuantity(tl.quantity)
                            .setUnit(tl.unit)
                            .setMaterial(tl.material ? new MaterialPresentable()
                                .setId(tl.material.id)
                                .setName(tl.productCategory.name) : undefined)
                            ) : [])
                        .setType(TradeType.BASIC)
                        .setStatus(await basicTradeService.getTradeStatus())
                }
                break;
            case TradeType.ORDER:
                const orderTradeService = BlockchainLibraryUtils.getOrderTradeService(address);
                resp = await orderTradeService.getTrade();

                if (resp) {
                    const orderTrade = await orderTradeService.getCompleteTrade({
                        entireResourceUrl: resp.externalUrl,
                    })
                    const orderLines = await orderTradeService.getLines();

                    trade
                        .setId(orderTrade.tradeId)
                        .setCommissioner(orderTrade.commissioner)
                        .setCustomer(orderTrade.customer)
                        .setIncoterms(orderTrade.incoterms)
                        .setPaymentDeadline(new Date(orderTrade.paymentDeadline))
                        .setDocumentDeliveryDeadline(new Date(orderTrade.documentDeliveryDeadline))
                        .setShipper(orderTrade.shipper)
                        .setArbiter(orderTrade.arbiter)
                        .setShippingPort(orderTrade.shippingPort)
                        .setShippingDeadline(new Date(orderTrade.shippingDeadline))
                        .setDeliveryPort(orderTrade.deliveryPort)
                        .setDeliveryDeadline(new Date(orderTrade.deliveryDeadline))
                        .setEscrow(orderTrade.escrow)
                        .setSupplier(orderTrade.supplier)
                        .setLines(orderLines.map(ol => new TradeLinePresentable()
                            .setId(ol.id)
                            .setProductCategory(ol.productCategory ? new ProductCategoryPresentable()
                                .setId(ol.productCategory.id)
                                .setQuality(ol.productCategory.quality)
                                .setName(ol.productCategory.name) : undefined)
                            .setMaterial(ol.material ? new MaterialPresentable()
                                .setId(ol.material.id)
                                .setName(ol.productCategory.name): undefined)
                            .setProductCategory(ol.productCategory ? new ProductCategoryPresentable()
                                .setId(ol.productCategory.id)
                                .setQuality(ol.productCategory.quality)
                                .setName(ol.productCategory.name) : undefined)
                            .setQuantity(ol.quantity)
                            .setUnit(ol.unit)
                            .setPrice(new TradeLinePrice().setAmount(ol.price.amount).setFiat(ol.price.fiat))))
                        .setType(TradeType.ORDER)
                        .setStatus(await orderTradeService.getTradeStatus())
                        .setNegotiationStatus(await orderTradeService.getNegotiationStatus())
                        .setAgreedAmount(orderTrade.agreedAmount)
                        .setTokenAddress(orderTrade.tokenAddress)

                    console.log("order trade retrieved: ", trade)
                }
                break;
            default:
                throw new CustomError(HttpStatusCode.BAD_REQUEST, "Wrong trade type");
        }
        return trade;
    }

    async saveBasicTrade(trade: TradePresentable): Promise<void> {
        let newTradeAddress: string;
        let transactionHash: string;
        [, newTradeAddress, transactionHash] = await this._tradeManagerService.registerBasicTrade(trade.supplier, trade.customer!, trade.commissioner!, trade.name!);

        await BlockchainLibraryUtils.waitForTransactions(transactionHash, Number(process.env.REACT_APP_BC_CONFIRMATION_NUMBER || 0));

        const basicTradeService = BlockchainLibraryUtils.getBasicTradeService(newTradeAddress);
        if (trade.deliveryNote) await basicTradeService.addDocument(trade.deliveryNote.documentType);

        if (trade.lines) {
            await Promise.all(trade.lines.map(async line => {
                await basicTradeService.addLine(new LineRequest(line.productCategory!.id, line.quantity!, line.unit!));
            }));
        }
    }

    async confirmOrderTrade(id: number): Promise<void> {
        const tradeService = BlockchainLibraryUtils.getOrderTradeService(await this._tradeManagerService.getTrade(id));
        await tradeService.confirmOrder();
    }

    async putBasicTrade(id: number, trade: TradePresentable): Promise<void> {
        const tradeService = BlockchainLibraryUtils.getBasicTradeService(await this._tradeManagerService.getTrade(id));
        const oldTrade: BasicTrade = await tradeService.getTrade();
        oldTrade.name !== trade.name && await tradeService.setName(trade.name!);
    }

    async putOrderTrade(id: number, trade: TradePresentable): Promise<void> {
        const tradeService = BlockchainLibraryUtils.getOrderTradeService(await this._tradeManagerService.getTrade(id));
        const oldTrade = await tradeService.getTrade();

        oldTrade.paymentDeadline !== trade.paymentDeadline?.getTime() && await tradeService.updatePaymentDeadline(trade.paymentDeadline!.getTime());
        oldTrade.documentDeliveryDeadline !== trade.documentDeliveryDeadline?.getTime() && await tradeService.updateDocumentDeliveryDeadline(trade.documentDeliveryDeadline!.getTime());
        oldTrade.arbiter !== trade.arbiter && await tradeService.updateArbiter(trade.arbiter!);
        oldTrade.shippingDeadline !== trade.shippingDeadline?.getTime() && await tradeService.updateShippingDeadline(trade.shippingDeadline!.getTime());
        oldTrade.deliveryDeadline !== trade.deliveryDeadline?.getTime() && await tradeService.updateDeliveryDeadline(trade.deliveryDeadline!.getTime());
        oldTrade.agreedAmount !== trade.agreedAmount && await tradeService.updateAgreedAmount(trade.agreedAmount!);
        oldTrade.tokenAddress !== trade.tokenAddress && await tradeService.updateTokenAddress(trade.tokenAddress!);
        // update one single line because at this time we manage only one line per trade
        console.log("trade: ", trade)
        console.log("oldTrade: ", oldTrade)
        await tradeService.updateLine(new OrderLineRequest(trade.lines[0].productCategory!.id, trade.lines[0].quantity!, trade.lines[0].unit!, new OrderLinePrice(trade.lines[0].price!.amount, trade.lines[0].price!.fiat), oldTrade.lines[0].id));
        // TODO: is it better to check if every field (also price) is changed, so that no useless calls to chain are made
        // if (oldTrade.lines[0].productCategory.id !== trade.lines[0].productCategory?.id || oldTrade.lines[0].quantity !== trade.lines[0].quantity || oldTrade.lines[0].unit !== trade.lines[0].unit)
        //     await tradeService.updateLine(new OrderLineRequest(trade.lines[0].productCategory!.id, trade.lines[0].quantity!, trade.lines[0].unit!, new OrderLinePrice(trade.lines[0].price!.amount, trade.lines[0].price!.fiat), oldTrade.lines[0].id));
    }

    async saveOrderTrade(trade: TradePresentable): Promise<void> {
        let newTradeAddress: string;
        let transactionHash: string;
        [, newTradeAddress, transactionHash] = await this._tradeManagerService.registerOrderTrade(
            trade.supplier, trade.customer!, trade.commissioner!, (trade.paymentDeadline!).getTime(), (trade.documentDeliveryDeadline!).getTime(),
            trade.arbiter!, (trade.shippingDeadline!).getTime(), (trade.deliveryDeadline!).getTime(), trade.agreedAmount!, trade.tokenAddress!,
        );

        await BlockchainLibraryUtils.waitForTransactions(transactionHash, Number(process.env.REACT_APP_BC_CONFIRMATION_NUMBER || 0));

        const orderTradeService = BlockchainLibraryUtils.getOrderTradeService(newTradeAddress);
        if (trade.paymentInvoice) await orderTradeService.addDocument(trade.paymentInvoice.documentType);
        if (trade.swissDecode) await orderTradeService.addDocument(trade.swissDecode.documentType);
        if (trade.deliveryNote) await orderTradeService.addDocument(trade.deliveryNote.documentType);
        if (trade.billOfLading) await orderTradeService.addDocument(trade.billOfLading.documentType);
        if (trade.weightCertificate) await orderTradeService.addDocument(trade.weightCertificate.documentType);
        if (trade.preferentialEntryCertificate) await orderTradeService.addDocument(trade.preferentialEntryCertificate.documentType);
        if (trade.fumigationCertificate) await orderTradeService.addDocument(trade.fumigationCertificate.documentType);
        if (trade.phytosanitaryCertificate) await orderTradeService.addDocument(trade.phytosanitaryCertificate.documentType);
        if (trade.insuranceCertificate) await orderTradeService.addDocument(trade.insuranceCertificate.documentType);

        if (trade.lines) {
            await Promise.all(trade.lines.map(async line => {
                await orderTradeService.addLine(new OrderLineRequest(line.productCategory!.id!, line.quantity!, line.unit!, new OrderLinePrice(line.price!.amount, line.price!.fiat)));
            }));
        }
    }
}
