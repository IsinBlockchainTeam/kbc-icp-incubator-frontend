import { useEthShipment } from '@/providers/entities/EthShipmentProvider';
import { CardPage } from '@/components/structure/CardPage/CardPage';
import React from 'react';
import { useParams } from 'react-router-dom';
import { Steps, Tag } from 'antd';
import { ShipmentStatus } from '@kbc-lib/coffee-trading-management-lib';
import {
    CheckOutlined,
    CompassOutlined,
    InboxOutlined,
    QuestionOutlined,
    SearchOutlined,
    TruckOutlined
} from '@ant-design/icons';
import { Pending } from '@/pages/Shipment/phase/Pending';
import { Shipping } from '@/pages/Shipment/phase/Shipping';

export const ShipmentView = () => {
    const { shipmentId } = useParams();
    const { shipments, getShipmentStatus } = useEthShipment();

    const shipment = shipments.find((s) => s.id === Number(shipmentId));
    if (!shipment) {
        return <>Shipment not found</>;
    }
    const shipmentStatus = getShipmentStatus(shipment.id);
    const [current, setCurrent] = React.useState<ShipmentStatus>(shipmentStatus);

    const onStepChange = (value: number) => {
        if (value > shipmentStatus) return;
        setCurrent(value);
    };

    const steps = [
        {
            title: 'Pending',
            icon: <QuestionOutlined />,
            content: <Pending />
        },
        {
            title: 'Shipping',
            icon: <InboxOutlined />,
            content: <Shipping />
        },
        {
            title: 'Transportation',
            icon: <TruckOutlined />,
            content: <></>
        },
        {
            title: 'Onboarded',
            icon: <CompassOutlined />,
            content: <></>
        },
        {
            title: 'Arbitration',
            icon: <SearchOutlined />,
            content: <></>
        },
        {
            title: 'Confirmed',
            icon: <CheckOutlined />,
            content: <></>
        }
    ];

    return (
        <CardPage
            title={
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                    Shipment
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Tag color="green">{ShipmentStatus[shipmentStatus]}</Tag>
                    </div>
                </div>
            }>
            <Steps
                type="navigation"
                current={current}
                onChange={onStepChange}
                className="shipment-status"
                items={steps.map((item) => ({ title: item.title, icon: item.icon }))}
            />
            {steps[current].content}
        </CardPage>
    );
};
