import {TradeStrategy} from "../strategies/trade/TradeStrategy";
import {Service} from "./Service";

export class TradeService<T, R> extends Service {
    private readonly _strategy: TradeStrategy<T, R>;

    constructor(strategy: TradeStrategy<T, R>) {
        super();
        this._strategy = strategy;
    }

    async getGeneralTrades(): Promise<T[]> {
        this.checkMethodImplementation(this._strategy.getGeneralTrades);
        return this._strategy.getGeneralTrades!();
    }

    async getTradeByIdAndType(id: number, type: number): Promise<T | undefined> {
        this.checkMethodImplementation(this._strategy.getTradeByIdAndType);
        return this._strategy.getTradeByIdAndType!(id, type);
    }

    async getOrders(): Promise<T[]> {
        this.checkMethodImplementation(this._strategy.getOrders);
        return this._strategy.getOrders!();
    }

    async getShipments(): Promise<T[]> {
        this.checkMethodImplementation(this._strategy.getShipments);
        return this._strategy.getShipments!();
    }

    async getContracts(): Promise<T[]> {
        this.checkMethodImplementation(this._strategy.getContracts);
        return this._strategy.getContracts!();
    }

    async getContractById(id: number): Promise<R> {
        this.checkMethodImplementation(this._strategy.getContractById);
        return this._strategy.getContractById!(id);
    }

    async getOrderById(id: number): Promise<R> {
        this.checkMethodImplementation(this._strategy.getContractById);
        return this._strategy.getOrderById!(id);
    }

    async getShippingById(id: number): Promise<R> {
        this.checkMethodImplementation(this._strategy.getContractById);
        return this._strategy.getShippingById!(id);
    }

    async saveBasicTrade(trade: T): Promise<void> {
        this.checkMethodImplementation(this._strategy.saveBasicTrade);
        return this._strategy.saveBasicTrade!(trade);
    }

    async putBasicTrade(id: number, trade: T): Promise<void> {
        this.checkMethodImplementation(this._strategy.putBasicTrade);
        return this._strategy.putBasicTrade!(id, trade);
    }

    async saveOrderTrade(trade: T): Promise<void> {
        this.checkMethodImplementation(this._strategy.saveOrderTrade);
        return this._strategy.saveOrderTrade!(trade);
    }
}
