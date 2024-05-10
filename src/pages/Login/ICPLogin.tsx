import {Button, Col, Flex, Image, Row, Typography} from "antd";
import React, {useEffect} from "react";
import {
    ICPIdentityDriver, ICPOrganizationDriver, ICPStorageDriver
} from "@blockchain-lib/common";
import {AuthClient} from "@dfinity/auth-client";
import {Identity} from "@dfinity/agent";
import {ICPFileDriver} from "@kbc-lib/coffee-trading-management-lib";
import {checkAndGetEnvironmentVariable} from "../../utils/utils";
import {ICP} from "../../constants";

const Text = Typography.Text;

export const ICPLogin = () => {
    const [identityDriver, setIdentityDriver] = React.useState<ICPIdentityDriver | null>(null);

    useEffect(() => {
        try {
            const identityDriver = ICPIdentityDriver.getInstance();
            setIdentityDriver(identityDriver);
        } catch (e) {}
    }, []);

    const icpLogin = async () => {
        const driverCanisterIds = {
            organization: checkAndGetEnvironmentVariable(ICP.CANISTER_ID_ORGANIZATION),
            storage: checkAndGetEnvironmentVariable(ICP.CANISTER_ID_STORAGE),
        }
        const identityProvider =
            process.env.DFX_NETWORK === "ic"
                ? "https://identity.ic0.app"
                : `http://${checkAndGetEnvironmentVariable(ICP.CANISTER_ID_INTERNET_IDENTITY)}.localhost:4943`;
        console.log("identityProvider", identityProvider)
        const authClient: AuthClient = await AuthClient.create();
        await authClient.login({
            identityProvider,
            onSuccess: async () => {
                const identity: Identity = authClient.getIdentity();
                await ICPOrganizationDriver.init(identity, driverCanisterIds.organization);
                await ICPStorageDriver.init(identity, driverCanisterIds.storage);
                ICPFileDriver.init();
            }
        });
        ICPIdentityDriver.init(authClient);
        setIdentityDriver(ICPIdentityDriver.getInstance());
    }

    const icpLogout = async () => {
        if (!identityDriver) return;
        await identityDriver.logout();
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
