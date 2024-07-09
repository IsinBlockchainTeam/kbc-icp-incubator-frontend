import {
    AssetOperation,
    AssetOperationDriver,
    AssetOperationService,
    MaterialDriver,
    MaterialService
} from '@kbc-lib/coffee-trading-management-lib';
import { EthAssetOperationService } from 'src/api/services/EthAssetOperationService';
import { AssetOperationRequest } from '@/api/types/AssetOperationRequest';

jest.mock('@kbc-lib/coffee-trading-management-lib');

describe('EthAssetOperationService', () => {
    let ethAssetOperationService: EthAssetOperationService;
    let assetOperationService: AssetOperationService;
    let materialService: MaterialService;

    beforeEach(() => {
        assetOperationService = new AssetOperationService({} as unknown as AssetOperationDriver);
        materialService = new MaterialService({} as MaterialDriver);
        ethAssetOperationService = new EthAssetOperationService(
            'walletAddress',
            assetOperationService,
            materialService
        );
    });

    it('should successfully save asset operation', async () => {
        const assetOperation: AssetOperationRequest = {
            name: 'Test',
            inputMaterialIds: [1, 2],
            outputMaterialId: 3,
            latitude: '10',
            longitude: '20',
            processTypes: ['type1', 'type2']
        };

        await ethAssetOperationService.saveAssetOperation(assetOperation);

        expect(assetOperationService.registerAssetOperation).toHaveBeenCalledWith(
            assetOperation.name,
            assetOperation.inputMaterialIds,
            assetOperation.outputMaterialId,
            assetOperation.latitude,
            assetOperation.longitude,
            assetOperation.processTypes
        );
    });

    it('should successfully fetch asset operations', async () => {
        assetOperationService.getAssetOperationsOfCreator = jest
            .fn()
            .mockResolvedValue([{} as AssetOperation]);

        const operations = await ethAssetOperationService.getAssetOperations();
        expect(assetOperationService.getAssetOperationsOfCreator).toHaveBeenCalledWith(
            'walletAddress'
        );
        expect(operations).toBeDefined();
    });

    it('should successfully fetch asset operation by id', async () => {
        assetOperationService.getAssetOperation = jest.fn().mockResolvedValue({} as AssetOperation);

        const operation = await ethAssetOperationService.getAssetOperationById(1);
        expect(assetOperationService.getAssetOperation).toHaveBeenCalledWith(1);
        expect(operation).toBeDefined();
    });
});
