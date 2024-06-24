import {
    Button,
    Divider,
    Form,
    FormProps,
    Input,
    List,
    Popover,
    Space,
    Steps,
    Typography
} from 'antd';
import {
    CalendarFilled,
    EditOutlined,
    ImportOutlined,
    ProductOutlined,
    SendOutlined,
    MailOutlined,
    TruckOutlined
} from '@ant-design/icons';
import React, { ReactNode, useContext, useMemo } from 'react';
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
import { useDispatch, useSelector } from 'react-redux';
import { DetailedTradePresentable, OrderTradePresentable } from '@/api/types/TradePresentable';
import { useNavigate } from 'react-router-dom';
import { SignerContext } from '@/providers/SignerProvider';
import TradeDutiesWaiting, { DutiesWaiting } from '@/pages/Trade/TradeDutiesWaiting';
import { EthContext } from '@/providers/EthProvider';
import { paths, requestPath } from '@/constants/paths';
import { notificationDuration } from '@/constants/notification';
import {
    differenceInDaysFromToday,
    fromTimestampToDate,
    showTextWithHtmlLinebreaks
} from '@/utils/utils';
import { ICPContext } from '@/providers/ICPProvider';
import { RootState } from '@/redux/store';

type Props = {
    status: OrderStatus;
    submittable: boolean;
    negotiationElements: FormElement[];
    orderInfo?: OrderTradePresentable;
    validationCallback: (
        tradeInfo: DetailedTradePresentable | undefined,
        documentType: DocumentType
    ) => undefined | { approve: () => Promise<void>; reject: () => Promise<void> };
    onSubmitView: (values: any) => Promise<void>;
    onSubmitNew: (values: any) => Promise<void>;
};

export default function OrderForm(props: Props) {
    const { status, submittable, negotiationElements, orderInfo } = props;
    let onSubmit: (values: any) => Promise<void>;
    const { getNameByDID } = useContext(ICPContext);
    const { signer } = useContext(SignerContext);
    const navigate = useNavigate();
    const { ethTradeService } = useContext(EthContext);
    const userInfo = useSelector((state: RootState) => state.userInfo);
    const dispatch = useDispatch();
    const [current, setCurrent] = React.useState<OrderStatus>(
        status === OrderStatus.COMPLETED ? OrderStatus.SHIPPED : status
    );
    const documentHeight = '45vh';
    const documentTypesLabel = new Map<DocumentType, string>()
        .set(DocumentType.PAYMENT_INVOICE, 'Payment Invoice')
        .set(DocumentType.ORIGIN_SWISS_DECODE, 'Swiss Decode')
        .set(DocumentType.WEIGHT_CERTIFICATE, 'Weight Certificate')
        .set(DocumentType.FUMIGATION_CERTIFICATE, 'Fumigation Certificate')
        .set(DocumentType.PREFERENTIAL_ENTRY_CERTIFICATE, 'Preferential Entry Certificate')
        .set(DocumentType.PHYTOSANITARY_CERTIFICATE, 'Phytosanitary Certificate')
        .set(DocumentType.INSURANCE_CERTIFICATE, 'Insurance Certificate')
        .set(DocumentType.BILL_OF_LADING, 'Bill Of Lading')
        .set(DocumentType.COMPARISON_SWISS_DECODE, 'Comparison Swiss Decode');

    const onChange = (value: number) => {
        if (value > status) return;
        setCurrent(value);
    };

    const submitDocuments = async (
        values: any,
        documents: { valueName: string; documentType: DocumentType }[]
    ): Promise<void> => {
        try {
            if (!orderInfo) return;
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
                        orderInfo.trade.tradeId,
                        TradeType.ORDER,
                        documentRequest,
                        orderInfo.trade.externalUrl
                    );
                })
            );
            openNotification(
                'Documents uploaded',
                <div>
                    Documents successfully uploaded:
                    <List
                        dataSource={documents
                            .filter((doc) => values[doc.valueName]?.name)
                            .map((doc) => ({
                                title: documentTypesLabel.get(doc.documentType),
                                description: values[doc.valueName].name
                            }))}
                        renderItem={(item) => (
                            <List.Item>
                                <List.Item.Meta title={item.title} description={item.description} />
                            </List.Item>
                        )}
                    />
                </div>,
                NotificationType.SUCCESS,
                notificationDuration + 2
            );
            navigate(paths.TRADES);
        } catch (e: any) {
            console.log('error: ', e);
            openNotification('Error', e.message, NotificationType.ERROR, notificationDuration);
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

    const deadlineExpiredEmailSend: FormProps['onFinish'] = async (values) => {
        try {
            const recipientCompanyName =
                orderInfo?.trade.supplier === signer?.address
                    ? await getNameByDID(`${DID_METHOD}:${orderInfo?.trade.commissioner}`)
                    : await getNameByDID(`${DID_METHOD}:${orderInfo?.trade.supplier}`);
            const response = await fetch(`${requestPath.EMAIL_SENDER_URL}/email/deadline-expired`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: values['emailAddress'],
                    recipientCompanyName,
                    senderCompanyName: userInfo.legalName,
                    senderEmailAddress: userInfo.email,
                    message: values['message'],
                    transactionUrl: window.location.href
                })
            });
            if (response.ok)
                openNotification(
                    'Success',
                    `Email sent successfully to ${recipientCompanyName}`,
                    NotificationType.SUCCESS
                );
        } catch (e: any) {
            openNotification('Error', e.message, NotificationType.ERROR, notificationDuration);
        } finally {
            dispatch(hideLoading());
            navigate(paths.TRADES);
        }
    };

    const stepLabelTip = (message: string, deadline: number, status: OrderStatus): ReactNode => {
        return (
            <div style={{ padding: '0.5rem' }}>
                <div>{showTextWithHtmlLinebreaks(message)}</div>
                <Space align="center" style={{ width: '100%' }}>
                    <Typography.Text strong style={{ fontSize: 'x-large' }}>
                        Deadline:{' '}
                    </Typography.Text>
                    <CalendarFilled style={{ fontSize: 'large' }} />
                    <Typography.Text style={{ fontSize: 'large' }}>
                        {fromTimestampToDate(deadline).toLocaleDateString()}
                    </Typography.Text>
                    {orderInfo?.status === status ? (
                        differenceInDaysFromToday(deadline) > 0 ? (
                            <Typography.Text style={{ fontSize: 'medium', color: 'orange' }}>
                                {`--> Left ${differenceInDaysFromToday(deadline)} days`}
                            </Typography.Text>
                        ) : (
                            <Typography.Text style={{ fontSize: 'medium', color: 'red' }}>
                                --{'> '}
                                <Popover
                                    title="Please contact the other party"
                                    trigger="click"
                                    placement="right"
                                    content={
                                        <Form
                                            labelCol={{ span: 10 }}
                                            wrapperCol={{ span: 14 }}
                                            style={{ padding: 20 }}
                                            onFinish={deadlineExpiredEmailSend}>
                                            <Form.Item
                                                name="emailAddress"
                                                label="E-mail address"
                                                rules={[
                                                    {
                                                        type: 'email',
                                                        message:
                                                            'The input is not valid E-mail address.'
                                                    },
                                                    {
                                                        required: true,
                                                        message: 'Please input the E-mail address.'
                                                    }
                                                ]}>
                                                <Input />
                                            </Form.Item>
                                            <Form.Item
                                                name="message"
                                                label="Message"
                                                rules={[
                                                    {
                                                        required: true,
                                                        message:
                                                            'Please input a message for the company.',
                                                        whitespace: true
                                                    }
                                                ]}>
                                                <Input.TextArea />
                                            </Form.Item>
                                            <Form.Item wrapperCol={{ span: 24 }}>
                                                <Button
                                                    type="primary"
                                                    htmlType="submit"
                                                    style={{ width: '100%' }}>
                                                    <MailOutlined style={{ fontSize: 'large' }} />{' '}
                                                    Send
                                                </Button>
                                            </Form.Item>
                                        </Form>
                                    }>
                                    <Button type="dashed" danger ghost>
                                        <span style={{ fontSize: 'large' }}>EXPIRED</span>
                                    </Button>
                                </Popover>
                            </Typography.Text>
                        )
                    ) : (
                        <Typography.Text style={{ fontSize: 'medium', color: 'green' }}>
                            --{'>'} Uploaded on time
                        </Typography.Text>
                    )}
                </Space>
            </div>
        );
    };

    const steps = useMemo(() => {
        let elementsAfterNegotiation:
            | Map<
                  OrderStatus,
                  { elements: FormElement[]; onSubmit: (values: any) => Promise<void> }
              >
            | undefined;
        if (orderInfo) {
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
                            label: stepLabelTip(
                                'At this stage, the exporter has to load a payment invoice for the goods that have been negotiated. \nThis operation allows coffee production to be started and planned only against a guarantee deposit from the importer',
                                orderInfo.trade.paymentDeadline,
                                OrderStatus.PRODUCTION
                            ),
                            marginVertical: '1rem'
                        },
                        {
                            type: FormElementType.DOCUMENT,
                            span: 12,
                            name: 'payment-invoice',
                            label: documentTypesLabel.get(DocumentType.PAYMENT_INVOICE)!,
                            required: true,
                            loading: false,
                            uploadable: isDocumentUploadable(
                                orderInfo.trade.supplier,
                                orderInfo,
                                DocumentType.PAYMENT_INVOICE
                            ),
                            info: orderInfo.documents.get(DocumentType.PAYMENT_INVOICE),
                            height: documentHeight,
                            validationCallback: props.validationCallback(
                                orderInfo,
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
                            label: stepLabelTip(
                                'This is the export phase, the exporter has to load the following documents to proceed with the export, in order to prove the quality of the goods and the intrinsic characteristics of the coffee.',
                                orderInfo.trade.documentDeliveryDeadline,
                                OrderStatus.PAYED
                            ),
                            marginVertical: '1rem'
                        },
                        {
                            type: FormElementType.DOCUMENT,
                            span: 12,
                            name: 'swiss-decode',
                            label: documentTypesLabel.get(DocumentType.ORIGIN_SWISS_DECODE)!,
                            required: true,
                            loading: false,
                            uploadable: isDocumentUploadable(
                                orderInfo.trade.supplier,
                                orderInfo,
                                DocumentType.ORIGIN_SWISS_DECODE
                            ),
                            info: orderInfo.documents.get(DocumentType.ORIGIN_SWISS_DECODE),
                            height: documentHeight,
                            validationCallback: props.validationCallback(
                                orderInfo,
                                DocumentType.ORIGIN_SWISS_DECODE
                            )
                        },
                        {
                            type: FormElementType.DOCUMENT,
                            span: 12,
                            name: 'weight-certificate',
                            label: documentTypesLabel.get(DocumentType.WEIGHT_CERTIFICATE)!,
                            required: true,
                            loading: false,
                            uploadable: isDocumentUploadable(
                                orderInfo.trade.supplier,
                                orderInfo,
                                DocumentType.WEIGHT_CERTIFICATE
                            ),
                            info: orderInfo.documents.get(DocumentType.WEIGHT_CERTIFICATE),
                            height: documentHeight,
                            validationCallback: props.validationCallback(
                                orderInfo,
                                DocumentType.WEIGHT_CERTIFICATE
                            )
                        },
                        {
                            type: FormElementType.DOCUMENT,
                            span: 12,
                            name: 'fumigation-certificate',
                            label: documentTypesLabel.get(DocumentType.FUMIGATION_CERTIFICATE)!,
                            required: true,
                            loading: false,
                            uploadable: isDocumentUploadable(
                                orderInfo.trade.supplier,
                                orderInfo,
                                DocumentType.FUMIGATION_CERTIFICATE
                            ),
                            info: orderInfo.documents.get(DocumentType.FUMIGATION_CERTIFICATE),
                            height: documentHeight,
                            validationCallback: props.validationCallback(
                                orderInfo,
                                DocumentType.FUMIGATION_CERTIFICATE
                            )
                        },
                        {
                            type: FormElementType.DOCUMENT,
                            span: 12,
                            name: 'preferential-entry-certificate',
                            label: documentTypesLabel.get(
                                DocumentType.PREFERENTIAL_ENTRY_CERTIFICATE
                            )!,
                            required: true,
                            loading: false,
                            uploadable: isDocumentUploadable(
                                orderInfo.trade.supplier,
                                orderInfo,
                                DocumentType.PREFERENTIAL_ENTRY_CERTIFICATE
                            ),
                            info: orderInfo.documents.get(
                                DocumentType.PREFERENTIAL_ENTRY_CERTIFICATE
                            ),
                            height: documentHeight,
                            validationCallback: props.validationCallback(
                                orderInfo,
                                DocumentType.PREFERENTIAL_ENTRY_CERTIFICATE
                            )
                        },
                        {
                            type: FormElementType.DOCUMENT,
                            span: 12,
                            name: 'phytosanitary-certificate',
                            label: documentTypesLabel.get(DocumentType.PHYTOSANITARY_CERTIFICATE)!,
                            required: true,
                            loading: false,
                            uploadable: isDocumentUploadable(
                                orderInfo.trade.supplier,
                                orderInfo,
                                DocumentType.PHYTOSANITARY_CERTIFICATE
                            ),
                            info: orderInfo.documents.get(DocumentType.PHYTOSANITARY_CERTIFICATE),
                            height: documentHeight,
                            validationCallback: props.validationCallback(
                                orderInfo,
                                DocumentType.PHYTOSANITARY_CERTIFICATE
                            )
                        },
                        {
                            type: FormElementType.DOCUMENT,
                            span: 12,
                            name: 'insurance-certificate',
                            label: documentTypesLabel.get(DocumentType.INSURANCE_CERTIFICATE)!,
                            required: true,
                            loading: false,
                            uploadable: isDocumentUploadable(
                                orderInfo.trade.supplier,
                                orderInfo,
                                DocumentType.INSURANCE_CERTIFICATE
                            ),
                            info: orderInfo.documents.get(DocumentType.INSURANCE_CERTIFICATE),
                            height: documentHeight,
                            validationCallback: props.validationCallback(
                                orderInfo,
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
                            label: stepLabelTip(
                                'This is the last step for the exporter, in which is important to prove that the goods are ready to be shipped. \nThe exporter has to load the Bill of Lading to proceed with the shipment.',
                                orderInfo.trade.shippingDeadline,
                                OrderStatus.EXPORTED
                            ),
                            marginVertical: '1rem'
                        },
                        {
                            type: FormElementType.DOCUMENT,
                            span: 12,
                            name: 'bill-of-lading',
                            label: documentTypesLabel.get(DocumentType.BILL_OF_LADING)!,
                            required: true,
                            loading: false,
                            uploadable: isDocumentUploadable(
                                orderInfo.trade.supplier,
                                orderInfo,
                                DocumentType.BILL_OF_LADING
                            ),
                            info: orderInfo.documents.get(DocumentType.BILL_OF_LADING),
                            height: documentHeight,
                            validationCallback: props.validationCallback(
                                orderInfo,
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
                            label: stepLabelTip(
                                'This is the final stage for this transaction where is important to prove that the goods, reached by the importer, have exactly the same specifications that are claimed by the exporter. \nThe importer has to load the results of the Swiss Decode.',
                                orderInfo.trade.deliveryDeadline,
                                OrderStatus.SHIPPED
                            ),
                            marginVertical: '1rem'
                        },
                        {
                            type: FormElementType.DOCUMENT,
                            span: 12,
                            name: 'comparison-swiss-decode',
                            label: documentTypesLabel.get(DocumentType.COMPARISON_SWISS_DECODE)!,
                            required: true,
                            loading: false,
                            uploadable: isDocumentUploadable(
                                orderInfo.trade.commissioner,
                                orderInfo,
                                DocumentType.COMPARISON_SWISS_DECODE
                            ),
                            info: orderInfo.documents.get(DocumentType.COMPARISON_SWISS_DECODE),
                            height: documentHeight,
                            validationCallback: props.validationCallback(
                                orderInfo,
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
            const trade = orderInfo?.trade,
                documents = orderInfo?.documents;
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
            const trade = orderInfo?.trade,
                documents = orderInfo?.documents;
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
