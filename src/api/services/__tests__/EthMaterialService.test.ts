import { EthMaterialService } from '@/api/services/EthMaterialService';
import {
    Material,
    MaterialDriver,
    MaterialService,
    ProductCategory,
    ProductCategoryDriver,
    ProductCategoryService
} from '@kbc-lib/coffee-trading-management-lib';

jest.mock('@kbc-lib/coffee-trading-management-lib');

describe('EthMaterialService', () => {
    let ethMaterialService: EthMaterialService;
    let productCategoryService: ProductCategoryService;
    let materialService: MaterialService;

    beforeEach(() => {
        productCategoryService = new ProductCategoryService({} as ProductCategoryDriver);
        materialService = new MaterialService({} as MaterialDriver);
        ethMaterialService = new EthMaterialService(
            'walletAddress',
            productCategoryService,
            materialService
        );
    });

    it('should successfully save product category', async () => {
        const productCategory = {
            name: 'Test',
            quality: 1,
            description: 'Test description'
        };

        await ethMaterialService.saveProductCategory(
            productCategory.name,
            productCategory.quality,
            productCategory.description
        );

        expect(productCategoryService.registerProductCategory).toHaveBeenCalledWith(
            productCategory.name,
            productCategory.quality,
            productCategory.description
        );
    });

    it('should successfully save material', async () => {
        await ethMaterialService.saveMaterial(1);

        expect(materialService.registerMaterial).toHaveBeenCalledWith(1);
    });

    it('should successfully fetch materials', async () => {
        materialService.getMaterialsOfCreator = jest.fn().mockResolvedValue([{} as Material]);

        const materials = await ethMaterialService.getMaterials();
        expect(materialService.getMaterialsOfCreator).toHaveBeenCalledWith('walletAddress');
        expect(materials).toBeDefined();
    });

    it('should successfully fetch product categories', async () => {
        productCategoryService.getProductCategories = jest
            .fn()
            .mockResolvedValue([{} as ProductCategory]);

        const productCategories = await ethMaterialService.getProductCategories();
        expect(productCategoryService.getProductCategories).toHaveBeenCalled();
        expect(productCategories).toBeDefined();
    });

    it('should successfully fetch product category by id', async () => {
        productCategoryService.getProductCategory = jest
            .fn()
            .mockResolvedValue({} as ProductCategory);

        const productCategory = await ethMaterialService.getProductCategory(1);
        expect(productCategoryService.getProductCategory).toHaveBeenCalledWith(1);
        expect(productCategory).toBeDefined();
    });
});
