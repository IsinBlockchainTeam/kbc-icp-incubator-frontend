import { FormElement, FormElementType } from '@/components/GenericForm/GenericForm';
import { CardPage } from '@/components/structure/CardPage/CardPage';
import { Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { paths } from '@/constants/paths';
import OrderForm from '@/pages/Trade/OrderForm';
import {
    OrderStatus,
    DocumentType,
    OrderLineRequest,
    OrderLinePrice,
    LineRequest
} from '@kbc-lib/coffee-trading-management-lib';
import { DetailedTradePresentable } from '@/api/types/TradePresentable';
import React, { useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { regex } from '@/utils/regex';
import { ValidateDatesType } from '@/pages/Trade/View/TradeView';
import useMaterial from '@/hooks/useMaterial';
import useMeasure from '@/hooks/useMeasure';
import { hideLoading, showLoading } from '@/redux/reducers/loadingSlice';
import { NotificationType, openNotification } from '@/utils/notification';
import { OrderTradeRequest } from '@/api/types/TradeRequest';
import dayjs from 'dayjs';
import { useDispatch } from 'react-redux';
import { SignerContext } from '@/providers/SignerProvider';
import { EthContext } from '@/providers/EthProvider';
import { notificationDuration } from '@/constants/notification';

type OrderTradeNewProps = {
    commonElements: FormElement[];
    validateDates: ValidateDatesType;
};
export const OrderTradeNew = ({ commonElements, validateDates }: OrderTradeNewProps) => {
    const { signer } = useContext(SignerContext);
    const { ethTradeService } = useContext(EthContext);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { units, fiats } = useMeasure();

    const { loadData, dataLoaded, productCategories } = useMaterial();

    useEffect(() => {
        if (!dataLoaded) loadData();
    }, [dataLoaded]);

    const disabledDate = (current: dayjs.Dayjs): boolean => {
        return current && current <= dayjs().endOf('day');
    };

    const onSubmit = async (values: any) => {
        try {
            //FIXME: This is a workaround to get data instead of the form
            values['supplier'] = location?.state?.supplierAddress || 'Unknown';
            values['customer'] = signer?.address || 'Unknown';
            values['commissioner'] = signer?.address || 'Unknown';
            values['product-category-id-1'] = location?.state?.productCategoryId || '0';
            dispatch(showLoading('Creating trade...'));
            const supplier: string = values['supplier'];
            const customer: string = values['customer'];
            const commissioner: string = values['commissioner'];

            const tradeLines: LineRequest[] = [];
            for (const key in values) {
                let id: string;
                if (key.startsWith('product-category-id-')) {
                    id = key.split('-')[3];
                    const quantity: number = parseInt(values[`quantity-${id}`]);
                    const unit: string = values[`unit-${id}`];
                    const productCategoryId: number = parseInt(values[key]);
                    const price: number = parseInt(values[`price-${id}`]);
                    const fiat: string = values[`fiat-${id}`];
                    tradeLines.push(
                        new OrderLineRequest(
                            productCategoryId,
                            quantity,
                            unit,
                            new OrderLinePrice(price, fiat)
                        )
                    );
                }
            }
            const orderTrade: OrderTradeRequest = {
                supplier,
                customer,
                commissioner,
                lines: tradeLines as OrderLineRequest[],
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
            await ethTradeService.saveOrderTrade(orderTrade);
            openNotification(
                'Order trade registered',
                `Order trade has been registered correctly!`,
                NotificationType.SUCCESS,
                notificationDuration
            );
            navigate(paths.TRADES);
        } catch (e: any) {
            console.log('error: ', e);
            openNotification('Error', e.message, NotificationType.ERROR, notificationDuration);
        } finally {
            dispatch(hideLoading());
        }
    };

    if (!dataLoaded) return <></>;

    const elements: FormElement[] = [
        ...commonElements,
        { type: FormElementType.TITLE, span: 24, label: 'Constraints' },
        {
            type: FormElementType.INPUT,
            span: 12,
            name: 'incoterms',
            label: 'Incoterms',
            required: true,
            defaultValue: '',
            disabled: false
        },
        {
            type: FormElementType.INPUT,
            span: 12,
            name: 'arbiter',
            label: 'Arbiter',
            required: true,
            defaultValue: '',
            disabled: false,
            regex: regex.ETHEREUM_ADDRESS
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
            span: 6,
            name: 'product-category-id-1',
            label: 'Product Category',
            required: false,
            options: productCategories.map((productCategory) => ({
                label: productCategory.name,
                value: productCategory.id
            })),
            defaultValue:
                productCategories.find((pc) => pc.id === location?.state?.productCategoryId)?.id ||
                -1,
            disabled: true
        },
        {
            type: FormElementType.INPUT,
            span: 5,
            name: `quantity-1`,
            label: 'Quantity',
            required: true,
            regex: regex.ONLY_DIGITS,
            defaultValue: '',
            disabled: false
        },
        {
            type: FormElementType.SELECT,
            span: 4,
            name: `unit-1`,
            label: 'Unit',
            required: true,
            options: units.map((unit) => ({ label: unit, value: unit })),
            defaultValue: '',
            disabled: false
        },
        {
            type: FormElementType.INPUT,
            span: 5,
            name: `price-1`,
            label: 'Price',
            required: true,
            defaultValue: '',
            regex: regex.ONLY_DIGITS,
            disabled: false
        },
        {
            type: FormElementType.SELECT,
            span: 4,
            name: `fiat-1`,
            label: 'Fiat',
            required: true,
            options: fiats.map((fiat) => ({ label: fiat, value: fiat })),
            defaultValue: '',
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
                    <Button
                        type="primary"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => navigate(paths.TRADES)}>
                        Delete Trade
                    </Button>
                </div>
            }>
            <OrderForm
                status={OrderStatus.CONTRACTING}
                submittable={true}
                negotiationElements={elements}
                validationCallback={
                    {} as (
                        tradeInfo: DetailedTradePresentable | undefined,
                        documentType: DocumentType
                    ) => undefined | { approve: () => Promise<void>; reject: () => Promise<void> }
                }
                onSubmitNew={onSubmit}
                onSubmitView={async (values: any) => {
                    return;
                }}
            />
        </CardPage>
    );
};
