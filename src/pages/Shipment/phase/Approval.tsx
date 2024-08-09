import { useParams } from 'react-router-dom';
import { useEthOrderTrade } from '@/providers/entities/EthOrderTradeProvider';
import { OrderLine, ShipmentPhase } from '@kbc-lib/coffee-trading-management-lib';
import { FormElement, FormElementType, GenericForm } from '@/components/GenericForm/GenericForm';
import { regex } from '@/constants/regex';
import React from 'react';
import { useEthShipment } from '@/providers/entities/EthShipmentProvider';
import { Card, Typography } from 'antd';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { credentials } from '@/constants/ssi';
import dayjs from 'dayjs';

const { Paragraph } = Typography;

export const Approval = () => {
    const { id } = useParams();
    const { detailedShipment, updateShipment, approveShipment } = useEthShipment();
    const { orderTrades, createShipment } = useEthOrderTrade();
    const userInfo = useSelector((state: RootState) => state.userInfo);
    const isExporter = userInfo.role.toUpperCase() === credentials.ROLE_EXPORTER;

    const orderTrade = orderTrades.find((trade) => trade.tradeId === Number(id));
    if (!orderTrade) {
        return <>Order not found</>;
    }

    const onSubmit = async (values: any) => {
        if (
            !id ||
            values['date'] < 0 ||
            values['quantity'] < 0 ||
            values['weight'] < 0 ||
            values['price'] < 0
        ) {
            return;
        }
        isExporter
            ? detailedShipment
                ? await updateShipment(
                      new Date(values['date']),
                      values['quantity'],
                      values['weight'],
                      values['price']
                  )
                : await createShipment(
                      Number(id),
                      new Date(values['date']),
                      values['quantity'],
                      values['weight'],
                      values['price']
                  )
            : await approveShipment();
    };

    const isEditable = detailedShipment
        ? detailedShipment.phase === ShipmentPhase.APPROVAL && isExporter
        : isExporter;
    const isSubmittable = detailedShipment
        ? detailedShipment.phase === ShipmentPhase.APPROVAL
        : isExporter;

    const elements: FormElement[] = [
        {
            type: FormElementType.DATE,
            span: 12,
            name: 'date',
            label: 'Expiration Date',
            required: true,
            defaultValue: detailedShipment && dayjs(detailedShipment.shipment.expirationDate),
            regex: regex.ONLY_DIGITS,
            disabled: !isEditable
        },
        {
            type: FormElementType.INPUT,
            span: 12,
            name: 'quantity',
            label: 'Quantity',
            required: true,
            addOnAfter: orderTrade.lines[0].unit,
            defaultValue: detailedShipment && detailedShipment.shipment.quantity,
            regex: regex.ONLY_DIGITS,
            disabled: !isEditable
        },
        {
            type: FormElementType.INPUT,
            span: 12,
            name: 'weight',
            label: 'Weight',
            required: true,
            addOnAfter: 'kg',
            defaultValue: detailedShipment && detailedShipment.shipment.weight,
            regex: regex.ONLY_DIGITS,
            disabled: !isEditable
        },
        {
            type: FormElementType.INPUT,
            span: 12,
            name: 'price',
            label: 'Price',
            required: true,
            addOnAfter: (orderTrade.lines[0] as OrderLine).price.fiat,
            defaultValue: detailedShipment && detailedShipment.shipment.price,
            regex: regex.ONLY_DIGITS,
            disabled: !isEditable
        }
    ];

    const commonText = `At this initial stage, the content of the shipment is defined. `;
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
                    {detailedShipment
                        ? commonText +
                          `The export can review or edit the shipment while the importer can approve it.`
                        : commonText + `The exporter can create the shipment.`}
                </Paragraph>
            </Card>
            <GenericForm
                elements={elements}
                confirmText={
                    isExporter
                        ? detailedShipment
                            ? 'Are you sure you want to edit this shipment?'
                            : 'Are you sure you want to create this shipment?'
                        : 'Are you sure you want to approve this shipment?'
                }
                submittable={isSubmittable}
                submitText={isExporter ? (detailedShipment ? 'Edit' : 'Create') : 'Approve'}
                onSubmit={onSubmit}
            />
        </>
    );
};
