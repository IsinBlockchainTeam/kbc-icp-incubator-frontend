import {Button, Col, Flex, Image, Row, Typography} from "antd";
import React, {useContext, useEffect} from "react";
import {
    ICPIdentityDriver, ICPOrganizationDriver, ICPStorageDriver
} from "@blockchain-lib/common";
import {ICPContext} from "../../contexts/ICPProvider";
import {AuthClient} from "@dfinity/auth-client";
import {Identity} from "@dfinity/agent";
import {ICPMetadataDriver} from "@kbc-lib/coffee-trading-management-lib";

const Text = Typography.Text;

export const ICPLogin = () => {
    const {identityDriver, updateIdentityDriver} = useContext(ICPContext);

    const icpLogin = async () => {
        const driverCanisterIds = {
            organization: process.env.REACT_APP_CANISTER_ID_ORGANIZATION!,
            storage: process.env.REACT_APP_CANISTER_ID_STORAGE!,
        }
        const identityProvider = `http://${process.env.REACT_APP_CANISTER_ID_INTERNET_IDENTITY!}.localhost:4943`
        const authClient: AuthClient = await AuthClient.create();
        await authClient.login({
            identityProvider,
            onSuccess: async () => {
                console.log("logged in")
                const identity: Identity = authClient.getIdentity();
                await ICPOrganizationDriver.init(identity, driverCanisterIds.organization);
                await ICPStorageDriver.init(identity, driverCanisterIds.storage);
                ICPMetadataDriver.init();
            }
        });
        const identityDriver = new ICPIdentityDriver(authClient);
        updateIdentityDriver(identityDriver);
    }

    const icpLogout = async () => {
        if (!identityDriver) return;
        await identityDriver.logout();
        updateIdentityDriver(null);
    }

    const createOrganization = async () => {
        const organizationDriver = ICPOrganizationDriver.getInstance();
        await organizationDriver.createOrganization("Dunder Mifflin", "The best paper company in the world");
    }

    return (
        <>
            <Row justify="center" align="middle" gutter={[16, 16]}>
                <Col xs={24} xl={24} style={{textAlign: "center"}}>
                    <Button size="large" onClick={identityDriver ? icpLogout : icpLogin}>
                        <Flex justify="center" align="middle" gap={"10px"}>
                            <Image
                                src="/icp-logo.png"
                                preview={false}
                                alt="Internet Computer Logo"
                                width={20}
                            />
                            <Text>{identityDriver ? "Logout from" : "Login with"} Internet Computer</Text>
                        </Flex>
                    </Button>
                </Col>
                <Col xs={24} xl={24} style={{textAlign: "center"}}>
                    {identityDriver &&
                        <Button size="large" onClick={createOrganization}>
                            <Text>Create organization</Text>
                        </Button>
                    }
                </Col>
            </Row>
        </>
    )
}
