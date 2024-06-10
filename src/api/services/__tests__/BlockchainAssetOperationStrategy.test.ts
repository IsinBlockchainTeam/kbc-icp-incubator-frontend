import { BlockchainAssetOperationStrategy } from '../../strategies/asset_operation/BlockchainAssetOperationStrategy';
import { getWalletAddress } from '../../../../utils/storage';
import { UseBlockchainLibraryUtils } from '../../../hooks/useBlockchainLibraryUtils';
import { AssetOperationPresentable } from '../../types/AssetOperationPresentable';
import { MaterialPresentable } from '../../types/MaterialPresentable';
import {
    AssetOperation,
    Material,
    ProductCategory
} from '../coffee-trading-management-lib/src/index';

jest.mock('../../../../utils/storage');
jest.mock('../../../BlockchainLibraryUtils');

describe('BlockchainAssetOperationStrategy', () => {
    const mockedRegisterAssetOperation = jest.fn();
    const mockedGetAssetOperationsOfCreator = jest.fn();
    const mockedGetAssetOperation = jest.fn();
    const mockedGetMaterial = jest.fn();

    const newAssetOperation: AssetOperationPresentable = new AssetOperationPresentable()
        .setName('asset operation')
        .setInputMaterials([new MaterialPresentable(1, 'input material')])
        .setOutputMaterial(new MaterialPresentable(2, 'output material'))
        .setLatitude('123')
        .setLongitude('456');
    const assetOperations = [
        new AssetOperation(
            1,
            'first asset operation',
            [new Material(1, new ProductCategory(1, 'input material', 1, 'description'))],
            new Material(2, new ProductCategory(2, 'output material', 2, 'description')),
            '123',
            '456',
            ['process type 1']
        )
    ];

    const walletAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
    let blockchainAssetOperationStrategy: BlockchainAssetOperationStrategy;

    beforeAll(() => {
        (getWalletAddress as jest.Mock).mockReturnValue(walletAddress);
        UseBlockchainLibraryUtils.getAssetOperationService = jest.fn().mockReturnValue({
            registerAssetOperation: mockedRegisterAssetOperation,
            getAssetOperationsOfCreator: mockedGetAssetOperationsOfCreator,
            getAssetOperation: mockedGetAssetOperation
        });
        UseBlockchainLibraryUtils.getMaterialService = jest.fn().mockReturnValue({
            getMaterial: mockedGetMaterial
        });
        blockchainAssetOperationStrategy = new BlockchainAssetOperationStrategy();
    });

    afterEach(() => jest.clearAllMocks());

    it('should save an asset operation', async () => {
        await blockchainAssetOperationStrategy.saveAssetOperation(newAssetOperation);

        expect(mockedRegisterAssetOperation).toHaveBeenCalledTimes(1);
        expect(mockedRegisterAssetOperation).toHaveBeenNthCalledWith(
            1,
            newAssetOperation.name,
            [newAssetOperation.inputMaterials[0].id],
            newAssetOperation.outputMaterial.id,
            newAssetOperation.latitude,
            newAssetOperation.longitude
        );
    });

    it('should get raw asset operations', async () => {
        mockedGetAssetOperationsOfCreator.mockReturnValueOnce(assetOperations);

        const result = await blockchainAssetOperationStrategy.getRawAssetOperations();

        expect(result).toEqual(assetOperations);
        expect(mockedGetAssetOperationsOfCreator).toHaveBeenCalledTimes(1);
        expect(mockedGetAssetOperationsOfCreator).toHaveBeenNthCalledWith(1, walletAddress);
    });

    it('should get asset operations', async () => {
        mockedGetAssetOperationsOfCreator.mockReturnValueOnce(assetOperations);
        mockedGetMaterial.mockReturnValueOnce(assetOperations[0].outputMaterial);
        const material = new MaterialPresentable(2, 'output material');

        const result = await blockchainAssetOperationStrategy.getAssetOperations();

        expect(result).toEqual(
            assetOperations.map((a) =>
                new AssetOperationPresentable(a.id, a.name).setOutputMaterial(material)
            )
        );
        expect(mockedGetAssetOperationsOfCreator).toHaveBeenCalledTimes(1);
        expect(mockedGetAssetOperationsOfCreator).toHaveBeenNthCalledWith(1, walletAddress);
        expect(mockedGetMaterial).toHaveBeenCalledTimes(1);
        expect(mockedGetMaterial).toHaveBeenNthCalledWith(1, assetOperations[0].outputMaterial.id);
    });

    it('should get an asset operation by id', async () => {
        mockedGetAssetOperation.mockReturnValueOnce(assetOperations[0]);
        mockedGetMaterial.mockReturnValueOnce(assetOperations[0].outputMaterial);
        const inputMaterial: MaterialPresentable = new MaterialPresentable(1, 'input material');
        const outputMaterial: MaterialPresentable = new MaterialPresentable(2, 'output material');
        const assetOperation: AssetOperationPresentable = new AssetOperationPresentable(
            1,
            'first asset operation'
        )
            .setInputMaterials([inputMaterial])
            .setOutputMaterial(outputMaterial);

        const result = await blockchainAssetOperationStrategy.getAssetOperationById(1);
        expect(result).toEqual(assetOperation);
        expect(mockedGetAssetOperation).toHaveBeenCalledTimes(1);
        expect(mockedGetAssetOperation).toHaveBeenNthCalledWith(1, 1);
        expect(mockedGetMaterial).toHaveBeenCalledTimes(1);
        expect(mockedGetMaterial).toHaveBeenNthCalledWith(1, assetOperations[0].outputMaterial.id);
    });

    it('should try to get an asset operation by id and return undefined if it does not exist', async () => {
        mockedGetAssetOperation.mockReturnValueOnce(undefined);
        const result = await blockchainAssetOperationStrategy.getAssetOperationById(42);

        expect(result).toBeUndefined();
        expect(mockedGetAssetOperation).toHaveBeenCalledTimes(1);
        expect(mockedGetAssetOperation).toHaveBeenNthCalledWith(1, 42);
    });
});
