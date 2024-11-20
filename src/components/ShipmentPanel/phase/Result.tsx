import React from 'react';
import { Card, Descriptions, DescriptionsProps, Tag, Typography } from 'antd';
import { ShipmentPhase } from '@isinblockchainteam/kbc-icp-incubator-library';
import { useShipment } from '@/providers/icp/ShipmentProvider';

const { Paragraph } = Typography;

export const Result = () => {
    const { detailedShipment } = useShipment();

    if (!detailedShipment) {
        return <>Shipment not found</>;
    }

    const items: DescriptionsProps['items'] = [
        {
            key: '1',
            label: 'Result',
            children: (
                <Tag key="status" color="blue">
                    {ShipmentPhase[detailedShipment.phase]}
                </Tag>
            ),
            span: 12
        }
    ];

    return (
        <>
            <Card
                style={{
                    width: '100%',
                    background: '#E6F4FF',
                    borderColor: '#91CAFF',
                    marginTop: 10,
                    marginBottom: 10
                }}
                role="card">
                <Paragraph>Result phase</Paragraph>
            </Card>
            <Descriptions title="Result" items={items} bordered />
        </>
    );
};
