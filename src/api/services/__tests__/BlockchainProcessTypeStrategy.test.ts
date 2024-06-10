import { getWalletAddress } from '../../../../utils/storage';
import { UseBlockchainLibraryUtils } from '../../../hooks/useBlockchainLibraryUtils';
import { BlockchainProcessTypeStrategy } from '../../strategies/process_type/BlockchainProcessTypeStrategy';

jest.mock('../../../hooks/useBlockchainLibraryUtils');

describe('BlockchainProcessTypeStrategy', () => {
    const walletAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
    const processTypes = ['process type 1', 'process type 2', 'process type 3'];

    let blockchainProcessTypeStrategy: BlockchainProcessTypeStrategy;
    const mockedGetTypesList = jest.fn().mockResolvedValue(processTypes);

    describe('getProcessTypes', () => {
        beforeEach(() => {
            (getWalletAddress as jest.Mock).mockReturnValue(walletAddress);
            UseBlockchainLibraryUtils.getEnumerableTypeService = jest.fn().mockReturnValue({
                getTypesList: mockedGetTypesList
            });

            blockchainProcessTypeStrategy = new BlockchainProcessTypeStrategy();
        });

        it('should return an array of process types', async () => {
            const result = await blockchainProcessTypeStrategy.getAllProcessTypes();

            expect(result).toEqual(processTypes);

            expect(mockedGetTypesList).toHaveBeenCalled();
        });
    });
});
