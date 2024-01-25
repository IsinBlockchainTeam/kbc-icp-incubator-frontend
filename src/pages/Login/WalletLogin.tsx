import {Button} from "antd";
import React, {useEffect} from "react";
import styles from "./Login.module.scss";
import {getWalletAddress, setWalletAddress, unsetWalletAddress} from "../../utils/storage";
import {NotificationType, openNotification} from "../../utils/notification";
import {useNavigate} from "react-router-dom";
import {paths} from "../../constants";

export const WalletLogin = () => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = React.useState<boolean>();
    const walletConnect = async () => {
        if (window.ethereum !== undefined) {
            console.log('MetaMask is installed!');
            try {
                // @ts-ignore
                const resp = await window.ethereum.request({method: "eth_requestAccounts"});
                setWalletAddress(resp[0]);
                openNotification("Login", "Success login with Metamask", NotificationType.SUCCESS);
            }
            catch (e) {
                console.log("Error during Metamask interaction: ", e);
                openNotification("Error", "Error during Metamask interaction", NotificationType.ERROR);
                unsetWalletAddress();
            }
        }
        else {
            console.log("Metamask is not installed");
            openNotification("Error", "Metamask is not installed", NotificationType.ERROR);
        }
        navigate(paths.HOME);
    }

    const walletDisconnect = () => {
        unsetWalletAddress();
        openNotification("Logout", "Success logout from Metamask", NotificationType.SUCCESS);
        navigate(paths.HOME);
    }

    useEffect(() => {
        setIsLoggedIn(getWalletAddress() !== null);
    }, []);

    return (
        <div className={styles.ContentContainer}>
            { isLoggedIn ?
                <Button className={styles.ChildContent} onClick={walletDisconnect}>Metamask Logout</Button>
                :
                <Button className={styles.ChildContent} onClick={walletConnect}>Metamask Login</Button>
            }
        </div>
    )
}
