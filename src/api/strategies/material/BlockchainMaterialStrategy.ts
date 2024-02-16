import {MaterialStrategy} from "./MaterialStrategy";
import {MaterialPresentable} from "../../types/MaterialPresentable";
import {Strategy} from "../Strategy";
import {MaterialService, ProductCategoryService} from "@kbc-lib/coffee-trading-management-lib";
import {BlockchainLibraryUtils} from "../../BlockchainLibraryUtils";

export class BlockchainMaterialStrategy extends Strategy implements MaterialStrategy<MaterialPresentable> {
    private readonly _productCategoryService: ProductCategoryService;
    private readonly _materialService: MaterialService;

    constructor() {
        super(true);
        this._productCategoryService = BlockchainLibraryUtils.getProductCategoryService();
        this._materialService = BlockchainLibraryUtils.getMaterialService();
    }

    async saveProductCategory(name: string, quality: number, description: string): Promise<void> {
        await this._productCategoryService.registerProductCategory(name, quality, description);
    }

    async saveMaterial(productCategoryId: number): Promise<void> {
        await this._materialService.registerMaterial(productCategoryId);
    }

    async getMaterials(): Promise<MaterialPresentable[]> {
        console.log(this._walletAddress);
        const materials = await this._materialService.getMaterialsOfCreator(this._walletAddress);
        console.log(materials);
        return materials.map(m =>
            new MaterialPresentable()
                .setId(m.id)
                .setName(m.productCategory.name)
        );
    }

}
