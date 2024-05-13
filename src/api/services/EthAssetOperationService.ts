import {AssetOperation, AssetOperationService, MaterialService} from "@kbc-lib/coffee-trading-management-lib";
import {BlockchainLibraryUtils} from "../BlockchainLibraryUtils";
import {Service} from "./Service";
import {AssetOperationRequest} from "../types/AssetOperationRequest";

export class EthAssetOperationService extends Service {
    private readonly _assetOperationService: AssetOperationService;
    private readonly _materialService: MaterialService;

    constructor() {
        super();
        this._assetOperationService = BlockchainLibraryUtils.getAssetOperationService();
        this._materialService = BlockchainLibraryUtils.getMaterialService();
    }

    async saveAssetOperation(assetOperation: AssetOperationRequest): Promise<void> {
        await this._assetOperationService.registerAssetOperation(assetOperation.name, assetOperation.inputMaterialIds, assetOperation.outputMaterialId, assetOperation.latitude, assetOperation.longitude, assetOperation.processTypes);
    }

    async getAssetOperations(): Promise<AssetOperation[]> {
        return this._assetOperationService.getAssetOperationsOfCreator(this._walletAddress);
    }

    async getRawAssetOperations(): Promise<AssetOperation[]> {
        return this._assetOperationService.getAssetOperationsOfCreator(this._walletAddress);
    }

    async getAssetOperationById(id: number): Promise<AssetOperation> {
        return this._assetOperationService.getAssetOperation(id);
    }
}
