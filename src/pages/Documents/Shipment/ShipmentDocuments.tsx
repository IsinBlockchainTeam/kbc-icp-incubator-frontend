import { CardPage } from '@/components/structure/CardPage/CardPage';
import { FormElement, FormElementType, GenericForm } from '@/components/GenericForm/GenericForm';
import { useEthRawTrade } from '@/providers/entities/EthRawTradeProvider';
import { DetailedOrderTrade, useEthOrderTrade } from '@/providers/entities/EthOrderTradeProvider';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Empty, Flex, Tag } from 'antd';
import { useICPOrganization } from '@/providers/entities/ICPOrganizationProvider';
import {
    OrderLine,
    OrderTrade,
    Shipment,
    EvaluationStatus,
    ShipmentDocumentType,
    ShipmentPhaseDocument
} from '@kbc-lib/coffee-trading-management-lib';
import DocumentUpload from '@/pages/Documents/DocumentUpload';
import { ConfirmButton } from '@/components/ConfirmButton/ConfirmButton';
import { useLocation, useNavigate } from 'react-router-dom';
import { setParametersPath } from '@/utils/page';
import { paths } from '@/constants/paths';
import { credentials } from '@/constants/ssi';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { addLoadingMessage, removeLoadingMessage } from '@/redux/reducers/loadingSlice';
import { ORDER_TRADE_MESSAGE } from '@/constants/message';
import { NotificationType, openNotification } from '@/utils/notification';
import { NOTIFICATION_DURATION } from '@/constants/notification';
import { ShipmentPhaseDisplayName } from '@/constants/shipmentPhase';
import { DetailedShipment, useShipment } from '@/providers/icp/ShipmentProvider';

type SelectedOrder = {
    detailedOrder: DetailedOrderTrade;
    detailedShipment: DetailedShipment | null;
};

export default () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { rawTrades } = useEthRawTrade();
    const userInfo = useSelector((state: RootState) => state.userInfo);
    const isExporter = userInfo.companyClaims.role.toUpperCase() === credentials.ROLE_EXPORTER;
    const { getCompany } = useICPOrganization();
    const [orders, setOrders] = useState<DetailedOrderTrade[]>([]);
    const { detailedOrderTrade, getDetailedTradesAsync } = useEthOrderTrade();
    const { detailedShipment, addDocument } = useShipment();
    const selectedDocumentType: ShipmentDocumentType | undefined =
        location.state?.selectedDocumentType;

    const tradeSelected: SelectedOrder | undefined = useMemo(() => {
        if (!detailedOrderTrade) return undefined;
        return {
            detailedOrder: detailedOrderTrade,
            detailedShipment
        };
    }, [detailedOrderTrade, detailedShipment]);

    const loadData = async () => {
        try {
            dispatch(addLoadingMessage(ORDER_TRADE_MESSAGE.RETRIEVE_MANY.LOADING));
            setOrders(
                (await getDetailedTradesAsync()).sort((a, b) => a.trade.tradeId - b.trade.tradeId)
            );
        } catch (e) {
            openNotification(
                'Error',
                ORDER_TRADE_MESSAGE.RETRIEVE_MANY.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(ORDER_TRADE_MESSAGE.RETRIEVE_MANY.LOADING));
        }
    };

    const handleChange = (value: number) => {
        const detailedOrder = orders[value];
        navigate(
            setParametersPath(paths.ORDER_DOCUMENTS, {
                id: detailedOrder.trade.tradeId.toString()
            })
        );
    };

    const computeCounterpart = (trade: OrderTrade) => {
        return isExporter
            ? getCompany(trade.commissioner).legalName
            : getCompany(trade.supplier).legalName;
    };

    const documentSubmit = async (
        documentType: ShipmentDocumentType,
        documentReferenceId: string,
        filename: string,
        fileContent: Blob
    ) => {
        await addDocument(documentType, documentReferenceId, filename, fileContent);
        navigate(paths.DOCUMENTS);
    };

    const approvedDocumentTypes: ShipmentDocumentType[] = [];
    const allPhasesDocuments: ShipmentPhaseDocument[] = [];
    detailedShipment?.shipment.documents.forEach((value) => {
        const documentInfo = value[0];
        if (documentInfo.evaluationStatus === EvaluationStatus.APPROVED)
            approvedDocumentTypes.push(documentInfo.documentType);
    });
    detailedShipment?.phaseDocuments?.forEach((value) => {
        value.forEach((doc) => {
            if (!approvedDocumentTypes.includes(doc.documentType)) allPhasesDocuments.push(doc);
        });
    });

    const elements: FormElement[] = useMemo(
        () => [
            {
                type: FormElementType.SELECT,
                span: 12,
                name: 'orders',
                label: 'Orders',
                required: false,
                defaultValue: tradeSelected
                    ? tradeSelected.detailedOrder.trade.tradeId.toString()
                    : undefined,
                options: orders.map((orderDetail, index) => ({
                    value: index,
                    label: orderDetail.trade.tradeId,
                    counterpart: computeCounterpart(orderDetail.trade)
                })),
                optionRender: ({ data }) => (
                    <Flex vertical>
                        <div>
                            <span style={{ fontWeight: 'bold' }}>ID: </span>
                            {data.label}
                        </div>
                        <div>
                            <span style={{ fontWeight: 'bold' }}>Counterpart: </span>
                            {data.counterpart}
                        </div>
                        {/*TODO: add eventually also issue date, after being added to the trade*/}
                    </Flex>
                ),
                onChange: handleChange,
                search: {
                    showIcon: true,
                    filterOption: (input: string, option: any) =>
                        option.label.toString().includes(input) ||
                        option.counterpart.toLowerCase().includes(input.toLowerCase())
                }
            },
            {
                type: FormElementType.CARD,
                span: 12,
                name: 'orderSelected',
                title: 'Order Details',
                hidden: tradeSelected === undefined,
                content: tradeSelected ? (
                    <Flex vertical>
                        <div>
                            <span style={{ fontWeight: 'bold' }}>Counterpart: </span>
                            {computeCounterpart(tradeSelected.detailedOrder.trade)}
                        </div>
                        <div>
                            <span style={{ fontWeight: 'bold' }}>Issue Date: </span>
                            {/*TODO: add issue date to order entity*/}
                            {new Date(
                                tradeSelected.detailedOrder.trade.deliveryDeadline * 1000
                            ).toLocaleDateString()}
                        </div>
                        <ConfirmButton
                            style={{ padding: 0, marginTop: 10, textAlign: 'left' }}
                            type="link"
                            text="Go to Order page"
                            confirmText="Do you want to go to the order page?"
                            onConfirm={() =>
                                navigate(
                                    setParametersPath(`${paths.TRADE_VIEW}?type=1`, {
                                        id: tradeSelected!.detailedOrder.trade.tradeId.toString()
                                    })
                                )
                            }
                        />
                    </Flex>
                ) : (
                    <Empty></Empty>
                )
            },
            {
                type: FormElementType.CARD,
                span: 24,
                name: 'shipmentSelected',
                title: 'Shipment Details',
                hidden: tradeSelected === undefined,
                content: tradeSelected?.detailedShipment ? (
                    <Flex vertical>
                        <Flex justify="space-between">
                            <div>
                                <span style={{ fontWeight: 'bold' }}>ID: </span>
                                #GeneratedID (in commercial invoice)
                            </div>
                            <div>
                                <span style={{ fontWeight: 'bold' }}>Status: </span>
                                <Tag color="geekblue" style={{ margin: 0 }}>
                                    {ShipmentPhaseDisplayName[tradeSelected.detailedShipment.phase]}
                                </Tag>
                            </div>
                        </Flex>
                        <Flex justify="space-between" style={{ marginBottom: '1rem' }}>
                            <div>
                                <span style={{ fontWeight: 'bold' }}>Quantity: </span>
                                {`${tradeSelected.detailedShipment.shipment.quantity} ${tradeSelected.detailedOrder.trade.lines[0].unit}`}
                            </div>
                            <div>
                                <span style={{ fontWeight: 'bold' }}>Weight: </span>
                                {`${tradeSelected.detailedShipment.shipment.grossWeight} kg`}
                            </div>
                            <div>
                                <span style={{ fontWeight: 'bold' }}>Price: </span>
                                {`${tradeSelected.detailedShipment.shipment.price} ${(tradeSelected.detailedOrder.trade.lines[0] as OrderLine).price.fiat}`}
                            </div>
                        </Flex>
                        <DocumentUpload
                            documentTypes={allPhasesDocuments.map((s) => s.documentType)}
                            onSubmit={documentSubmit}
                            oldDocumentsInfo={
                                tradeSelected?.detailedShipment
                                    ? Array.from(
                                          tradeSelected.detailedShipment.shipment.documents.values()
                                      ).flat()
                                    : []
                            }
                            selectedDocumentType={selectedDocumentType}
                        />
                    </Flex>
                ) : (
                    <Alert
                        style={{ textAlign: 'center' }}
                        message={
                            <span>
                                No shipment available for this order, please continue with order
                                negotiation.
                            </span>
                        }
                        type={'warning'}
                    />
                )
            }
        ],
        [orders, tradeSelected]
    );

    useEffect(() => {
        if (rawTrades.length) loadData();
    }, [rawTrades]);

    return (
        <CardPage title="Shipment Documents">
            <GenericForm
                elements={elements}
                confirmText="This will upload the document for the order selected, proceed?"
                submittable={false}
            />
        </CardPage>
    );
};
