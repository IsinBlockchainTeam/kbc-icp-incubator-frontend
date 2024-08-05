import { Card, Typography } from 'antd';
import { FormElement, FormElementType, GenericForm } from '@/components/GenericForm/GenericForm';
import React from 'react';
import { credentials } from '@/constants/ssi';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useEthShipment } from '@/providers/entities/EthShipmentProvider';
import { useParams } from 'react-router-dom';
import { ConfirmButton } from '@/components/ConfirmButton/ConfirmButton';
import { ShipmentStatus } from '@kbc-lib/coffee-trading-management-lib';

const { Paragraph } = Typography;
export const Pending = () => {
    const { shipmentId } = useParams();
    const userInfo = useSelector((state: RootState) => state.userInfo);
    const isImporter = userInfo.role.toUpperCase() === credentials.ROLE_IMPORTER;
    const { shipments, approveShipment, getShipmentStatus } = useEthShipment();

    const shipment = shipments.find((s) => s.id === Number(shipmentId));
    if (!shipment) {
        return <>Shipment not found</>;
    }
    const isPending = getShipmentStatus(shipment.id) === ShipmentStatus.PENDING;

    const elements: FormElement[] = [
        {
            type: FormElementType.INPUT,
            span: 12,
            name: 'id',
            label: 'ID',
            required: true,
            defaultValue: shipment.id,
            disabled: true
        },
        {
            type: FormElementType.SPACE,
            span: 12
        },
        {
            type: FormElementType.INPUT,
            span: 12,
            name: 'date',
            label: 'Date',
            required: true,
            defaultValue: shipment.date,
            disabled: true
        },
        {
            type: FormElementType.INPUT,
            span: 12,
            name: 'quantity',
            label: 'Quantity',
            required: true,
            defaultValue: shipment.quantity,
            disabled: true
        },
        {
            type: FormElementType.INPUT,
            span: 12,
            name: 'weight',
            label: 'Weight',
            required: true,
            defaultValue: shipment.weight,
            disabled: true
        },
        {
            type: FormElementType.INPUT,
            span: 12,
            name: 'price',
            label: 'Price',
            required: true,
            defaultValue: shipment.price,
            disabled: true
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
                <Paragraph>
                    You are in the Pending phase because the shipment has not yet been approved by
                    the importer.
                </Paragraph>
            </Card>

            <GenericForm elements={elements} submittable={false} />

            {isPending && isImporter && (
                <ConfirmButton
                    text={'Approve'}
                    confirmText={'Are you sure you want to approve this shipment?'}
                    onConfirm={() => approveShipment(shipment.id)}
                    block
                />
            )}
        </>
    );
};
