import {Button, Card, Typography} from "antd";
import styles from "./Profile.module.scss";
import {useSelector} from "react-redux";
import {RootState} from "../../redux/store";
import {Navigate} from "react-router-dom";
import {ICP, paths} from "../../constants";
import SingletonSigner from "../../api/SingletonSigner";
import {useSiweIdentity} from "../../components/icp/SiweIdentityProvider/SiweIdentityProvider";
import React, {useEffect, useState} from "react";
import {
    ICPIdentityDriver,
    ICPOrganizationDriver, ICPStorageDriver
} from "@blockchain-lib/common";
import {ICPFileDriver} from "@kbc-lib/coffee-trading-management-lib";
import {checkAndGetEnvironmentVariable} from "../../utils/utils";
const { Title, Paragraph, Text } = Typography;
export default function Profile() {
    const { identity } = useSiweIdentity();
    const userInfo = useSelector((state: RootState) => state.userInfo);
    const [principal, setPrincipal] = useState<string>("");

    useEffect(() => {
        if(identity) {
            console.log("Identity is", identity);
            setPrincipal(identity.getPrincipal().toString());
            initDrivers();
        }
    }, [identity]);

    const initDrivers = () => {
        if(identity) {
            console.log("Initializing drivers...")
            const driverCanisterIds = {
                organization: checkAndGetEnvironmentVariable(ICP.CANISTER_ID_ORGANIZATION),
                storage: checkAndGetEnvironmentVariable(ICP.CANISTER_ID_STORAGE),
            }
            ICPOrganizationDriver.init(identity, driverCanisterIds.organization);
            ICPStorageDriver.init(identity, driverCanisterIds.storage);
            ICPFileDriver.init();
            ICPIdentityDriver.init(identity);
            console.log(ICPIdentityDriver.getInstance());
        }
    }

    const createOrganization = async () => {
        const organizationDriver = ICPOrganizationDriver.getInstance();
        const organization = await organizationDriver.createOrganization("Dunder Mifflin", "The best paper company in the world");
        console.log("organization", organization)
    }

    if (!userInfo.isLogged) {
        return <Navigate to={paths.LOGIN} />
    }
    return (
        <div className={styles.ProfileContainer}>
            <Card
                style={{width: '100%'}}
                cover={<img alt="example" src={userInfo.image} style={{marginTop: '10px', height: '200px', width: '100%', objectFit: 'contain'}} />}
            >
                <Title>Welcome {userInfo.legalName}!</Title>
                <Title level={5}>Your information:</Title>
                <Paragraph>Role: {userInfo.role.length !== 0 ? userInfo.role : 'Unknown'}</Paragraph>
                <Paragraph>Email: {userInfo.email}</Paragraph>
                <Paragraph>Address: {userInfo.address}</Paragraph>
                <Paragraph>Nation: {userInfo.nation}</Paragraph>
                <Paragraph>Telephone: {userInfo.telephone}</Paragraph>
                <Paragraph>Ethereum Address: {SingletonSigner.getInstance()?.address || 'undefined'}</Paragraph>
                {identity &&
                    <>
                        <Paragraph>ICP principal: {principal}</Paragraph>
                        <Button size="large" onClick={createOrganization}>
                            <Text>Create organization</Text>
                        </Button>
                    </>
                }
            </Card>
        </div>
    );
}
