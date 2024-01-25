import {TradeStrategy} from "./TradeStrategy";
import {TradePresentable} from "../../types/TradePresentable";
import {
    IConcreteTradeService,
    Line,
    Trade, TradeManagerService,
    TradeType
} from "@kbc-lib/coffee-trading-management-lib";
import {BlockchainLibraryUtils} from "../../BlockchainLibraryUtils";
import {Strategy} from "../Strategy";
import {MaterialPresentable} from "../../types/MaterialPresentable";
import {CustomError} from "../../../utils/error/CustomError";
import {HttpStatusCode} from "../../../utils/error/HttpStatusCode";
import {TradeLinePresentable, TradeLinePrice} from "../../types/TradeLinePresentable";

export class BlockchainTradeStrategy extends Strategy implements TradeStrategy<TradePresentable, Trade> {
    private readonly _tradeManagerService: TradeManagerService;

    constructor() {
        super(true);
        this._tradeManagerService = BlockchainLibraryUtils.getTradeManagerService();
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
        console.log("getGeneralTrades")
        const trades: Map<string, TradeType> = await this._tradeManagerService.getTradesAndTypes();
        let tradePresentables: TradePresentable[] = [];

        console.log("trades: ", trades)

        const processTrades = async () => {
            for (const [address, type] of trades) {
                let tradeService: IConcreteTradeService;
                if(type === TradeType.ORDER) {
                    tradeService = BlockchainLibraryUtils.getOrderTradeService(address);
                } else if(type === TradeType.BASIC) {
                    tradeService = BlockchainLibraryUtils.getBasicTradeService(address);
                } else {
                    throw new CustomError(HttpStatusCode.INTERNAL_SERVER, "Received an invalid trade type");
                }

                const lines: Line[] = await tradeService.getLines();
                const {tradeId, supplier, customer, commissioner} = await tradeService.getTrade();

                tradePresentables.push(new TradePresentable()
                    .setId(tradeId)
                    .setSupplier(supplier)
                    .setCustomer(customer)
                    .setCommissioner(commissioner)
                    .setLines(lines.map(tl => new TradeLinePresentable()
                        .setId(tl.id)
                        .setMaterial(new MaterialPresentable()
                            .setId(tl.materialsId[0])
                            .setName(tl.productCategory))))
                    .setType(type));
            }
        }

        await processTrades();

        return tradePresentables;
    }

    async getTradeByIdAndType(id: number, type: number): Promise<TradePresentable | undefined> {
        const trade = new TradePresentable();
        const tradeManagerService: TradeManagerService = BlockchainLibraryUtils.getTradeManagerService();
        const address: string = await tradeManagerService.getTrade(id);

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
                        .setLines(lines ? lines.map(tl => new TradeLinePresentable()
                            .setId(tl.id)
                            .setMaterial(new MaterialPresentable().setId(tl.materialsId[0]).setName(tl.productCategory))) : [])
                        .setType(TradeType.BASIC)
                        .setStatus(await basicTradeService.getTradeStatus())
                }
                break;
            case TradeType.ORDER:
                const orderTradeService = BlockchainLibraryUtils.getOrderTradeService(address);
                resp = await orderTradeService.getTrade();

                if (resp) {
                    const orderLines = await orderTradeService.getLines();

                    trade
                        .setId(resp.tradeId)
                        .setCustomer(resp.customer)
                        //.setIncoterms(resp.incoterms)
                        .setPaymentDeadline(new Date(resp.paymentDeadline))
                        .setDocumentDeliveryPipeline(new Date(resp.documentDeliveryDeadline))
                        //.setShipper(resp.shipper)
                        .setArbiter(resp.arbiter)
                        //.setShippingPort(resp.shippingPort)
                        .setShippingDeadline(new Date(resp.shippingDeadline))
                        //.setDeliveryPort(resp.deliveryPort)
                        .setDeliveryDeadline(new Date(resp.deliveryDeadline))
                        .setEscrow(resp.escrow)
                        .setSupplier(resp.supplier)
                        .setLines(orderLines.map(ol => new TradeLinePresentable()
                            .setId(ol.id)
                            .setMaterial(new MaterialPresentable().setId(ol.materialsId[0]).setName(ol.productCategory))
                            .setQuantity(ol.quantity)
                            .setPrice(new TradeLinePrice().setAmount(ol.price.amount).setFiat(ol.price.fiat))))
                        .setType(TradeType.ORDER)
                        .setStatus(await orderTradeService.getTradeStatus())
                }
                break;
            default:
                throw new CustomError(HttpStatusCode.BAD_REQUEST, "Wrong trade type");
        }
        console.log("trade: ", trade)
        return trade;
    }
}
