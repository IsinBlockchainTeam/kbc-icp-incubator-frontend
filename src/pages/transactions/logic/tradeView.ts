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
import {TradeLinePresentable, TradeLinePrice} from "../../../api/types/TradeLinePresentable";
import {ProductCategoryPresentable} from "../../../api/types/ProductCategoryPresentable";

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

    const confirmNegotiation = () => {

    }

    const getTradeInfo = async (id: number, type: number) => {
        try {
            dispatch(showLoading("Retrieving trade..."));
            const resp = await tradeService.getTradeByIdAndType(id, type);
            console.log("resp: ", resp)
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
            // const documentService = new EthDocumentService(new BlockchainDocumentStrategy({
            //     serverUrl: subjectClaims!.podServerUrl!,
            //     sessionCredentials: {
            //         podName: subjectClaims!.podName!,
            //         clientId: subjectClaims!.podClientId!,
            //         clientSecret: subjectClaims!.podClientSecret!
            //     }
            // }));
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
        // TODO: remove this comment
        // if (!subjectClaims || !(subjectClaims.podClientSecret && subjectClaims.podClientId && subjectClaims.podServerUrl)) {
        //     openNotification("Error", "No information about company storage", NotificationType.ERROR);
        //     return;
        // }
        (async () => {
            await getTradeInfo(parseInt(id!), type);
            await getTradeDocuments(parseInt(id!));
            setLoadingDocuments(false);
        })();
    }, []);

    useEffect(() => {
        // if(!documents) return;
        // if(documents.length === 0) return;
        if(!trade) return;

        // const disabled = true;
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
        if(documents && documents.length > 0) {
            documentElement = {
                type: FormElementType.DOCUMENT,
                span: 12,
                name: 'payment-invoice',
                label: 'Payment Invoice',
                required: false,
                loading: false,
                uploadable: false,
                content: new Blob([documents[0].content]),
                height: '45vh',
            }
        } else {
            documentElement = {
                type: FormElementType.DOCUMENT,
                span: 12,
                name: 'payment-invoice',
                label: 'Payment Invoice',
                required: false,
                loading: false,
                uploadable: false,
                height: '45vh',
            }
        }
        const documentHeight = '45vh';

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
                {type: FormElementType.TITLE, span: 24, label: 'Line Item'},
            );
            trade.lines.forEach((line, index) => {
                newElements.push(
                    {
                        type: FormElementType.INPUT,
                        span: 8,
                        name: 'product-category-id-1',
                        label: 'Product Category Id',
                        required: true,
                        defaultValue: line.productCategory?.id.toString(),
                        disabled,
                    },
                    {
                        type: FormElementType.INPUT,
                        span: 6,
                        name: `quantity-1`,
                        label: 'Quantity',
                        required: true,
                        defaultValue: line.quantity?.toString(),
                        disabled,
                    },
                    {
                        type: FormElementType.INPUT,
                        span: 4,
                        name: `unit-1`,
                        label: 'Unit',
                        required: true,
                        defaultValue: line.unit,
                        disabled,
                    },
                    {type: FormElementType.SPACE, span: 6},
                );
            });
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
                    required: false,
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
                    required: false,
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
                    required: false,
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
                    required: false,
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
                        defaultValue: line.productCategory?.id.toString(),
                        disabled,
                    },
                    {
                        type: FormElementType.INPUT,
                        span: 4,
                        name: `quantity-${id}`,
                        label: 'Quantity',
                        required: true,
                        regex: regex.ONLY_DIGITS,
                        defaultValue: line.quantity?.toString(),
                        disabled,
                    },
                    {
                        type: FormElementType.INPUT,
                        span: 4,
                        name: `unit-1`,
                        label: 'Unit',
                        required: true,
                        defaultValue: line.unit,
                        disabled,
                    },
                    {
                        type: FormElementType.INPUT,
                        span: 4,
                        name: `price-${id}`,
                        label: 'Price',
                        required: true,
                        defaultValue: line.price?.amount.toString(),
                        disabled,
                    },
                    {
                        type: FormElementType.INPUT,
                        span: 4,
                        name: `fiat-${id}`,
                        label: 'Fiat',
                        required: true,
                        defaultValue: line.price?.fiat,
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
                openNotification("Invalid dates", '', NotificationType.ERROR);
            }
            const tradeToSubmit: TradePresentable = new TradePresentable()
                .setSupplier(values['supplier'])
                .setCustomer(values['customer'])
                .setCommissioner(values['commissioner']);
            const quantity: number = parseInt(values[`quantity-1`]);
            const unit: string = values[`unit-${id}`];
            const productCategoryId: number = parseInt(values['product-category-id-1']);
            if(trade?.type === TradeType.BASIC) {
                tradeToSubmit
                    .setName(values['name'])
                    .setDeliveryNote(values['certificate-of-shipping'] && new DocumentPresentable()
                        .setContentType(values['certificate-of-shipping'].type)
                        .setDocumentType(DocumentType.DELIVERY_NOTE)
                        .setFilename(values['certificate-of-shipping'].name)
                        .setContent(values['certificate-of-shipping'])
                    )
                    .setLines([new TradeLinePresentable()
                        .setQuantity(quantity)
                        .setUnit(unit)
                        .setProductCategory(new ProductCategoryPresentable(productCategoryId))
                    ]);
                console.log("basic trade: ", tradeToSubmit)
                await tradeService.putBasicTrade(trade.id, tradeToSubmit);
            }
            else if (trade?.type === TradeType.ORDER) {
                const price: number = parseInt(values[`price-${id}`].split(' ')[0]);
                const fiat: string = values[`fiat-${id}`];
                tradeToSubmit
                    .setIncoterms(values['incoterms'])
                    .setPaymentDeadline(dayjs(values['payment-deadline']).toDate())
                    .setDocumentDeliveryDeadline(dayjs(values['document-delivery-deadline']).toDate())
                    .setShippingDeadline(dayjs(values['shipping-deadline']).toDate())
                    .setDeliveryDeadline(dayjs(values['delivery-deadline']).toDate())
                    .setShipper(values['shipper'])
                    .setArbiter(values['arbiter'])
                    .setShippingPort(values['shipping-port'])
                    .setDeliveryPort(values['delivery-port'])
                    .setAgreedAmount(parseInt(values['agreed-amount']))
                    .setTokenAddress(values['token-address'])
                    .setPaymentInvoice(values['payment-invoice'] && new DocumentPresentable()
                        .setContentType(values['payment-invoice'].type)
                        .setDocumentType(DocumentType.PAYMENT_INVOICE)
                        .setFilename(values['payment-invoice'].name)
                        .setContent(values['payment-invoice'])
                    )
                    .setSwissDecode(values['swiss-decode'] && new DocumentPresentable()
                        .setContentType(values['swiss-decode'].type)
                        .setDocumentType(DocumentType.SWISS_DECODE)
                        .setFilename(values['swiss-decode'].name)
                        .setContent(values['swiss-decode'])
                    )
                    .setDeliveryNote(values['certificate-of-shipping'] && new DocumentPresentable()
                        .setContentType(values['certificate-of-shipping'].type)
                        .setDocumentType(DocumentType.DELIVERY_NOTE)
                        .setFilename(values['certificate-of-shipping'].name)
                        .setContent(values['certificate-of-shipping'])
                    )
                    .setBillOfLading(values['bill-of-lading'] && new DocumentPresentable()
                        .setContentType(values['bill-of-lading'].type)
                        .setDocumentType(DocumentType.BILL_OF_LADING)
                        .setFilename(values['bill-of-lading'].name)
                        .setContent(values['bill-of-lading'])
                    )
                    .setWeightCertificate(values['certificate-of-weight'] && new DocumentPresentable()
                        .setContentType(values['certificate-of-weight'].type)
                        .setDocumentType(DocumentType.WEIGHT_CERTIFICATE)
                        .setFilename(values['certificate-of-weight'].name)
                        .setContent(values['certificate-of-weight'])
                    )
                    .setPreferentialEntryCertificate(values['certificate-of-preferential-entry'] && new DocumentPresentable()
                        .setContentType(values['certificate-of-preferential-entry'].type)
                        .setDocumentType(DocumentType.PREFERENTIAL_ENTRY_CERTIFICATE)
                        .setFilename(values['certificate-of-preferential-entry'].name)
                        .setContent(values['certificate-of-preferential-entry'])
                    )
                    .setFumigationCertificate(values['certificate-of-fumigation'] && new DocumentPresentable()
                        .setContentType(values['certificate-of-fumigation'].type)
                        .setDocumentType(DocumentType.FUMIGATION_CERTIFICATE)
                        .setFilename(values['certificate-of-fumigation'].name)
                        .setContent(values['certificate-of-fumigation'])
                    )
                    .setPhytosanitaryCertificate(values['certificate-of-phytosanitary'] && new DocumentPresentable()
                        .setContentType(values['certificate-of-phytosanitary'].type)
                        .setDocumentType(DocumentType.PHYTOSANITARY_CERTIFICATE)
                        .setFilename(values['certificate-of-phytosanitary'].name)
                        .setContent(values['certificate-of-phytosanitary'])
                    )
                    .setInsuranceCertificate(values['certificate-of-insurance'] && new DocumentPresentable()
                        .setContentType(values['certificate-of-insurance'].type)
                        .setDocumentType(DocumentType.INSURANCE_CERTIFICATE)
                        .setFilename(values['certificate-of-insurance'].name)
                        .setContent(values['certificate-of-insurance'])
                    )
                    .setLines([new TradeLinePresentable()
                        .setQuantity(quantity)
                        .setUnit(unit)
                        .setProductCategory(new ProductCategoryPresentable(productCategoryId))
                        .setPrice(new TradeLinePrice(price, fiat))
                    ]);
                console.log("order trade: ", tradeToSubmit)
                await tradeService.putOrderTrade(trade.id, tradeToSubmit);
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
