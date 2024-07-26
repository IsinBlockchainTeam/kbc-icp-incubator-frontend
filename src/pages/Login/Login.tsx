import React, { useEffect, useState } from 'react';
import styles from './Login.module.scss';
import { Card, QRCode, Steps } from 'antd';
import VeramoLogin from './VeramoLogin';
import { useWeb3ModalAccount } from '@web3modal/ethers5/react';
import { PROJECT_ID } from '@/constants/walletConnect';
import EthereumProvider, { EthereumProviderOptions } from '@walletconnect/ethereum-provider';
import { JsonRpcSigner } from '@ethersproject/providers';
import { ethers } from 'ethers';
import { useSigner } from '@/providers/SignerProvider';

function WalletConnectLogin() {
    // return (
    //     <Flex style={{ justifyContent: 'center' }} role={'wallet-connect-container'}>
    //         <w3m-button />
    //     </Flex>
    // );
    const { setSigner } = useSigner();
    const [initialized, setInitialized] = useState<boolean>(false);
    const [provider, setProvider] = useState<any>();
    const [uri, setUri] = useState<string>();

    const init = async () => {
        const provider = await EthereumProvider.init({
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
            namespaces: {
                eip155: {
                    methods: ['eth_sendTransaction', 'eth_signTransaction', 'personal_sign'],
                    chains: [222],
                    events: ['accountsChanged', 'networkChanged']
                }
            },
            optionalChains: [222],
            rpcMap: {
                222: 'https://testnet-3achain-rpc.noku.io'
            }
        } as EthereumProviderOptions);

        setProvider(provider);
        setInitialized(true);
    };

    useEffect(() => {
        if (!initialized) init();
    }, [initialized]);

    const onConnect = async () => {
        console.log('connected!');
        const ethersProvider = new ethers.providers.Web3Provider(provider);
        console.log('ethersProvider', ethersProvider);
        const account = await ethersProvider.getSigner().getAddress();
        const ethersSigner = ethersProvider.getSigner(account);
        console.log('ethersSigner', ethersSigner);
        setSigner(ethersSigner);
    };

    useEffect(() => {
        if (!provider) return;

        provider.on('display_uri', (uri: string) => {
            console.log('display_uri', uri);
            setUri(uri);
        });
        provider.on('connect', (args: any) => {
            console.log('event connect');
            console.log('args', args);
            onConnect();
        });

        (async () => {
            await provider.connect();
            console.log('connected!!!');
        })();
    }, [provider]);

    return <>{uri && <QRCode value={uri} />}</>;
}

export const Login = () => {
    const { isConnected } = useWeb3ModalAccount();
    const [current, setCurrent] = useState<number>(isConnected ? 1 : 0);
    const steps = [
        {
            title: 'WalletConnect Login',
            content: <WalletConnectLogin />
        },
        {
            title: 'SSI Login',
            content: <VeramoLogin />
        }
    ];

    const onChange = (current: number) => {
        // if (!isConnected) return;
        setCurrent(current);
    };

    useEffect(() => {
        if (isConnected) setCurrent(1);
    }, [isConnected]);

    return (
        <div className={styles.LoginContainer}>
            <Card style={{ width: '100%', padding: 20 }}>
                <Steps
                    current={current}
                    items={steps}
                    onChange={onChange}
                    style={{ paddingLeft: '10%', paddingRight: '10%' }}
                />
                <div style={{ padding: 30 }}>{steps[current].content}</div>
            </Card>
        </div>
    );
};

export default Login;
