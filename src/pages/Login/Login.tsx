import React, {useEffect, useState} from 'react';
import styles from './Login.module.scss';
import {Card, QRCode} from 'antd';
import VeramoLogin from './VeramoLogin';
import { useWeb3Modal } from '@web3modal/ethers5/react';
import { EthereumProvider } from '@walletconnect/ethereum-provider';
import {EthereumProviderOptions} from "@walletconnect/ethereum-provider/dist/types/EthereumProvider";

function WalletConnectLib() {
    const {open} = useWeb3Modal();

    return (
        <>
            <button onClick={() => open()}>Open Connect Modal</button>
            <button onClick={() => open({view: 'Networks'})}>Open Network Modal</button>
        </>
    );
}

function WalletConnectComponent() {
    const [initialized, setInitialized] = useState<boolean>(false);
    const [provider, setProvider] = useState<any>();
    const [uri, setUri] = useState<string>();

    const init = async () => {
        const provider = await EthereumProvider.init({
            projectId: 'e55dee800a9c2117a91613b30aa697ee',
            metadata: {
                name: 'KBC platform',
                description: 'A portal to decentralized coffee trading',
                url: 'http://192.168.0.173:3000',
                icons: [
                    'https://media.licdn.com/dms/image/C4D0BAQFdvo0UQVHVOQ/company-logo_200_200/0/1630488712072?e=2147483647&v=beta&t=2eNF5yIqHWYMfYGWa5IZ4fb-qMwCiJ2wgMiazq_OLa0'
                ]
            },
            showQrModal: false,
            optionalChains: [11155111],
        } as EthereumProviderOptions);
        setProvider(provider);
        setInitialized(true);
    }

    const generateUri = async () => {
        await provider.connect();
    }

    useEffect(() => {
        if(!initialized) init();
    }, [initialized]);

    useEffect(() => {
        if(!provider) return;

        provider.on('display_uri', (uri: string) => {
            console.log('display_uri', uri);
            setUri(uri);
        })

        generateUri();
    }, [provider]);

    const showSession = async () => {
        console.log('Session:', provider.session);
        console.log('Provider:', provider.getProvider());
        const result = await provider.request({ method: 'personal_sign', params:
                ["0x3132372e302e302e312077616e747320796f7520746f207369676e20696e207769746820796f757220457468657265756d206163636f756e743a0a3078333139464645443761373144334344323261454562354338313543383866306432623139443132330a0a4c6f67696e20746f2074686520534957452f49430a0a5552493a20687474703a2f2f3132372e302e302e313a353137330a56657273696f6e3a20310a436861696e2049443a20310a4e6f6e63653a2034653666373432303639366532303735373336350a4973737565642041743a20323032342d30372d31385430363a35323a32302e3338373333363230345a0a45787069726174696f6e2054696d653a20323032342d30372d31385430363a35373a32302e3338373333363230345a", "0x319ffed7a71d3cd22aeeb5c815c88f0d2b19d123"]
            });
        console.log('Result:', result)
    }

    return(
        <>
            {uri && <QRCode value={uri}/>}
            <button onClick={showSession}>Show Session</button>
        </>

    )
}

export const Login = () => {
    const [activeLoginTab, setActiveLoginTab] = useState<string>('vc_login');

    const tabList = [
        {key: 'vc_login', tab: 'Verifiable Credential Login'},
        {key: 'wallet_connect_lib', tab: 'Wallet Connect Lib'},
        {key: 'wallet_connect_custom', tab: 'Wallet Connect Custom'}
    ];

    const contentList: Record<string, React.ReactNode> = {
        vc_login: <VeramoLogin/>,
        wallet_connect_lib: <WalletConnectLib/>,
        wallet_connect_custom: <WalletConnectComponent/>
    };

    return (
        <div className={styles.LoginContainer}>
            <Card
                style={{width: '100%'}}
                tabList={tabList}
                activeTabKey={activeLoginTab}
                onTabChange={(key) => setActiveLoginTab(key)}>
                {contentList[activeLoginTab]}
            </Card>
        </div>
    );
};

export default Login;
