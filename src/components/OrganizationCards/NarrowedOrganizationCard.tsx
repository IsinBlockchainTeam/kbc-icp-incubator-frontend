import { Card, Descriptions } from 'antd';

import { NarrowedOrganization } from '@isinblockchainteam/kbc-icp-incubator-library';
import React from 'react';

type Props = {
    organization: NarrowedOrganization;
};

export const NarrowedOrganizationCard = (props: Props) => {
    return (
        <Card title="Other companies" style={{ flex: 1 }}>
            <Descriptions column={1} style={{ marginTop: '20px' }}>
                <Descriptions.Item label="Name">{props.organization.legalName}</Descriptions.Item>
            </Descriptions>
        </Card>
    );
};
