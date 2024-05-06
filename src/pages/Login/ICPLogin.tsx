import {Button, Col, Flex, Image, Row, Typography} from "antd";
import React, {useEffect} from "react";
import {
    ICPIdentityDriver
} from "@blockchain-lib/common";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../redux/types";
import {updateIcpIdentityDriver} from "../../redux/reducers/authSlice";

const Text = Typography.Text;

export const ICPLogin = () => {
    const [icpIdentityDriver, setIcpIdentityDriver] = React.useState<ICPIdentityDriver | null>(null);
    const identityDriver = useSelector((state: RootState) => state.auth.icpIdentityDriver);
    const dispatch = useDispatch();

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
        setIcpIdentityDriver(identityDriver);
    }, [identityDriver]);

    return (
        <>
            <Row justify="center" align="middle" gutter={[16, 16]}>
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
