import { Button, Card, Typography } from 'antd';
import styles from './Profile.module.scss';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { Navigate } from 'react-router-dom';
import { useSiweIdentity } from '@/providers/SiweIdentityProvider';
import React, { useContext, useEffect, useState } from 'react';
import { SignerContext } from '@/providers/SignerProvider';
import { ICPContext } from '@/providers/ICPProvider';
import { paths } from '@/constants/paths';

const { Title, Paragraph, Text } = Typography;
export default function Profile() {
    const { signer } = useContext(SignerContext);
    const { organizationDriver } = useContext(ICPContext);
    const { identity } = useSiweIdentity();
    const userInfo = useSelector((state: RootState) => state.userInfo);
    const [principal, setPrincipal] = useState<string>('');
    const [showButton, setShowButton] = useState<boolean>(false);

    useEffect(() => {
        if (identity) {
            setPrincipal(identity.getPrincipal().toString());
        }
        checkOrganization();
    }, [identity]);

    const checkOrganization = async () => {
        try {
            await organizationDriver.getUserOrganizations();
        } catch (e) {
            setShowButton(true);
        }
    };

    const createOrganization = async () => {
        const organization = await organizationDriver.createOrganization(
            userInfo.legalName,
            `A company based in ${userInfo.nation}`,
            { legalName: userInfo.legalName }
        );
        console.log('organization', organization);
    };

    if (!userInfo.isLogged) {
        console.log('Not logged');
        return <Navigate to={paths.LOGIN} />;
    }
    return (
        <div className={styles.ProfileContainer}>
            <Card
                style={{ width: '100%' }}
                cover={
                    <img
                        alt="example"
                        src={userInfo.image}
                        style={{
                            marginTop: '10px',
                            height: '200px',
                            width: '100%',
                            objectFit: 'contain'
                        }}
                    />
                }>
                <Title>Welcome {userInfo.legalName}!</Title>
                <Title level={5}>Your information:</Title>
                <Paragraph>
                    Role: {userInfo.role.length !== 0 ? userInfo.role : 'Unknown'}
                </Paragraph>
                <Paragraph>Email: {userInfo.email}</Paragraph>
                <Paragraph>Address: {userInfo.address}</Paragraph>
                <Paragraph>Nation: {userInfo.nation}</Paragraph>
                <Paragraph>Telephone: {userInfo.telephone}</Paragraph>
                <Paragraph>Ethereum Address: {signer?._address || 'undefined'}</Paragraph>
                {identity && (
                    <>
                        <Paragraph>ICP principal: {principal}</Paragraph>
                        {showButton && (
                            <Button size="large" onClick={createOrganization}>
                                <Text>Create organization</Text>
                            </Button>
                        )}
                    </>
                )}
            </Card>
        </div>
    );
}
