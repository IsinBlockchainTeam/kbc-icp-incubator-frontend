import {useSelector} from "react-redux";
import {useEffect, useState} from "react";
import {TradeType} from "@kbc-lib/coffee-trading-management-lib";
import {v4 as uuid} from "uuid";
import { RootState } from "../../../../redux/types";
import {TradeService} from "../../../../api/services/TradeService";
import {BlockchainTradeStrategy} from "../../../../api/strategies/trade/BlockchainTradeStrategy";
import {FormElement, FormElementType} from "../../../../components/GenericForm/GenericForm";
import {regex} from "../../../../utils/regex";

export default function useTradeShared() {
    const subjectClaims = useSelector((state: RootState) => state.auth.subjectClaims);
    const tradeService = new TradeService(new BlockchainTradeStrategy({
        serverUrl: subjectClaims!.podServerUrl!,
        clientId: subjectClaims!.podClientId!,
        clientSecret: subjectClaims!.podClientSecret!
    }));

    const [type, setType] = useState<TradeType>(TradeType.BASIC);

    const updateType = (newType: TradeType) => {
        setType(newType);
    }

    const [orderState, setOrderState] = useState<number>(0);

    const [lines, setLines] = useState<FormElement[]>([]);

    const [, setLineOrder] = useState<string[]>([]);

    const basicLine: FormElement[] = [
        {
            type: FormElementType.INPUT,
            span: 8,
            name: 'product-category-id-1',
            label: 'Product Category Id',
            required: true,
            regex: regex.ONLY_DIGITS,
            defaultValue: '',
            disabled: false,
        },
        {type: FormElementType.SPACE, span: 16},];

    const orderLine: FormElement[] = [
        {
            type: FormElementType.INPUT,
            span: 6,
            name: `product-category-id-1`,
            label: 'Product Category Id',
            required: true,
            regex: regex.ONLY_DIGITS,
            defaultValue: '',
            disabled: false,
        },
        {
            type: FormElementType.INPUT,
            span: 6,
            name: `quantity-1`,
            label: 'Quantity',
            required: true,
            regex: regex.ONLY_DIGITS,
            defaultValue: '',
            disabled: false,
        },
        {
            type: FormElementType.INPUT,
            span: 6,
            name: `price-1`,
            label: 'Price',
            required: true,
            defaultValue: '',
            disabled: false,
        },
        {type: FormElementType.SPACE, span: 6},];

    const getLineId = (): string => {
        const id: string = uuid();
        setLineOrder((prev) => [...prev, id]);
        return id;
    }

    const addLine = () => {
        const id: string = getLineId();
        if (type === TradeType.BASIC) {
            setLines((prev) => [...prev,
                {
                    type: FormElementType.INPUT,
                    span: 8,
                    name: `product-category-id-${id}`,
                    label: 'Product Category Id',
                    required: true,
                    defaultValue: '',
                    disabled: false,
                }, {
                    type: FormElementType.BUTTON,
                    span: 4,
                    name: `delete-line-${id}`,
                    label: 'Delete line',
                    disabled: false,
                    onClick: () => deleteLine(id),
                    buttonType: 'default',
                    additionalProperties: 'danger'
                },
                {type: FormElementType.SPACE, span: 12},]);
        } else {
            setLines((prev) => [...prev,
                {
                    type: FormElementType.INPUT,
                    span: 6,
                    name: `product-category-id-${id}`,
                    label: 'Product Category Id',
                    required: true,
                    defaultValue: '',
                    disabled: false,
                },
                {
                    type: FormElementType.INPUT,
                    span: 6,
                    name: `quantity-${id}`,
                    label: 'Quantity',
                    required: true,
                    regex: regex.ONLY_DIGITS,
                    defaultValue: '',
                    disabled: false,
                },
                {
                    type: FormElementType.INPUT,
                    span: 6,
                    name: `price-${id}`,
                    label: 'Price',
                    required: true,
                    defaultValue: '',
                    disabled: false,
                },
                {
                    type: FormElementType.BUTTON,
                    span: 6,
                    name: `delete-line-${id}`,
                    label: 'Delete line',
                    disabled: false,
                    onClick: () => deleteLine(id),
                    buttonType: 'default',
                    additionalProperties: 'danger'
                }
            ]);
        }
    }

    const deleteLine = (id: string) => {
        console.log('delete line', id)
        let index: number;
        setLineOrder((currentLineOrder) => {
            index = currentLineOrder.indexOf(id);
            return currentLineOrder.filter((lineId) => lineId !== id);
        });

        setLines((currentLines) => {
            const start: number = type === TradeType.BASIC ? 2 + index * 3 : index * 4;
            const end: number = type === TradeType.BASIC ? 2 + index * 3 + 3 : index * 4 + 4;

            return currentLines.filter((_, i) => i < start || i >= end);
        });
    }

    useEffect(() => {
        if (type === TradeType.BASIC) {
            setLines([
                ...basicLine,
            ]);
        } else {
            setLines([
                ...orderLine,
            ]);
        }
    }, [type]);

    const [elements, setElements] = useState<FormElement[]>([]);

    const commonElements: FormElement[] = [
        {type: FormElementType.TITLE, span: 24, label: 'Actors'}, {
            type: FormElementType.INPUT,
            span: 8,
            name: 'supplier',
            label: 'Supplier',
            required: true,
            regex: regex.ETHEREUM_ADDRESS,
            defaultValue: '',
            disabled: false,
        },
        {
            type: FormElementType.INPUT,
            span: 8,
            name: 'customer',
            label: 'Customer',
            required: true,
            regex: regex.ETHEREUM_ADDRESS,
            defaultValue: '',
            disabled: false,
        },
        {
            type: FormElementType.INPUT,
            span: 8,
            name: 'commissioner',
            label: 'Commissioner',
            required: true,
            regex: regex.ETHEREUM_ADDRESS,
            defaultValue: '',
            disabled: false,
        },
    ]

    const documentHeight = '45vh';

    useEffect(() => {
        if (type === TradeType.BASIC) {
            setElements([
                ...commonElements,
                {type: FormElementType.TITLE, span: 24, label: 'Data'},
                {
                    type: FormElementType.INPUT,
                    span: 12,
                    name: 'name',
                    label: 'Name',
                    required: true,
                    defaultValue: '',
                    disabled: false,
                },
                {type: FormElementType.TITLE, span: 24, label: 'Line Items'},
                ...lines,
                {
                    type: FormElementType.BUTTON,
                    span: 24,
                    name: 'new-line',
                    label: 'New line',
                    disabled: false,
                    onClick: addLine
                }]);
        } else {
            setElements([
                ...commonElements,
                {type: FormElementType.TITLE, span: 24, label: 'Constraints'},
                {
                    type: FormElementType.INPUT,
                    span: 12,
                    name: 'incoterms',
                    label: 'Incoterms',
                    required: true,
                    defaultValue: '',
                    disabled: false,
                },
                {
                    type: FormElementType.DOCUMENT,
                    span: 12,
                    name: 'payment-invoice',
                    label: 'Payment Invoice',
                    required: false,
                    loading: false,
                    uploadable: true,
                    height: documentHeight
                },
                {
                    type: FormElementType.DATE,
                    span: 12,
                    name: 'payment-deadline',
                    label: 'Payment Deadline',
                    required: true,
                    defaultValue: '',
                    disabled: false,
                },
                {
                    type: FormElementType.DATE,
                    span: 12,
                    name: 'document-delivery-deadline',
                    label: 'Document Delivery Deadline',
                    required: false,
                    defaultValue: '',
                    disabled: false,
                },
                {
                    type: FormElementType.DOCUMENT,
                    span: 12,
                    name: 'swiss-decode',
                    label: 'Coffee Origin (Swiss Decode)',
                    required: false,
                    loading: false,
                    uploadable: true,
                    height: documentHeight
                },
                {
                    type: FormElementType.DOCUMENT,
                    span: 12,
                    name: 'certificate-of-shipping',
                    label: 'Certificate of Shipping',
                    required: false,
                    loading: false,
                    uploadable: true,
                    height: documentHeight
                },
                {
                    type: FormElementType.DOCUMENT,
                    span: 12,
                    name: 'bill-of-lading',
                    label: 'Bill of Lading',
                    required: false,
                    loading: false,
                    uploadable: true,
                    height: documentHeight
                },
                {
                    type: FormElementType.DOCUMENT,
                    span: 12,
                    name: 'cerificate-of-weight',
                    label: 'Certificate of Weight',
                    required: false,
                    loading: false,
                    uploadable: true,
                    height: documentHeight
                },
                {
                    type: FormElementType.DOCUMENT,
                    span: 12,
                    name: 'certificate-of-preferential-entry',
                    label: 'Certificate of Preferential Entry',
                    required: false,
                    loading: false,
                    uploadable: true,
                    height: documentHeight
                },
                {
                    type: FormElementType.DOCUMENT,
                    span: 12,
                    name: 'certificate-of-fumigation',
                    label: 'Certificate of Fumigation',
                    required: false,
                    loading: false,
                    uploadable: true,
                    height: documentHeight
                },
                {
                    type: FormElementType.DOCUMENT,
                    span: 12,
                    name: 'certificate-of-phytosanitary',
                    label: 'Certificate of Phytosanitary',
                    required: false,
                    loading: false,
                    uploadable: true,
                    height: documentHeight
                },
                {
                    type: FormElementType.DOCUMENT,
                    span: 12,
                    name: 'certificate-of-insurance',
                    label: 'Certificate of Insurance',
                    required: false,
                    loading: false,
                    uploadable: true,
                    height: documentHeight
                },
                {
                    type: FormElementType.INPUT,
                    span: 12,
                    name: 'shipper',
                    label: 'Shipper',
                    required: true,
                    defaultValue: '',
                    disabled: false,
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
                    type: FormElementType.INPUT,
                    span: 12,
                    name: 'shippingPort',
                    label: 'Shipping Port',
                    required: true,
                    defaultValue: '',
                    disabled: false,
                },
                {
                    type: FormElementType.DATE,
                    span: 12,
                    name: 'shipping-deadline',
                    label: 'Shipping Deadline',
                    required: true,
                    defaultValue: '',
                    disabled: false,
                },
                {
                    type: FormElementType.INPUT,
                    span: 12,
                    name: 'deliveryPort',
                    label: 'Delivery Port',
                    required: true,
                    defaultValue: '',
                    disabled: false,
                },
                {
                    type: FormElementType.DATE,
                    span: 12,
                    name: 'delivery-deadline',
                    label: 'Delivery Deadline',
                    required: true,
                    defaultValue: '',
                    disabled: false,
                },
                {
                    type: FormElementType.INPUT,
                    span: 12,
                    name: 'agreedAmount',
                    label: 'Agreed Amount',
                    required: true,
                    regex: regex.ONLY_DIGITS,
                    defaultValue: '',
                    disabled: false,
                },
                {
                    type: FormElementType.INPUT,
                    span: 12,
                    name: 'tokenAddress',
                    label: 'Token Address',
                    required: true,
                    regex: regex.ETHEREUM_ADDRESS,
                    defaultValue: '',
                    disabled: false,
                },
                {type: FormElementType.TITLE, span: 24, label: 'Line Items'},
                ...lines,
                {
                    type: FormElementType.BUTTON,
                    span: 24,
                    name: 'new-line',
                    label: 'New line',
                    disabled: false,
                    onClick: addLine,
                    buttonType: 'default'
                },
            ])
        }
    }, [type, lines]);

    return {
        type,
        tradeService,
        orderState,
        elements,
        updateType,
    }
}