import { UseBlockchainLibraryUtils } from '../../../hooks/useBlockchainLibraryUtils';
import { getWalletAddress } from '../../../../utils/storage';
import { BlockchainGraphStrategy } from '../../strategies/graph/BlockchainGraphStrategy';

jest.mock('../../../../utils/storage');
jest.mock('../../../BlockchainLibraryUtils');

describe('BlockchainGraphStrategy', () => {
    const mockedComputeGraph = jest.fn();

    const walletAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
    let blockchainGraphStrategy: BlockchainGraphStrategy;

    beforeAll(() => {
        (getWalletAddress as jest.Mock).mockReturnValue(walletAddress);
        UseBlockchainLibraryUtils.getGraphService = jest.fn().mockReturnValue({
            computeGraph: mockedComputeGraph
        });
        blockchainGraphStrategy = new BlockchainGraphStrategy();
    });

    afterEach(() => jest.clearAllMocks());

    it('should compute a graph', async () => {
        await blockchainGraphStrategy.computeGraph(1);

        expect(mockedComputeGraph).toHaveBeenCalledTimes(1);
        expect(mockedComputeGraph).toHaveBeenNthCalledWith(1, 1, true);
    });
});
