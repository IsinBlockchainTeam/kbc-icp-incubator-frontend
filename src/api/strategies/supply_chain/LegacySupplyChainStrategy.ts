import {Strategy} from "../Strategy";
import {SupplyChainStrategy} from "./SupplyChainStrategy";
import {SupplyChainInfoPresentable} from "@unece/cotton-fetch";
import SupplyChainInfoControllerApi from "../../controllers/unece/SupplyChainInfoControllerApi";

export class LegacySupplyChainStrategy extends Strategy implements SupplyChainStrategy<SupplyChainInfoPresentable> {

    constructor() {
        super(false);
    }
    async getSupplyChain(materialId: number): Promise<SupplyChainInfoPresentable> {
        return SupplyChainInfoControllerApi.getSupplyChain({
            materialId: materialId,
        });
    }

}
