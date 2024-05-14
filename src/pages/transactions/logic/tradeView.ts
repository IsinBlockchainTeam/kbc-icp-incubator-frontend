import useTradeShared from "./tradeShared";
import {NotificationType, openNotification} from "../../../utils/notification";
import {
    BasicTrade,
    DocumentType, LineRequest,
    NegotiationStatus,
    OrderLine, OrderLinePrice, OrderLineRequest,
    OrderTrade,
    TradeType
} from "@kbc-lib/coffee-trading-management-lib";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import {useDispatch} from "react-redux";
import {useEffect, useState} from "react";
import {DetailedTradePresentable} from "../../../api/types/TradePresentable";
import {hideLoading, showLoading} from "../../../redux/reducers/loadingSlice";
import {FormElement, FormElementType} from "../../../components/GenericForm/GenericForm";
import {regex} from "../../../utils/regex";
import dayjs from "dayjs";
import {paths} from "../../../constants";
import {getEnumKeyByValue} from "../../../utils/utils";
import {BasicTradeRequest, OrderTradeRequest} from "../../../api/types/TradeRequest";

export default function useTradeView() {
    const { units, fiats, ethTradeService, orderState } = useTradeShared();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const {id} = useParams();
    const location = useLocation();
    const type = parseInt(new URLSearchParams(location.search).get('type')!);

    const [trade, setTrade] = useState<DetailedTradePresentable>();
    const [loadingDocuments, setLoadingDocuments] = useState<boolean>(true);
    const [disabled, setDisabled] = useState<boolean>(true);
    const [negotiationStatus, setNegotiationStatus] = useState<string | undefined>(undefined);

    const toggleDisabled = () => {
        setDisabled(!disabled);
    }

    const confirmNegotiation = async () => {
        if (!ethTradeService) {
            console.error("EthTradeService not found");
            return;
        }
        try {
            await ethTradeService.confirmOrderTrade(parseInt(id!));
            openNotification("Negotiation confirmed", `The negotiation has been confirmed`, NotificationType.SUCCESS, 1);
            navigate(paths.TRADES);
        }
        catch (e: any) {
            console.log("error: ", e);
            openNotification("Error", e.message, NotificationType.ERROR);
        }
    }

    const getTradeInfo = async (id: number) => {
        if (!ethTradeService) {
            console.error("EthTradeService not found");
            return;
        }
        try {
            dispatch(showLoading("Retrieving trade..."));
            const resp = await ethTradeService.getTradeById(id);
            resp && setTrade(resp);
        } catch (e: any) {
            console.log("error: ", e);
            openNotification("Error", e.message, NotificationType.ERROR);
        } finally {
            dispatch(hideLoading())
        }
    }

    const [elements, setElements] = useState<FormElement[]>([]);

    useEffect(() => {
        (async () => {
            await getTradeInfo(parseInt(id!));
            setLoadingDocuments(false);
        })();
    }, []);

    useEffect(() => {
        if(!trade) return;

        const commonElements: FormElement[] = [
            {type: FormElementType.TITLE, span: 24, label: 'Actors'}, {
                type: FormElementType.INPUT,
                span: 8,
                name: 'supplier',
                label: 'Supplier',
                required: true,
                regex: regex.ETHEREUM_ADDRESS,
                defaultValue: trade.trade.supplier,
                disabled: true,
            },
            {
                type: FormElementType.INPUT,
                span: 8,
                name: 'customer',
                label: 'Customer',
                required: true,
                regex: regex.ETHEREUM_ADDRESS,
                defaultValue: trade.trade.customer,
                disabled: true,
            },
            {
                type: FormElementType.INPUT,
                span: 8,
                name: 'commissioner',
                label: 'Commissioner',
                required: true,
                regex: regex.ETHEREUM_ADDRESS,
                defaultValue: trade.trade.commissioner,
                disabled: true,
            },
        ]

        let documentElement: FormElement;
        const documentHeight = '45vh';
        if(type === TradeType.BASIC) {
            const content = trade.documents.get(DocumentType.DELIVERY_NOTE)?.content;
            documentElement = {
                type: FormElementType.DOCUMENT,
                span: 12,
                name: 'certificate-of-shipping',
                label: 'Certificate of Shipping',
                required: false,
                loading: false,
                uploadable: !disabled,
                content: content,
                height: documentHeight,
            }
        } else if(type === TradeType.ORDER) {
            const content = trade.documents.get(DocumentType.PAYMENT_INVOICE)?.content;
            documentElement = {
                type: FormElementType.DOCUMENT,
                span: 12,
                name: 'payment-invoice',
                label: 'Payment Invoice',
                required: false,
                loading: false,
                uploadable: !disabled,
                content: content,
                height: documentHeight,
            }
        } else {
            throw new Error("Invalid trade type");
        }

        if (type === TradeType.BASIC) {
            const basicTrade = trade.trade as BasicTrade;
            const newElements = [...commonElements];
            newElements.push(
                {type: FormElementType.TITLE, span: 24, label: 'Data'},
                {
                    type: FormElementType.INPUT,
                    span: 12,
                    name: 'name',
                    label: 'Name',
                    required: true,
                    defaultValue: basicTrade.name,
                    disabled,
                },
                documentElement,
                {type: FormElementType.TITLE, span: 24, label: 'Line Item'},
            );
            basicTrade.lines.forEach((line, index) => {
                newElements.push(
                    {
                        type: FormElementType.INPUT,
                        span: 8,
                        name: `product-category-id-${index+1}`,
                        label: 'Product Category Id',
                        required: true,
                        defaultValue: line.productCategory?.id.toString(),
                        disabled,
                    },
                    {
                        type: FormElementType.INPUT,
                        span: 6,
                        name: `quantity-${index+1}`,
                        label: 'Quantity',
                        required: true,
                        defaultValue: line.quantity?.toString(),
                        disabled,
                    },
                    {
                        type: FormElementType.SELECT,
                        span: 4,
                        name: `unit-${index+1}`,
                        label: 'Unit',
                        required: true,
                        options: units.map((unit) => ({label: unit, value: unit})),
                        defaultValue: line.unit!,
                        disabled,
                    },
                    {type: FormElementType.SPACE, span: 6},
                );
            });
            setElements(newElements);
        }
        else {
            const orderTrade = trade.trade as OrderTrade;

            setNegotiationStatus(getEnumKeyByValue(NegotiationStatus, orderTrade.negotiationStatus));
            const newElements = [...commonElements];
            newElements.push(
                {type: FormElementType.TITLE, span: 24, label: 'Constraints'},
                {
                    type: FormElementType.INPUT,
                    span: 12,
                    name: 'incoterms',
                    label: 'Incoterms',
                    required: true,
                    defaultValue: orderTrade.metadata?.incoterms,
                    disabled,
                },
                documentElement,
                {
                    type: FormElementType.DATE,
                    span: 12,
                    name: 'payment-deadline',
                    label: 'Payment Deadline',
                    required: true,
                    defaultValue: dayjs.unix(orderTrade.paymentDeadline),
                    disabled,
                },
                {
                    type: FormElementType.DATE,
                    span: 12,
                    name: 'document-delivery-deadline',
                    label: 'Document Delivery Deadline',
                    required: true,
                    defaultValue: dayjs.unix(orderTrade.documentDeliveryDeadline),
                    disabled,
                },
                {
                    type: FormElementType.INPUT,
                    span: 12,
                    name: 'shipper',
                    label: 'Shipper',
                    required: true,
                    defaultValue: orderTrade.metadata?.shipper,
                    disabled,
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
                    type: FormElementType.INPUT,
                    span: 12,
                    name: 'shipping-port',
                    label: 'Shipping Port',
                    required: true,
                    defaultValue: orderTrade.metadata?.shippingPort,
                    disabled,
                },
                {
                    type: FormElementType.DATE,
                    span: 12,
                    name: 'shipping-deadline',
                    label: 'Shipping Deadline',
                    required: true,
                    defaultValue: dayjs.unix(orderTrade.shippingDeadline),
                    disabled,
                },
                {
                    type: FormElementType.INPUT,
                    span: 12,
                    name: 'delivery-port',
                    label: 'Delivery Port',
                    required: true,
                    defaultValue: orderTrade.metadata?.deliveryPort,
                    disabled,
                },
                {
                    type: FormElementType.DATE,
                    span: 12,
                    name: 'delivery-deadline',
                    label: 'Delivery Deadline',
                    required: true,
                    defaultValue: dayjs.unix(orderTrade.deliveryDeadline),
                    disabled,
                },
                {
                    type: FormElementType.INPUT,
                    span: 12,
                    name: 'agreed-amount',
                    label: 'Agreed Amount',
                    required: true,
                    regex: regex.ONLY_DIGITS,
                    defaultValue: orderTrade.agreedAmount,
                    disabled,
                },
                {
                    type: FormElementType.INPUT,
                    span: 12,
                    name: 'token-address',
                    label: 'Token Address',
                    required: true,
                    regex: regex.ETHEREUM_ADDRESS,
                    defaultValue: orderTrade.tokenAddress,
                    disabled,
                },
                {type: FormElementType.TITLE, span: 24, label: 'Line Items'},
            );
            orderTrade.lines.forEach((line, index) => {
                newElements.push(
                    {
                        type: FormElementType.INPUT,
                        span: 6,
                        name: `product-category-id-${index+1}`,
                        label: 'Product Category Id',
                        required: true,
                        defaultValue: line.productCategory?.id.toString(),
                        disabled,
                    },
                    {
                        type: FormElementType.INPUT,
                        span: 5,
                        name: `quantity-${index+1}`,
                        label: 'Quantity',
                        required: true,
                        regex: regex.ONLY_DIGITS,
                        defaultValue: line.quantity?.toString(),
                        disabled,
                    },
                    {
                        type: FormElementType.SELECT,
                        span: 4,
                        name: `unit-${index+1}`,
                        label: 'Unit',
                        required: true,
                        options: units.map((unit) => ({label: unit, value: unit})),
                        defaultValue: line.unit!,
                        disabled,
                    },
                    {
                        type: FormElementType.INPUT,
                        span: 5,
                        name: `price-${index+1}`,
                        label: 'Price',
                        required: true,
                        defaultValue: (line as OrderLine).price?.amount.toString(),
                        disabled,
                    },
                    {
                        type: FormElementType.SELECT,
                        span: 4,
                        name: `fiat-${index+1}`,
                        label: 'Fiat',
                        required: true,
                        options: fiats.map((fiat) => ({label: fiat, value: fiat})),
                        defaultValue: (line as OrderLine).price!.fiat,
                        disabled,
                    },
                );
            });
            setElements(newElements);
        }
    }, [trade, disabled]);

    const onSubmit = async (values: any) => {
        if (!ethTradeService) {
            console.error("EthTradeService not found");
            return;
        }
        try {
            dispatch(showLoading("Loading..."));
            if (values['delivery-deadline'] <= values['shipping-deadline']) {
                openNotification("Delivery deadline cannot be less then shipping one", '', NotificationType.ERROR);
            }

            const supplier: string = values['supplier'];
            const customer: string = values['customer'];
            const commissioner: string = values['commissioner'];
            const quantity: number = parseInt(values[`quantity-1`]);
            const unit: string = values[`unit-1`];
            const productCategoryId: number = parseInt(values['product-category-id-1']);

            if(type === TradeType.BASIC) {
                const updatedBasicTrade: BasicTradeRequest = {
                    supplier,
                    customer,
                    commissioner,
                    lines: [new LineRequest(productCategoryId, quantity, unit)],
                    name: values['name'],
                };
                await ethTradeService.putBasicTrade(parseInt(id!), updatedBasicTrade);
            }
            else if (type === TradeType.ORDER) {
                const price: number = parseInt(values[`price-1`]);
                const fiat: string = values[`fiat-1`];

                const updatedOrderTrade: OrderTradeRequest = {
                    supplier,
                    customer,
                    commissioner,
                    lines: [new OrderLineRequest(productCategoryId, quantity, unit, new OrderLinePrice(price, fiat))],
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
                    deliveryPort: values['delivery-port'],
                };
                await ethTradeService.putOrderTrade(parseInt(id!), updatedOrderTrade);
            }
            setDisabled(true);
            navigate(paths.TRADES);
        } catch (e: any) {
            console.log("error: ", e);
            openNotification("Error", e.message, NotificationType.ERROR);
        } finally {
            dispatch(hideLoading())
        }
    }

    return {
        type,
        orderState,
        elements,
        trade,
        loadingDocuments,
        disabled,
        negotiationStatus,
        toggleDisabled,
        onSubmit,
        confirmNegotiation
    }
}
