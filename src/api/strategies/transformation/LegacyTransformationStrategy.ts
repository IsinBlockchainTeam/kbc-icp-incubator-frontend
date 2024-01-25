import {TransformationStrategy} from "./TransformationStrategy";
import TransformationPlanControllerApi from "../../controllers/unece/TransformationPlanControllerApi";
import {TransformationPlanPresentable} from "@unece/cotton-fetch";
import {Strategy} from "../Strategy";
import Transformation from "../../../models/Transformation";

export class LegacyTransformationStrategy extends Strategy implements TransformationStrategy<TransformationPlanPresentable, Transformation> {
    constructor() {
        super(false);
    }
    async getTransformations(): Promise<TransformationPlanPresentable[]> {
        return TransformationPlanControllerApi.getAllMyTransformationPlans();
        // const transformations = await TransformationPlanControllerApi.getAllMyTransformationPlans();
        // return transformations.map(t =>
        //     new TransformationPresentable()
        //         .setName(t.name!)
        //         .setInputMaterials(t.inputPositions!.map(p => new MaterialPresentable().setName(p.contractorMaterialName!)))
        //         .setOutputMaterial(new MaterialPresentable().setName(t.outputMaterial!.name!))
        // );
    }

    async getTransformationById(id: number): Promise<TransformationPlanPresentable> {
        return TransformationPlanControllerApi.getTransformationPlan({id});
    }

}
