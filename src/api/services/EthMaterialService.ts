import {Service} from "./Service";
import {Material, MaterialService, ProductCategory, ProductCategoryService} from "@kbc-lib/coffee-trading-management-lib";
import {BlockchainLibraryUtils} from "../BlockchainLibraryUtils";

export class EthMaterialService extends Service {
    private readonly _productCategoryService: ProductCategoryService;
    private readonly _materialService: MaterialService;

    constructor() {
        super();
        this._productCategoryService = BlockchainLibraryUtils.getProductCategoryService();
        this._materialService = BlockchainLibraryUtils.getMaterialService();
    }

    async getProductCategories(): Promise<ProductCategory[]> {
        return this._productCategoryService.getProductCategories();
    }

    getProductCategory(id: number): Promise<ProductCategory> {
        return this._productCategoryService.getProductCategory(id);
    }

    async saveProductCategory(name: string, quality: number, description: string): Promise<void> {
        await this._productCategoryService.registerProductCategory(name, quality, description);
    }

    async saveMaterial(productCategoryId: number): Promise<void> {
        await this._materialService.registerMaterial(productCategoryId);
    }

    async getMaterials(): Promise<Material[]> {
        return this._materialService.getMaterialsOfCreator(this._walletAddress);
    }
}
