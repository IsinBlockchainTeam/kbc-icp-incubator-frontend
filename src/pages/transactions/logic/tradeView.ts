import useTradeShared from "./tradeShared";
import {NotificationType, openNotification} from "../../../utils/notification";
import {BasicTrade, DocumentType, OrderLine, OrderTrade, TradeType} from "@kbc-lib/coffee-trading-management-lib";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import {useDispatch} from "react-redux";
import {useEffect, useState} from "react";
import {DetailedTradePresentable, TradePreviewPresentable} from "../../../api/types/TradePresentable";
import {DocumentPresentable} from "../../../api/types/DocumentPresentable";
import {EthDocumentService} from "../../../api/services/EthDocumentService";
import {hideLoading, showLoading} from "../../../redux/reducers/loadingSlice";
import {FormElement, FormElementType} from "../../../components/GenericForm/GenericForm";
import {regex} from "../../../utils/regex";
import dayjs from "dayjs";
import {ProductCategory} from "@kbc-lib/coffee-trading-management-lib";
import {paths} from "../../../constants";

export default function useTradeView() {
    const { units, fiats, tradeService, orderState } = useTradeShared();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const {id} = useParams();
    const location = useLocation();
    const type = parseInt(new URLSearchParams(location.search).get('type')!);

    const [trade, setTrade] = useState<DetailedTradePresentable>();
    const [documents, setDocuments] = useState<DocumentPresentable[]>();
    const [loadingDocuments, setLoadingDocuments] = useState<boolean>(true);
    const [disabled, setDisabled] = useState<boolean>(true);

    const toggleDisabled = () => {
        setDisabled(!disabled);
    }

    const confirmNegotiation = async () => {
        try {
            await tradeService.confirmOrderTrade(parseInt(id!));
            openNotification("Negotiation confirmed", `The negotiation has been confirmed`, NotificationType.SUCCESS, 1);
            navigate(paths.TRADES);
        }
        catch (e: any) {
            console.log("error: ", e);
            openNotification("Error", e.message, NotificationType.ERROR);
        }
    }

    const getTradeInfo = async (id: number) => {
        try {
            dispatch(showLoading("Retrieving trade..."));
            const resp = await tradeService.getTradeById(id);
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
            await getTradeInfo(parseInt(id!));
            await getTradeDocuments(parseInt(id!));
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
            const content = documents?.find(doc => doc.documentType === DocumentType.DELIVERY_NOTE)?.content;
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
            const content = documents?.find(doc => doc.documentType === DocumentType.PAYMENT_INVOICE)?.content;
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
                    defaultValue: orderTrade.paymentDeadline ? dayjs(new Date(orderTrade.paymentDeadline).toISOString()) : '',
                    disabled,
                },
                {
                    type: FormElementType.DATE,
                    span: 12,
                    name: 'document-delivery-deadline',
                    label: 'Document Delivery Deadline',
                    required: false,
                    defaultValue: orderTrade.documentDeliveryDeadline ? dayjs(new Date(orderTrade.documentDeliveryDeadline).toISOString()) : '',
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
                    defaultValue: orderTrade.shippingDeadline ? dayjs(new Date(orderTrade.shippingDeadline).toISOString()) : '',
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
                    defaultValue: orderTrade.deliveryDeadline ? dayjs(new Date(orderTrade.deliveryDeadline).toISOString()) : '',
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
    }, [trade, documents, disabled]);

    const onSubmit = async (values: any) => {
        try {
            dispatch(showLoading("Loading..."));
            if (values['delivery-deadline'] <= values['shipping-deadline']) {
                openNotification("Delivery deadline cannot be less then shipping one", '', NotificationType.ERROR);
            }
            // const tradeToSubmit: TradePreviewPresentable = new TradePreviewPresentable()
            //     .setSupplier(values['supplier'])
            //     .setCustomer(values['customer'])
            //     .setCommissioner(values['commissioner']);
            const supplier: string = values['supplier'];
            const customer: string = values['customer'];
            const commissioner: string = values['commissioner'];
            const quantity: number = parseInt(values[`quantity-1`]);
            const unit: string = values[`unit-1`];
            const productCategoryId: number = parseInt(values['product-category-id-1']);
            if(type === TradeType.BASIC) {
                // TODO: refactor this
                // tradeToSubmit
                //     .setName(values['name'])
                //     .setDeliveryNote(values['certificate-of-shipping'] && new DocumentPresentable()
                //         .setContentType(values['certificate-of-shipping'].type)
                //         .setDocumentType(DocumentType.DELIVERY_NOTE)
                //         .setFilename(values['certificate-of-shipping'].name)
                //         .setContent(values['certificate-of-shipping'])
                //     )
                //     .setLines([new TradeLinePresentable()
                //         .setQuantity(quantity)
                //         .setUnit(unit)
                //         // TODO: refactor this
                //         // .setProductCategory(new ProductCategoryPresentable(productCategoryId))
                //     ]);
                // await tradeService.putBasicTrade(trade.id, tradeToSubmit);
            }
            else if (type === TradeType.ORDER) {
                // TODO: refactor this
                // const price: number = parseInt(values[`price-1`]);
                // const fiat: string = values[`fiat-1`];
                // tradeToSubmit
                //     .setIncoterms(values['incoterms'])
                //     .setPaymentDeadline(dayjs(values['payment-deadline']).toDate())
                //     .setDocumentDeliveryDeadline(dayjs(values['document-delivery-deadline']).toDate())
                //     .setShippingDeadline(dayjs(values['shipping-deadline']).toDate())
                //     .setDeliveryDeadline(dayjs(values['delivery-deadline']).toDate())
                //     .setShipper(values['shipper'])
                //     .setArbiter(values['arbiter'])
                //     .setShippingPort(values['shipping-port'])
                //     .setDeliveryPort(values['delivery-port'])
                //     .setAgreedAmount(parseInt(values['agreed-amount']))
                //     .setTokenAddress(values['token-address'])
                //     .setPaymentInvoice(values['payment-invoice'] && new DocumentPresentable()
                //         .setContentType(values['payment-invoice'].type)
                //         .setDocumentType(DocumentType.PAYMENT_INVOICE)
                //         .setFilename(values['payment-invoice'].name)
                //         .setContent(values['payment-invoice'])
                //     )
                //     .setDeliveryNote(values['certificate-of-shipping'] && new DocumentPresentable()
                //         .setContentType(values['certificate-of-shipping'].type)
                //         .setDocumentType(DocumentType.DELIVERY_NOTE)
                //         .setFilename(values['certificate-of-shipping'].name)
                //         .setContent(values['certificate-of-shipping'])
                //     )
                //     .setLines([new TradeLinePresentable()
                //         .setQuantity(quantity)
                //         .setUnit(unit)
                //         // TODO: refactor this
                //         // .setProductCategory(new ProductCategoryPresentable(productCategoryId))
                //         .setPrice(new TradeLinePrice(price, fiat))
                //     ]);
                // console.log("value: ", values)
                // await tradeService.putOrderTrade(trade.id, tradeToSubmit);
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
        documents,
        loadingDocuments,
        disabled,
        toggleDisabled,
        onSubmit,
        confirmNegotiation
    }
}
