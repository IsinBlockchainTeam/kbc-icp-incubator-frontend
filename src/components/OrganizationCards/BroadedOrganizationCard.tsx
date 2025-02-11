import { Avatar, Card, Descriptions } from 'antd';

import { BroadedOrganization } from '@kbc-lib/coffee-trading-management-lib';
import React from 'react';
import { EnvironmentOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';

type Props = {
    organization: BroadedOrganization;
};

export const BroadedOrganizationCard = (props: Props) => {
    return (
        <Card title="Friend companies" style={{ flex: 1 }}>
            <Card.Meta
                avatar={<Avatar size={100} src={props.organization.image} />}
                title={props.organization.legalName}
                description={props.organization.role}
            />
            <Descriptions column={1} style={{ marginTop: '20px' }}>
                <Descriptions.Item label="Industrial Sector">
                    {props.organization.industrialSector}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                        <MailOutlined style={{ marginRight: 4 }} />
                        {props.organization.email}
                    </span>
                </Descriptions.Item>
                <Descriptions.Item label="Phone">
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                        <PhoneOutlined style={{ marginRight: 4 }} />
                        {props.organization.telephone}
                    </span>
                </Descriptions.Item>
                <Descriptions.Item label="Address">
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                        <EnvironmentOutlined style={{ marginRight: 4 }} />
                        {props.organization.address}, {props.organization.city},{' '}
                        {props.organization.postalCode}, {props.organization.region},{' '}
                        {props.organization.countryCode}
                    </span>
                </Descriptions.Item>
            </Descriptions>
        </Card>
    );
};
