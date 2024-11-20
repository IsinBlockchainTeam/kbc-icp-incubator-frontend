import { useParams } from 'react-router-dom';
import { EvaluationStatus, OrderLine, ShipmentPhase } from '@isinblockchainteam/kbc-icp-incubator-library';
import { FormElement, FormElementType, GenericForm } from '@/components/GenericForm/GenericForm';
import { regex } from '@/constants/regex';
import React from 'react';
import { Card, Typography } from 'antd';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { credentials } from '@/constants/ssi';
import dayjs from 'dayjs';
import { ShipmentDocumentTable } from '@/components/ShipmentPanel/ShipmentDocumentTable';
import { useShipment } from '@/providers/icp/ShipmentProvider';
import { useOrder } from '@/providers/icp/OrderProvider';

const { Paragraph } = Typography;

export const ShipmentConfirmation = () => {
    const { id } = useParams();
    const { detailedShipment, setDetails, approveDetails } = useShipment();
    const { order } = useOrder();
    const userInfo = useSelector((state: RootState) => state.userInfo);
    const isExporter = userInfo.companyClaims.role.toUpperCase() === credentials.ROLE_EXPORTER;

    if (!order) {
        return <>Order not found</>;
    }
    if (!detailedShipment) {
        return <>Shipment not found</>;
    }

    const onSubmit = async (values: any) => {
        if (
            !id ||
            Number(values['shipmentNumber']) < 0 ||
            Number(values['price']) < 0 ||
            Number(values['quantity']) < 0 ||
            Number(values['containersNumber']) < 0 ||
            Number(values['netWeight']) < 0 ||
            Number(values['grossWeight']) < 0
        )
            return;
        isExporter
            ? await setDetails(
                  Number(values['shipmentNumber']),
                  new Date(values['expirationDate']),
                  new Date(values['fixingDate']),
                  values['targetExchange'],
                  Number(values['differentialApplied']),
                  Number(values['price']),
                  Number(values['quantity']),
                  Number(values['containersNumber']),
                  Number(values['netWeight']),
                  Number(values['grossWeight'])
              )
            : await approveDetails();
    };

    const isEditable =
        detailedShipment.shipment.detailsEvaluationStatus !== EvaluationStatus.APPROVED &&
        isExporter;
    const isSubmittable =
        detailedShipment.shipment.detailsEvaluationStatus !== EvaluationStatus.APPROVED;

    const elements: FormElement[] = [
        {
            type: FormElementType.TITLE,
            span: 24,
            label: 'Shipment Details'
        },
        {
            type: FormElementType.INPUT,
            span: 12,
            name: 'shipmentNumber',
            label: 'Shipment Number',
            required: true,
            defaultValue: detailedShipment.shipment.shipmentNumber,
            regex: regex.ONLY_DIGITS,
            disabled: !isEditable
        },
        {
            type: FormElementType.INPUT,
            span: 12,
            name: 'price',
            label: 'Price',
            required: true,
            addOnAfter: (order.lines[0] as OrderLine).price.fiat,
            defaultValue: detailedShipment.shipment.price,
            regex: regex.ONLY_DIGITS,
            disabled: !isEditable
        },
        {
            type: FormElementType.DATE,
            span: 12,
            name: 'expirationDate',
            label: 'Expiration Date',
            required: true,
            defaultValue: detailedShipment.shipment.detailsSet
                ? dayjs(detailedShipment.shipment.expirationDate)
                : dayjs(),
            regex: regex.ONLY_DIGITS,
            disabled: !isEditable
        },
        {
            type: FormElementType.DATE,
            span: 12,
            name: 'fixingDate',
            label: 'Fixing Date',
            required: true,
            defaultValue: detailedShipment.shipment.detailsSet
                ? dayjs(detailedShipment.shipment.fixingDate)
                : dayjs(),
            regex: regex.ONLY_DIGITS,
            disabled: !isEditable
        },
        {
            type: FormElementType.INPUT,
            span: 12,
            name: 'targetExchange',
            label: 'Target Exchange',
            required: true,
            defaultValue: detailedShipment.shipment.targetExchange,
            disabled: !isEditable
        },
        {
            type: FormElementType.INPUT,
            span: 12,
            name: 'differentialApplied',
            label: 'Differential Applied',
            required: true,
            addOnAfter: '%',
            defaultValue: detailedShipment.shipment.differentialApplied,
            regex: regex.ONLY_DIGITS,
            disabled: !isEditable
        },
        {
            type: FormElementType.INPUT,
            span: 12,
            name: 'quantity',
            label: 'Quantity',
            required: true,
            addOnAfter: order.lines[0].unit,
            defaultValue: detailedShipment.shipment.quantity,
            regex: regex.ONLY_DIGITS,
            disabled: !isEditable
        },
        {
            type: FormElementType.INPUT,
            span: 12,
            name: 'containersNumber',
            label: 'Containers Number',
            required: true,
            defaultValue: detailedShipment.shipment.containersNumber,
            regex: regex.ONLY_DIGITS,
            disabled: !isEditable
        },
        {
            type: FormElementType.INPUT,
            span: 12,
            name: 'netWeight',
            label: 'Net Weight',
            required: true,
            addOnAfter: 'kg',
            defaultValue: detailedShipment.shipment.netWeight,
            regex: regex.ONLY_DIGITS,
            disabled: !isEditable
        },
        {
            type: FormElementType.INPUT,
            span: 12,
            name: 'grossWeight',
            label: 'Gross Weight',
            required: true,
            addOnAfter: 'kg',
            defaultValue: detailedShipment.shipment.grossWeight,
            regex: regex.ONLY_DIGITS,
            disabled: !isEditable
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
                <Paragraph>Phase in which the content of the shipment is defined.</Paragraph>
            </Card>
            <ShipmentDocumentTable selectedPhase={ShipmentPhase.PHASE_2} />
            <GenericForm
                elements={elements}
                confirmText={
                    isExporter
                        ? detailedShipment
                            ? 'Are you sure you want to edit this shipment details?'
                            : 'Are you sure you want to submit this shipment details?'
                        : 'Are you sure you want to approve this shipment?'
                }
                submittable={isSubmittable}
                submitText={
                    isExporter
                        ? detailedShipment.shipment.detailsSet
                            ? 'Edit'
                            : 'Create'
                        : 'Approve'
                }
                onSubmit={onSubmit}
            />
        </>
    );
};
