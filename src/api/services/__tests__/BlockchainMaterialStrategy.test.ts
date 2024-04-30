import {BlockchainLibraryUtils} from "../../BlockchainLibraryUtils";
import {BlockchainMaterialStrategy} from "../../strategies/material/BlockchainMaterialStrategy";
import {getWalletAddress} from "../../../../utils/storage";
import {Material, ProductCategory} from "../coffee-trading-management-lib/src/index";
import {MaterialPresentable} from "../../types/MaterialPresentable";

jest.mock("../../../../utils/storage");
jest.mock("../../../BlockchainLibraryUtils");

describe('BlockchainMaterialStrategy', () => {
    const mockedRegisterProductCategory = jest.fn();
    const mockedRegisterMaterial = jest.fn();
    const mockedGetMaterialsOfCreator = jest.fn();

    const walletAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
    let blockchainMaterialStrategy: BlockchainMaterialStrategy;

    beforeAll(() => {
        (getWalletAddress as jest.Mock).mockReturnValue(walletAddress);
        BlockchainLibraryUtils.getProductCategoryService = jest.fn().mockReturnValue({
            registerProductCategory: mockedRegisterProductCategory,
        });
        BlockchainLibraryUtils.getMaterialService = jest.fn().mockReturnValue({
            registerMaterial: mockedRegisterMaterial,
            getMaterialsOfCreator: mockedGetMaterialsOfCreator,
        });
        blockchainMaterialStrategy = new BlockchainMaterialStrategy();
    });

    afterEach(() => jest.clearAllMocks());

    it('should save a product category', async () => {
        await blockchainMaterialStrategy.saveProductCategory('name', 1, 'description');

        expect(mockedRegisterProductCategory).toHaveBeenCalledTimes(1);
        expect(mockedRegisterProductCategory).toHaveBeenNthCalledWith(1, 'name', 1, 'description');
    });

    it('should save a material', async () => {
        await blockchainMaterialStrategy.saveMaterial(1);

        expect(mockedRegisterMaterial).toHaveBeenCalledTimes(1);
        expect(mockedRegisterMaterial).toHaveBeenNthCalledWith(1, 1);
    });

    it('should get materials', async () => {
        mockedGetMaterialsOfCreator.mockReturnValueOnce([
            new Material(1, new ProductCategory(1, 'name', 1, 'description')),
            new Material(2, new ProductCategory(2, 'name2', 2, 'description2')),
        ]);
        const result = await blockchainMaterialStrategy.getMaterials();

        expect(result).toEqual([
            new MaterialPresentable(1, 'name'),
            new MaterialPresentable(2, 'name2'),
        ]);
        expect(mockedGetMaterialsOfCreator).toHaveBeenCalledTimes(1);
        expect(mockedGetMaterialsOfCreator).toHaveBeenNthCalledWith(1, walletAddress);
    });
});
