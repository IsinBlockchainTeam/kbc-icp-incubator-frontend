import {
    NegotiationStatus,
    OrderTrade,
    OrderLineRequest,
    OrderLinePrice,
    OrderLine,
    OrderStatus
} from '@kbc-lib/coffee-trading-management-lib';
import { Tag, Tooltip } from 'antd';
import OrderStatusSteps from '@/pages/Trade/OrderStatusSteps/OrderStatusSteps';
import { CardPage } from '@/components/structure/CardPage/CardPage';
import React, { useState } from 'react';
import { FormElement, FormElementType } from '@/components/GenericForm/GenericForm';
import { regex } from '@/utils/regex';
import dayjs from 'dayjs';
import { useSigner } from '@/providers/SignerProvider';
import { paths } from '@/constants/paths';
import { useNavigate } from 'react-router-dom';
import { CheckCircleOutlined, EditOutlined, RollbackOutlined } from '@ant-design/icons';
import { validateDates } from '@/utils/date';
import { useEthMaterial } from '@/providers/entities/EthMaterialProvider';
import { useEthEnumerable } from '@/providers/entities/EthEnumerableProvider';
import { OrderTradeRequest, useEthOrderTrade } from '@/providers/entities/EthOrderTradeProvider';

type OrderTradeViewProps = {
    orderTrade: OrderTrade;
    disabled: boolean;
    toggleDisabled: () => void;
    commonElements: FormElement[];
};
export const OrderTradeView = ({
    orderTrade,
    disabled,
    toggleDisabled,
    commonElements
}: OrderTradeViewProps) => {
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const { signer } = useSigner();
    const { productCategories } = useEthMaterial();
    const { units, fiats } = useEthEnumerable();
    const { updateOrderTrade, confirmNegotiation, getOrderStatus } = useEthOrderTrade();
    const negotiationStatus = NegotiationStatus[orderTrade.negotiationStatus];
    const navigate = useNavigate();

    const toggleEditing = () => {
        toggleDisabled();
        setIsEditing(!isEditing);
    };

    const disabledDate = (current: dayjs.Dayjs): boolean => {
        return current && current <= dayjs().endOf('day');
    };

    const onSubmit = async (values: any) => {
        const quantity: number = parseInt(values[`quantity-1`]);
        const unit: string = values[`unit-1`];
        const productCategoryId: number = parseInt(values['product-category-id-1']);

        const price: number = parseInt(values[`price-1`]);
        const fiat: string = values[`fiat-1`];

        const updatedOrderTrade: OrderTradeRequest = {
            supplier: values['supplier'],
            customer: values['customer'],
            commissioner: values['commissioner'],
            lines: [
                new OrderLineRequest(
                    productCategoryId,
                    quantity,
                    unit,
                    new OrderLinePrice(price, fiat)
                )
            ],
            paymentDeadline: dayjs(values['payment-deadline']).unix(),
            documentDeliveryDeadline: dayjs(values['document-delivery-deadline']).unix(),
            arbiter: values['arbiter'],
            shippingDeadline: dayjs(values['shipping-deadline']).unix(),
            deliveryDeadline: dayjs(values['delivery-deadline']).unix(),
            agreedAmount: parseInt(values['agreed-amount']),
            tokenAddress: values['token-address'],
            incoterms: values['incoterms'],
            shipper: values['shipper'],
            shippingPort: values['shipping-port'],
            deliveryPort: values['delivery-port']
        };
        await updateOrderTrade(orderTrade.tradeId, updatedOrderTrade);
        toggleDisabled();
        navigate(paths.TRADES);
    };

    const elements: FormElement[] = [
        {
            type: FormElementType.TIP,
            span: 24,
            label: (
                <p>
                    This is the first stage, where the involved parties can negotiate the terms of
                    the trade. <br />
                    Once the negotiation is confirmed by both parties, the implementation phase will
                    begin in which all the necessary documents must be uploaded in order to
                    successfully complete the transaction.{' '}
                </p>
            ),
            marginVertical: '1rem'
        },
        ...commonElements,
        { type: FormElementType.TITLE, span: 24, label: 'Constraints' },
        {
            type: FormElementType.INPUT,
            span: 12,
            name: 'incoterms',
            label: 'Incoterms',
            required: true,
            defaultValue: orderTrade.metadata?.incoterms,
            disabled
        },
        {
            type: FormElementType.INPUT,
            span: 12,
            name: 'arbiter',
            label: 'Arbiter',
            required: true,
            defaultValue: orderTrade.arbiter,
            disabled,
            regex: regex.ETHEREUM_ADDRESS
        },
        {
            type: FormElementType.DATE,
            span: 12,
            name: 'payment-deadline',
            label: 'Payment Deadline',
            required: true,
            defaultValue: dayjs.unix(orderTrade.paymentDeadline),
            disabled,
            disableValues: disabledDate,
            dependencies: ['document-delivery-deadline']
        },
        {
            type: FormElementType.DATE,
            span: 12,
            name: 'document-delivery-deadline',
            label: 'Document Delivery Deadline',
            required: true,
            defaultValue: dayjs.unix(orderTrade.documentDeliveryDeadline),
            disabled,
            dependencies: ['payment-deadline'],
            validationCallback: validateDates(
                'document-delivery-deadline',
                'payment-deadline',
                'greater',
                'This must be after Payment Deadline'
            )
        },
        {
            type: FormElementType.INPUT,
            span: 8,
            name: 'shipper',
            label: 'Shipper',
            required: true,
            defaultValue: orderTrade.metadata?.shipper,
            disabled
        },
        {
            type: FormElementType.INPUT,
            span: 8,
            name: 'shipping-port',
            label: 'Shipping Port',
            required: true,
            defaultValue: orderTrade.metadata?.shippingPort,
            disabled
        },
        {
            type: FormElementType.DATE,
            span: 8,
            name: 'shipping-deadline',
            label: 'Shipping Deadline',
            required: true,
            defaultValue: dayjs.unix(orderTrade.shippingDeadline),
            disabled,
            dependencies: ['document-delivery-deadline'],
            validationCallback: validateDates(
                'shipping-deadline',
                'document-delivery-deadline',
                'greater',
                'This must be after Document Delivery Deadline'
            )
        },
        {
            type: FormElementType.INPUT,
            span: 12,
            name: 'delivery-port',
            label: 'Delivery Port',
            required: true,
            defaultValue: orderTrade.metadata?.deliveryPort,
            disabled
        },
        {
            type: FormElementType.DATE,
            span: 12,
            name: 'delivery-deadline',
            label: 'Delivery Deadline',
            required: true,
            defaultValue: dayjs.unix(orderTrade.deliveryDeadline),
            disabled,
            dependencies: ['shipping-deadline'],
            validationCallback: validateDates(
                'delivery-deadline',
                'shipping-deadline',
                'greater',
                'This must be after Shipping Deadline'
            )
        },
        {
            type: FormElementType.INPUT,
            span: 12,
            name: 'agreed-amount',
            label: 'Agreed Amount',
            required: true,
            regex: regex.ONLY_DIGITS,
            defaultValue: orderTrade.agreedAmount,
            disabled
        },
        {
            type: FormElementType.INPUT,
            span: 12,
            name: 'token-address',
            label: 'Token Address',
            required: true,
            regex: regex.ETHEREUM_ADDRESS,
            defaultValue: orderTrade.tokenAddress,
            disabled
        },
        { type: FormElementType.TITLE, span: 24, label: 'Line Items' }
    ];
    orderTrade.lines.forEach((line, index) => {
        elements.push(
            {
                type: FormElementType.SELECT,
                span: 6,
                name: `product-category-id-${index + 1}`,
                label: 'Product Category Id',
                required: true,
                options: productCategories.map((productCategory) => ({
                    label: productCategory.name,
                    value: productCategory.id
                })),
                defaultValue:
                    productCategories.find((pc) => pc.id === line.productCategory?.id)?.id || -1,
                disabled
            },
            {
                type: FormElementType.INPUT,
                span: 5,
                name: `quantity-${index + 1}`,
                label: 'Quantity',
                required: true,
                regex: regex.ONLY_DIGITS,
                defaultValue: line.quantity?.toString(),
                disabled
            },
            {
                type: FormElementType.SELECT,
                span: 4,
                name: `unit-${index + 1}`,
                label: 'Unit',
                required: true,
                options: units.map((unit) => ({ label: unit, value: unit })),
                defaultValue: line.unit!,
                disabled
            },
            {
                type: FormElementType.INPUT,
                span: 5,
                name: `price-${index + 1}`,
                label: 'Price',
                required: true,
                regex: regex.ONLY_DIGITS,
                defaultValue: (line as OrderLine).price?.amount.toString(),
                disabled
            },
            {
                type: FormElementType.SELECT,
                span: 4,
                name: `fiat-${index + 1}`,
                label: 'Fiat',
                required: true,
                options: fiats.map((fiat) => ({ label: fiat, value: fiat })),
                defaultValue: (line as OrderLine).price!.fiat,
                disabled
            }
        );
    });
    if (negotiationStatus !== NegotiationStatus[NegotiationStatus.CONFIRMED]) {
        elements.push(
            {
                type: FormElementType.BUTTON,
                span: 24,
                name: 'back',
                label: (
                    <div>
                        Back <RollbackOutlined />
                    </div>
                ),
                buttonType: 'primary',
                hidden: !isEditing,
                onClick: toggleEditing,
                resetFormValues: true
            },
            {
                type: FormElementType.BUTTON,
                span: 12,
                name: 'edit',
                label: (
                    <div>
                        {disabled ? 'Edit ' : 'Editing.. '}
                        <EditOutlined style={{ fontSize: 'large' }} />
                    </div>
                ),
                buttonType: 'primary',
                hidden: isEditing,
                onClick: toggleEditing
            }
        );
        if (
            (orderTrade.hasSupplierSigned && orderTrade.supplier !== signer?.address) ||
            (orderTrade.hasCommissionerSigned && orderTrade.commissioner !== signer?.address)
        ) {
            elements.push({
                type: FormElementType.BUTTON,
                span: 12,
                name: 'confirm',
                label: (
                    <Tooltip title="Confirm the negotiation if everything is OK">
                        Confirm Negotiation <CheckCircleOutlined style={{ fontSize: 'large' }} />
                    </Tooltip>
                ),
                buttonType: 'primary',
                hidden: isEditing,
                onClick: () => confirmNegotiation(orderTrade.tradeId)
            });
        }
    }
    return (
        <CardPage
            title={
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                    Order
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Tag color="green">
                            {negotiationStatus !== NegotiationStatus[NegotiationStatus.CONFIRMED]
                                ? negotiationStatus
                                : OrderStatus[getOrderStatus(orderTrade.tradeId)]}
                        </Tag>
                    </div>
                </div>
            }>
            <OrderStatusSteps
                status={getOrderStatus(orderTrade.tradeId)}
                orderTrade={orderTrade}
                submittable={!disabled}
                negotiationElements={elements}
                onSubmit={onSubmit}
            />
        </CardPage>
    );
};
export default OrderTradeView;
