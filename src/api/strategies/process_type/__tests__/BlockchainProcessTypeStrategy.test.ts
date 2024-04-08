import {getWalletAddress} from "../../../../utils/storage";
import {BlockchainLibraryUtils} from "../../../BlockchainLibraryUtils";
import {BlockchainProcessTypeStrategy} from "../BlockchainProcessTypeStrategy";

jest.mock('../../BlockchainLibraryUtils');

describe('BlockchainProcessTypeStrategy', () => {
    const walletAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
    const processTypes = ['process type 1', 'process type 2', 'process type 3'];

    let blockchainProcessTypeStrategy: BlockchainProcessTypeStrategy;
    const mockedGetTypesList = jest.fn().mockResolvedValue(processTypes);

    describe('getProcessTypes', () => {

        beforeEach(() => {
            (getWalletAddress as jest.Mock).mockReturnValue(walletAddress);
            BlockchainLibraryUtils.getEnumerableTypeService = jest.fn().mockReturnValue({
                getTypesList: mockedGetTypesList,
            });

            blockchainProcessTypeStrategy = new BlockchainProcessTypeStrategy();
        });


        it('should return an array of process types', async () => {
            const result = await blockchainProcessTypeStrategy.getAllProcessTypes();

            expect(result).toEqual(processTypes);

            expect(mockedGetTypesList).toHaveBeenCalled()
        });
    });
});
