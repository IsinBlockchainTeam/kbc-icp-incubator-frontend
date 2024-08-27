import { useEthShipment } from '@/providers/entities/EthShipmentProvider';
import React, { useEffect } from 'react';
import { Steps } from 'antd';
import { ShipmentPhase } from '@kbc-lib/coffee-trading-management-lib';
import { AuditOutlined, ExperimentOutlined, TruckOutlined } from '@ant-design/icons';
import { Cargo } from '@/pages/Shipment/svg/Cargo';
import { Approval } from '@/pages/Shipment/phase/Approval';
import { LandTransportation } from '@/pages/Shipment/phase/LandTransportation';
import { SeaTransportation } from '@/pages/Shipment/phase/SeaTransportation';
import { Comparison } from '@/pages/Shipment/phase/Comparison';

export const Shipment = () => {
    const { detailedShipment } = useEthShipment();

    const currentPhase = detailedShipment?.phase || ShipmentPhase.APPROVAL;
    const [current, setCurrent] = React.useState<ShipmentPhase>(currentPhase);

    useEffect(() => {
        console.log('currentPhase', currentPhase);
        setCurrent(currentPhase);
    }, [currentPhase]);

    const onStepChange = (value: number) => {
        if (value > currentPhase) return;
        setCurrent(value);
    };

    const steps = [
        {
            title: 'Approval',
            icon: <AuditOutlined />,
            content: <Approval />
        },
        {
            title: 'Land Transportation',
            icon: <TruckOutlined />,
            content: <LandTransportation />
        },
        {
            title: 'Sea Transportation',
            icon: <Cargo />,
            content: <SeaTransportation />
        },
        {
            title: 'Comparison',
            icon: <ExperimentOutlined />,
            content: <Comparison />
        }
    ];

    return (
        <>
            <Steps
                type="navigation"
                current={current}
                onChange={onStepChange}
                className="shipment-status"
                items={steps.map((item) => ({ title: item.title, icon: item.icon }))}
                style={{ marginBottom: '20px' }}
            />
            {steps[current].content}
        </>
    );
};
