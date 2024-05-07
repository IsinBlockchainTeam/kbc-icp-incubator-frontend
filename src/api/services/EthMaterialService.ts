import {Service} from "./Service";
import {MaterialService, ProductCategoryService} from "@kbc-lib/coffee-trading-management-lib";
import {BlockchainLibraryUtils} from "../BlockchainLibraryUtils";
import {MaterialPresentable} from "../types/MaterialPresentable";
import {ProductCategoryPresentable} from "../types/ProductCategoryPresentable";

export class EthMaterialService extends Service {
    private readonly _productCategoryService: ProductCategoryService;
    private readonly _materialService: MaterialService;

    constructor() {
        super();
        this._productCategoryService = BlockchainLibraryUtils.getProductCategoryService();
        this._materialService = BlockchainLibraryUtils.getMaterialService();
    }

    async getProductCategories() {
        const productCategories = await this._productCategoryService.getProductCategories();
        return productCategories.map(pc => new ProductCategoryPresentable(
            pc.id,
            pc.name,
            pc.quality,
        ));
    }

    async saveProductCategory(name: string, quality: number, description: string): Promise<void> {
        await this._productCategoryService.registerProductCategory(name, quality, description);
    }

    async saveMaterial(productCategoryId: number): Promise<void> {
        await this._materialService.registerMaterial(productCategoryId);
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
