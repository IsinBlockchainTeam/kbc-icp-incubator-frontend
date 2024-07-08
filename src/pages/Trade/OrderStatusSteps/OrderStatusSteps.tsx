import { Divider, Steps } from 'antd';
import {
    EditOutlined,
    ProductOutlined,
    SendOutlined,
    TruckOutlined,
    ImportOutlined
} from '@ant-design/icons';
import React from 'react';
import { FormElement, GenericForm } from '@/components/GenericForm/GenericForm';
import { DocumentType, OrderStatus, OrderTrade } from '@kbc-lib/coffee-trading-management-lib';
import { CoffeeProduction } from '@/pages/Trade/OrderStatusSteps/CoffeeProduction';
import { CoffeeExport } from '@/pages/Trade/OrderStatusSteps/CoffeeExport';
import { CoffeeShipment } from '@/pages/Trade/OrderStatusSteps/CoffeeShipment';
import { CoffeeImport } from '@/pages/Trade/OrderStatusSteps/CoffeeImport';

type Props = {
    status: OrderStatus;
    submittable: boolean;
    negotiationElements: FormElement[];
    // FIXME: please stop using ?:
    orderTrade?: OrderTrade;
    validationCallback: (
        orderTrade: OrderTrade | null,
        documentType: DocumentType
    ) => undefined | { approve: () => Promise<void>; reject: () => Promise<void> };
    onSubmit: (values: any) => Promise<void>;
};

export default function OrderStatusSteps(props: Props) {
    const { status, submittable, negotiationElements, orderTrade } = props;
    const [current, setCurrent] = React.useState<OrderStatus>(
        status === OrderStatus.COMPLETED ? OrderStatus.SHIPPED : status
    );

    const onChange = (value: number) => {
        if (value > status) return;
        setCurrent(value);
    };

    const steps = [
        {
            title: 'Contract stipulation',
            icon: <EditOutlined />,
            content: (
                <GenericForm
                    elements={negotiationElements}
                    submittable={submittable}
                    onSubmit={props.onSubmit}
                />
            )
        },
        {
            title: 'Coffee Production',
            icon: <ProductOutlined />,
            content: orderTrade && (
                <CoffeeProduction
                    orderTrade={orderTrade}
                    validationCallback={props.validationCallback}
                />
            )
        },
        {
            title: 'Coffee Export',
            icon: <SendOutlined />,
            content: orderTrade && (
                <CoffeeExport
                    orderTrade={orderTrade}
                    validationCallback={props.validationCallback}
                />
            )
        },
        {
            title: 'Coffee Shipment',
            icon: <TruckOutlined />,
            content: orderTrade && (
                <CoffeeShipment
                    orderTrade={orderTrade}
                    validationCallback={props.validationCallback}
                />
            )
        },
        {
            title: 'Coffee Import',
            icon: <ImportOutlined />,
            content: orderTrade && (
                <CoffeeImport
                    orderTrade={orderTrade}
                    validationCallback={props.validationCallback}
                />
            )
        }
    ];

    return (
        <>
            <Divider>Order status</Divider>
            <Steps
                type="navigation"
                current={current}
                onChange={onChange}
                className="order-status"
                items={steps.map((item) => ({ title: item.title, icon: item.icon }))}
            />
            <React.Fragment>{steps[current].content}</React.Fragment>
        </>
    );
}
