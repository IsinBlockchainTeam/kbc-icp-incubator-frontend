import {Button, Col, DatePicker, Flex, Image, Row, Typography} from "antd";
import React, {useEffect} from "react";
import styles from "./Login.module.scss";
import {getWalletAddress, setWalletAddress, unsetWalletAddress} from "../../utils/storage";
import {NotificationType, openNotification} from "../../utils/notification";
import {useNavigate} from "react-router-dom";
import {paths} from "../../constants";
import {
    ICPIdentityDriver
} from "@blockchain-lib/common";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../redux/types";
import {updateIcpIdentityDriver, updateSubjectClaims} from "../../redux/reducers/authSlice";
import dayjs from "dayjs";

const Text = Typography.Text;

export const WalletLogin = () => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = React.useState<boolean>();
    const [icpIdentityDriver, setIcpIdentityDriver] = React.useState<ICPIdentityDriver | null>(null);
    const identityDriver = useSelector((state: RootState) => state.auth.icpIdentityDriver);
    const dispatch = useDispatch();

    const walletConnect = async () => {
        if (window.ethereum !== undefined) {
            console.log('MetaMask is installed!');
            try {
                // @ts-ignore
                const resp = await window.ethereum.request({method: "eth_requestAccounts"});
                setWalletAddress(resp[0]);
                openNotification("Login", "Success login with Metamask", NotificationType.SUCCESS);
            } catch (e) {
                console.log("Error during Metamask interaction: ", e);
                openNotification("Error", "Error during Metamask interaction", NotificationType.ERROR);
                unsetWalletAddress();
            }
        } else {
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

    const icpLogin = async () => {
        // await storageDriver?.login(process.env.REACT_APP_CANISTER_ID_INTERNET_IDENTITY!);
        const driverCanisterIds = {
            organization: process.env.REACT_APP_CANISTER_ID_ORGANIZATION!,
            storage: process.env.REACT_APP_CANISTER_ID_STORAGE!,
        }
        const identityDriver = new ICPIdentityDriver(`http://${process.env.REACT_APP_CANISTER_ID_INTERNET_IDENTITY!}.localhost:4943`, driverCanisterIds);
        await identityDriver.login();
        setIcpIdentityDriver(identityDriver);
        dispatch(updateIcpIdentityDriver(identityDriver));
    }

    const icpLogout = async () => {
        if(!icpIdentityDriver) return;
        await icpIdentityDriver.logout();
        setIcpIdentityDriver(null);
        dispatch(updateIcpIdentityDriver(null));
    }

    useEffect(() => {
        setIsLoggedIn(getWalletAddress() !== null);
    }, []);

    useEffect(() => {
        setIcpIdentityDriver(identityDriver);
    }, [identityDriver]);

    // const date = 2024-04-18

    return (
        <>
            <Row justify="center" align="middle" gutter={[16, 16]}>
                <Col xs={24} xl={24} style={{textAlign: "center"}}>
                        <Button className={styles.ChildContent} onClick={isLoggedIn ? walletDisconnect : walletConnect}>
                            <Flex justify="center" align="middle" gap={"10px"}>
                                <Image
                                    src="/metamask-logo.png"
                                    preview={false}
                                    alt="Metamask Logo"
                                    width={20}
                                />
                                <Text>{isLoggedIn ? "Logout from" : "Login with" } Metamask</Text>
                            </Flex>
                        </Button>
                </Col>
                <Col xs={24} xl={24} style={{textAlign: "center"}}>
                    <Button size="large" onClick={icpIdentityDriver ? icpLogout: icpLogin}>
                        <Flex justify="center" align="middle" gap={"10px"}>
                            <Image
                                src="/icp-logo.png"
                                preview={false}
                                alt="Internet Computer Logo"
                                width={20}
                            />
                            <Text>{icpIdentityDriver ? "Logout from" : "Login with" } Internet Computer</Text>
                        </Flex>
                    </Button>
                </Col>
            </Row>
        </>
    )
}
