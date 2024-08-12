import { Avatar, Button, Card, Col, Descriptions, Row, Typography } from 'antd';
import styles from './Profile.module.scss';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { Navigate } from 'react-router-dom';
import { useSiweIdentity } from '@/providers/SiweIdentityProvider';
import React, { useEffect, useState } from 'react';
import { useSigner } from '@/providers/SignerProvider';
import { useICP } from '@/providers/ICPProvider';
import { paths } from '@/constants/paths';
import { MailOutlined, PhoneOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { formatAddress, formatICPPrincipal } from '@/utils/format';

const { Title, Text } = Typography;
export default function Profile() {
    const { signer } = useSigner();
    const { organizationDriver } = useICP();
    const { identity } = useSiweIdentity();
    const userInfo = useSelector((state: RootState) => state.userInfo);
    const [principal, setPrincipal] = useState<string>('');
    const [showButton, setShowButton] = useState<boolean>(false);

    const { companyClaims, employeeClaims } = userInfo;

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
            userInfo.companyClaims.legalName,
            `A company based in ${userInfo.companyClaims.nation}`,
            { legalName: userInfo.companyClaims.legalName }
        );
        console.log('organization', organization);
    };

    if (!userInfo.isLogged) {
        return <Navigate to={paths.LOGIN} />;
    }
    return (
        <div className={styles.ProfileContainer} style={{ padding: '30px' }}>
            <Card>
                <Title>
                    Welcome {userInfo.employeeClaims.firstName} {userInfo.employeeClaims.lastName}!
                </Title>
                <Row gutter={16} style={{ display: 'flex' }}>
                    <Col span={12} style={{ display: 'flex', flexDirection: 'column' }}>
                        <Card style={{ flex: 1 }}>
                            <Card.Meta
                                avatar={<Avatar size={100} src={companyClaims.image} />}
                                title={companyClaims.legalName}
                                description={companyClaims.role}
                            />
                            <Descriptions column={1} style={{ marginTop: '20px' }}>
                                <Descriptions.Item label="Industrial Sector">
                                    {companyClaims.industrialSector}
                                </Descriptions.Item>
                                <Descriptions.Item label="Email">
                                    <span style={{ display: 'flex', alignItems: 'center' }}>
                                        <MailOutlined style={{ marginRight: 4 }} />
                                        {companyClaims.email}
                                    </span>
                                </Descriptions.Item>
                                <Descriptions.Item label="Phone">
                                    <span style={{ display: 'flex', alignItems: 'center' }}>
                                        <PhoneOutlined style={{ marginRight: 4 }} />
                                        {companyClaims.telephone}
                                    </span>
                                </Descriptions.Item>
                                <Descriptions.Item label="Address">
                                    <span style={{ display: 'flex', alignItems: 'center' }}>
                                        <EnvironmentOutlined style={{ marginRight: 4 }} />
                                        {companyClaims.address}, {companyClaims.nation}
                                    </span>
                                </Descriptions.Item>
                                <Descriptions.Item label="Latitude">
                                    {companyClaims.latitude}
                                </Descriptions.Item>
                                <Descriptions.Item label="Longitude">
                                    {companyClaims.longitude}
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>
                    </Col>
                    <Col span={12} style={{ display: 'flex', flexDirection: 'column' }}>
                        <Card style={{ flex: 1 }}>
                            <Card.Meta
                                avatar={<Avatar size={100} src={employeeClaims.image} />}
                                title={`${employeeClaims.firstName} ${employeeClaims.lastName}`}
                                description={employeeClaims.role}
                            />
                            <Descriptions column={1} style={{ marginTop: '20px' }}>
                                <Descriptions.Item label="Email">
                                    <span style={{ display: 'flex', alignItems: 'center' }}>
                                        <MailOutlined style={{ marginRight: 4 }} />
                                        {employeeClaims.email}
                                    </span>
                                </Descriptions.Item>
                                <Descriptions.Item label="Phone">
                                    <span style={{ display: 'flex', alignItems: 'center' }}>
                                        <PhoneOutlined style={{ marginRight: 4 }} />
                                        {employeeClaims.telephone}
                                    </span>
                                </Descriptions.Item>
                                <Descriptions.Item label="Address">
                                    <span style={{ display: 'flex', alignItems: 'center' }}>
                                        <EnvironmentOutlined style={{ marginRight: 4 }} />
                                        {employeeClaims.address}
                                    </span>
                                </Descriptions.Item>
                                <Descriptions.Item label="Birth Date">
                                    {employeeClaims.birthDate}
                                </Descriptions.Item>
                                <Descriptions.Item label="Ethereum Address">
                                    {formatAddress(signer._address)}
                                </Descriptions.Item>
                                {identity && (
                                    <>
                                        <Descriptions.Item label="ICP Principal">
                                            {formatICPPrincipal(principal)}
                                        </Descriptions.Item>
                                    </>
                                )}
                            </Descriptions>
                        </Card>
                    </Col>
                </Row>
                {showButton && (
                    <Button size="large" onClick={createOrganization}>
                        <Text>Create organization</Text>
                    </Button>
                )}
            </Card>
        </div>
    );
}
