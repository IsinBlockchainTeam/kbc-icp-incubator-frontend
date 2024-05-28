import {Divider, Steps} from "antd";
import {EditOutlined, ImportOutlined, ProductOutlined, SendOutlined, TruckOutlined} from "@ant-design/icons";
import React, {useContext, useMemo} from "react";
import {FormElement, FormElementType, GenericForm} from "../GenericForm/GenericForm";
import {DocumentType, OrderStatus, serial, TradeType} from "@kbc-lib/coffee-trading-management-lib";
import {hideLoading, showLoading} from "../../redux/reducers/loadingSlice";
import {DocumentRequest} from "../../api/types/DocumentRequest";
import {NotificationType, openNotification} from "../../utils/notification";
import {EthServicesContext} from "../../providers/EthServicesProvider";
import {useDispatch} from "react-redux";
import {DetailedTradePresentable} from "../../api/types/TradePresentable";
import useTradeView from "../../pages/transactions/logic/tradeView";
import useTradeNew from "../../pages/transactions/logic/tradeNew";
import {useNavigate} from "react-router-dom";
import {paths} from "../../constants";
import {SignerContext} from "../../providers/SignerProvider";
import TradeDutiesWaiting, {DutiesWaiting} from "../../pages/transactions/TradeDutiesWaiting";

type Props = {
    status: OrderStatus,
    submittable: boolean,
    negotiationElements: FormElement[],
    tradeInfo?: DetailedTradePresentable
}

export default function OrderTradeStatusForms(props: Props) {
    const {
        status,
        submittable,
        negotiationElements,
        tradeInfo,
    } = props;
    let onSubmit: (values: any) => Promise<void>;
    const {signer} = useContext(SignerContext);
    const navigate = useNavigate();
    const {ethTradeService} = useContext(EthServicesContext);
    const dispatch = useDispatch();
    const [current, setCurrent] = React.useState<OrderStatus>(status);
    const documentHeight = '45vh';
    const tradeView = useTradeView();
    const tradeNew = useTradeNew();

    const onChange = (value: number) => {
        if(value > status) return;
        setCurrent(value);
    }

    const submitDocuments = async (values: any, documents: {valueName: string, documentType: DocumentType}[]): Promise<void> => {
        try {
            if (!tradeInfo) return;
            dispatch(showLoading("Documents uploading..."));
            await serial(documents.map(doc => async () => {
                if (!values[doc.valueName] || !values[doc.valueName].name) return;
                const documentRequest: DocumentRequest = {
                    content: values[doc.valueName],
                    filename: values[doc.valueName].name,
                    documentType: doc.documentType,
                }
                await ethTradeService.addDocument(tradeInfo.trade.tradeId, TradeType.ORDER, documentRequest, tradeInfo.trade.externalUrl);
                navigate(paths.TRADES);
            }));
        } catch (e: any) {
            console.log("error: ", e);
            openNotification("Error", e.message, NotificationType.ERROR);
        } finally {
            dispatch(hideLoading());
        }
    }

    const steps = useMemo(() => {
        let elementsAfterNegotiation: Map<OrderStatus, {elements: FormElement[], onSubmit: (values: any) => Promise<void>}> | undefined;
        if (tradeInfo) {
            onSubmit = tradeView.onSubmit;

            elementsAfterNegotiation = new Map<OrderStatus, {elements: FormElement[], onSubmit: (values: any) => Promise<void>}>()
                .set(OrderStatus.PRODUCTION, {
                    elements: [
                        {
                            type: FormElementType.TIP,
                            span: 24,
                            label: 'At this stage, the exporter has to load a payment invoice for the goods that have been negotiated. \n This operation allows coffee production to be started and planned only against a guarantee deposit from the importer'
                        },
                        {
                            type: FormElementType.DOCUMENT,
                            span: 12,
                            name: 'payment-invoice',
                            label: 'Payment Invoice',
                            required: true,
                            loading: false,
                            uploadable: true,
                            info: tradeInfo.documents.get(DocumentType.PAYMENT_INVOICE),
                            height: documentHeight,
                            validationCallback: tradeView.validationCallback(tradeInfo, DocumentType.PAYMENT_INVOICE),
                        }
                    ],
                    onSubmit: (values: any) => submitDocuments(values, [{valueName: 'payment-invoice', documentType: DocumentType.PAYMENT_INVOICE}])
                })
                .set(OrderStatus.PAYED, {
                    elements: [
                        {
                            type: FormElementType.TIP,
                            span: 24,
                            label: 'This is the export phase, the exporter has to load the following documents to proceed with the export, \n in order to prove the quality of the goods and the intrinsic characteristics of the coffee.'
                        },
                        {
                            type: FormElementType.DOCUMENT,
                            span: 12,
                            name: 'swiss-decode',
                            label: 'Swiss Decode',
                            required: true,
                            loading: false,
                            uploadable: true,
                            info: tradeInfo.documents.get(DocumentType.SWISS_DECODE),
                            height: documentHeight,
                            validationCallback: tradeView.validationCallback(tradeInfo, DocumentType.SWISS_DECODE),
                        },
                        {
                            type: FormElementType.DOCUMENT,
                            span: 12,
                            name: 'weight-certificate',
                            label: 'Weight Certificate',
                            required: true,
                            loading: false,
                            uploadable: true,
                            info: tradeInfo.documents.get(DocumentType.WEIGHT_CERTIFICATE),
                            height: documentHeight,
                            validationCallback: tradeView.validationCallback(tradeInfo, DocumentType.WEIGHT_CERTIFICATE),
                        },
                        {
                            type: FormElementType.DOCUMENT,
                            span: 12,
                            name: 'fumigation-certificate',
                            label: 'Fumigation Certificate',
                            required: true,
                            loading: false,
                            uploadable: true,
                            info: tradeInfo.documents.get(DocumentType.FUMIGATION_CERTIFICATE),
                            height: documentHeight,
                            validationCallback: tradeView.validationCallback(tradeInfo, DocumentType.FUMIGATION_CERTIFICATE),
                        },
                        {
                            type: FormElementType.DOCUMENT,
                            span: 12,
                            name: 'preferential-entry-certificate',
                            label: 'Preferential Entry Certificate',
                            required: true,
                            loading: false,
                            uploadable: true,
                            info: tradeInfo.documents.get(DocumentType.PREFERENTIAL_ENTRY_CERTIFICATE),
                            height: documentHeight,
                            validationCallback: tradeView.validationCallback(tradeInfo, DocumentType.PREFERENTIAL_ENTRY_CERTIFICATE),
                        },
                        {
                            type: FormElementType.DOCUMENT,
                            span: 12,
                            name: 'phytosanitary-certificate',
                            label: 'Phytosanitary Certificate',
                            required: true,
                            loading: false,
                            uploadable: true,
                            info: tradeInfo.documents.get(DocumentType.PHYTOSANITARY_CERTIFICATE),
                            height: documentHeight,
                            validationCallback: tradeView.validationCallback(tradeInfo, DocumentType.PHYTOSANITARY_CERTIFICATE),
                        },
                        {
                            type: FormElementType.DOCUMENT,
                            span: 12,
                            name: 'insurance-certificate',
                            label: 'Insurance Certificate',
                            required: true,
                            loading: false,
                            uploadable: true,
                            info: tradeInfo.documents.get(DocumentType.INSURANCE_CERTIFICATE),
                            height: documentHeight,
                            validationCallback: tradeView.validationCallback(tradeInfo, DocumentType.INSURANCE_CERTIFICATE),
                        },
                    ],
                    onSubmit: (values: any) => submitDocuments(values, [
                        {valueName: 'swiss-decode', documentType: DocumentType.SWISS_DECODE},
                        {valueName: 'weight-certificate', documentType: DocumentType.WEIGHT_CERTIFICATE},
                        {valueName: 'fumigation-certificate', documentType: DocumentType.FUMIGATION_CERTIFICATE},
                        {valueName: 'preferential-entry-certificate', documentType: DocumentType.PREFERENTIAL_ENTRY_CERTIFICATE},
                        {valueName: 'phytosanitary-certificate', documentType: DocumentType.PHYTOSANITARY_CERTIFICATE},
                        {valueName: 'insurance-certificate', documentType: DocumentType.INSURANCE_CERTIFICATE},
                    ]),
                })
                .set(OrderStatus.EXPORTED, {
                    elements: [
                        {
                            type: FormElementType.TIP,
                            span: 24,
                            label: 'This is the last step for the exporter, in which is important to prove that the goods are ready to be shipped. \n The exporter has to load the Bill of Lading to proceed with the shipment.'
                        },
                        {
                            type: FormElementType.DOCUMENT,
                            span: 12,
                            name: 'bill-of-lading',
                            label: 'Bill Of Lading',
                            required: true,
                            loading: false,
                            uploadable: true,
                            info: tradeInfo.documents.get(DocumentType.BILL_OF_LADING),
                            height: documentHeight,
                            validationCallback: tradeView.validationCallback(tradeInfo, DocumentType.BILL_OF_LADING),
                        }
                    ],
                    onSubmit: (values: any) => submitDocuments(values, [{valueName: 'bill-of-lading', documentType: DocumentType.BILL_OF_LADING}])
                });
        }
        else {
            onSubmit = tradeNew.onSubmit;
        }

        const hasPendingDuties = (orderStatus: OrderStatus, elements: Map<OrderStatus, {elements: FormElement[], onSubmit: (values: any) => Promise<void>}> | undefined): elements is Map<OrderStatus, {elements: FormElement[], onSubmit: (values: any) => Promise<void>}> => {
            const trade = tradeInfo?.trade, documents = tradeInfo?.documents;
            if (!trade || !documents) return false;

            if (orderStatus === OrderStatus.PRODUCTION) return documents.has(DocumentType.PAYMENT_INVOICE) ? true : signer?.address === trade.supplier;
            if (orderStatus === OrderStatus.PAYED) return (documents.has(DocumentType.SWISS_DECODE) || documents.has(DocumentType.WEIGHT_CERTIFICATE) ||
                    documents.has(DocumentType.FUMIGATION_CERTIFICATE) || documents.has(DocumentType.PREFERENTIAL_ENTRY_CERTIFICATE) ||
                    documents.has(DocumentType.PHYTOSANITARY_CERTIFICATE) || documents.has(DocumentType.INSURANCE_CERTIFICATE)) ? true : signer?.address === trade.supplier;
            if (orderStatus === OrderStatus.EXPORTED) return documents.has(DocumentType.BILL_OF_LADING) ? true : signer?.address === trade.supplier;
            return true;
        }

        return [
            {
                title: 'Contract stipulation',
                icon: <EditOutlined />,
                content: <GenericForm elements={negotiationElements} submittable={submittable} onSubmit={onSubmit}/>
            },
            {
                title: 'Coffee Production',
                icon: <ProductOutlined />,
                content: hasPendingDuties(OrderStatus.PRODUCTION, elementsAfterNegotiation) ?
                    <GenericForm elements={elementsAfterNegotiation.get(OrderStatus.PRODUCTION)!.elements} submittable={current === OrderStatus.PRODUCTION} onSubmit={elementsAfterNegotiation.get(OrderStatus.PRODUCTION)!.onSubmit}/> :
                    <TradeDutiesWaiting waitingType={DutiesWaiting.EXPORTER_PRODUCTION} message={"The exporter has not uploaded the Payment Invoice yet. \n You will be notified when there are new developments."} />
            },
            {
                title: 'Coffee Export',
                icon: <SendOutlined />,
                content: hasPendingDuties(OrderStatus.PAYED, elementsAfterNegotiation) ?
                    <GenericForm elements={elementsAfterNegotiation.get(OrderStatus.PAYED)!.elements} submittable={current === OrderStatus.PAYED} onSubmit={elementsAfterNegotiation.get(OrderStatus.PAYED)!.onSubmit}/> :
                    <TradeDutiesWaiting waitingType={DutiesWaiting.EXPORTER_EXPORT} message={"The exporter has not uploaded any of the documents yet. \n You will be notified when there are new developments."} />
            },
            {
                title: 'Coffee Shipment',
                icon: <TruckOutlined />,
                content: hasPendingDuties(OrderStatus.EXPORTED, elementsAfterNegotiation) ?
                    <GenericForm elements={elementsAfterNegotiation.get(OrderStatus.EXPORTED)!.elements} submittable={current === OrderStatus.EXPORTED} onSubmit={elementsAfterNegotiation.get(OrderStatus.EXPORTED)!.onSubmit}/> :
                    <TradeDutiesWaiting waitingType={DutiesWaiting.EXPORTER_SHIPPING} message={"The exporter has not uploaded the Bill of Lading. \n You will be notified when there are new developments."} />
            },
            {
                title: 'Coffee Import',
                icon: <ImportOutlined />,
                content: <GenericForm elements={[]} submittable={current === OrderStatus.SHIPPED}/>
            }
        ];
    }, [negotiationElements, submittable]);

    return (
        <>
            <Divider>Order status</Divider>
            <Steps
                type="navigation"
                current={current}
                onChange={onChange}
                className="order-status"
                items={steps.map(item => ({title: item.title, icon: item.icon}))}
            />
            <React.Fragment>{steps[current].content}</React.Fragment>
        </>
    )
}
