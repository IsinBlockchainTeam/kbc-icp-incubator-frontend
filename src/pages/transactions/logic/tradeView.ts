import useTradeShared from "./tradeShared";
import {NotificationType, openNotification} from "../../../utils/notification";
import {DocumentType, TradeType} from "@kbc-lib/coffee-trading-management-lib";
import {useLocation, useParams} from "react-router-dom";
import {useDispatch} from "react-redux";
import {useEffect, useState} from "react";
import {TradePresentable} from "../../../api/types/TradePresentable";
import {DocumentPresentable} from "../../../api/types/DocumentPresentable";
import {EthDocumentService} from "../../../api/services/EthDocumentService";
import {hideLoading, showLoading} from "../../../redux/reducers/loadingSlice";
import {FormElement, FormElementType} from "../../../components/GenericForm/GenericForm";
import {regex} from "../../../utils/regex";
import dayjs from "dayjs";

export default function useTradeView() {
    const { tradeService, orderState } = useTradeShared();
    const dispatch = useDispatch();

    const {id} = useParams();
    const location = useLocation();
    const type = parseInt(new URLSearchParams(location.search).get('type')!);

    const [trade, setTrade] = useState<TradePresentable>();
    const [documents, setDocuments] = useState<DocumentPresentable[]>();
    const [loadingDocuments, setLoadingDocuments] = useState<boolean>(true);
    const [disabled, setDisabled] = useState<boolean>(true);

    const toggleDisabled = () => {
        setDisabled(!disabled);
    }

    const getTradeInfo = async (id: number, type: number) => {
        try {
            dispatch(showLoading("Retrieving trade..."));
            const resp = await tradeService.getTradeByIdAndType(id, type);
            resp && setTrade(resp);
        } catch (e: any) {
            console.log("error: ", e);
            openNotification("Error", e.message, NotificationType.ERROR);
        } finally {
            dispatch(hideLoading())
        }
    }

    const getTradeDocuments = async (id: number) => {
        try {
            dispatch(showLoading("Retrieving documents..."));
            const documentService = new EthDocumentService();
            const resp = await documentService.getDocumentsByTransactionId(id);
            resp && setDocuments(resp);
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
            await getTradeInfo(parseInt(id!), type);
            await getTradeDocuments(parseInt(id!));
            setLoadingDocuments(false);
        })();
    }, []);

    useEffect(() => {
        if(!trade) return;

        const disabled = true;

        const commonElements: FormElement[] = [
            {type: FormElementType.TITLE, span: 24, label: 'Actors'}, {
                type: FormElementType.INPUT,
                span: 8,
                name: 'supplier',
                label: 'Supplier',
                required: true,
                regex: regex.ETHEREUM_ADDRESS,
                defaultValue: trade.supplier,
                disabled,
            },
            {
                type: FormElementType.INPUT,
                span: 8,
                name: 'customer',
                label: 'Customer',
                required: true,
                regex: regex.ETHEREUM_ADDRESS,
                defaultValue: trade.customer,
                disabled,
            },
            {
                type: FormElementType.INPUT,
                span: 8,
                name: 'commissioner',
                label: 'Commissioner',
                required: true,
                regex: regex.ETHEREUM_ADDRESS,
                defaultValue: trade.commissioner,
                disabled,
            },
        ]

        let documentElement: FormElement;
        const documentHeight = '45vh';
        if(type === TradeType.BASIC) {
            const content = documents?.find(doc => doc.documentType === DocumentType.DELIVERY_NOTE)?.content;
            documentElement = {
                type: FormElementType.DOCUMENT,
                span: 12,
                name: 'certificate-of-shipping',
                label: 'Certificate of Shipping',
                required: false,
                loading: false,
                uploadable: false,
                content: content,
                height: documentHeight,
            }
        } else if(type === TradeType.ORDER) {
            const content = documents?.find(doc => doc.documentType === DocumentType.PAYMENT_INVOICE)?.content;
            documentElement = {
                type: FormElementType.DOCUMENT,
                span: 12,
                name: 'payment-invoice',
                label: 'Payment Invoice',
                required: false,
                loading: false,
                uploadable: false,
                content: content,
                height: documentHeight,
            }
        } else {
            throw new Error("Invalid trade type");
        }

        if (type === TradeType.BASIC) {
            const newElements = [...commonElements];
            newElements.push(
                {type: FormElementType.TITLE, span: 24, label: 'Data'},
                {
                    type: FormElementType.INPUT,
                    span: 12,
                    name: 'name',
                    label: 'Name',
                    required: true,
                    defaultValue: trade.name,
                    disabled,
                },
                documentElement,
                {type: FormElementType.TITLE, span: 24, label: 'Line Items'},
                {
                    type: FormElementType.INPUT,
                    span: 8,
                    name: 'product-category-id-1',
                    label: 'Product Category Id',
                    required: true,
                    regex: regex.ONLY_DIGITS,
                    defaultValue: trade.lines[0].productCategory?.id.toString(),
                    disabled,
                },
                {type: FormElementType.SPACE, span: 16},
            );
            setElements(newElements);
        }
        else {
            const newElements = [...commonElements];
            newElements.push(
                {type: FormElementType.TITLE, span: 24, label: 'Constraints'},
                {
                    type: FormElementType.INPUT,
                    span: 12,
                    name: 'incoterms',
                    label: 'Incoterms',
                    required: true,
                    defaultValue: trade.incoterms,
                    disabled: true,
                },
                documentElement,
                {
                    type: FormElementType.DATE,
                    span: 12,
                    name: 'payment-deadline',
                    label: 'Payment Deadline',
                    required: true,
                    defaultValue: trade.paymentDeadline ? dayjs(new Date(trade.paymentDeadline).toISOString()) : '',
                    disabled,
                },
                {
                    type: FormElementType.DATE,
                    span: 12,
                    name: 'document-delivery-deadline',
                    label: 'Document Delivery Deadline',
                    required: false,
                    defaultValue: trade.documentDeliveryDeadline ? dayjs(new Date(trade.documentDeliveryDeadline).toISOString()) : '',
                    disabled,
                },
                {
                    type: FormElementType.INPUT,
                    span: 12,
                    name: 'shipper',
                    label: 'Shipper',
                    required: true,
                    defaultValue: trade.shipper,
                    disabled: true,
                },
                {
                    type: FormElementType.INPUT,
                    span: 12,
                    name: 'arbiter',
                    label: 'Arbiter',
                    required: true,
                    defaultValue: trade.arbiter,
                    disabled,
                    regex: regex.ETHEREUM_ADDRESS
                },
                {
                    type: FormElementType.INPUT,
                    span: 12,
                    name: 'shipping-port',
                    label: 'Shipping Port',
                    required: true,
                    defaultValue: trade.shippingPort,
                    disabled: true,
                },
                {
                    type: FormElementType.DATE,
                    span: 12,
                    name: 'shipping-deadline',
                    label: 'Shipping Deadline',
                    required: true,
                    defaultValue: trade.shippingDeadline ? dayjs(new Date(trade.shippingDeadline).toISOString()) : '',
                    disabled,
                },
                {
                    type: FormElementType.INPUT,
                    span: 12,
                    name: 'delivery-port',
                    label: 'Delivery Port',
                    required: true,
                    defaultValue: trade.deliveryPort,
                    disabled: true,
                },
                {
                    type: FormElementType.DATE,
                    span: 12,
                    name: 'delivery-deadline',
                    label: 'Delivery Deadline',
                    required: true,
                    defaultValue: trade.deliveryDeadline ? dayjs(new Date(trade.deliveryDeadline).toISOString()) : '',
                    disabled,
                },
                {
                    type: FormElementType.INPUT,
                    span: 12,
                    name: 'agreed-amount',
                    label: 'Agreed Amount',
                    required: true,
                    regex: regex.ONLY_DIGITS,
                    defaultValue: trade.agreedAmount,
                    disabled,
                },
                {
                    type: FormElementType.INPUT,
                    span: 12,
                    name: 'tokenAddress',
                    label: 'Token Address',
                    required: true,
                    regex: regex.ETHEREUM_ADDRESS,
                    defaultValue: trade.tokenAddress,
                    disabled,
                },
                {type: FormElementType.TITLE, span: 24, label: 'Line Items'},
            );
            trade.lines.forEach((line, index) => {
                newElements.push(
                    {
                        type: FormElementType.INPUT,
                        span: 6,
                        name: `product-category-id-1`,
                        label: 'Product Category Id',
                        required: true,
                        defaultValue: line.material?.id.toString(),
                        disabled,
                    },
                    {
                        type: FormElementType.INPUT,
                        span: 6,
                        name: `quantity-${id}`,
                        label: 'Quantity',
                        required: true,
                        regex: regex.ONLY_DIGITS,
                        defaultValue: line.quantity?.toString(),
                        disabled,
                    },
                    {
                        type: FormElementType.INPUT,
                        span: 6,
                        name: `price-${id}`,
                        label: 'Price',
                        required: true,
                        defaultValue: line.price?.amount.toString() + ' ' + line.price?.fiat,
                        disabled,
                    },
                );
            });
            setElements(newElements);
        }
    }, [trade, documents]);

    const onSubmit = async (values: any) => {
        try {
            dispatch(showLoading("Loading..."));
            if (values['delivery-deadline'] <= values['shipping-deadline']) {
                openNotification("Invalid dates", '', NotificationType.ERROR);
            }
            if(trade?.type === TradeType.BASIC) {
                await tradeService.putBasicTrade(trade.id, values);
            }
            setDisabled(true);
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
        documents,
        loadingDocuments,
        disabled,
        toggleDisabled,
        onSubmit
    }
}
