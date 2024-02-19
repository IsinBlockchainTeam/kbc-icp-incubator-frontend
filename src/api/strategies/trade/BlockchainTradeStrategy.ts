import {TradeStrategy} from "./TradeStrategy";
import {TradePresentable} from "../../types/TradePresentable";
import {
    BasicTrade,
    BasicTradeService,
    IConcreteTradeService,
    Line, LineRequest,
    Trade, TradeManagerService,
    TradeType
} from "@kbc-lib/coffee-trading-management-lib";
import {BlockchainLibraryUtils} from "../../BlockchainLibraryUtils";
import {Strategy} from "../Strategy";
import {MaterialPresentable} from "../../types/MaterialPresentable";
import {CustomError} from "../../../utils/error/CustomError";
import {HttpStatusCode} from "../../../utils/error/HttpStatusCode";
import {TradeLinePresentable, TradeLinePrice} from "../../types/TradeLinePresentable";
import {SolidService} from "../../services/SolidService";
import {CompanyPodInfo} from "../../types/solid";

export class BlockchainTradeStrategy extends Strategy implements TradeStrategy<TradePresentable, Trade> {
    private readonly _tradeManagerService: TradeManagerService;
    private readonly _solidService?: SolidService;

    constructor(solidPodInfo?: CompanyPodInfo) {
        super(true);
        this._tradeManagerService = BlockchainLibraryUtils.getTradeManagerService();
        if (solidPodInfo)
            this._solidService = new SolidService(solidPodInfo.serverUrl, solidPodInfo.clientId, solidPodInfo.clientSecret);
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
        this.checkService(this._solidService);
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
                            .setMaterial(tl.material ? new MaterialPresentable()
                                .setId(tl.material.id)
                                .setName(tl.productCategory.name): undefined)): [])
                        .setType(TradeType.BASIC)
                        .setStatus(await basicTradeService.getTradeStatus())
                }
                break;
            case TradeType.ORDER:
                const orderTradeService = BlockchainLibraryUtils.getOrderTradeService(address);
                resp = await orderTradeService.getTrade();

                if (resp) {
                    const orderMetadata = await this._solidService!.retrieveMetadata(resp.externalUrl);
                    const orderLines = await orderTradeService.getLines();

                    trade
                        .setId(resp.tradeId)
                        .setCommissioner(resp.commissioner)
                        .setCustomer(resp.customer)
                        .setIncoterms(orderMetadata.incoterms)
                        .setPaymentDeadline(new Date(resp.paymentDeadline))
                        .setDocumentDeliveryPipeline(new Date(resp.documentDeliveryDeadline))
                        .setShipper(orderMetadata.shipper)
                        .setArbiter(resp.arbiter)
                        .setShippingPort(orderMetadata.shippingPort)
                        .setShippingDeadline(new Date(resp.shippingDeadline))
                        .setDeliveryPort(orderMetadata.deliveryPort)
                        .setDeliveryDeadline(new Date(resp.deliveryDeadline))
                        .setEscrow(resp.escrow)
                        .setSupplier(resp.supplier)
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
        this.checkService(this._solidService);

        const tradeManagerService: TradeManagerService = BlockchainLibraryUtils.getTradeManagerService();
        // TODO: fix external url
        const newTrade: BasicTrade = await tradeManagerService.registerBasicTrade(trade.supplier, trade.customer!, trade.commissioner!, 'externalUrl', trade.name!);
        if (trade.lines) {
            const basicTradeService: BasicTradeService = BlockchainLibraryUtils.getBasicTradeService(await tradeManagerService.getTrade(newTrade.tradeId));
            await Promise.all(trade.lines.map(async line => {
                await basicTradeService.addLine(new LineRequest(line.material?.id!));
            }));
        }
    }

    async putBasicTrade(id: number, trade: TradePresentable): Promise<void> {
        this.checkService(this._solidService);
        const tradeManagerService: TradeManagerService = BlockchainLibraryUtils.getTradeManagerService();
        const tradeService: BasicTradeService = BlockchainLibraryUtils.getBasicTradeService(await tradeManagerService.getTrade(id));
        const oldTrade: BasicTrade = await tradeService.getTrade();
        oldTrade.name !== trade.name && await tradeService.setName(trade.name!);
    }
}
