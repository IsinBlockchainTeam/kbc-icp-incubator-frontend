import {AssetOperationStrategy} from "../strategies/asset_operation/AssetOperationStrategy";
import {Service} from "./Service";

export class TransformationService<T, R> extends Service {
    private _strategy: AssetOperationStrategy<T, R>;

    constructor(strategy: AssetOperationStrategy<T, R>) {
        super();
        this._strategy = strategy;
    }

    async getTransformations(): Promise<T[]> {
        return this._strategy.getAssetOperations();
    }

    async getRawTransformations(): Promise<R[]> {
        this.checkMethodImplementation(this._strategy.getRawAssetOperations);
        return this._strategy.getRawAssetOperations!();
    }

    async getTransformationById(id: number): Promise<T | undefined> {
        return this._strategy.getAssetOperationById(id);
    }
}
