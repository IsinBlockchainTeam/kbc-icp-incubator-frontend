import { FormElement, FormElementType, GenericForm } from '@/components/GenericForm/GenericForm';
import {
    DocumentType,
    LineRequest,
    OrderLinePrice,
    OrderLineRequest,
    OrderStatus,
    TradeType
} from '@kbc-lib/coffee-trading-management-lib';
import { Button, FormInstance } from 'antd';
import { CardPage } from '@/components/structure/CardPage/CardPage';
import React, { useContext, useEffect, useState } from 'react';
import { DeleteOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import OrderForm from '@/pages/Trade/OrderForm';
import { paths } from '@/constants/paths';
import { hideLoading, showLoading } from '@/redux/reducers/loadingSlice';
import { BasicTradeRequest, OrderTradeRequest } from '@/api/types/TradeRequest';
import { DocumentRequest } from '@/api/types/DocumentRequest';
import { NotificationType, openNotification } from '@/utils/notification';
import dayjs from 'dayjs';
import { SignerContext } from '@/providers/SignerProvider';
import { useDispatch } from 'react-redux';
import { EthContext } from '@/providers/EthProvider';
import useActorName from '@/hooks/useActorName';
import { regex } from '@/utils/regex';
import useMaterial from '@/hooks/useMaterial';
import useMeasure from '@/hooks/useMeasure';
import { DetailedTradePresentable } from '@/api/types/TradePresentable';

const validateDates = (
    dataFieldName: string,
    dateFieldNameToCompare: string,
    comparison: 'greater' | 'less',
    errorMessage: string
) => {
    return (form: FormInstance): Promise<void> => {
        const date = dayjs(form.getFieldValue(dataFieldName));
        const dateToCompare = dayjs(form.getFieldValue(dateFieldNameToCompare));
        if (date && dateToCompare)
            if (
                (comparison === 'greater' && date.isBefore(dateToCompare)) ||
                (comparison === 'less' && date.isAfter(dateToCompare))
            )
                return Promise.reject(errorMessage);

        return Promise.resolve();
    };
};

export const TradeNew = () => {
    const { signer } = useContext(SignerContext);
    const { ethTradeService } = useContext(EthContext);
    const dispatch = useDispatch();
    const { getActorName } = useActorName();
    const { loadData, dataLoaded, productCategories } = useMaterial();
    const { units, fiats } = useMeasure();

    const navigate = useNavigate();
    const location = useLocation();

    const [areNamesReady, setAreNamesReady] = useState<boolean>(false);
    const [supplierName, setSupplierName] = useState<string>('Unknown');
    const [commissionerName, setCommissionerName] = useState<string>('Unknown');

    const type = parseInt(new URLSearchParams(location.search).get('type')!);
    const documentHeight = '45vh';
    const elements: FormElement[] = [];

    useEffect(() => {
        fetchNames();
        loadData();
    }, []);

    const fetchNames = async () => {
        setSupplierName(await getActorName(location?.state?.supplierName));
        setCommissionerName(await getActorName(signer?.address));
        setAreNamesReady(true);
    };

    if (!areNamesReady || !dataLoaded) {
        return <></>;
    }

    const onSubmit = async (values: any) => {
        try {
            //FIXME: This is a workaround to get data instead of the form
            values['supplier'] = location?.state?.supplierName || 'Unknown';
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

                    if (type === TradeType.BASIC) {
                        tradeLines.push(new LineRequest(productCategoryId, quantity, unit));
                    } else {
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
            }
            if (type === TradeType.BASIC) {
                const basicTrade: BasicTradeRequest = {
                    supplier,
                    customer,
                    commissioner,
                    lines: tradeLines as LineRequest[],
                    name: values['name']
                };
                const deliveryNote: DocumentRequest = {
                    content: values['certificate-of-shipping'],
                    filename: values['certificate-of-shipping'].name,
                    documentType: DocumentType.DELIVERY_NOTE
                };
                await ethTradeService.saveBasicTrade(basicTrade, [deliveryNote]);
                openNotification(
                    'Basic trade registered',
                    `Basic trade "${values.name}" has been registered correctly!`,
                    NotificationType.SUCCESS,
                    1
                );
            } else {
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
                    1
                );
            }
            navigate(paths.TRADES);
        } catch (e: any) {
            console.log('error: ', e);
            openNotification('Error', e.message, NotificationType.ERROR);
        } finally {
            dispatch(hideLoading());
        }
    };

    elements.push(
        { type: FormElementType.TITLE, span: 24, label: 'Actors' },
        {
            type: FormElementType.INPUT,
            span: 8,
            name: 'supplier',
            label: 'Supplier',
            required: true,
            defaultValue: supplierName,
            disabled: true
        },
        {
            type: FormElementType.INPUT,
            span: 8,
            name: 'customer',
            label: 'Customer',
            required: true,
            defaultValue: commissionerName,
            disabled: true
        },
        {
            type: FormElementType.INPUT,
            span: 8,
            name: 'commissioner',
            label: 'Commissioner',
            required: true,
            defaultValue: commissionerName,
            disabled: true
        }
    );
    if (type === TradeType.BASIC) {
        elements.push(
            { type: FormElementType.TITLE, span: 24, label: 'Data' },
            {
                type: FormElementType.INPUT,
                span: 12,
                name: 'name',
                // WTF is this?
                // label: 'Reference ID',
                label: 'Name',
                required: true,
                defaultValue: '',
                disabled: false
            },
            {
                type: FormElementType.DOCUMENT,
                span: 12,
                name: 'certificate-of-shipping',
                label: 'Shipping Invoice',
                required: true,
                loading: false,
                uploadable: true,
                height: documentHeight
            },
            { type: FormElementType.TITLE, span: 24, label: 'Line Item' },
            {
                type: FormElementType.SELECT,
                span: 8,
                name: 'product-category-id-1',
                label: 'Product Category',
                required: false,
                options: productCategories.map((productCategory) => ({
                    label: productCategory.name,
                    value: productCategory.id
                })),
                defaultValue:
                    productCategories.find((pc) => pc.id === location?.state?.productCategoryId)
                        ?.id || -1,
                disabled: true
            },
            {
                type: FormElementType.INPUT,
                span: 6,
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
            { type: FormElementType.SPACE, span: 6 }
        );
    } else {
        elements.push(
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
                    productCategories.find((pc) => pc.id === location?.state?.productCategoryId)
                        ?.id || -1,
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
        );
    }

    if (!location?.state?.supplierName || !location?.state?.productCategoryId) {
        navigate(paths.HOME);
    } else {
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
                {type === TradeType.ORDER ? (
                    <OrderForm
                        status={OrderStatus.CONTRACTING}
                        submittable={true}
                        negotiationElements={elements}
                        validationCallback={
                            {} as (
                                tradeInfo: DetailedTradePresentable | undefined,
                                documentType: DocumentType
                            ) =>
                                | undefined
                                | { approve: () => Promise<void>; reject: () => Promise<void> }
                        }
                        onSubmitNew={onSubmit}
                        onSubmitView={async (values: any) => {
                            return;
                        }}
                    />
                ) : (
                    <GenericForm elements={elements} submittable={true} onSubmit={onSubmit} />
                )}
            </CardPage>
        );
    }
    return <></>;
};
