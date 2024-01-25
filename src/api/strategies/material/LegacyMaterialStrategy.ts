import {Strategy} from "../Strategy";
import {MaterialStrategy} from "./MaterialStrategy";
import {MaterialPresentable} from "@unece/cotton-fetch";
import MaterialControllerApi from "../../controllers/unece/MaterialControllerApi";

export class LegacyMaterialStrategy extends Strategy implements MaterialStrategy<MaterialPresentable> {
    constructor() {
        super(false);
    }
    async getMaterials(): Promise<MaterialPresentable[]> {
        const [outputMaterials, inputMaterials] = await Promise.all([
            MaterialControllerApi.getMaterialsByCompany({
                company: this._walletAddress,
                isInput: false,
                isForTransformation: false
            }),
            MaterialControllerApi.getMaterialsByCompany({
                company: this._walletAddress,
                isInput: true,
                isForTransformation: false
            })
        ]);
        return inputMaterials.concat(outputMaterials);
    }

}
