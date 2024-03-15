import {FormElement, FormElementType, GenericForm} from "../../../components/GenericForm/GenericForm";
import {TradeType} from "@kbc-lib/coffee-trading-management-lib";
import {getEnumKeyByValue} from "../../../utils/utils";
import {Button, Dropdown, MenuProps, Typography} from "antd";
import {CardPage} from "../../../components/structure/CardPage/CardPage";
import React, {useEffect, useState} from "react";
import {NotificationType, openNotification} from "../../../utils/notification";
import {DeleteOutlined, DownOutlined} from '@ant-design/icons';
import {paths} from "../../../constants";
import {useNavigate} from "react-router-dom";
import {TradeService} from "../../../api/services/TradeService";
import {BlockchainTradeStrategy} from "../../../api/strategies/trade/BlockchainTradeStrategy";
import {useSelector} from "react-redux";
import {RootState} from "../../../redux/types";
import {TradeLinePresentable, TradeLinePrice} from "../../../api/types/TradeLinePresentable";
import {MaterialPresentable} from "../../../api/types/MaterialPresentable";
import {v4 as uuid} from 'uuid';
import dayjs from "dayjs";
import {regex} from "../../../utils/regex";

const {Text} = Typography;

export const TradeNew = () => {
    const navigate = useNavigate();
    const subjectClaims = useSelector((state: RootState) => state.auth.subjectClaims);
    const tradeService = new TradeService(new BlockchainTradeStrategy({
        serverUrl: subjectClaims!.podServerUrl!,
        clientId: subjectClaims!.podClientId!,
        clientSecret: subjectClaims!.podClientSecret!
    }));

    const documentHeight = '45vh';

    const [type, setType] = useState<TradeType>(TradeType.BASIC);

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

    const items: MenuProps['items'] = [
        {label: 'Basic', key: '0'},
        {label: 'Order', key: '1'},
    ];

    const menuProps = {
        items,
        onClick: ({key}: any) => {
            setType(parseInt(key) as TradeType);
        }
    }

    const onSubmit = async (values: any) => {
        for (const key in values) {
            let id: string;
            if (key.startsWith('product-category-id-')) {
                id = key.split('-')[3];
                if(type === TradeType.BASIC)
                    (values['lines'] ||= []).push(new TradeLinePresentable(0, new MaterialPresentable(values[key])));
                else {
                    const materialId: number = parseInt(values[`product-category-id-${id}`]);
                    const quantity: number = parseInt(values[`quantity-${id}`]);
                    const price: number = parseInt(values[`price-${id}`].split(' ')[0]);
                    const fiat: string = values[`price-${id}`].split(' ')[1];
                    const line: TradeLinePresentable = new TradeLinePresentable(0, new MaterialPresentable(materialId), quantity, new TradeLinePrice(price, fiat));
                    (values['lines'] ||= []).push(line);
                }
            }
        }
        if (type === TradeType.BASIC) {
            await tradeService.saveBasicTrade(values);
            openNotification("Basic trade registered", `Basic trade "${values.name}" has been registered correctly!`, NotificationType.SUCCESS, 1);
        } else {
            values['paymentDeadline'] = dayjs(values['payment-deadline']).toDate();
            values['documentDeliveryDeadline'] = values['document-delivery-deadline'].toDate();
            values['shippingDeadline'] = (values['shipping-deadline']).toDate();
            values['deliveryDeadline'] = values['delivery-deadline'].toDate();
            await tradeService.saveOrderTrade(values);
            openNotification("Order trade registered", `Order trade has been registered correctly!`, NotificationType.SUCCESS, 1);
        }
    }

    return (
        <CardPage title={
            <div
                style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                New Trade
                <Button type="primary" danger icon={<DeleteOutlined/>} onClick={() => navigate(paths.TRADES)}>
                    Delete Trade
                </Button>
            </div>
        }>

            <div style={{display: "flex", alignItems: "center"}}>
                <Text style={{marginRight: '16px'}} strong>Trade Type:</Text>
                <Dropdown menu={menuProps} trigger={['click']}>
                    <Button>{getEnumKeyByValue(TradeType, type)} <DownOutlined/></Button>
                </Dropdown>
            </div>

            <GenericForm elements={elements} submittable={true} onSubmit={onSubmit}/>
        </CardPage>
    )
}