import {Strategy} from "../Strategy";
import {GraphData, GraphStrategy} from "./GraphStrategy";
import {GraphService} from "@kbc-lib/coffee-trading-management-lib";
import {BlockchainLibraryUtils} from "../../BlockchainLibraryUtils";

export class BlockchainGraphStrategy extends Strategy implements GraphStrategy<GraphData> {
    private readonly _graphService: GraphService;
    constructor() {
        super(true);
        this._graphService = BlockchainLibraryUtils.getGraphService()
    }

    async computeGraph(materialId: number, supplier?: string): Promise<GraphData> {
        return this._graphService.computeGraph(supplier || this._walletAddress, materialId);
    }
}
