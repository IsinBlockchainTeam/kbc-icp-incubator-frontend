import React, {useEffect, useState} from "react";
import {CardPage} from "../../../components/structure/CardPage/CardPage";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import {TradeService} from "../../../api/services/TradeService";
import {Spin, Tag} from "antd";
import dayjs from "dayjs";
import {getEnumKeyByValue, isValueInEnum} from "../../../utils/utils";
import {TradePresentable} from "../../../api/types/TradePresentable";
import {DocumentPresentable} from "../../../api/types/DocumentPresentable";
import {BlockchainTradeStrategy} from "../../../api/strategies/trade/BlockchainTradeStrategy";
import {DocumentService} from "../../../api/services/DocumentService";
import {BlockchainDocumentStrategy} from "../../../api/strategies/document/BlockchainDocumentStrategy";
import {TradeType} from "@kbc-lib/coffee-trading-management-lib";
import {useSelector} from "react-redux";
import {RootState} from "../../../redux/types";
import {NotificationType, openNotification} from "../../../utils/notification";
import {FormElement, FormElementType, GenericForm} from "../../../components/GenericForm/GenericForm";
import {EditOutlined} from "@ant-design/icons";
import {regex} from "../../../utils/regex";

export const TradeView = () => {
    const navigate = useNavigate();
    const {id} = useParams();
    const location = useLocation();
    const type = parseInt(new URLSearchParams(location.search).get('type')!);
    const subjectClaims = useSelector((state: RootState) => state.auth.subjectClaims);

    const [trade, setTrade] = useState<TradePresentable>();
    const [documents, setDocuments] = useState<DocumentPresentable[]>();
    const [loadingDocuments, setLoadingDocuments] = useState<boolean>(true);
    const [disabled, setDisabled] = useState<boolean>(true);

    const tradeService = new TradeService(new BlockchainTradeStrategy({
        serverUrl: subjectClaims!.podServerUrl!,
        sessionCredentials: {
            podName: subjectClaims!.podName!,
            clientId: subjectClaims!.podClientId!,
            clientSecret: subjectClaims!.podClientSecret!
        }
    }));

    const getTradeInfo = async (id: number, type: number) => {
        const resp = await tradeService.getTradeByIdAndType(id, type);
        resp && setTrade(resp);
    }

    const getTradeDocuments = async (id: number) => {
        const documentService = new DocumentService(new BlockchainDocumentStrategy({
            serverUrl: subjectClaims!.podServerUrl!,
            sessionCredentials: {
                podName: subjectClaims!.podName!,
                clientId: subjectClaims!.podClientId!,
                clientSecret: subjectClaims!.podClientSecret!
            }
        }));
        const resp = await documentService.getDocumentsByTransactionIdAndType(id, 'trade');
        console.log("documents: ", resp)
        resp && setDocuments(resp);
    }

    useEffect(() => {
        if (!subjectClaims || !(subjectClaims.podClientSecret && subjectClaims.podClientId && subjectClaims.podServerUrl)) {
            openNotification("Error", "No information about company storage", NotificationType.ERROR);
            return;
        }
        (async () => {
            await getTradeInfo(parseInt(id!), type);
            await getTradeDocuments(parseInt(id!));
            setLoadingDocuments(false);
        })();
    }, []);

    const elements: FormElement[] = [
        {type: FormElementType.TITLE, span: 24, label: 'Actors'},
        {
            type: FormElementType.INPUT,
            span: 8,
            name: 'supplier',
            label: 'Supplier',
            required: true,
            defaultValue: trade?.supplier,
            disabled,
            regex: regex.ETHEREUM_ADDRESS
        },
        {
            type: FormElementType.INPUT,
            span: 8,
            name: 'customer',
            label: 'Customer',
            required: true,
            defaultValue: trade?.customer,
            disabled,
            regex: regex.ETHEREUM_ADDRESS
        },
        {
            type: FormElementType.INPUT,
            span: 8,
            name: 'commissioner',
            label: 'Commissioner',
            required: true,
            defaultValue: trade?.commissioner,
            disabled,
            regex: regex.ETHEREUM_ADDRESS
        },
    ];

    if (trade?.type === TradeType.BASIC) {
        elements.push({
            type: FormElementType.INPUT,
            span: 12,
            name: 'name',
            label: 'Name',
            required: true,
            defaultValue: trade?.name,
            disabled,
        }, {type: FormElementType.TITLE, span: 24, label: 'Line Items'});

        trade?.lines.forEach((line) => elements.push({
                type: FormElementType.INPUT,
                span: 8,
                name: 'material-name',
                label: 'Material Name',
                required: true,
                defaultValue: line.material?.name,
                disabled,
            },
            {
                type: FormElementType.BUTTON,
                span: 4,
                name: 'button',
                label: 'Show Supply Chain',
                disabled: !line.material,
                onClick: () => navigate(`/graph/${line.material?.id}`)
            },
        ));
    } else {
        elements.push({type: FormElementType.TITLE, span: 24, label: 'Constraints'},
            {
                type: FormElementType.INPUT,
                span: 4,
                name: 'incoterms',
                label: 'Incoterms',
                required: true,
                defaultValue: trade?.incoterms,
                disabled,
            },
            {type: FormElementType.SPACE, span: 20},
            {
                type: FormElementType.DATE,
                span: 12,
                name: 'payment-deadline',
                label: 'Payment Deadline',
                required: true,
                defaultValue: dayjs(trade?.paymentDeadline),
                disabled,
            },
            {
                type: FormElementType.DATE,
                span: 12,
                name: 'document-delivery-deadline',
                label: 'Document Delivery Deadline',
                required: true,
                defaultValue: dayjs(trade?.documentDeliveryDeadline),
                disabled,
            },
            {
                type: FormElementType.INPUT,
                span: 12,
                name: 'shipper',
                label: 'Shipper',
                required: true,
                defaultValue: trade?.shipper,
                disabled,
            },
            {
                type: FormElementType.INPUT,
                span: 12,
                name: 'arbiter',
                label: 'Arbiter',
                required: true,
                defaultValue: trade?.arbiter,
                disabled,
                regex: regex.ETHEREUM_ADDRESS
            },
            {
                type: FormElementType.INPUT,
                span: 12,
                name: 'shipping-port',
                label: 'Shipping Port',
                required: true,
                defaultValue: trade?.shippingPort,
                disabled,
            },
            {
                type: FormElementType.DATE,
                span: 12,
                name: 'shipping-deadline',
                label: 'Shipping Deadline',
                required: true,
                defaultValue: dayjs(trade?.shippingDeadline),
                disabled,
            },
            {
                type: FormElementType.INPUT,
                span: 12,
                name: 'delivery-port',
                label: 'Delivery Port',
                required: true,
                defaultValue: trade?.deliveryPort,
                disabled,
            },
            {
                type: FormElementType.DATE,
                span: 12,
                name: 'delivery-deadline',
                label: 'Delivery Deadline',
                required: true,
                defaultValue: dayjs(trade?.deliveryDeadline),
                disabled,
            },
            {
                type: FormElementType.INPUT,
                span: 12,
                name: 'escrow',
                label: 'Escrow',
                required: true,
                defaultValue: trade?.escrow,
                disabled,
                regex: regex.ETHEREUM_ADDRESS
            },
            {type: FormElementType.TITLE, span: 24, label: 'Line Items'},
        );

        trade?.lines.forEach((line) => elements.push({
                type: FormElementType.INPUT,
                span: 8,
                name: 'material-name',
                label: 'Material Name',
                required: true,
                defaultValue: line.material?.name,
                disabled,
            },
            {
                type: FormElementType.BUTTON,
                span: 4,
                name: 'button',
                label: 'Show Supply Chain',
                disabled: !line.material,
                onClick: () => {}
            },
            {
                type: FormElementType.INPUT,
                span: 8,
                name: 'quantity',
                label: 'Quantity',
                required: true,
                defaultValue: line.quantity,
                disabled,
            },
            {
                type: FormElementType.INPUT,
                span: 4,
                name: 'price',
                label: 'Price',
                required: true,
                defaultValue: `${line.price?.amount} ${line.price?.fiat}`,
                disabled,
            },
        ))
    }

    documents?.forEach((document) => elements.push({
        type: FormElementType.DOCUMENT_PREVIEW,
        span: 24,
        name: document.name,
        label: document.name,
        required: true,
        content: document.content,
        disabled,
    }))

    const onSubmit = async (values: any) => {
        if (values['delivery-deadline'] <= values['shipping-deadline']) {
            openNotification("Invalid dates", '', NotificationType.ERROR);
        }
        if(trade?.type === TradeType.BASIC) {
            await tradeService.putBasicTrade(trade.id, values);
        }
        setDisabled(true);
    }

    if (!trade)
        return <Spin
            style={{width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}/>;
    if (!isValueInEnum(type, TradeType))
        return <div>Wrong type</div>;


    return (
        <CardPage title={
            <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                {getEnumKeyByValue(TradeType, type)}
                <div style={{display: 'flex', alignItems: 'center'}}>
                    {trade?.status && (
                        <Tag color='green' key={trade.status}>
                            {trade.status?.toUpperCase()}
                        </Tag>
                    )}
                    <EditOutlined style={{marginLeft: '8px'}} onClick={() => setDisabled(!disabled)}/>
                </div>
            </div>}
        >
            <GenericForm elements={elements} submittable={!disabled} onSubmit={onSubmit}/>
        </CardPage>

    )
}

export default TradeView;
