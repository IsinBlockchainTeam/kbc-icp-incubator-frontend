import useTradeShared from "./tradeShared";
import {NotificationType, openNotification} from "@/utils/notification";
import {
    BasicTrade,
    DocumentStatus,
    DocumentType,
    LineRequest,
    NegotiationStatus,
    OrderLine,
    OrderLinePrice,
    OrderLineRequest,
    OrderTrade,
    TradeType,
} from "@kbc-lib/coffee-trading-management-lib";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import {useDispatch} from "react-redux";
import {useContext, useEffect, useState} from "react";
import {DetailedTradePresentable} from "@/api/types/TradePresentable";
import {hideLoading, showLoading} from "@/redux/reducers/loadingSlice";
import {FormElement, FormElementType} from "@/components/GenericForm/GenericForm";
import {regex} from "@/utils/regex";
import dayjs from "dayjs";
import {DID_METHOD, paths} from "@/constants/index";
import {BasicTradeRequest, OrderTradeRequest} from "@/api/types/TradeRequest";
import {SignerContext} from "@/providers/SignerProvider";
import {ICPContext} from "@/providers/ICPProvider";

export default function useTradeView() {
    const {getNameByDID} = useContext(ICPContext);
    const {signer} = useContext(SignerContext);

    const { dataLoaded, validateDocument, validateDates, productCategories, units, fiats, ethTradeService } = useTradeShared();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const {id} = useParams();
    const location = useLocation();
    const type = parseInt(new URLSearchParams(location.search).get('type')!);

    const [trade, setTrade] = useState<DetailedTradePresentable>();
    const [disabled, setDisabled] = useState<boolean>(true);
    const [negotiationStatus, setNegotiationStatus] = useState<string | undefined>(undefined);
    const [actorNames, setActorNames] = useState<string[]>([]);
    const [elements, setElements] = useState<FormElement[]>([]);

    const toggleDisabled = () => {
        setDisabled(!disabled);
    }

    const confirmNegotiation = async () => {
        try {
            dispatch(showLoading("Retrieving trade..."));
            await ethTradeService.confirmOrderTrade(parseInt(id!));
            openNotification("Negotiation confirmed", `The negotiation has been confirmed`, NotificationType.SUCCESS, 1);
            navigate(paths.TRADES);
        } catch (e: any) {
            console.log("error: ", e);
            openNotification("Error", e.message, NotificationType.ERROR);
        } finally {
            dispatch(hideLoading());
        }
    }

    useEffect(() => {
        return () => {
            dispatch(hideLoading())
        }
    }, []);

    useEffect(() => {
        if(!dataLoaded) return;
        if (id) loadTradeInfo(parseInt(id));
    }, [dataLoaded]);

    const loadTradeInfo = async (id: number) => {
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

    const getActorNames = async () => {
        if (!trade) {
            console.error("Trade not found");
            return;
        }
        try {
            dispatch(showLoading("Retrieving actors..."));
            const supplier = await getNameByDID(DID_METHOD + ':' + trade.trade.supplier);
            const commissioner = await getNameByDID(DID_METHOD + ':' + trade.trade.commissioner);
            setActorNames([supplier, commissioner]);
        } catch (e: any) {
            console.log("error: ", e);
            openNotification("Error", e.message, NotificationType.ERROR);
        } finally {
            dispatch(hideLoading())
        }
    }

    const validationCallback = (tradeInfo: DetailedTradePresentable | undefined, documentType: DocumentType) => {
        if (!tradeInfo) return undefined;
        const doc = tradeInfo.documents.get(documentType);
        return doc && doc.status === DocumentStatus.NOT_EVALUATED && doc.uploadedBy !== signer?.address ? {
            approve: () => validateDocument(tradeInfo.trade.tradeId, doc.id, DocumentStatus.APPROVED),
            reject: () => validateDocument(tradeInfo.trade.tradeId, doc.id, DocumentStatus.NOT_APPROVED)
        } : undefined;
    }

    useEffect(() => {
        if (!trade) return;
        getActorNames();
    }, [trade]);

    useEffect(() => {
        if(!trade || actorNames.length === 0) return;

        const commonElements: FormElement[] = [
            {type: FormElementType.TITLE, span: 24, label: 'Actors'}, {
                type: FormElementType.INPUT,
                span: 8,
                name: 'supplier',
                label: 'Supplier',
                required: true,
                defaultValue: actorNames[0],
                disabled: true,
            },
            {
                type: FormElementType.INPUT,
                span: 8,
                name: 'customer',
                label: 'Customer',
                required: true,
                defaultValue: actorNames[1],
                disabled: true,
            },
            {
                type: FormElementType.INPUT,
                span: 8,
                name: 'commissioner',
                label: 'Commissioner',
                required: true,
                defaultValue: actorNames[1],
                disabled: true,
            },
        ]

        const documentHeight = '45vh';
        if (type === TradeType.BASIC) {
            const doc = trade.documents.get(DocumentType.DELIVERY_NOTE);
            const documentElement: FormElement = {
                type: FormElementType.DOCUMENT,
                span: 12,
                name: 'certificate-of-shipping',
                label: 'Certificate of Shipping',
                required: false,
                loading: false,
                uploadable: !disabled,
                info: doc,
                height: documentHeight,
                validationCallback: validationCallback(trade, DocumentType.DELIVERY_NOTE),
            }

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
                        type: FormElementType.SELECT,
                        span: 8,
                        name: `product-category-id-${index + 1}`,
                        label: 'Product Category Id',
                        required: true,
                        options: productCategories.map((productCategory) => ({label: productCategory.name, value: productCategory.id})),
                        defaultValue: productCategories.find(pc => pc.id === line.productCategory?.id)?.id || -1,
                        disabled,
                    },
                    {
                        type: FormElementType.INPUT,
                        span: 6,
                        name: `quantity-${index + 1}`,
                        label: 'Quantity',
                        required: true,
                        defaultValue: line.quantity?.toString(),
                        disabled,
                    },
                    {
                        type: FormElementType.SELECT,
                        span: 4,
                        name: `unit-${index + 1}`,
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
        } else {
            const orderTrade = trade.trade as OrderTrade;
            setNegotiationStatus(NegotiationStatus[orderTrade.negotiationStatus]);

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
                    dependencies: ['document-delivery-deadline'],
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
                    validationCallback: validateDates('document-delivery-deadline', 'payment-deadline', 'greater', 'This must be after Payment Deadline')
                },
                {
                    type: FormElementType.INPUT,
                    span: 8,
                    name: 'shipper',
                    label: 'Shipper',
                    required: true,
                    defaultValue: orderTrade.metadata?.shipper,
                    disabled,
                },
                {
                    type: FormElementType.INPUT,
                    span: 8,
                    name: 'shipping-port',
                    label: 'Shipping Port',
                    required: true,
                    defaultValue: orderTrade.metadata?.shippingPort,
                    disabled,
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
                    validationCallback: validateDates('shipping-deadline', 'document-delivery-deadline', 'greater', 'This must be after Document Delivery Deadline')
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
                        type: FormElementType.SELECT,
                        span: 6,
                        name: `product-category-id-${index + 1}`,
                        label: 'Product Category Id',
                        required: true,
                        options: productCategories.map((productCategory) => ({label: productCategory.name, value: productCategory.id})),
                        defaultValue: productCategories.find(pc => pc.id === line.productCategory?.id)?.id || -1,
                        disabled,
                    },
                    {
                        type: FormElementType.INPUT,
                        span: 5,
                        name: `quantity-${index + 1}`,
                        label: 'Quantity',
                        required: true,
                        regex: regex.ONLY_DIGITS,
                        defaultValue: line.quantity?.toString(),
                        disabled,
                    },
                    {
                        type: FormElementType.SELECT,
                        span: 4,
                        name: `unit-${index + 1}`,
                        label: 'Unit',
                        required: true,
                        options: units.map((unit) => ({label: unit, value: unit})),
                        defaultValue: line.unit!,
                        disabled,
                    },
                    {
                        type: FormElementType.INPUT,
                        span: 5,
                        name: `price-${index + 1}`,
                        label: 'Price',
                        required: true,
                        regex: regex.ONLY_DIGITS,
                        defaultValue: (line as OrderLine).price?.amount.toString(),
                        disabled,
                    },
                    {
                        type: FormElementType.SELECT,
                        span: 4,
                        name: `fiat-${index + 1}`,
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
    }, [trade, actorNames, disabled]);

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

            if (type === TradeType.BASIC) {
                const updatedBasicTrade: BasicTradeRequest = {
                    supplier,
                    customer,
                    commissioner,
                    lines: [new LineRequest(productCategoryId, quantity, unit)],
                    name: values['name'],
                };
                await ethTradeService.putBasicTrade(parseInt(id!), updatedBasicTrade);
            } else if (type === TradeType.ORDER) {
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
        elements,
        trade,
        disabled,
        negotiationStatus,
        validationCallback,
        toggleDisabled,
        onSubmit,
        confirmNegotiation
    }
}
