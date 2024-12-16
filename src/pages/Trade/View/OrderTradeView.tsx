import { NegotiationStatus, OrderLine, OrderParams, OrderStatus } from '@kbc-lib/coffee-trading-management-lib';
import { Tooltip } from 'antd';
import React, { useState } from 'react';
import { FormElement, FormElementType, GenericForm } from '@/components/GenericForm/GenericForm';
import { regex } from '@/constants/regex';
import dayjs from 'dayjs';
import { useSigner } from '@/providers/auth/SignerProvider';
import { paths } from '@/constants/paths';
import { useNavigate } from 'react-router-dom';
import { CheckCircleOutlined, EditOutlined, FilePdfOutlined, RollbackOutlined } from '@ant-design/icons';
import { validateDates } from '@/utils/date';
import useOrderGenerator, { OrderSpec } from '@/hooks/documentGenerator/useOrderGenerator';
import PDFGenerationView from '@/components/PDFViewer/PDFGenerationView';
import { incotermsMap } from '@/constants/trade';
import { useOrder } from '@/providers/entities/icp/OrderProvider';
import { useProductCategory } from '@/providers/entities/icp/ProductCategoryProvider';
import { useEnumeration } from '@/providers/entities/icp/EnumerationProvider';

type OrderTradeViewProps = {
    disabled: boolean;
    toggleDisabled: () => void;
    commonElements: FormElement[];
};
export const OrderTradeView = ({ disabled, toggleDisabled, commonElements }: OrderTradeViewProps) => {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const { signer } = useSigner();
    const { units, fiats } = useEnumeration();
    const { order, update, sign } = useOrder();
    const { productCategories } = useProductCategory();

    if (!order) return <div>Order not available</div>;
    const status = OrderStatus[order.status];
    const [showGeneratedDocument, setShowGeneratedDocument] = useState(false);
    // TODO: in general, remove hardcoded values and add input in the form of the negotiation
    const orderSpec: OrderSpec = {
        id: `order_#${order.id}`,
        // TODO: add issueDate to order entity, so that also in the future (not today) I know when the order has been issued
        issueDate: new Date().getTime(),
        supplierAddress: order.supplier,
        commissionerAddress: order.commissioner,
        // TODO: define the currency directly in the negotiation terms, not in lines
        currency: 'USDC',
        items: order.lines.map((line, index) => ({
            id: `order_info_line#${index}`,
            productCategory: line.productCategory.name || '',
            productTypology: 'Green coffee beans',
            quality: line.productCategory.quality,
            moisture: 12,
            quantitySpecs: [
                {
                    value: line.quantity,
                    unitCode: line.unit
                },
                {
                    value: 3,
                    unitCode: "40' Dry containers"
                }
            ],
            weight: 900,
            sample: {
                isNeeded: true,
                description: '1 lb shipping sample to be provided prior shipment'
            },
            unitCode: line.unit,
            standards: ['RFA (Rain Forest Alliance)', 'ICO (Certificate of Origin)']
        })),
        constraints: {
            incoterms: order.incoterms,
            guaranteePercentage: 20,
            arbiterAddress: order.arbiter,
            shipper: order.shipper,
            shippingPort: order.shippingPort,
            deliveryPort: order.deliveryPort,
            deliveryDate: order.deliveryDeadline.getTime(),
            otherConditions:
                '1) Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua\n2) Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris\n...\n....\n.....\n6) Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident'
        }
    };

    const toggleEditing = () => {
        toggleDisabled();
        setIsEditing(!isEditing);
    };

    const disabledDate = (current: dayjs.Dayjs): boolean => {
        return current && current <= dayjs().endOf('day');
    };

    const onSubmit = async (values: any) => {
        const quantity = parseInt(values[`quantity-1`]);
        const unit = values[`unit-1`];
        const productCategory = productCategories.find((productCategory) => productCategory.id === values[`product-category-id-1`]);
        if (!productCategory) throw new Error('Product Category not found');
        const productCategoryId = productCategory?.id;

        const amount: number = parseInt(values[`price-1`]);
        const fiat: string = values[`fiat-1`];

        const updatedOrderTrade: OrderParams = {
            supplier: order.supplier,
            customer: order.customer,
            commissioner: order.commissioner,
            paymentDeadline: dayjs(values['payment-deadline']).toDate(),
            documentDeliveryDeadline: dayjs(values['document-delivery-deadline']).toDate(),
            arbiter: values['arbiter'],
            token: values['token-address'],
            shippingDeadline: dayjs(values['shipping-deadline']).toDate(),
            deliveryDeadline: dayjs(values['delivery-deadline']).toDate(),
            agreedAmount: parseInt(values['agreed-amount']),
            incoterms: values['incoterms'],
            shipper: values['shipper'],
            shippingPort: values['shipping-port'],
            deliveryPort: values['delivery-port'],
            lines: [
                {
                    quantity,
                    unit,
                    productCategoryId,
                    price: { amount, fiat }
                }
            ]
        };
        await update(updatedOrderTrade);
        toggleDisabled();
        navigate(paths.TRADES);
    };

    const elements: FormElement[] = [
        ...commonElements,
        { type: FormElementType.TITLE, span: 24, label: 'Constraints' },
        {
            type: FormElementType.SELECT,
            span: 12,
            name: 'incoterms',
            label: 'Incoterms',
            required: true,
            options: Array.from(incotermsMap.keys()).map((incoterm) => ({
                label: incoterm,
                value: incoterm
            })),
            defaultValue: order.incoterms,
            disabled
        },
        {
            type: FormElementType.INPUT,
            span: 12,
            name: 'arbiter',
            label: 'Arbiter',
            required: true,
            defaultValue: order.arbiter,
            disabled,
            regex: regex.ETHEREUM_ADDRESS
        },
        {
            type: FormElementType.DATE,
            span: 12,
            name: 'payment-deadline',
            label: 'Payment Deadline',
            required: true,
            defaultValue: dayjs(order.paymentDeadline),
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
            defaultValue: dayjs(order.documentDeliveryDeadline),
            disabled,
            dependencies: ['payment-deadline'],
            validationCallback: validateDates('document-delivery-deadline', 'payment-deadline', 'greater', 'This must be after Payment Deadline')
        },
        {
            type: FormElementType.INPUT,
            span: 8,
            name: 'shipper',
            label: 'Shipper',
            required: true,
            defaultValue: order.shipper,
            disabled
        },
        {
            type: FormElementType.INPUT,
            span: 8,
            name: 'shipping-port',
            label: 'Shipping Port',
            required: true,
            defaultValue: order.shippingPort,
            disabled
        },
        {
            type: FormElementType.DATE,
            span: 8,
            name: 'shipping-deadline',
            label: 'Shipping Deadline',
            required: true,
            defaultValue: dayjs(order.shippingDeadline),
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
            defaultValue: order.deliveryPort,
            disabled
        },
        {
            type: FormElementType.DATE,
            span: 12,
            name: 'delivery-deadline',
            label: 'Delivery Deadline',
            required: true,
            defaultValue: dayjs(order.deliveryDeadline),
            disabled,
            dependencies: ['shipping-deadline'],
            validationCallback: validateDates('delivery-deadline', 'shipping-deadline', 'greater', 'This must be after Shipping Deadline')
        },
        {
            type: FormElementType.INPUT,
            span: 12,
            name: 'agreed-amount',
            label: 'Agreed Amount',
            required: true,
            regex: regex.ONLY_DIGITS,
            defaultValue: order.agreedAmount,
            disabled
        },
        {
            type: FormElementType.INPUT,
            span: 12,
            name: 'token-address',
            label: 'Token Address',
            required: true,
            regex: regex.ETHEREUM_ADDRESS,
            defaultValue: order.token,
            disabled
        },
        { type: FormElementType.TITLE, span: 24, label: 'Line Items' }
    ];
    order.lines.forEach((line, index) => {
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
                defaultValue: line.productCategory.name,
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
    if (status !== NegotiationStatus[NegotiationStatus.CONFIRMED]) {
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
        if (!order.signatures.includes(signer._address) && (order.supplier !== signer._address || order.commissioner !== signer._address)) {
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
                onClick: () => sign(order.id)
            });
        }
    }
    elements.push({
        type: FormElementType.BUTTON,
        span: 24,
        name: 'generateDocument',
        label: (
            <div>
                {'Generate Document '}
                <FilePdfOutlined style={{ fontSize: 'large' }} />
            </div>
        ),
        buttonType: 'primary',
        hidden: isEditing,
        onClick: () => setShowGeneratedDocument(true)
    });

    return (
        <>
            <GenericForm elements={elements} confirmText="Are you sure you want to proceed?" submittable={!disabled} onSubmit={onSubmit} />
            <PDFGenerationView
                title={'Generated Order'}
                centered={true}
                visible={showGeneratedDocument}
                handleClose={() => setShowGeneratedDocument(false)}
                useGeneration={useOrderGenerator(orderSpec)}
                downloadable={true}
                filename={`order_${order.id}.pdf`}
            />
        </>
    );
};
export default OrderTradeView;
