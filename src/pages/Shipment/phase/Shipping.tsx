import { Card, Typography } from 'antd';
import React from 'react';
import { EscrowPanel } from '@/components/EscrowPanel/EscrowPanel';

const { Paragraph } = Typography;

export const Shipping = () => {
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
                <Paragraph>
                    You are in the Shipping phase because the required amount to cover the shipment
                    is awaiting deposit in escrow. Once the funds are available and secured, the
                    process will proceed to the next phase.
                </Paragraph>
            </Card>
            <EscrowPanel />
        </>
    );
};
