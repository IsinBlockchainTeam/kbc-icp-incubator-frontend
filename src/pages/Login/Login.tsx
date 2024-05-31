import React, {useEffect, useState} from "react";
import styles from './Login.module.scss';
import {Card} from "antd";
import VeramoLogin from "./VeramoLogin";
import {useWeb3Modal, useWeb3ModalAccount, useWeb3ModalProvider} from '@web3modal/ethers5/react';
import {updateWalletConnect} from "../../redux/reducers/walletConnectSlice";
import {useDispatch} from "react-redux";
import {ethers} from "ethers";

function WalletConnect() {
    const { open } = useWeb3Modal()
    const { address, chainId, isConnected } = useWeb3ModalAccount();
    const { walletProvider } = useWeb3ModalProvider();
    const dispatch = useDispatch();

    useEffect(() => {
        if(!isConnected || !walletProvider)
            return;

        console.log("ADDRESS:", address);
        const ethersProvider = new ethers.providers.Web3Provider(walletProvider);
        if(isConnected) {
            console.log("Updating wallet connect...");
            dispatch(updateWalletConnect({
                address,
                chainId,
                isConnected,
                walletProvider: ethersProvider,
            }))
        }
    }, [isConnected, walletProvider]);

    const sendTransaction = async () => {
        const ethersProvider = new ethers.providers.Web3Provider(walletProvider!);
        const signer = ethersProvider.getSigner();
        console.log("signer:", signer);

        // Create a transaction object
        const tx = {
            to: "0xb794f5ea0ba39494ce839613fffba74279579268", // Replace with the recipient's address
            value: ethers.utils.parseEther("0.1"), // Amount to send
            gasLimit: ethers.utils.hexlify(21000), // Basic transaction costs 21000 gas
            gasPrice: ethers.utils.hexlify(ethers.utils.parseUnits("10", "gwei")), // 10 Gwei
        };

        // Sign the transaction
        const signedTx = await signer.sendTransaction(tx);

        // Wait for the transaction to be mined
        const receipt = await signedTx.wait();

        console.log("Transaction receipt:", receipt);
    }

    return (
        <>
            <button onClick={() => open()}>Open Connect Modal</button>
            <button onClick={() => open({ view: 'Networks' })}>Open Network Modal</button>
            <button onClick={() => sendTransaction()}>Send transaction</button>
        </>
    );
}

export const Login = () => {
    const [activeLoginTab, setActiveLoginTab] = useState<string>("vc_login");

    const tabList = [
        { key: 'vc_login', tab: "Verifiable Credential Login"},
        { key: 'wallet_connect', tab: "Wallet Connect"},
    ];

    const contentList: Record<string, React.ReactNode> = {
        vc_login: <VeramoLogin />,
        wallet_connect: <WalletConnect />
    }

    return (
        <div className={styles.LoginContainer}>
            <Card
                style={{ width: '100%' }}
                tabList={tabList}
                activeTabKey={activeLoginTab}
                onTabChange={(key) => setActiveLoginTab(key)}
            >
                {contentList[activeLoginTab]}
            </Card>
        </div>
    )
}

export default Login;
