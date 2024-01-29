import {MaterialStrategy} from "./MaterialStrategy";
import {MaterialPresentable} from "../../types/MaterialPresentable";
import {Strategy} from "../Strategy";
import {MaterialService} from "@kbc-lib/coffee-trading-management-lib";
import {BlockchainLibraryUtils} from "../../BlockchainLibraryUtils";

export class BlockchainMaterialStrategy extends Strategy implements MaterialStrategy<MaterialPresentable> {
    private readonly _materialService: MaterialService;

    constructor() {
        super(true);
        this._materialService = BlockchainLibraryUtils.getMaterialService();
    }
    async getMaterials(): Promise<MaterialPresentable[]> {
        const materials = await this._materialService.getMaterialsOfCreator(this._walletAddress);
        return materials.map(m =>
            new MaterialPresentable()
                .setId(m.id)
                .setName(m.productCategory.name)
        );
    }

}
