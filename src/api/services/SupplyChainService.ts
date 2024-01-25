import {Service} from "./Service";
import {SupplyChainStrategy} from "../strategies/supply_chain/SupplyChainStrategy";

export class SupplyChainService<T> extends Service {
    private readonly _supplyChainStrategy: SupplyChainStrategy<T>;

    constructor(supplyChainStrategy: SupplyChainStrategy<T>) {
        super();
        this._supplyChainStrategy = supplyChainStrategy;
    }

    async getSupplyChain(materialId: number): Promise<T> {
        return this._supplyChainStrategy.getSupplyChain(materialId);
    }
}
