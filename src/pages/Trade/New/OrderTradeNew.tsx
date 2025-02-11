import { FormElement, FormElementType, GenericForm } from '@/components/GenericForm/GenericForm';
import { CardPage } from '@/components/CardPage/CardPage';
import { Button, Empty } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { paths } from '@/constants/paths';
import { Material, OrderParams } from '@kbc-lib/coffee-trading-management-lib';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { regex } from '@/constants/regex';
import dayjs from 'dayjs';
import { validateDates } from '@/utils/date';
import { incotermsMap } from '@/constants/trade';
import { useOrder } from '@/providers/entities/icp/OrderProvider';
import { useProductCategory } from '@/providers/entities/icp/ProductCategoryProvider';
import { useEnumeration } from '@/providers/entities/icp/EnumerationProvider';
import { useMaterial } from '@/providers/entities/icp/MaterialProvider';
import { MaterialInfoCardContent } from '@/components/CardContents/MaterialInfoCardContent';
import { useBusinessRelation } from '@/providers/entities/icp/BusinessRelationProvider';

type OrderTradeNewProps = {
    supplierAddress: string;
    customerAddress: string;
    supplierMaterial: Material;
    commonElements: FormElement[];
};

export const OrderTradeNew = ({ supplierAddress, customerAddress, commonElements, supplierMaterial }: OrderTradeNewProps) => {
    const navigate = useNavigate();
    const { units, fiats } = useEnumeration();
    const { productCategories } = useProductCategory();
    const { materials } = useMaterial();
    const { getBusinessRelation, discloseInformation } = useBusinessRelation();
    const { createOrder } = useOrder();

    if (!productCategories || productCategories.length === 0) {
        return <div />;
    }

    const disabledDate = (current: dayjs.Dayjs): boolean => {
        return current && current <= dayjs().endOf('day');
    };

    const verifyBusinessRelation = async (ethAddress: string) => {
        try {
            getBusinessRelation(ethAddress);
        } catch (error) {
            await discloseInformation(ethAddress);
        }
    };

    const onSubmit = async (values: any) => {
        //FIXME: This is a workaround to get data instead of the form
        values['supplier'] = supplierAddress;
        values['customer'] = customerAddress;
        values['commissioner'] = customerAddress;

        const orderTrade: OrderParams = {
            supplier: supplierAddress,
            customer: customerAddress,
            commissioner: customerAddress,
            paymentDeadline: dayjs(values['payment-deadline']).toDate(),
            documentDeliveryDeadline: dayjs(values['document-delivery-deadline']).toDate(),
            arbiter: values['arbiter'],
            shippingDeadline: dayjs(values['shipping-deadline']).toDate(),
            deliveryDeadline: dayjs(values['delivery-deadline']).toDate(),
            agreedAmount: parseInt(values['agreed-amount']),
            token: values['token-address'],
            incoterms: values['incoterms'],
            shipper: values['shipper'],
            shippingPort: values['shipping-port'],
            deliveryPort: values['delivery-port'],
            lines: [
                {
                    supplierMaterialId: values['supplier-material'],
                    commissionerMaterialId: values['commissioner-material'],
                    quantity: parseInt(values['quantity']),
                    unit: values['unit'],
                    price: {
                        amount: parseInt(values['price']),
                        fiat: values['fiat']
                    }
                }
            ]
        };
        await createOrder(orderTrade);

        await verifyBusinessRelation(orderTrade.supplier);

        navigate(paths.TRADES);
    };

    const supplierMaterialInfoCard = <MaterialInfoCardContent material={supplierMaterial} />;
    const elements: FormElement[] = [
        ...commonElements,
        { type: FormElementType.TITLE, span: 24, label: 'Constraints' },
        {
            type: FormElementType.SELECT,
            span: 12,
            name: 'incoterms',
            label: 'Incoterms',
            required: true,
            defaultValue: '',
            options: Array.from(incotermsMap.keys()).map((incoterm) => ({
                label: incoterm,
                value: incoterm
            })),
            disabled: false
        },
        {
            type: FormElementType.INPUT,
            span: 12,
            name: 'arbiter',
            label: 'Arbiter',
            required: true,
            defaultValue: '',
            disabled: false
        },
        {
            type: FormElementType.DATE,
            span: 12,
            name: 'payment-deadline',
            label: 'Payment Deadline',
            required: true,
            defaultValue: '',
            disabled: false,
            disableValues: disabledDate,
            dependencies: ['document-delivery-deadline']
        },
        {
            type: FormElementType.DATE,
            span: 12,
            name: 'document-delivery-deadline',
            label: 'Document Delivery Deadline',
            required: true,
            defaultValue: '',
            disabled: false,
            dependencies: ['payment-deadline'],
            validationCallback: validateDates('document-delivery-deadline', 'payment-deadline', 'greater', 'This must be after Payment Deadline')
        },
        {
            type: FormElementType.INPUT,
            span: 8,
            name: 'shipper',
            label: 'Shipper',
            required: true,
            defaultValue: '',
            disabled: false
        },
        {
            type: FormElementType.INPUT,
            span: 8,
            name: 'shipping-port',
            label: 'Shipping Port',
            required: true,
            defaultValue: '',
            disabled: false
        },
        {
            type: FormElementType.DATE,
            span: 8,
            name: 'shipping-deadline',
            label: 'Shipping Deadline',
            required: true,
            defaultValue: '',
            disabled: false,
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
            defaultValue: '',
            disabled: false
        },
        {
            type: FormElementType.DATE,
            span: 12,
            name: 'delivery-deadline',
            label: 'Delivery Deadline',
            required: true,
            defaultValue: '',
            disabled: false,
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
            defaultValue: '',
            disabled: false
        },
        {
            type: FormElementType.INPUT,
            span: 12,
            name: 'token-address',
            label: 'Token Address',
            required: true,
            regex: regex.ETHEREUM_ADDRESS,
            defaultValue: '',
            disabled: false
        },
        { type: FormElementType.TITLE, span: 24, label: 'Line Item' },
        {
            type: FormElementType.SELECT,
            span: 12,
            name: `supplier-material`,
            label: 'Supplier Material',
            required: true,
            options: [
                {
                    label: supplierMaterial.name,
                    value: supplierMaterial.id
                }
            ],
            defaultValue: supplierMaterial.id,
            disabled: true
        },
        {
            type: FormElementType.CARD,
            span: 12,
            name: 'supplier-material-details',
            title: 'Material details',
            hidden: false,
            content: supplierMaterialInfoCard
        },
        {
            type: FormElementType.SELECT,
            span: 12,
            name: `commissioner-material`,
            label: 'Commissioner Material',
            required: true,
            options: materials
                .filter((material) => material.isInput)
                .map((material) => ({
                    label: material.name,
                    value: material.id
                })),
            defaultValue: undefined,
            disabled: false
        },
        {
            type: FormElementType.CARD,
            span: 12,
            name: 'commissioner-material-details',
            title: 'Material details',
            hidden: false,
            content: (values) => {
                if (values && values['commissioner-material'] !== undefined) {
                    const selectedCommissionerMaterial = materials.find((material) => material.id === values['commissioner-material']);
                    return <MaterialInfoCardContent material={selectedCommissionerMaterial} />;
                }
                return <Empty />;
            }
        },
        {
            type: FormElementType.INPUT,
            span: 6,
            name: `quantity`,
            label: 'Quantity',
            required: true,
            regex: regex.ONLY_DIGITS,
            defaultValue: '',
            disabled: false
        },
        {
            type: FormElementType.SELECT,
            span: 6,
            name: `unit`,
            label: 'Unit',
            required: true,
            options: units.map((unit) => ({ label: unit, value: unit })),
            defaultValue: undefined,
            disabled: false
        },
        {
            type: FormElementType.INPUT,
            span: 6,
            name: `price`,
            label: 'Price',
            required: true,
            defaultValue: '',
            regex: regex.ONLY_DIGITS,
            disabled: false
        },
        {
            type: FormElementType.SELECT,
            span: 6,
            name: `fiat`,
            label: 'Fiat',
            required: true,
            options: fiats.map((fiat) => ({ label: fiat, value: fiat })),
            defaultValue: undefined,
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
                    New Trade
                    <Button type="primary" danger icon={<DeleteOutlined />} onClick={() => navigate(paths.TRADES)}>
                        Delete Trade
                    </Button>
                </div>
            }>
            <GenericForm elements={elements} onSubmit={onSubmit} submittable={true} />
        </CardPage>
    );
};
