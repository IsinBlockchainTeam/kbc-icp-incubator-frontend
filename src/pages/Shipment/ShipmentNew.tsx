import { useEthShipment } from '@/providers/entities/EthShipmentProvider';
import { CardPage } from '@/components/structure/CardPage/CardPage';
import { paths } from '@/constants/paths';
import { FormElement, FormElementType, GenericForm } from '@/components/GenericForm/GenericForm';
import React from 'react';
import { regex } from '@/constants/regex';
import { useNavigate, useParams } from 'react-router-dom';
import { setParametersPath } from '@/utils/page';
import { TradeType } from '@kbc-lib/coffee-trading-management-lib';

export const ShipmentNew = () => {
    const { id } = useParams();
    const { addShipment } = useEthShipment();
    const navigate = useNavigate();

    const onSubmit = async (values: any) => {
        if (
            values['date'] < 0 ||
            values['quantity'] < 0 ||
            values['weight'] < 0 ||
            values['price'] < 0
        ) {
            return;
        }
        await addShipment(values['date'], values['quantity'], values['weight'], values['price']);
        navigate(
            setParametersPath(
                `${paths.TRADE_VIEW}?type=:type`,
                { id: id || '' },
                { type: TradeType.ORDER }
            )
        );
    };

    const elements: FormElement[] = [
        {
            type: FormElementType.INPUT,
            span: 24,
            name: 'date',
            label: 'Date',
            required: true,
            defaultValue: 0,
            regex: regex.ONLY_DIGITS,
            disabled: false
        },
        {
            type: FormElementType.INPUT,
            span: 24,
            name: 'quantity',
            label: 'Quantity',
            required: true,
            defaultValue: 0,
            regex: regex.ONLY_DIGITS,
            disabled: false
        },
        {
            type: FormElementType.INPUT,
            span: 24,
            name: 'weight',
            label: 'Weight',
            required: true,
            defaultValue: 0,
            regex: regex.ONLY_DIGITS,
            disabled: false
        },
        {
            type: FormElementType.INPUT,
            span: 24,
            name: 'price',
            label: 'Price',
            required: true,
            defaultValue: 0,
            regex: regex.ONLY_DIGITS,
            disabled: false
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
                    New Shipment
                </div>
            }>
            <GenericForm
                elements={elements}
                confirmText="Are you sure you want to add this shipment?"
                submittable={true}
                onSubmit={onSubmit}
            />
        </CardPage>
    );
};
