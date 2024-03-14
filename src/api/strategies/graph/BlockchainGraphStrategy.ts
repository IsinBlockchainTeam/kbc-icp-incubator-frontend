import {Strategy} from "../Strategy";
import {GraphData, GraphStrategy} from "./GraphStrategy";
import {GraphService, GraphData as LibGraphData} from "@kbc-lib/coffee-trading-management-lib";
import {BlockchainLibraryUtils} from "../../BlockchainLibraryUtils";
import {SolidMetadataSpec} from "../../../../../coffee-trading-management-lib/src";

export type BlockchainGraphData = {
    [K in keyof GraphData]: LibGraphData[K];
}

export class BlockchainGraphStrategy extends Strategy implements GraphStrategy<GraphData> {
    private readonly _graphService: GraphService<SolidMetadataSpec>;
    constructor() {
        super(true);
        this._graphService = BlockchainLibraryUtils.getGraphService()
    }

    async computeGraph(materialId: number, supplier?: string): Promise<BlockchainGraphData> {
        return this._graphService.computeGraph(materialId, true);
    }
}
