
export interface TradeStrategy<T, R> {
    getOrders?: () => Promise<T[]>;

    getContracts?: () => Promise<T[]>;

    getShipments?: () => Promise<T[]>;

    getGeneralTrades?: () => Promise<T[]>;

    getTradeByIdAndType?: (id: number, type: number) => Promise<T | undefined>;

    getContractById?: (id: number) => Promise<R>;

    getOrderById?: (id: number) => Promise<R>;

    getShippingById?: (id: number) => Promise<R>;

}
