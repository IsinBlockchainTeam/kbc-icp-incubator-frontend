import React, { useState } from 'react';
import styles from './Login.module.scss';
import { Card } from 'antd';
import VeramoLogin from './VeramoLogin';
import { useWeb3Modal } from '@web3modal/ethers5/react';

function WalletConnect() {
    const { open } = useWeb3Modal();

    return (
        <>
            <button onClick={() => open()}>Open Connect Modal</button>
            <button onClick={() => open({ view: 'Networks' })}>Open Network Modal</button>
        </>
    );
}

export const Login = () => {
    const [activeLoginTab, setActiveLoginTab] = useState<string>('vc_login');

    const tabList = [
        { key: 'vc_login', tab: 'Verifiable Credential Login' },
        { key: 'wallet_connect', tab: 'Wallet Connect' }
    ];

    const contentList: Record<string, React.ReactNode> = {
        vc_login: <VeramoLogin />,
        wallet_connect: <WalletConnect />
    };

    return (
        <div className={styles.LoginContainer}>
            <Card
                style={{ width: '100%' }}
                tabList={tabList}
                activeTabKey={activeLoginTab}
                onTabChange={(key) => setActiveLoginTab(key)}>
                {contentList[activeLoginTab]}
            </Card>
        </div>
    );
};

export default Login;
