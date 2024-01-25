export interface SupplyChainStrategy<T> {
    getSupplyChain(materialId: number): Promise<T>;
}
