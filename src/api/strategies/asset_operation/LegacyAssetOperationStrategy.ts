import {AssetOperationStrategy} from "./AssetOperationStrategy";
import TransformationPlanControllerApi from "../../controllers/unece/TransformationPlanControllerApi";
import {TransformationPlanPresentable} from "@unece/cotton-fetch";
import {Strategy} from "../Strategy";
import AssetOperation from "../../../models/AssetOperation";

export class LegacyAssetOperationStrategy extends Strategy implements AssetOperationStrategy<TransformationPlanPresentable, AssetOperation> {
    constructor() {
        super(false);
    }
    async getAssetOperations(): Promise<TransformationPlanPresentable[]> {
        return TransformationPlanControllerApi.getAllMyTransformationPlans();
        // const transformations = await TransformationPlanControllerApi.getAllMyTransformationPlans();
        // return transformations.map(t =>
        //     new TransformationPresentable()
        //         .setName(t.name!)
        //         .setInputMaterials(t.inputPositions!.map(p => new MaterialPresentable().setName(p.contractorMaterialName!)))
        //         .setOutputMaterial(new MaterialPresentable().setName(t.outputMaterial!.name!))
        // );
    }

    async getAssetOperationById(id: number): Promise<TransformationPlanPresentable> {
        return TransformationPlanControllerApi.getTransformationPlan({id});
    }

}
