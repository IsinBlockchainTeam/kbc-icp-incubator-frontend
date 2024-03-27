import {TradeStrategy} from "./TradeStrategy";
import {TradePresentable} from "../../types/TradePresentable";
import {
    BasicTrade,
    IConcreteTradeService,
    Line, LineRequest, OrderLinePrice, OrderLineRequest,
    Trade,
    TradeType
} from "@kbc-lib/coffee-trading-management-lib";
import {BlockchainLibraryUtils} from "../../BlockchainLibraryUtils";
import {Strategy} from "../Strategy";
import {MaterialPresentable} from "../../types/MaterialPresentable";
import {CustomError} from "../../../utils/error/CustomError";
import {HttpStatusCode} from "../../../utils/error/HttpStatusCode";
import {TradeLinePresentable, TradeLinePrice} from "../../types/TradeLinePresentable";
import {SolidSpec, StorageSpec} from "../../types/storage";
import {OrderTradeInfo} from "../../../../../coffee-trading-management-lib/src";
import { AccessMode } from "@blockchain-lib/common";

export class BlockchainTradeStrategy extends Strategy implements TradeStrategy<TradePresentable, Trade> {
    private readonly _tradeManagerService;
    private readonly _storageSpec?: SolidSpec;

    constructor(storageSpec?: SolidSpec) {
        super(true);
        this._storageSpec = storageSpec;
        this._tradeManagerService = BlockchainLibraryUtils.getTradeManagerService(this._storageSpec);
    }
    // async getOrders(): Promise<TradePresentable[]> {
    //     const orders = await this._tradeService.getOrders(this._walletAddress);
    //     // TODO: nel momento in cui verranno effettivamente salvati dei metadati per un ordine su ipfs (che si ritengono utili da mostrare) aggiungere logica per recuperarli
    //     return await Promise.all(orders.map(async o => {
    //         const orderLines = await this._tradeService.getOrderLines(this._walletAddress, o.id);
    //         return new TradePresentable()
    //             .setId(o.id)
    //             .setLines(orderLines.map(ol => new TradeLinePresentable()
    //                 .setId(ol.id!)
    //                 .setMaterial(new MaterialPresentable().setName(ol.productCategory))
    //                 .setQuantity(ol.quantity)
    //                 .setPrice(new TradeLinePrice().setAmount(ol.price.amount).setFiat(ol.price.fiat))))
    //             .setSupplier(o.supplier)
    //             .setCustomer(o.customer)
    //             .setPaymentDeadline(o.paymentDeadline)
    //             .setDocumentDeliveryPipeline(o.documentDeliveryDeadline)
    //             .setArbiter(o.arbiter)
    //             .setShippingDeadline(o.shippingDeadline)
    //             .setDeliveryDeadline(o.deliveryDeadline)
    //             .setType(TradeType.NEGOTIATION)
    //     }));
    // }

    async getGeneralTrades(): Promise<TradePresentable[]> {
        const tradeIds: number[] = await this._tradeManagerService.getTradeIdsOfSupplier(this._walletAddress);
        tradeIds.push(...await this._tradeManagerService.getTradeIdsOfCommissioner(this._walletAddress));
        let tradePresentables: TradePresentable[] = [];

        if (!tradeIds.length) return tradePresentables;

        const tradeContractAddresses = await Promise.all(tradeIds.map(async id => this._tradeManagerService.getTrade(id)));
        for (const tradeAddress of tradeContractAddresses) {
            const tradeService = BlockchainLibraryUtils.getTradeService(tradeAddress, this._storageSpec);
            let tradeInstanceService: IConcreteTradeService;
            const tradeType = await tradeService.getTradeType();
            if(tradeType === TradeType.ORDER) {
                tradeInstanceService = BlockchainLibraryUtils.getOrderTradeService(tradeAddress, this._storageSpec);
            } else if(tradeType === TradeType.BASIC) {
                tradeInstanceService = BlockchainLibraryUtils.getBasicTradeService(tradeAddress, this._storageSpec);
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
                const basicTradeService = BlockchainLibraryUtils.getBasicTradeService(address, this._storageSpec);
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
                const orderTradeService = BlockchainLibraryUtils.getOrderTradeService(address, this._storageSpec);
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
                        .setDocumentDeliveryPipeline(new Date(orderTrade.documentDeliveryDeadline))
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
        const newTrade: BasicTrade = await this._tradeManagerService.registerBasicTrade(trade.supplier, trade.customer!, trade.commissioner!, trade.name!, {
            value: { issueDate: new Date() },
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
        });
        if (trade.lines) {
            const basicTradeService = BlockchainLibraryUtils.getBasicTradeService(await this._tradeManagerService.getTrade(newTrade.tradeId));
            await Promise.all(trade.lines.map(async line => {
                await basicTradeService.addLine(new LineRequest(line.material?.id!));
            }));
        }
    }

    async putBasicTrade(id: number, trade: TradePresentable): Promise<void> {
        const tradeService = BlockchainLibraryUtils.getBasicTradeService(await this._tradeManagerService.getTrade(id), this._storageSpec);
        const oldTrade: BasicTrade = await tradeService.getTrade();
        oldTrade.name !== trade.name && await tradeService.setName(trade.name!);
    }

    async saveOrderTrade(trade: TradePresentable, storageSpec?: SolidSpec): Promise<void> {
        const newTrade: OrderTradeInfo = await this._tradeManagerService.registerOrderTrade(
            trade.supplier, trade.customer!, trade.commissioner!, (trade.paymentDeadline!).getTime(), (trade.documentDeliveryDeadline!).getTime(),
            trade.arbiter!, (trade.shippingDeadline!).getTime(), (trade.deliveryDeadline!).getTime(), trade.agreedAmount!, trade.tokenAddress!,
            { value: { incoterms: trade.incoterms, shipper: trade.shipper, shippingPort: trade.shippingPort, deliveryPort: trade.deliveryPort }}
        );
        if (trade.lines) {
            const orderTradeService = BlockchainLibraryUtils.getOrderTradeService(await this._tradeManagerService.getTrade(newTrade.tradeId), this._storageSpec);
            await Promise.all(trade.lines.map(async line => {
                await orderTradeService.addLine(new OrderLineRequest(line.material?.id!, line.quantity!, new OrderLinePrice(line.price!.amount, line.price!.fiat)));
            }));
        }
    }
}
