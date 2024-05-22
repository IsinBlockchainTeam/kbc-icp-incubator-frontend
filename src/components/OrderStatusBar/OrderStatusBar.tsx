import {Divider, Steps} from "antd";
import {EditOutlined, ImportOutlined, ProductOutlined, SendOutlined, TruckOutlined} from "@ant-design/icons";
import React, {ReactNode, useContext, useEffect} from "react";
import {FormElement, FormElementType, GenericForm} from "../GenericForm/GenericForm";
import {DocumentType, OrderStatus, serial, Trade, TradeType} from "@kbc-lib/coffee-trading-management-lib";
import {hideLoading} from "../../redux/reducers/loadingSlice";
import {DocumentRequest} from "../../api/types/DocumentRequest";
import {NotificationType, openNotification} from "../../utils/notification";
import {EthServicesContext} from "../../providers/EthServicesProvider";
import {useDispatch} from "react-redux";

export interface OrderStatusBarProps {
    orderStatus: number;
    onChange?: (value: number) => void;
    trade?: Trade;
}

export default function OrderStatusBar(props: OrderStatusBarProps) {
    const {
        orderStatus,
        onChange,
        trade
    } = props;
    const {ethTradeService} = useContext(EthServicesContext);
    const dispatch = useDispatch();
    const [steps, setSteps] = React.useState<{status: OrderStatus, title: string, icon: ReactNode, content: ReactNode}[]>([]);
    const documentHeight = '45vh';

    const submitDocuments = async (values: any, documents: {valueName: string, documentType: DocumentType}[]): Promise<void> => {
        try {
            if (!trade) return;
            await serial(documents.map(doc => async () => {
                const documentRequest: DocumentRequest = {
                    content: values[doc.valueName],
                    filename: values[doc.valueName].name,
                    documentType: doc.documentType,
                }
                await ethTradeService.addDocument(trade.tradeId, TradeType.ORDER, documentRequest, trade.externalUrl)
            }));
        } catch (e: any) {
            console.log("error: ", e);
            openNotification("Error", e.message, NotificationType.ERROR);
        } finally {
            dispatch(hideLoading());
        }
    }

    const elementStatus: Map<OrderStatus, {elements: FormElement[], onSubmit: (values: any) => Promise<void>}> = new Map<OrderStatus, {elements: FormElement[], onSubmit: (values: any) => Promise<void>}>()
        .set(OrderStatus.PRODUCTION, {
            elements: [
                {
                    type: FormElementType.DOCUMENT,
                    span: 12,
                    name: 'payment-invoice',
                    label: 'Payment Invoice',
                    required: true,
                    loading: false,
                    uploadable: true,
                    height: documentHeight,
                    evaluable: true,
                }
            ],
            onSubmit: (values: any) => submitDocuments(values, [{valueName: 'payment-invoice', documentType: DocumentType.PAYMENT_INVOICE}])
        })
        .set(OrderStatus.PAYED, {
            elements: [
                {
                    type: FormElementType.DOCUMENT,
                    span: 12,
                    name: 'swiss-decode',
                    label: 'Swiss Decode',
                    required: true,
                    loading: false,
                    uploadable: true,
                    height: documentHeight,
                    evaluable: true,
                },
                {
                    type: FormElementType.DOCUMENT,
                    span: 12,
                    name: 'weight-certificate',
                    label: 'Weight Certificate',
                    required: true,
                    loading: false,
                    uploadable: true,
                    height: documentHeight,
                    evaluable: true,
                },
                {
                    type: FormElementType.DOCUMENT,
                    span: 12,
                    name: 'fumigation-certificate',
                    label: 'Fumigation Certificate',
                    required: true,
                    loading: false,
                    uploadable: true,
                    height: documentHeight,
                    evaluable: true,
                },
                {
                    type: FormElementType.DOCUMENT,
                    span: 12,
                    name: 'preferential-entry-certificate',
                    label: 'Preferential Entry Certificate',
                    required: true,
                    loading: false,
                    uploadable: true,
                    height: documentHeight,
                    evaluable: true,
                },
                {
                    type: FormElementType.DOCUMENT,
                    span: 12,
                    name: 'phytosanitary-certificate',
                    label: 'Phytosanitary Certificate',
                    required: true,
                    loading: false,
                    uploadable: true,
                    height: documentHeight,
                    evaluable: true,
                },
                {
                    type: FormElementType.DOCUMENT,
                    span: 12,
                    name: 'insurance-certificate',
                    label: 'Insurance Certificate',
                    required: true,
                    loading: false,
                    uploadable: true,
                    height: documentHeight,
                    evaluable: true,
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
                    type: FormElementType.DOCUMENT,
                    span: 12,
                    name: 'bill-of-lading',
                    label: 'Bill Of Lading',
                    required: true,
                    loading: false,
                    uploadable: true,
                    height: documentHeight,
                    evaluable: true,
                }
            ],
            onSubmit: (values: any) => submitDocuments(values, [{valueName: 'bill-of-lading', documentType: DocumentType.BILL_OF_LADING}])
        });

    useEffect(() => {
        setSteps([
            {
                status: OrderStatus.CONTRACTING,
                title: 'Contract stipulation',
                icon: <EditOutlined />,
                content: <GenericForm elements={elementStatus.get(OrderStatus.CONTRACTING)!.elements} submittable={true} onSubmit={elementStatus.get(OrderStatus.CONTRACTING)!.onSubmit}/>
            },
            {
                status: OrderStatus.PRODUCTION,
                title: 'Coffee Production',
                icon: <ProductOutlined />,
                content: <GenericForm elements={elementStatus.get(OrderStatus.PRODUCTION)!.elements} submittable={true} onSubmit={elementStatus.get(OrderStatus.PRODUCTION)!.onSubmit}/>
            },
            {
                status: OrderStatus.PAYED,
                title: 'Coffee Export',
                icon: <SendOutlined />,
                content: <GenericForm elements={elementStatus.get(OrderStatus.PAYED)!.elements} submittable={true} onSubmit={elementStatus.get(OrderStatus.PAYED)!.onSubmit}/>
            },
            {
                status: OrderStatus.EXPORTED,
                title: 'Coffee Shipment',
                icon: <TruckOutlined />,
                content: <GenericForm elements={elementStatus.get(OrderStatus.EXPORTED)!.elements} submittable={true} onSubmit={elementStatus.get(OrderStatus.EXPORTED)!.onSubmit}/>
            },
            {
                status: OrderStatus.SHIPPED,
                title: 'Coffee Import',
                icon: <ImportOutlined />,
                content: <GenericForm elements={[]} submittable={true}/>
            }
        ])
    }, []);


    return (
        <>
            <Divider>Order status</Divider>
            <Steps
                type="navigation"
                current={orderStatus}
                onChange={onChange}
                className="order-status"
                items={steps.map(item => ({title: item.title, icon: item.icon}))}
            />
        </>
    )
}
