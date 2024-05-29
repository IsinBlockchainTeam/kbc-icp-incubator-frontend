import {GraphData as LibGraphData, GraphService} from "@kbc-lib/coffee-trading-management-lib";

export type GraphData = {
    nodes: any[],
    edges: any[]
}

export type BlockchainGraphData = {
    [K in keyof GraphData]: LibGraphData[K];
}

export class EthGraphService {
    private readonly _graphService: GraphService;

    constructor(graphService: GraphService) {
        this._graphService = graphService;

    }

    async computeGraph(materialId: number): Promise<BlockchainGraphData> {
        return this._graphService.computeGraph(materialId, true);
    }
}
