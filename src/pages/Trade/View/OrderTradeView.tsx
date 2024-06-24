import {
    NegotiationStatus,
    OrderTrade,
    DocumentType,
    DocumentStatus,
    OrderLineRequest,
    OrderLinePrice,
    OrderLine
} from '@kbc-lib/coffee-trading-management-lib';
import { Tag, Tooltip } from 'antd';
import { CheckCircleOutlined, EditOutlined } from '@ant-design/icons';
import OrderForm from '@/pages/Trade/OrderForm';
import { DetailedTradePresentable, OrderTradePresentable } from '@/api/types/TradePresentable';
import { CardPage } from '@/components/structure/CardPage/CardPage';
import React, { useContext, useEffect } from 'react';
import { FormElement, FormElementType } from '@/components/GenericForm/GenericForm';
import { regex } from '@/utils/regex';
import dayjs from 'dayjs';
import { ValidateDatesType } from '@/pages/Trade/View/TradeView';
import { SignerContext } from '@/providers/SignerProvider';
import useDocument from '@/hooks/useDocument';
import { hideLoading, showLoading } from '@/redux/reducers/loadingSlice';
import { NotificationType, openNotification } from '@/utils/notification';
import { OrderTradeRequest } from '@/api/types/TradeRequest';
import { paths } from '@/constants/paths';
import { useDispatch } from 'react-redux';
import { EthContext } from '@/providers/EthProvider';
import { useNavigate } from 'react-router-dom';
import useMaterial from '@/hooks/useMaterial';
import useMeasure from '@/hooks/useMeasure';

type OrderTradeViewProps = {
    orderTradePresentable: OrderTradePresentable;
    disabled: boolean;
    toggleDisabled: () => void;
    confirmNegotiation: () => void;
    commonElements: FormElement[];
    validateDates: ValidateDatesType;
};
export const OrderTradeView = ({
    orderTradePresentable,
    disabled,
    toggleDisabled,
    confirmNegotiation,
    commonElements,
    validateDates
}: OrderTradeViewProps) => {
    const { signer } = useContext(SignerContext);
    const { ethTradeService } = useContext(EthContext);
    const { loadData, dataLoaded, productCategories } = useMaterial();
    const { units, fiats } = useMeasure();
    const { validateDocument } = useDocument();
    const dispatch = useDispatch();
    const orderTrade = orderTradePresentable.trade as OrderTrade;
    const negotiationStatus = NegotiationStatus[orderTrade.negotiationStatus];
    const navigate = useNavigate();

    useEffect(() => {
        if (!dataLoaded) loadData();
    }, [dataLoaded]);

    const validationCallback = (
        tradeInfo: DetailedTradePresentable | undefined,
        documentType: DocumentType
    ) => {
        if (!tradeInfo) return undefined;
        const doc = tradeInfo.documents.get(documentType);
        return doc &&
            doc.status === DocumentStatus.NOT_EVALUATED &&
            doc.uploadedBy !== signer?.address
            ? {
                  approve: () =>
                      validateDocument(tradeInfo.trade.tradeId, doc.id, DocumentStatus.APPROVED),
                  reject: () =>
                      validateDocument(tradeInfo.trade.tradeId, doc.id, DocumentStatus.NOT_APPROVED)
              }
            : undefined;
    };

    const onSubmit = async (values: any) => {
        try {
            dispatch(showLoading('Loading...'));
            if (values['delivery-deadline'] <= values['shipping-deadline']) {
                openNotification(
                    'Delivery deadline cannot be less then shipping one',
                    '',
                    NotificationType.ERROR
                );
            } else {
                const supplier: string = values['supplier'];
                const customer: string = values['customer'];
                const commissioner: string = values['commissioner'];
                const quantity: number = parseInt(values[`quantity-1`]);
                const unit: string = values[`unit-1`];
                const productCategoryId: number = parseInt(values['product-category-id-1']);

                const price: number = parseInt(values[`price-1`]);
                const fiat: string = values[`fiat-1`];

                const updatedOrderTrade: OrderTradeRequest = {
                    supplier,
                    customer,
                    commissioner,
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
                await ethTradeService.putOrderTrade(orderTrade.tradeId, updatedOrderTrade);
                toggleDisabled();
                navigate(paths.TRADES);
            }
        } catch (e: any) {
            console.log('error: ', e);
            openNotification('Error', e.message, NotificationType.ERROR);
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
                        <Tag color="green">{negotiationStatus.toUpperCase()}</Tag>
                        {negotiationStatus !== NegotiationStatus[NegotiationStatus.CONFIRMED] && (
                            <div>
                                <EditOutlined
                                    style={{ marginLeft: '8px' }}
                                    onClick={toggleDisabled}
                                />
                                <Tooltip title="Confirm the negotiation if everything is OK">
                                    <CheckCircleOutlined
                                        style={{ marginLeft: '8px' }}
                                        onClick={confirmNegotiation}
                                    />
                                </Tooltip>
                            </div>
                        )}
                    </div>
                </div>
            }>
            <OrderForm
                status={orderTradePresentable.status}
                tradeInfo={orderTradePresentable}
                submittable={!disabled}
                negotiationElements={elements}
                validationCallback={validationCallback}
                onSubmitView={onSubmit}
                onSubmitNew={async (values: any) => {
                    return;
                }}
            />
        </CardPage>
    );
};
export default OrderTradeView;
