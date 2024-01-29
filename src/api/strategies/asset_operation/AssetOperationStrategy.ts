
export interface AssetOperationStrategy<T, R> {
    getAssetOperations(): Promise<T[]>;

    getRawAssetOperations?(): Promise<R[]>;

    getAssetOperationById(id: number): Promise<T | undefined>;
}
