import { createEthereumProvider } from '@/utils/walletConnect';
import EthereumProvider from '@walletconnect/ethereum-provider';
import { PROJECT_ID } from '@/constants/walletConnect';

jest.mock('@walletconnect/ethereum-provider', () => ({
    __esModule: true,
    default: {
        init: jest.fn()
    }
}));

describe('walletConnect', () => {
    const mockInit = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (EthereumProvider.init as jest.Mock).mockImplementation(mockInit);
    });

    describe('createEthereumProvider', () => {
        it('should call EthereumProvider.init with the correct parameters', async () => {
            await createEthereumProvider();
            expect(mockInit).toHaveBeenCalledTimes(1);
            expect(mockInit).toHaveBeenCalledWith({
                projectId: PROJECT_ID,
                metadata: {
                    name: 'Alcomex platform',
                    description: 'A portal to decentralized coffee trading',
                    url: 'https://xd4om-uqaaa-aaaam-aclya-cai.icp0.io/',
                    icons: [
                        'https://media.licdn.com/dms/image/C4D0BAQFdvo0UQVHVOQ/company-logo_200_200/0/1630488712072?e=2147483647&v=beta&t=2eNF5yIqHWYMfYGWa5IZ4fb-qMwCiJ2wgMiazq_OLa0'
                    ]
                },
                showQrModal: false,
                optionalChains: [222, 17000, 11155420],
                rpcMap: {
                    222: 'https://testnet-3achain-rpc.noku.io',
                    17000: 'https://ethereum-holesky-rpc.publicnode.com',
                    11155420: 'https://sepolia.optimism.io'
                }
            });
        });
    });
});
