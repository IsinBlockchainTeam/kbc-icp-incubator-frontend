import React from 'react';
import { useEthShipment } from '@/providers/entities/EthShipmentProvider';
import { Card, Descriptions, DescriptionsProps, Tag, Typography } from 'antd';
import { ShipmentPhase } from '@kbc-lib/coffee-trading-management-lib';

const { Paragraph } = Typography;

export const Result = () => {
    const { detailedShipment } = useEthShipment();

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
