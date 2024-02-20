import {MaterialStrategy} from "../strategies/material/MaterialStrategy";
import {Service} from "./Service";

export class MaterialService<T> extends Service {
    private readonly _strategy: MaterialStrategy<T>;

    constructor(materialStrategy: MaterialStrategy<T>) {
        super();
        this._strategy = materialStrategy;
    }

    async saveProductCategory(name: string, quality: number, description: string): Promise<void> {
        this.checkMethodImplementation(this._strategy.saveProductCategory);
        return this._strategy.saveProductCategory!(name, quality, description);
    }

    async saveMaterial(productCategoryId: number): Promise<void> {
        this.checkMethodImplementation(this._strategy.saveMaterial);
        return this._strategy.saveMaterial!(productCategoryId);
    }

    async getMaterials(): Promise<T[]> {
        return this._strategy.getMaterials();
    }
}
