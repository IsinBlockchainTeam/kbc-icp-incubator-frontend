import {TransformationStrategy} from "../strategies/transformation/TransformationStrategy";
import {Service} from "./Service";

export class TransformationService<T, R> extends Service {
    private _strategy: TransformationStrategy<T, R>;

    constructor(strategy: TransformationStrategy<T, R>) {
        super();
        this._strategy = strategy;
    }

    async getTransformations(): Promise<T[]> {
        return this._strategy.getTransformations();
    }

    async getRawTransformations(): Promise<R[]> {
        this.checkMethodImplementation(this._strategy.getRawTransformations);
        return this._strategy.getRawTransformations!();
    }

    async getTransformationById(id: number): Promise<T | undefined> {
        return this._strategy.getTransformationById(id);
    }
}
