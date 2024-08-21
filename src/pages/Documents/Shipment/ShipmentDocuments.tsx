import { CardPage } from '@/components/structure/CardPage/CardPage';
import { FormElement, FormElementType, GenericForm } from '@/components/GenericForm/GenericForm';
import { useEthRawTrade } from '@/providers/entities/EthRawTradeProvider';
import { DetailedOrderTrade, useEthOrderTrade } from '@/providers/entities/EthOrderTradeProvider';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Empty, Flex, Tag } from 'antd';
import { useICPName } from '@/providers/entities/ICPNameProvider';
import {
    DetailedShipment,
    ShipmentDocumentRules,
    useEthShipment
} from '@/providers/entities/EthShipmentProvider';
import {
    OrderLine,
    OrderTrade,
    ShipmentDocumentType,
    ShipmentPhase
} from '@kbc-lib/coffee-trading-management-lib';
import DocumentUpload from '@/pages/Documents/DocumentUpload';
import { ConfirmButton } from '@/components/ConfirmButton/ConfirmButton';
import { useNavigate } from 'react-router-dom';
import { setParametersPath } from '@/utils/page';
import { paths } from '@/constants/paths';
import { credentials } from '@/constants/ssi';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { addLoadingMessage, removeLoadingMessage } from '@/redux/reducers/loadingSlice';
import { ORDER_TRADE_MESSAGE } from '@/constants/message';
import { NotificationType, openNotification } from '@/utils/notification';
import { NOTIFICATION_DURATION } from '@/constants/notification';

type SelectedOrder = {
    detailedOrder: DetailedOrderTrade;
    detailedShipment: DetailedShipment | null;
};

export default () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { rawTrades } = useEthRawTrade();
    const userInfo = useSelector((state: RootState) => state.userInfo);
    const isExporter = userInfo.companyClaims.role.toUpperCase() === credentials.ROLE_EXPORTER;
    const { getName } = useICPName();
    const [orders, setOrders] = useState<DetailedOrderTrade[]>([]);
    const { detailedOrderTrade, getDetailedTradesAsync } = useEthOrderTrade();
    const { detailedShipment, addDocument } = useEthShipment();

    const tradeSelected: SelectedOrder | undefined = useMemo(() => {
        if (!detailedOrderTrade) return undefined;
        console.log('detailedOrderTrade: ', detailedOrderTrade);
        return {
            detailedOrder: detailedOrderTrade,
            detailedShipment
        };
    }, [detailedOrderTrade, detailedShipment]);

    const shipmentPhaseDocumentTypes: ShipmentDocumentType[][] = useMemo(
        () =>
            tradeSelected?.detailedShipment
                ? [
                      [],
                      tradeSelected.detailedShipment.shipment
                          .landTransportationRequiredDocumentsTypes,
                      tradeSelected.detailedShipment.shipment
                          .seaTransportationRequiredDocumentsTypes
                  ].map((types) =>
                      types.filter(
                          (type) => ShipmentDocumentRules[type].isExporterUploader === isExporter
                      )
                  )
                : [],
        [tradeSelected?.detailedShipment]
    );

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

    const handleChange = async (value: number) => {
        const detailedOrder = orders[value];
        console.log('detailedOrder: ', detailedOrder);
        console.log('value: ', value);
        navigate(
            setParametersPath(paths.ORDER_DOCUMENTS, {
                id: detailedOrder.trade.tradeId.toString()
            })
        );
    };

    const computeCounterpart = (trade: OrderTrade) => {
        return isExporter ? getName(trade.commissioner) : getName(trade.supplier);
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

    useEffect(() => {
        console.log('tradeSelected: ', tradeSelected?.detailedOrder.trade.tradeId);
        console.log(
            'orders: ',
            orders.map((orderDetail, index) => ({
                value: index,
                label: orderDetail.trade.tradeId,
                counterpart: computeCounterpart(orderDetail.trade)
            }))
        );
    }, [tradeSelected?.detailedOrder.trade.tradeId]);

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
                title: 'Order',
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
                    </Flex>
                ) : (
                    <Empty></Empty>
                )
            },
            {
                type: FormElementType.CARD,
                span: 24,
                name: 'shipmentSelected',
                title: 'Shipment',
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
                                    {ShipmentPhase[tradeSelected.detailedShipment.phase]}
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
                                {`${tradeSelected.detailedShipment.shipment.weight} kg`}
                            </div>
                            <div>
                                <span style={{ fontWeight: 'bold' }}>Price: </span>
                                {`${tradeSelected.detailedShipment.shipment.price} ${(tradeSelected.detailedOrder.trade.lines[0] as OrderLine).price.fiat}`}
                            </div>
                        </Flex>
                        {tradeSelected.detailedShipment.phase === ShipmentPhase.APPROVAL ? (
                            <Alert
                                style={{ textAlign: 'center' }}
                                message={
                                    <span>
                                        Shipment must be approved before uploading documents. <br />
                                        Click{' '}
                                        <ConfirmButton
                                            style={{ padding: 0 }}
                                            type="link"
                                            text="here"
                                            confirmText="Go to 'Shipment' section in order to approve the shipment, proceed?"
                                            disabled={isExporter}
                                            onConfirm={() =>
                                                navigate(
                                                    setParametersPath(
                                                        `${paths.TRADE_VIEW}?type=1`,
                                                        {
                                                            id: tradeSelected!.detailedOrder.trade.tradeId.toString()
                                                        }
                                                    )
                                                )
                                            }
                                        />
                                    </span>
                                }
                                type={'warning'}
                            />
                        ) : (
                            <DocumentUpload
                                documentTypes={
                                    shipmentPhaseDocumentTypes[tradeSelected.detailedShipment.phase]
                                }
                                onSubmit={documentSubmit}
                                oldDocumentsInfo={tradeSelected.detailedShipment.documents}
                            />
                        )}
                    </Flex>
                ) : (
                    <Alert
                        style={{ textAlign: 'center' }}
                        message={
                            <span>
                                No shipment available for this order, please add one to proceed.{' '}
                                <br />
                                Click{' '}
                                <ConfirmButton
                                    style={{ padding: 0 }}
                                    type="link"
                                    text="here"
                                    confirmText="Go to 'Shipment' section in order to add new shipment, proceed?"
                                    disabled={!isExporter}
                                    onConfirm={() =>
                                        navigate(
                                            setParametersPath(`${paths.TRADE_VIEW}?type=1`, {
                                                id: tradeSelected!.detailedOrder.trade.tradeId.toString()
                                            })
                                        )
                                    }
                                />
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
