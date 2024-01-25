import {MaterialStrategy} from "../strategies/material/MaterialStrategy";
import {Service} from "./Service";

export class MaterialService<T> extends Service {
    private readonly _strategy: MaterialStrategy<T>;

    constructor(materialStrategy: MaterialStrategy<T>) {
        super();
        this._strategy = materialStrategy;
    }

    async getMaterials(): Promise<T[]> {
        return this._strategy.getMaterials();
    }
}
