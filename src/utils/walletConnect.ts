import EthereumProvider from '@walletconnect/ethereum-provider';
import { PROJECT_ID } from '@/constants/walletConnect';

export async function createEthereumProvider(): Promise<EthereumProvider> {
    return EthereumProvider.init({
        projectId: PROJECT_ID,
        metadata: {
            name: 'KBC platform',
            description: 'A portal to decentralized coffee trading',
            url: 'https://xd4om-uqaaa-aaaam-aclya-cai.icp0.io/',
            icons: [
                'https://media.licdn.com/dms/image/C4D0BAQFdvo0UQVHVOQ/company-logo_200_200/0/1630488712072?e=2147483647&v=beta&t=2eNF5yIqHWYMfYGWa5IZ4fb-qMwCiJ2wgMiazq_OLa0'
            ]
        },
        showQrModal: false,
        // namespaces: {
        //     eip155: {
        //         methods: ['eth_sendTransaction', 'eth_signTransaction', 'personal_sign'],
        //         chains: [222],
        //         events: ['accountsChanged', 'networkChanged']
        //     }
        // },
        optionalChains: [222],
        rpcMap: {
            222: 'https://testnet-3achain-rpc.noku.io'
        }
    });
}
