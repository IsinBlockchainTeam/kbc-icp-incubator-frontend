import {
    AssetOperation,
    AssetOperationService,
    MaterialService
} from '@kbc-lib/coffee-trading-management-lib';
import { AssetOperationRequest } from '@/api/types/AssetOperationRequest';

export class EthAssetOperationService {
    private readonly _walletAddress: string;
    private readonly _assetOperationService: AssetOperationService;
    private readonly _materialService: MaterialService;

    constructor(
        walletAddress: string,
        assetOperationService: AssetOperationService,
        materialService: MaterialService
    ) {
        this._walletAddress = walletAddress;
        this._assetOperationService = assetOperationService;
        this._materialService = materialService;
    }

    async saveAssetOperation(assetOperation: AssetOperationRequest): Promise<void> {
        await this._assetOperationService.registerAssetOperation(
            assetOperation.name,
            assetOperation.inputMaterialIds,
            assetOperation.outputMaterialId,
            assetOperation.latitude,
            assetOperation.longitude,
            assetOperation.processTypes
        );
    }

    async getAssetOperations(): Promise<AssetOperation[]> {
        return this._assetOperationService.getAssetOperationsOfCreator(this._walletAddress);
    }

    async getAssetOperationById(id: number): Promise<AssetOperation> {
        return this._assetOperationService.getAssetOperation(id);
    }
}
