export interface MaterialStrategy<T> {
    getMaterials(): Promise<T[]>;
}
