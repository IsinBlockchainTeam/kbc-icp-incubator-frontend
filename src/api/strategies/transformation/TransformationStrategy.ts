
export interface TransformationStrategy<T, R> {
    getTransformations(): Promise<T[]>;

    getRawTransformations?(): Promise<R[]>;

    getTransformationById(id: number): Promise<T | undefined>;
}
