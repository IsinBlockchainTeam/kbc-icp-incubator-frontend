import {
    AssetOperation,
    AssetOperationService,
    GraphService,
    Trade,
    TradeManagerService
} from '@kbc-lib/coffee-trading-management-lib';
import { BlockchainGraphData, EthGraphService } from '@/api/services/EthGraphService';
import { Signer } from 'ethers';
describe('EthGraphService', () => {
    let ethGraphService: EthGraphService;
    let graphService: GraphService;

    beforeEach(() => {
        graphService = new GraphService(
            {} as unknown as Signer,
            {} as unknown as TradeManagerService,
            {} as unknown as AssetOperationService
        );
        ethGraphService = new EthGraphService(graphService);
    });

    it('should successfully compute graph', async () => {
        const materialId = 1;
        const graphData: BlockchainGraphData = {
            nodes: [{ id: 1 } as AssetOperation],
            edges: [{ trade: {} as Trade, from: '1', to: '2' }]
        };
        graphService.computeGraph = jest.fn().mockResolvedValue(graphData);

        const result = await ethGraphService.computeGraph(materialId);

        expect(result).toEqual(graphData);
        expect(graphService.computeGraph).toHaveBeenCalledWith(materialId, true);
    });
});
