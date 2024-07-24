import React, { useEffect, useState } from 'react';
import styles from './Login.module.scss';
import { Card, Flex, Steps } from 'antd';
import VeramoLogin from './VeramoLogin';
import { useWeb3ModalAccount } from '@web3modal/ethers5/react';

function WalletConnectLogin() {
    return (
        <Flex style={{ justifyContent: 'center' }}>
            <w3m-button />
        </Flex>
    );
}

export const Login = () => {
    const [current, setCurrent] = useState<number>(0);
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
    const { isConnected } = useWeb3ModalAccount();

    useEffect(() => {
        if (isConnected) {
            setCurrent(1);
        }
    }, [isConnected]);

    return (
        <div className={styles.LoginContainer}>
            <Card style={{ width: '100%', padding: 20 }}>
                <Steps
                    current={current}
                    items={steps}
                    style={{ paddingLeft: '10%', paddingRight: '10%' }}
                />
                <div style={{ padding: 30 }}>{steps[current].content}</div>
            </Card>
        </div>
    );
};

export default Login;
