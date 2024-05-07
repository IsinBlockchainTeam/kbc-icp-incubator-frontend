import {Service} from "./Service";
import {BlockchainLibraryUtils} from "../BlockchainLibraryUtils";
import {TradePresentable} from "../types/TradePresentable";
import {BasicTrade, Line, LineRequest, IConcreteTradeService, OrderLinePrice, OrderLineRequest, TradeType} from "@kbc-lib/coffee-trading-management-lib";
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
                const basicTradeService = BlockchainLibraryUtils.getBasicTradeService(address);
                resp = await basicTradeService.getTrade();
                console.log("resp basic: ", resp)

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
                            .setMaterial(ol.material ? new MaterialPresentable()
                                .setId(ol.material.id)
                                .setName(ol.productCategory.name): undefined)
                            .setQuantity(ol.quantity)
                            .setPrice(new TradeLinePrice().setAmount(ol.price.amount).setFiat(ol.price.fiat))))
                        .setType(TradeType.ORDER)
                        .setStatus(await orderTradeService.getTradeStatus())
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
                await basicTradeService.addLine(new LineRequest(line.material?.id!));
            }));
        }
    }

    async putBasicTrade(id: number, trade: TradePresentable): Promise<void> {
        const tradeService = BlockchainLibraryUtils.getBasicTradeService(await this._tradeManagerService.getTrade(id));
        const oldTrade: BasicTrade = await tradeService.getTrade();
        oldTrade.name !== trade.name && await tradeService.setName(trade.name!);
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
                await orderTradeService.addLine(new OrderLineRequest(line.material?.id!, line.quantity!, new OrderLinePrice(line.price!.amount, line.price!.fiat)));
            }));
        }
    }
}
