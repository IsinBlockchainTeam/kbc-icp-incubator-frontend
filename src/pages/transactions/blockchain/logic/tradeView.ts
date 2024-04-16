import useTradeShared from "./tradeShared";
import {NotificationType, openNotification} from "../../../../utils/notification";
import {TradeType} from "@kbc-lib/coffee-trading-management-lib";
import {useLocation, useParams} from "react-router-dom";
import {useSelector} from "react-redux";
import {RootState} from "../../../../redux/types";
import {useEffect, useState} from "react";
import {TradePresentable} from "../../../../api/types/TradePresentable";
import {DocumentPresentable} from "../../../../api/types/DocumentPresentable";
import {DocumentService} from "../../../../api/services/DocumentService";
import {BlockchainDocumentStrategy} from "../../../../api/strategies/document/BlockchainDocumentStrategy";
import {
    ICPStorageDriver
} from "@blockchain-lib/common";
import {FormElement, FormElementType} from "../../../../components/GenericForm/GenericForm";
import {regex} from "../../../../utils/regex";

export default function useTradeView() {
    const { tradeService, orderState } = useTradeShared();

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
        const resp = await tradeService.getTradeByIdAndType(id, type);
        resp && setTrade(resp);
    }

    const getTradeDocuments = async (id: number) => {
        const storageDriver = ICPStorageDriver.getInstance();
        let fileList = await storageDriver.listFiles(0);
        console.log("FILE LIST", fileList);
        fileList = fileList.filter(file => file.file.mime_type === 'application/pdf')
        const documents = await Promise.all(fileList.map(async file => await storageDriver.getFile(file.file)));

        let documentPresentables: DocumentPresentable[] = [];
        for (let i = 0; i < fileList.length; i++) {
            const fileInfo = fileList[i].file;
            const blob = new Blob([documents[i].buffer], { type: 'application/pdf'});
            const dp = new DocumentPresentable()
                .setName(fileInfo.name)
                .setContentType('application/pdf')
                .setContent(blob)
                .setFilename(fileInfo.name);
            documentPresentables.push(dp);
        }
        console.log("DOCUMENTS", documentPresentables);
        setDocuments(documentPresentables);
    }

    const [elements, setElements] = useState<FormElement[]>([]);

    useEffect(() => {
        (async () => {
            await getTradeInfo(parseInt(id!), type);
        })();
        (async () => {
            await getTradeDocuments(parseInt(id!));
            setLoadingDocuments(false);
        })();
    }, []);

    useEffect(() => {
        console.log("USE EFFECT: ", trade, documents)
        if(!documents) return;
        if(documents.length === 0) return;
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

        const documentHeight = '45vh';

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
                    defaultValue: trade.name,
                    disabled,
                },
                {type: FormElementType.TITLE, span: 24, label: 'Line Items'},
                {
                    type: FormElementType.INPUT,
                    span: 8,
                    name: 'product-category-id-1',
                    label: 'Product Category Id',
                    required: true,
                    regex: regex.ONLY_DIGITS,
                    defaultValue: trade.lines[0].material?.id.toString(),
                    disabled,
                },
                {type: FormElementType.SPACE, span: 16},
            ]);
        }
        else {
            setElements([
                ...commonElements,
                {type: FormElementType.TITLE, span: 24, label: 'Constraints'},
                {
                    type: FormElementType.INPUT,
                    span: 12,
                    name: 'incoterms',
                    label: 'Incoterms',
                    required: true,
                    defaultValue: trade.incoterms,
                    disabled,
                },
                {
                    type: FormElementType.DOCUMENT,
                    span: 12,
                    name: 'payment-invoice',
                    label: 'Payment Invoice',
                    required: false,
                    loading: false,
                    uploadable: false,
                    content: documents[0].content,
                    height: documentHeight,
                },
                {
                    type: FormElementType.DATE,
                    span: 12,
                    name: 'payment-deadline',
                    label: 'Payment Deadline',
                    required: true,
                    // defaultValue: trade.paymentDeadline,
                    defaultValue: '',
                    disabled,
                },
                {
                    type: FormElementType.DATE,
                    span: 12,
                    name: 'document-delivery-deadline',
                    label: 'Document Delivery Deadline',
                    required: false,
                    // defaultValue: trade.documentDeliveryDeadline,
                    defaultValue: '',
                    disabled,
                },
                {
                    type: FormElementType.INPUT,
                    span: 12,
                    name: 'shipper',
                    label: 'Shipper',
                    required: true,
                    defaultValue: trade.shipper,
                    disabled,
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
                    name: 'shippingPort',
                    label: 'Shipping Port',
                    required: true,
                    defaultValue: trade.shippingPort,
                    disabled,
                },
                {
                    type: FormElementType.DATE,
                    span: 12,
                    name: 'shipping-deadline',
                    label: 'Shipping Deadline',
                    required: true,
                    // defaultValue: trade.shippingDeadline,
                    defaultValue: '',
                    disabled,
                },
                {
                    type: FormElementType.INPUT,
                    span: 12,
                    name: 'deliveryPort',
                    label: 'Delivery Port',
                    required: true,
                    defaultValue: trade.deliveryPort,
                    disabled,
                },
                {
                    type: FormElementType.DATE,
                    span: 12,
                    name: 'delivery-deadline',
                    label: 'Delivery Deadline',
                    required: true,
                    //defaultValue: trade.deliveryDeadline,
                    defaultValue: '',
                    disabled,
                },
                {
                    type: FormElementType.INPUT,
                    span: 12,
                    name: 'agreedAmount',
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
                {
                    type: FormElementType.INPUT,
                    span: 6,
                    name: `product-category-id-1`,
                    label: 'Product Category Id',
                    required: true,
                    defaultValue: trade.lines[0].material?.id.toString(),
                    disabled,
                },
                {
                    type: FormElementType.INPUT,
                    span: 6,
                    name: `quantity-${id}`,
                    label: 'Quantity',
                    required: true,
                    regex: regex.ONLY_DIGITS,
                    defaultValue: trade.lines[0].quantity?.toString(),
                    disabled,
                },
                {
                    type: FormElementType.INPUT,
                    span: 6,
                    name: `price-${id}`,
                    label: 'Price',
                    required: true,
                    defaultValue: trade.lines[0].price?.amount.toString() + ' ' + trade.lines[0].price?.fiat,
                    disabled,
                },
            ])
        }
    }, [trade, documents]);

    const onSubmit = async (values: any) => {
        if (values['delivery-deadline'] <= values['shipping-deadline']) {
            openNotification("Invalid dates", '', NotificationType.ERROR);
        }
        if(trade?.type === TradeType.BASIC) {
            await tradeService.putBasicTrade(trade.id, values);
        }
        setDisabled(true);
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
