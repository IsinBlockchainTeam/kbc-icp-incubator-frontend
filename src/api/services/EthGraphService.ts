import {Service} from "./Service";
import {GraphData as LibGraphData, GraphService, SolidMetadataSpec} from "@kbc-lib/coffee-trading-management-lib";
import {BlockchainLibraryUtils} from "../BlockchainLibraryUtils";

export type GraphData = {
    nodes: any[],
    edges: any[]
}

export type BlockchainGraphData = {
    [K in keyof GraphData]: LibGraphData[K];
}

export class EthGraphService extends Service {
    private readonly _graphService: GraphService<SolidMetadataSpec, SolidMetadataSpec>;

    constructor() {
        super();
        this._graphService = BlockchainLibraryUtils.getGraphService()

    }

    async computeGraph(materialId: number): Promise<BlockchainGraphData> {
        return this._graphService.computeGraph(materialId, true);
    }
}
