
export interface AssetOperationStrategy<T, R> {
    saveAssetOperation?(assetOperation: T): Promise<void>;

    getAssetOperations(): Promise<T[]>;

    getRawAssetOperations?(): Promise<R[]>;

    getAssetOperationById(id: number): Promise<T | undefined>;
}
