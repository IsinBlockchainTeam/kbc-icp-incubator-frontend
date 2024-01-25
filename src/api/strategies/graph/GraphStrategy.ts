export type GraphData = {
    nodes: any[],
    edges: any[]
}
export interface GraphStrategy<T> {
    computeGraph: (materialId: number, additionalInfo?: any) => Promise<T>
}
