import {TransformationStrategy} from "./TransformationStrategy";
import {TransformationPresentable} from "../../types/TransformationPresentable";
import {Strategy} from "../Strategy";
import {
    MaterialService,
    Transformation, TransformationService
} from "@kbc-lib/coffee-trading-management-lib";
import {BlockchainLibraryUtils} from "../../BlockchainLibraryUtils";
import {MaterialPresentable} from "../../types/MaterialPresentable";

export class BlockchainTransformationStrategy extends Strategy implements TransformationStrategy<TransformationPresentable, Transformation> {
    private readonly _transformationService: TransformationService;
    private readonly _materialService: MaterialService;

    constructor() {
        super(true);
        this._transformationService = BlockchainLibraryUtils.getTransformationService();
        this._materialService = BlockchainLibraryUtils.getMaterialService();
    }
    async getRawTransformations(): Promise<Transformation[]> {
        return this._transformationService.getTransformations(this._walletAddress);
    }

    async getTransformations(): Promise<TransformationPresentable[]> {
        const transformations = await this._transformationService.getTransformations(this._walletAddress);
        return await Promise.all(transformations.map(async t => {
            const outputMaterial = await this._materialService.getMaterial( t.outputMaterialId);
            return new TransformationPresentable()
                .setId(t.id)
                .setName(t.name)
                .setOutputMaterial(new MaterialPresentable().setId(outputMaterial.id).setName(outputMaterial.name))
        }));
    }

    async getTransformationById(id: number): Promise<TransformationPresentable | undefined> {
        const transformation = await this._transformationService.getTransformation( id);
        if (!transformation) return undefined;
        const outputMaterial = await this._materialService.getMaterial( transformation.outputMaterialId);
        return new TransformationPresentable()
            .setId(transformation.id)
            .setName(transformation.name)
            .setOutputMaterial(new MaterialPresentable().setId(outputMaterial.id).setName(outputMaterial.name))
            .setInputMaterials(transformation.inputMaterials.map(m => new MaterialPresentable().setId(m.id).setName(m.name)));
    }

}
