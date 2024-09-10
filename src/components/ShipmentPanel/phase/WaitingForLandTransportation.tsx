import React from 'react';
import { useEthShipment } from '@/providers/entities/EthShipmentProvider';
import { Card, Typography } from 'antd';
import { ShipmentDocumentTable } from '@/components/ShipmentPanel/ShipmentDocumentTable';
import { ShipmentPhase } from '@kbc-lib/coffee-trading-management-lib';

const { Paragraph } = Typography;

export const WaitingForLandTransportation = () => {
    const { detailedShipment } = useEthShipment();

    if (!detailedShipment) {
        return <>Shipment not found</>;
    }

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
                    Phase from when the Exporter stipulates the day of goods pickup in the Warehouse
                    with the Maritime Agency (Land Transporter) to when the goods leave the
                    warehouse.
                </Paragraph>
            </Card>
            <ShipmentDocumentTable selectedPhase={ShipmentPhase.PHASE_3} />
        </>
    );
};
