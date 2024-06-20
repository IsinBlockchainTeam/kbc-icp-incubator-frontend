import { Divider, Steps } from 'antd';
import {
    EditOutlined,
    ImportOutlined,
    ProductOutlined,
    SendOutlined,
    TruckOutlined
} from '@ant-design/icons';
import React, { useContext, useMemo } from 'react';
import { FormElement, FormElementType, GenericForm } from '@/components/GenericForm/GenericForm';
import {
    DocumentStatus,
    DocumentType,
    OrderStatus,
    serial,
    TradeType
} from '@kbc-lib/coffee-trading-management-lib';
import { hideLoading, showLoading } from '@/redux/reducers/loadingSlice';
import { DocumentRequest } from '@/api/types/DocumentRequest';
import { NotificationType, openNotification } from '@/utils/notification';
import { useDispatch } from 'react-redux';
import { DetailedTradePresentable } from '@/api/types/TradePresentable';
import { useNavigate } from 'react-router-dom';
import { SignerContext } from '@/providers/SignerProvider';
import TradeDutiesWaiting, { DutiesWaiting } from '@/pages/Trade/TradeDutiesWaiting';
import { EthContext } from '@/providers/EthProvider';
import { paths } from '@/constants/paths';

type Props = {
    status: OrderStatus;
    submittable: boolean;
    negotiationElements: FormElement[];
    tradeInfo?: DetailedTradePresentable;
    validationCallback: (
        tradeInfo: DetailedTradePresentable | undefined,
        documentType: DocumentType
    ) => undefined | { approve: () => Promise<void>; reject: () => Promise<void> };
    onSubmitView: (values: any) => Promise<void>;
    onSubmitNew: (values: any) => Promise<void>;
};

export default function OrderForm(props: Props) {
    const { status, submittable, negotiationElements, tradeInfo } = props;
    const { signer } = useContext(SignerContext);
    const navigate = useNavigate();
    const { ethTradeService } = useContext(EthContext);
    const dispatch = useDispatch();
    const [current, setCurrent] = React.useState<OrderStatus>(
        status === OrderStatus.COMPLETED ? OrderStatus.SHIPPED : status
    );
    const documentHeight = '45vh';
    let onSubmit: (values: any) => Promise<void>;

    const onChange = (value: number) => {
        if (value > status) return;
        setCurrent(value);
    };

    const submitDocuments = async (
        values: any,
        documents: { valueName: string; documentType: DocumentType }[]
    ): Promise<void> => {
        try {
            if (!tradeInfo) return;
            dispatch(showLoading('Documents uploading...'));
            await serial(
                documents.map((doc) => async () => {
                    if (!values[doc.valueName] || !values[doc.valueName].name) return;
                    const documentRequest: DocumentRequest = {
                        content: values[doc.valueName],
                        filename: values[doc.valueName].name,
                        documentType: doc.documentType
                    };
                    await ethTradeService.addDocument(
                        tradeInfo.trade.tradeId,
                        TradeType.ORDER,
                        documentRequest,
                        tradeInfo.trade.externalUrl
                    );
                })
            );
            navigate(paths.TRADES);
        } catch (e: any) {
            console.log('error: ', e);
            openNotification('Error', e.message, NotificationType.ERROR);
        } finally {
            dispatch(hideLoading());
        }
    };

    const isDocumentUploadable = (
        designatedPartyAddress: string,
        tradeInfo: DetailedTradePresentable,
        documentType: DocumentType
    ): boolean => {
        return (
            signer?.address === designatedPartyAddress &&
            tradeInfo.documents.get(documentType)?.status !== DocumentStatus.APPROVED
        );
    };

    const steps = useMemo(() => {
        let elementsAfterNegotiation:
            | Map<
                  OrderStatus,
                  { elements: FormElement[]; onSubmit: (values: any) => Promise<void> }
              >
            | undefined;
        if (tradeInfo) {
            onSubmit = props.onSubmitView;

            elementsAfterNegotiation = new Map<
                OrderStatus,
                { elements: FormElement[]; onSubmit: (values: any) => Promise<void> }
            >()
                .set(OrderStatus.PRODUCTION, {
                    elements: [
                        {
                            type: FormElementType.TIP,
                            span: 24,
                            label: 'At this stage, the exporter has to load a payment invoice for the goods that have been negotiated. \n This operation allows coffee production to be started and planned only against a guarantee deposit from the importer',
                            marginVertical: '1rem'
                        },
                        {
                            type: FormElementType.DOCUMENT,
                            span: 12,
                            name: 'payment-invoice',
                            label: 'Payment Invoice',
                            required: true,
                            loading: false,
                            uploadable: isDocumentUploadable(
                                tradeInfo.trade.supplier,
                                tradeInfo,
                                DocumentType.PAYMENT_INVOICE
                            ),
                            info: tradeInfo.documents.get(DocumentType.PAYMENT_INVOICE),
                            height: documentHeight,
                            validationCallback: props.validationCallback(
                                tradeInfo,
                                DocumentType.PAYMENT_INVOICE
                            )
                        }
                    ],
                    onSubmit: (values: any) =>
                        submitDocuments(values, [
                            {
                                valueName: 'payment-invoice',
                                documentType: DocumentType.PAYMENT_INVOICE
                            }
                        ])
                })
                .set(OrderStatus.PAYED, {
                    elements: [
                        {
                            type: FormElementType.TIP,
                            span: 24,
                            label: 'This is the export phase, the exporter has to load the following documents to proceed with the export, \n in order to prove the quality of the goods and the intrinsic characteristics of the coffee.',
                            marginVertical: '1rem'
                        },
                        {
                            type: FormElementType.DOCUMENT,
                            span: 12,
                            name: 'swiss-decode',
                            label: 'Swiss Decode',
                            required: true,
                            loading: false,
                            uploadable: isDocumentUploadable(
                                tradeInfo.trade.supplier,
                                tradeInfo,
                                DocumentType.ORIGIN_SWISS_DECODE
                            ),
                            info: tradeInfo.documents.get(DocumentType.ORIGIN_SWISS_DECODE),
                            height: documentHeight,
                            validationCallback: props.validationCallback(
                                tradeInfo,
                                DocumentType.ORIGIN_SWISS_DECODE
                            )
                        },
                        {
                            type: FormElementType.DOCUMENT,
                            span: 12,
                            name: 'weight-certificate',
                            label: 'Weight Certificate',
                            required: true,
                            loading: false,
                            uploadable: isDocumentUploadable(
                                tradeInfo.trade.supplier,
                                tradeInfo,
                                DocumentType.WEIGHT_CERTIFICATE
                            ),
                            info: tradeInfo.documents.get(DocumentType.WEIGHT_CERTIFICATE),
                            height: documentHeight,
                            validationCallback: props.validationCallback(
                                tradeInfo,
                                DocumentType.WEIGHT_CERTIFICATE
                            )
                        },
                        {
                            type: FormElementType.DOCUMENT,
                            span: 12,
                            name: 'fumigation-certificate',
                            label: 'Fumigation Certificate',
                            required: true,
                            loading: false,
                            uploadable: isDocumentUploadable(
                                tradeInfo.trade.supplier,
                                tradeInfo,
                                DocumentType.FUMIGATION_CERTIFICATE
                            ),
                            info: tradeInfo.documents.get(DocumentType.FUMIGATION_CERTIFICATE),
                            height: documentHeight,
                            validationCallback: props.validationCallback(
                                tradeInfo,
                                DocumentType.FUMIGATION_CERTIFICATE
                            )
                        },
                        {
                            type: FormElementType.DOCUMENT,
                            span: 12,
                            name: 'preferential-entry-certificate',
                            label: 'Preferential Entry Certificate',
                            required: true,
                            loading: false,
                            uploadable: isDocumentUploadable(
                                tradeInfo.trade.supplier,
                                tradeInfo,
                                DocumentType.PREFERENTIAL_ENTRY_CERTIFICATE
                            ),
                            info: tradeInfo.documents.get(
                                DocumentType.PREFERENTIAL_ENTRY_CERTIFICATE
                            ),
                            height: documentHeight,
                            validationCallback: props.validationCallback(
                                tradeInfo,
                                DocumentType.PREFERENTIAL_ENTRY_CERTIFICATE
                            )
                        },
                        {
                            type: FormElementType.DOCUMENT,
                            span: 12,
                            name: 'phytosanitary-certificate',
                            label: 'Phytosanitary Certificate',
                            required: true,
                            loading: false,
                            uploadable: isDocumentUploadable(
                                tradeInfo.trade.supplier,
                                tradeInfo,
                                DocumentType.PHYTOSANITARY_CERTIFICATE
                            ),
                            info: tradeInfo.documents.get(DocumentType.PHYTOSANITARY_CERTIFICATE),
                            height: documentHeight,
                            validationCallback: props.validationCallback(
                                tradeInfo,
                                DocumentType.PHYTOSANITARY_CERTIFICATE
                            )
                        },
                        {
                            type: FormElementType.DOCUMENT,
                            span: 12,
                            name: 'insurance-certificate',
                            label: 'Insurance Certificate',
                            required: true,
                            loading: false,
                            uploadable: isDocumentUploadable(
                                tradeInfo.trade.supplier,
                                tradeInfo,
                                DocumentType.INSURANCE_CERTIFICATE
                            ),
                            info: tradeInfo.documents.get(DocumentType.INSURANCE_CERTIFICATE),
                            height: documentHeight,
                            validationCallback: props.validationCallback(
                                tradeInfo,
                                DocumentType.INSURANCE_CERTIFICATE
                            )
                        }
                    ],
                    onSubmit: (values: any) =>
                        submitDocuments(values, [
                            {
                                valueName: 'swiss-decode',
                                documentType: DocumentType.ORIGIN_SWISS_DECODE
                            },
                            {
                                valueName: 'weight-certificate',
                                documentType: DocumentType.WEIGHT_CERTIFICATE
                            },
                            {
                                valueName: 'fumigation-certificate',
                                documentType: DocumentType.FUMIGATION_CERTIFICATE
                            },
                            {
                                valueName: 'preferential-entry-certificate',
                                documentType: DocumentType.PREFERENTIAL_ENTRY_CERTIFICATE
                            },
                            {
                                valueName: 'phytosanitary-certificate',
                                documentType: DocumentType.PHYTOSANITARY_CERTIFICATE
                            },
                            {
                                valueName: 'insurance-certificate',
                                documentType: DocumentType.INSURANCE_CERTIFICATE
                            }
                        ])
                })
                .set(OrderStatus.EXPORTED, {
                    elements: [
                        {
                            type: FormElementType.TIP,
                            span: 24,
                            label: 'This is the last step for the exporter, in which is important to prove that the goods are ready to be shipped. \n The exporter has to load the Bill of Lading to proceed with the shipment.',
                            marginVertical: '1rem'
                        },
                        {
                            type: FormElementType.DOCUMENT,
                            span: 12,
                            name: 'bill-of-lading',
                            label: 'Bill Of Lading',
                            required: true,
                            loading: false,
                            uploadable: isDocumentUploadable(
                                tradeInfo.trade.supplier,
                                tradeInfo,
                                DocumentType.BILL_OF_LADING
                            ),
                            info: tradeInfo.documents.get(DocumentType.BILL_OF_LADING),
                            height: documentHeight,
                            validationCallback: props.validationCallback(
                                tradeInfo,
                                DocumentType.BILL_OF_LADING
                            )
                        }
                    ],
                    onSubmit: (values: any) =>
                        submitDocuments(values, [
                            {
                                valueName: 'bill-of-lading',
                                documentType: DocumentType.BILL_OF_LADING
                            }
                        ])
                })
                .set(OrderStatus.SHIPPED, {
                    elements: [
                        {
                            type: FormElementType.TIP,
                            span: 24,
                            label: 'This is the final stage for this transaction where is important to prove that the goods, reached by the importer, \n have exactly the same specifications that are claimed by the exporter. The importer has to load the results of the Swiss Decode.',
                            marginVertical: '1rem'
                        },
                        {
                            type: FormElementType.DOCUMENT,
                            span: 12,
                            name: 'comparison-swiss-decode',
                            label: 'Comparison Swiss Decode',
                            required: true,
                            loading: false,
                            uploadable: isDocumentUploadable(
                                tradeInfo.trade.commissioner,
                                tradeInfo,
                                DocumentType.COMPARISON_SWISS_DECODE
                            ),
                            info: tradeInfo.documents.get(DocumentType.COMPARISON_SWISS_DECODE),
                            height: documentHeight,
                            validationCallback: props.validationCallback(
                                tradeInfo,
                                DocumentType.COMPARISON_SWISS_DECODE
                            )
                        }
                    ],
                    onSubmit: (values: any) =>
                        submitDocuments(values, [
                            {
                                valueName: 'comparison-swiss-decode',
                                documentType: DocumentType.COMPARISON_SWISS_DECODE
                            }
                        ])
                });
        } else {
            onSubmit = props.onSubmitNew;
        }

        const hasStartingDuties = (
            orderStatus: OrderStatus,
            elements:
                | Map<
                      OrderStatus,
                      { elements: FormElement[]; onSubmit: (values: any) => Promise<void> }
                  >
                | undefined
        ): elements is Map<
            OrderStatus,
            { elements: FormElement[]; onSubmit: (values: any) => Promise<void> }
        > => {
            const trade = tradeInfo?.trade,
                documents = tradeInfo?.documents;
            if (!trade || !documents) return false;

            const hasDocuments = (
                designatedPartyAddress: string,
                documentTypes: DocumentType[]
            ): boolean =>
                documentTypes.some((docType) => documents.has(docType))
                    ? true
                    : signer?.address === designatedPartyAddress;

            switch (orderStatus) {
                case OrderStatus.PRODUCTION:
                    return hasDocuments(trade.supplier, [DocumentType.PAYMENT_INVOICE]);
                case OrderStatus.PAYED:
                    return hasDocuments(trade.supplier, [
                        DocumentType.ORIGIN_SWISS_DECODE,
                        DocumentType.WEIGHT_CERTIFICATE,
                        DocumentType.FUMIGATION_CERTIFICATE,
                        DocumentType.PREFERENTIAL_ENTRY_CERTIFICATE,
                        DocumentType.PHYTOSANITARY_CERTIFICATE,
                        DocumentType.INSURANCE_CERTIFICATE
                    ]);
                case OrderStatus.EXPORTED:
                    return hasDocuments(trade.supplier, [DocumentType.BILL_OF_LADING]);
                case OrderStatus.SHIPPED:
                    return hasDocuments(trade.commissioner, [DocumentType.COMPARISON_SWISS_DECODE]);
                default:
                    return true;
            }
        };

        const hasPendingDuties = (orderStatus: OrderStatus): boolean => {
            const trade = tradeInfo?.trade,
                documents = tradeInfo?.documents;
            if (!trade || !documents) return false;

            const checkDocumentStatuses = (
                designatedPartyAddress: string,
                docTypes: DocumentType[],
                statuses: DocumentStatus[]
            ): boolean =>
                signer?.address !== designatedPartyAddress
                    ? false
                    : docTypes.some((docType) =>
                          statuses.some((status) =>
                              documents.get(docType)
                                  ? documents.get(docType)!.status === status
                                  : true
                          )
                      );

            switch (orderStatus) {
                case OrderStatus.PRODUCTION:
                    return checkDocumentStatuses(
                        trade.supplier,
                        [DocumentType.PAYMENT_INVOICE],
                        [DocumentStatus.NOT_EVALUATED, DocumentStatus.NOT_APPROVED]
                    );
                case OrderStatus.PAYED:
                    return checkDocumentStatuses(
                        trade.supplier,
                        [
                            DocumentType.ORIGIN_SWISS_DECODE,
                            DocumentType.WEIGHT_CERTIFICATE,
                            DocumentType.FUMIGATION_CERTIFICATE,
                            DocumentType.PREFERENTIAL_ENTRY_CERTIFICATE,
                            DocumentType.PHYTOSANITARY_CERTIFICATE,
                            DocumentType.INSURANCE_CERTIFICATE
                        ],
                        [DocumentStatus.NOT_EVALUATED, DocumentStatus.NOT_APPROVED]
                    );
                case OrderStatus.EXPORTED:
                    return checkDocumentStatuses(
                        trade.supplier,
                        [DocumentType.BILL_OF_LADING],
                        [DocumentStatus.NOT_EVALUATED, DocumentStatus.NOT_APPROVED]
                    );
                case OrderStatus.SHIPPED:
                    return checkDocumentStatuses(
                        trade.commissioner,
                        [DocumentType.COMPARISON_SWISS_DECODE],
                        [DocumentStatus.NOT_EVALUATED, DocumentStatus.NOT_APPROVED]
                    );
                default:
                    return false;
            }
        };

        return [
            {
                title: 'Contract stipulation',
                icon: <EditOutlined />,
                content: (
                    <GenericForm
                        elements={negotiationElements}
                        submittable={submittable}
                        onSubmit={onSubmit}
                    />
                )
            },
            {
                title: 'Coffee Production',
                icon: <ProductOutlined />,
                content: hasStartingDuties(OrderStatus.PRODUCTION, elementsAfterNegotiation) ? (
                    <GenericForm
                        elements={elementsAfterNegotiation.get(OrderStatus.PRODUCTION)!.elements}
                        submittable={hasPendingDuties(OrderStatus.PRODUCTION)}
                        onSubmit={elementsAfterNegotiation.get(OrderStatus.PRODUCTION)!.onSubmit}
                    />
                ) : (
                    <TradeDutiesWaiting
                        waitingType={DutiesWaiting.EXPORTER_PRODUCTION}
                        message={
                            'The exporter has not uploaded the Payment Invoice yet. \n You will be notified when there are new developments.'
                        }
                        marginVertical="1rem"
                    />
                )
            },
            {
                title: 'Coffee Export',
                icon: <SendOutlined />,
                content: hasStartingDuties(OrderStatus.PAYED, elementsAfterNegotiation) ? (
                    <GenericForm
                        elements={elementsAfterNegotiation.get(OrderStatus.PAYED)!.elements}
                        submittable={hasPendingDuties(OrderStatus.PAYED)}
                        onSubmit={elementsAfterNegotiation.get(OrderStatus.PAYED)!.onSubmit}
                    />
                ) : (
                    <TradeDutiesWaiting
                        waitingType={DutiesWaiting.EXPORTER_EXPORT}
                        message={
                            'The exporter has not uploaded any of the documents yet. \n You will be notified when there are new developments.'
                        }
                        marginVertical="1rem"
                    />
                )
            },
            {
                title: 'Coffee Shipment',
                icon: <TruckOutlined />,
                content: hasStartingDuties(OrderStatus.EXPORTED, elementsAfterNegotiation) ? (
                    <GenericForm
                        elements={elementsAfterNegotiation.get(OrderStatus.EXPORTED)!.elements}
                        submittable={hasPendingDuties(OrderStatus.EXPORTED)}
                        onSubmit={elementsAfterNegotiation.get(OrderStatus.EXPORTED)!.onSubmit}
                    />
                ) : (
                    <TradeDutiesWaiting
                        waitingType={DutiesWaiting.EXPORTER_SHIPPING}
                        message={
                            'The exporter has not uploaded the Bill of Lading. \n You will be notified when there are new developments.'
                        }
                        marginVertical="1rem"
                    />
                )
            },
            {
                title: 'Coffee Import',
                icon: <ImportOutlined />,
                content: hasStartingDuties(OrderStatus.SHIPPED, elementsAfterNegotiation) ? (
                    <GenericForm
                        elements={elementsAfterNegotiation.get(OrderStatus.SHIPPED)!.elements}
                        submittable={hasPendingDuties(OrderStatus.SHIPPED)}
                        onSubmit={elementsAfterNegotiation.get(OrderStatus.SHIPPED)!.onSubmit}
                    />
                ) : (
                    <TradeDutiesWaiting
                        waitingType={DutiesWaiting.IMPORTER_IMPORT}
                        message={
                            'The importer has not uploaded the Swiss Decode results for comparison. \n You will be notified when there are new developments.'
                        }
                        marginVertical="1rem"
                    />
                )
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
                items={steps.map((item) => ({ title: item.title, icon: item.icon }))}
            />
            <React.Fragment>{steps[current].content}</React.Fragment>
        </>
    );
}
