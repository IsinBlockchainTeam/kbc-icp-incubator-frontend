import React, { useEffect, useState } from 'react';
import styles from './Login.module.scss';
import { Card, QRCode, Steps } from 'antd';
import VeramoLogin from './VeramoLogin';
import { useWeb3ModalAccount } from '@web3modal/ethers5/react';
import { PROJECT_ID } from '@/constants/walletConnect';
import EthereumProvider, { EthereumProviderOptions } from '@walletconnect/ethereum-provider';
import { ethers } from 'ethers';
import { useSigner } from '@/providers/SignerProvider';
import { useWalletConnect } from '@/providers/WalletConnectProvider';
import { createEthereumProvider } from '@/utils/walletConnect';

function WalletConnectLogin() {
    // return (
    //     <Flex style={{ justifyContent: 'center' }} role={'wallet-connect-container'}>
    //         <w3m-button />
    //     </Flex>
    // );
    const { provider, setProvider, setConnected } = useWalletConnect();
    const [initialized, setInitialized] = useState<boolean>(false);
    const [uri, setUri] = useState<string>();

    const init = async () => {
        const provider = await createEthereumProvider();

        setProvider(provider);
        setInitialized(true);
    };

    useEffect(() => {
        if (!initialized) init();
    }, [initialized]);

    const onConnect = async () => {
        setConnected(true);
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
                {/*<Steps*/}
                {/*    current={current}*/}
                {/*    items={steps}*/}
                {/*    onChange={onChange}*/}
                {/*    style={{ paddingLeft: '10%', paddingRight: '10%' }}*/}
                {/*/>*/}
                {/*<div style={{ padding: 30 }}>{steps[current].content}</div>*/}
                <VeramoLogin />
            </Card>
        </div>
    );
};

export default Login;
