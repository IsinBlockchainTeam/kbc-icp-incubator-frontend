import { useEthShipment } from '@/providers/entities/EthShipmentProvider';
import React, { useEffect } from 'react';
import { Steps } from 'antd';
import { ShipmentPhase } from '@kbc-lib/coffee-trading-management-lib';
import { FlagOutlined, FormOutlined, InboxOutlined, TruckOutlined } from '@ant-design/icons';
import { Cargo } from '@/components/ShipmentPanel/svg/Cargo';
import { WaitingForLandTransportation } from '@/components/ShipmentPanel/phase/WaitingForLandTransportation';
import { LandTransportation } from '@/components/ShipmentPanel/phase/LandTransportation';
import { SeaTransportation } from '@/components/ShipmentPanel/phase/SeaTransportation';
import { Bean } from '@/components/ShipmentPanel/svg/Bean';
import { ShipmentConfirmation } from '@/components/ShipmentPanel/phase/ShipmentConfirmation';
import { Result } from '@/components/ShipmentPanel/phase/Result';
import { SampleApproval } from '@/components/ShipmentPanel/phase/SampleApproval';
import { ShipmentPhaseDisplayName } from '@/constants/shipmentPhase';

export const ShipmentPanel = () => {
    const { detailedShipment } = useEthShipment();

    const [currentPhase, setCurrentPhase] = React.useState<ShipmentPhase>(ShipmentPhase.PHASE_1);

    useEffect(() => {
        if (detailedShipment) {
            setCurrentPhase(detailedShipment.phase > 5 ? 5 : detailedShipment.phase);
        }
    }, [detailedShipment]);

    if (!detailedShipment) {
        return <>Shipment not created</>;
    }

    const onStepChange = (value: number) => {
        if (value > detailedShipment.phase) return;
        setCurrentPhase(value);
    };

    const steps = [
        {
            title: ShipmentPhaseDisplayName[ShipmentPhase.PHASE_1],
            icon: <Bean />,
            content: <SampleApproval />
        },
        {
            title: ShipmentPhaseDisplayName[ShipmentPhase.PHASE_2],
            icon: <FormOutlined />,
            content: <ShipmentConfirmation />
        },
        {
            title: ShipmentPhaseDisplayName[ShipmentPhase.PHASE_3],
            icon: <InboxOutlined />,
            content: <WaitingForLandTransportation />
        },
        {
            title: ShipmentPhaseDisplayName[ShipmentPhase.PHASE_4],
            icon: <TruckOutlined />,
            content: <LandTransportation />
        },
        {
            title: ShipmentPhaseDisplayName[ShipmentPhase.PHASE_5],
            icon: <Cargo />,
            content: <SeaTransportation />
        },
        {
            title: 'Result',
            icon: <FlagOutlined />,
            content: <Result />
        }
    ];

    return (
        <>
            <Steps
                labelPlacement="vertical"
                size="small"
                current={currentPhase}
                onChange={onStepChange}
                className="shipment-status"
                items={steps.map((item) => ({ title: item.title, icon: item.icon }))}
                style={{ marginBottom: '20px' }}
            />
            {steps[currentPhase].content}
        </>
    );
};
