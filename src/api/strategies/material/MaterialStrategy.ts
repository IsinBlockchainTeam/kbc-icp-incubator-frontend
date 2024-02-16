export interface MaterialStrategy<T> {
    saveProductCategory?: (name: string, quality: number, description: string) => Promise<void>;
    saveMaterial?: (productCategoryId: number) => Promise<void>;
    getMaterials(): Promise<T[]>;
}
