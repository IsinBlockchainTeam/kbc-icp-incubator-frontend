import {FormElement, FormElementType, GenericForm} from "../../../components/GenericForm/GenericForm";
import {BasicTrade, TradeType} from "@kbc-lib/coffee-trading-management-lib";
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
import {TradeLinePresentable} from "../../../api/types/TradeLinePresentable";
import {MaterialPresentable} from "../../../api/types/MaterialPresentable";

const {Text} = Typography;

export const TradeNew = () => {
    const navigate = useNavigate();
    const subjectClaims = useSelector((state: RootState) => state.auth.subjectClaims);
    const tradeService = new TradeService(new BlockchainTradeStrategy({
        serverUrl: subjectClaims!.podServerUrl!,
        clientId: subjectClaims!.podClientId!,
        clientSecret: subjectClaims!.podClientSecret!
    }));

    const [type, setType] = useState<TradeType>(TradeType.BASIC);

    const [lines, setLines] = useState<FormElement[]>([{
        type: FormElementType.INPUT,
        span: 8,
        name: 'product-category-id-1',
        label: 'Product Category Id',
        required: true,
        defaultValue: '',
        disabled: false,
    },
        {type: FormElementType.SPACE, span: 16},]);

    const addLine = () => {
        setLines((prev) => [...prev, {
            type: FormElementType.INPUT,
            span: 8,
            name: `product-category-id-${prev.length}`,
            label: 'Product Category Id',
            required: true,
            defaultValue: '',
            disabled: false,
        }, {
            type: FormElementType.BUTTON,
            span: 4,
            name: 'delete-line',
            label: 'Delete line',
            disabled: false,
        },
            {type: FormElementType.SPACE, span: 12},]);
    }

    const [elements, setElements] = useState<FormElement[]>([{type: FormElementType.TITLE, span: 24, label: 'Actors'},]);

    useEffect(() => {
        setElements((prev) => [
            {type: FormElementType.TITLE, span: 24, label: 'Actors'},{
            type: FormElementType.INPUT,
            span: 8,
            name: 'supplier',
            label: 'Supplier',
            required: true,
            regex: '0x[a-fA-F0-9]{40}',
            defaultValue: '',
            disabled: false,
        },
            {
                type: FormElementType.INPUT,
                span: 8,
                name: 'customer',
                label: 'Customer',
                required: true,
                regex: '0x[a-fA-F0-9]{40}',
                defaultValue: '',
                disabled: false,
            },
            {
                type: FormElementType.INPUT,
                span: 8,
                name: 'commissioner',
                label: 'Commissioner',
                required: true,
                regex: '0x[a-fA-F0-9]{40}',
                defaultValue: '',
                disabled: false,
            },
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
            },]);
    }, [lines]);

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

    // if (type === TradeType.BASIC) {
    //     elems.push({
    //             type: FormElementType.INPUT,
    //             span: 12,
    //             name: 'name',
    //             label: 'Name',
    //             required: true,
    //             defaultValue: '',
    //             disabled: false,
    //         },
    //         {type: FormElementType.TITLE, span: 24, label: 'Line Items'},
    //         line,
    //         ...lines,
    //         {type: FormElementType.BUTTON, span: 24, name: 'new-line', label: 'New line', disabled: false, onClick: addLine},
    //     );
    // } else {
    //     elems.push({type: FormElementType.TITLE, span: 24, label: 'Constraints'},
    //         {
    //             type: FormElementType.INPUT,
    //             span: 4,
    //             name: 'incoterms',
    //             label: 'Incoterms',
    //             required: true,
    //             defaultValue: '',
    //             disabled: false,
    //         },
    //         {type: FormElementType.SPACE, span: 20},
    //         {
    //             type: FormElementType.DATE,
    //             span: 12,
    //             name: 'payment-deadline',
    //             label: 'Payment Deadline',
    //             required: true,
    //             defaultValue: '',
    //             disabled: false,
    //         },
    //         {
    //             type: FormElementType.DATE,
    //             span: 12,
    //             name: 'document-delivery-deadline',
    //             label: 'Document Delivery Deadline',
    //             required: true,
    //             defaultValue: '',
    //             disabled: false,
    //         },
    //         {
    //             type: FormElementType.INPUT,
    //             span: 12,
    //             name: 'shipper',
    //             label: 'Shipper',
    //             required: true,
    //             defaultValue: '',
    //             disabled: false,
    //         },
    //         {
    //             type: FormElementType.INPUT,
    //             span: 12,
    //             name: 'arbiter',
    //             label: 'Arbiter',
    //             required: true,
    //             defaultValue: '',
    //             disabled: false,
    //             regex: '0x[a-fA-F0-9]{40}'
    //         },
    //         {
    //             type: FormElementType.INPUT,
    //             span: 12,
    //             name: 'shipping-port',
    //             label: 'Shipping Port',
    //             required: true,
    //             defaultValue: '',
    //             disabled: false,
    //         },
    //         {
    //             type: FormElementType.DATE,
    //             span: 12,
    //             name: 'shipping-deadline',
    //             label: 'Shipping Deadline',
    //             required: true,
    //             defaultValue: '',
    //             disabled: false,
    //         },
    //         {
    //             type: FormElementType.INPUT,
    //             span: 12,
    //             name: 'delivery-port',
    //             label: 'Delivery Port',
    //             required: true,
    //             defaultValue: '',
    //             disabled: false,
    //         },
    //         {
    //             type: FormElementType.DATE,
    //             span: 12,
    //             name: 'delivery-deadline',
    //             label: 'Delivery Deadline',
    //             required: true,
    //             defaultValue: '',
    //             disabled: false,
    //         },
    //         {
    //             type: FormElementType.INPUT,
    //             span: 12,
    //             name: 'escrow',
    //             label: 'Escrow',
    //             required: true,
    //             defaultValue: '',
    //             disabled: false,
    //             regex: '0x[a-fA-F0-9]{40}'
    //         },
    //         {type: FormElementType.TITLE, span: 24, label: 'Line Items'},
    //     );
    //
    //     // trade?.lines.forEach((line) => elements.push({
    //     //         type: FormElementType.INPUT,
    //     //         span: 8,
    //     //         name: 'material-name',
    //     //         label: 'Material Name',
    //     //         required: true,
    //     //         defaultValue: line.material?.name,
    //     //         ,
    //     //     },
    //     //     {
    //     //         type: FormElementType.BUTTON,
    //     //         span: 4,
    //     //         name: 'button',
    //     //         label: 'Show Supply Chain',
    //     //     },
    //     //     {
    //     //         type: FormElementType.INPUT,
    //     //         span: 8,
    //     //         name: 'quantity',
    //     //         label: 'Quantity',
    //     //         required: true,
    //     //         defaultValue: line.quantity,
    //     //     },
    //     //     {
    //     //         type: FormElementType.INPUT,
    //     //         span: 4,
    //     //         name: 'price',
    //     //         label: 'Price',
    //     //         required: true,
    //     //         defaultValue: `${line.price?.amount} ${line.price?.fiat}`,
    //     //     },
    //     // ))
    // }

    const onSubmit = async (values: any) => {

        for(const key in values) {
            if (key.startsWith('product-category-id-')) {
                const id: number = parseInt(key.split('-')[3]);
                (values['lines'] ||= []).push(new TradeLinePresentable(id, new MaterialPresentable(values[key])));
            }
        }
        if(type === TradeType.BASIC) {
            await tradeService.saveBasicTrade(values);
            openNotification("Basic trade registered", `Basic trade ${values.name} has been registered correctly!`, NotificationType.SUCCESS, 1);
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