import {Button, Card, Typography} from "antd";
import styles from "./Profile.module.scss";
import {useSelector} from "react-redux";
import {RootState} from "../../redux/store";
import {Navigate} from "react-router-dom";
import {paths} from "../../constants";
import SingletonSigner from "../../api/SingletonSigner";
import {useSiweIdentity} from "../../components/icp/SiweIdentityProvider/SiweIdentityProvider";
import React, {useEffect, useState} from "react";
import {
    ICPOrganizationDriver
} from "@blockchain-lib/common";
const { Title, Paragraph, Text } = Typography;
export default function Profile() {
    const { identity } = useSiweIdentity();
    const userInfo = useSelector((state: RootState) => state.userInfo);
    const [principal, setPrincipal] = useState<string>("");

    useEffect(() => {
        if(identity) {
            console.log("Identity is", identity);
            setPrincipal(identity.getPrincipal().toString());
        }
    }, [identity]);

    const createOrganization = async () => {
        const organizationDriver = ICPOrganizationDriver.getInstance();
        const organization = await organizationDriver.createOrganization("Dunder Mifflin", "The best paper company in the world");
        console.log("organization", organization)
    }

    if (!userInfo.isLogged) {
        console.log('Not logged');
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
