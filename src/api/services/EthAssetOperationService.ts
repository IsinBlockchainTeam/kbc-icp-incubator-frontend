import {AssetOperation, AssetOperationService, MaterialService} from "@kbc-lib/coffee-trading-management-lib";
import {BlockchainLibraryUtils} from "../BlockchainLibraryUtils";
import {AssetOperationPresentable} from "../types/AssetOperationPresentable";
import {MaterialPresentable} from "../types/MaterialPresentable";
import {Service} from "./Service";

export class EthAssetOperationService extends Service {
    private readonly _assetOperationService: AssetOperationService;
    private readonly _materialService: MaterialService;

    constructor() {
        super();
        this._assetOperationService = BlockchainLibraryUtils.getAssetOperationService();
        this._materialService = BlockchainLibraryUtils.getMaterialService();
    }

    async saveAssetOperation(assetOperation: AssetOperationPresentable): Promise<void> {
        await this._assetOperationService.registerAssetOperation(assetOperation.name, assetOperation.inputMaterials.map(m => m.id), assetOperation.outputMaterial.id, assetOperation.latitude, assetOperation.longitude, assetOperation.processTypes);
    }

    async getAssetOperations(): Promise<AssetOperationPresentable[]> {
        const assetOperations = await this._assetOperationService.getAssetOperationsOfCreator(this._walletAddress);
        return await Promise.all(assetOperations.map(async a => {
            const outputMaterial = await this._materialService.getMaterial(a.outputMaterial.id);
            return new AssetOperationPresentable()
                .setId(a.id)
                .setName(a.name)
                .setOutputMaterial(new MaterialPresentable().setId(outputMaterial.id).setName(outputMaterial.productCategory.name))
        }));
    }

    async getRawAssetOperations(): Promise<AssetOperation[]> {
        return this._assetOperationService.getAssetOperationsOfCreator(this._walletAddress);
    }

    async getAssetOperationById(id: number): Promise<AssetOperationPresentable | undefined> {
        const assetOperation = await this._assetOperationService.getAssetOperation(id);
        if (!assetOperation) return undefined;
        const outputMaterial = await this._materialService.getMaterial(assetOperation.outputMaterial.id);
        return new AssetOperationPresentable()
            .setId(assetOperation.id)
            .setName(assetOperation.name)
            .setOutputMaterial(new MaterialPresentable().setId(outputMaterial.id).setName(outputMaterial.productCategory.name))
            .setInputMaterials(assetOperation.inputMaterials.map(m => new MaterialPresentable().setId(m.id).setName(m.productCategory.name)));
    }
}
