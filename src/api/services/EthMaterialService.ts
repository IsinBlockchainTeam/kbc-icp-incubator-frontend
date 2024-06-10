import {Material, MaterialService, ProductCategory, ProductCategoryService} from "@kbc-lib/coffee-trading-management-lib";

export class EthMaterialService {
    private readonly _walletAddress: string;
    private readonly _productCategoryService: ProductCategoryService;
    private readonly _materialService: MaterialService;

    constructor(walletAddress: string, productCategoryService: ProductCategoryService, materialService: MaterialService) {
        this._walletAddress = walletAddress;
        this._productCategoryService = productCategoryService;
        this._materialService = materialService;
    }

    async getProductCategories(): Promise<ProductCategory[]> {
        return this._productCategoryService.getProductCategories();
    }

    getProductCategory(id: number): Promise<ProductCategory> {
        return this._productCategoryService.getProductCategory(id);
    }

    async saveProductCategory(name: string, quality: number, description: string): Promise<number> {
        return this._productCategoryService.registerProductCategory(name, quality, description);
    }

    async saveMaterial(productCategoryId: number): Promise<void> {
        await this._materialService.registerMaterial(productCategoryId);
    }

    async getMaterials(): Promise<Material[]> {
        return this._materialService.getMaterialsOfCreator(this._walletAddress);
    }
}
