import { Avatar, Button, Card, Col, Descriptions, Row, Typography } from 'antd';
import styles from './Profile.module.scss';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { Navigate } from 'react-router-dom';
import { useSiweIdentity } from '@/providers/SiweIdentityProvider';
import React, { useEffect, useState } from 'react';
import { useSigner } from '@/providers/SignerProvider';
import { paths } from '@/constants/paths';
import { MailOutlined, PhoneOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { formatAddress, formatICPPrincipal } from '@/utils/format';
import { fromDateToString } from '@/utils/date';
import { useOrganization } from '@/providers/icp/OrganizationProvider';

import {
    BroadedOrganization,
    NarrowedOrganization,
    Organization,
    OrganizationParams,
    OrganizationRole
} from '@kbc-lib/coffee-trading-management-lib';
import { BroadedOrganizationCard } from '@/components/OrganizationCards/BroadedOrganizationCard';
import { NarrowedOrganizationCard } from '@/components/OrganizationCards/NarrowedOrganizationCard';

const { Title, Text } = Typography;
export default function Profile() {
    const { signer } = useSigner();
    const { identity } = useSiweIdentity();
    const userInfo = useSelector((state: RootState) => state.userInfo);
    const { getOrganization, storeOrganization, updateOrganization, organizations } =
        useOrganization();
    const [principal, setPrincipal] = useState<string>('');
    const [icpOrganization, setIcpOrganization] = useState<Organization | undefined>();

    const { companyClaims, employeeClaims } = userInfo;

    useEffect(() => {
        if (identity) {
            setPrincipal(identity.getPrincipal().toString());
        }
        checkIcpOrganization();
    }, [identity, organizations]);

    const checkIcpOrganization = () => {
        const organizationEthAddress = userInfo.roleProof.delegator;

        try {
            const foundedOrganization = getOrganization(organizationEthAddress);

            setIcpOrganization(foundedOrganization);
        } catch (e) {
            console.log('Organization not found');
        }
    };

    const storeOrganizationWrapper = async (organizationParams: OrganizationParams) => {
        await storeOrganization(organizationParams);
        checkIcpOrganization();
    };

    const updateOrganizationWrapper = async (organizationParams: OrganizationParams) => {
        const organizationEthAddress = userInfo.roleProof.delegator;

        await updateOrganization(organizationEthAddress, organizationParams);
        checkIcpOrganization();
    };

    const buildICPActions = () => {
        const organizationParams: OrganizationParams = {
            legalName: companyClaims.legalName,
            industrialSector: companyClaims.industrialSector,
            address: companyClaims.address,
            city: companyClaims.city,
            postalCode: companyClaims.postalCode,
            region: companyClaims.region,
            countryCode: companyClaims.nation,
            role: OrganizationRole[companyClaims.role as keyof typeof OrganizationRole],
            telephone: companyClaims.telephone,
            email: companyClaims.email,
            image: companyClaims.image
        };

        return icpOrganization === undefined ? (
            <Button size="large" onClick={() => storeOrganizationWrapper(organizationParams)}>
                <Text>Share organization information</Text>
            </Button>
        ) : (
            <Col>
                <Title level={5}>You are sharing the following data with the platform</Title>
                <Row gutter={16}>
                    <Col span={12}>
                        <BroadedOrganizationCard
                            organization={icpOrganization as BroadedOrganization}
                        />
                    </Col>
                    <Col span={12}>
                        <NarrowedOrganizationCard
                            organization={icpOrganization as NarrowedOrganization}
                        />
                    </Col>
                </Row>
                <Row style={{ paddingTop: 8 }}>
                    <Button
                        size="large"
                        onClick={() => updateOrganizationWrapper(organizationParams)}>
                        <Text>Update organization information</Text>
                    </Button>
                </Row>
            </Col>
        );
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
                                    {fromDateToString(new Date(employeeClaims.birthDate))}
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
                <Col>
                    <Row style={{ paddingTop: 8, paddingBottom: 8 }}>{buildICPActions()}</Row>
                </Col>
            </Card>
        </div>
    );
}
