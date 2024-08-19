import { CardPage } from '@/components/structure/CardPage/CardPage';
import { FormElement, FormElementType, GenericForm } from '@/components/GenericForm/GenericForm';
import { useEthRawTrade } from '@/providers/entities/EthRawTradeProvider';
import { DetailedOrderTrade, useEthOrderTrade } from '@/providers/entities/EthOrderTradeProvider';
import { useEffect, useMemo, useState } from 'react';
import { Divider, Empty, Flex } from 'antd';
import { useSigner } from '@/providers/SignerProvider';
import { useICPName } from '@/providers/entities/ICPNameProvider';
import { useEthShipment } from '@/providers/entities/EthShipmentProvider';
import {
    OrderLine,
    OrderTrade,
    Shipment,
    ShipmentDocumentType,
    ShipmentPhase
} from '@kbc-lib/coffee-trading-management-lib';
import ShipmentDocumentUpload from '@/pages/Trade/ShipmentDocuments/ShipmentDocumentUpload';
import { ICPResourceSpec } from '@blockchain-lib/common';

export default () => {
    const { rawTrades } = useEthRawTrade();
    const { signer } = useSigner();
    const { getName } = useICPName();
    const [ordersWithShipment, setOrdersWithShipment] = useState<DetailedOrderTrade[]>([]);
    const [tradeSelected, setTradeSelected] = useState<{
        detailedOrder: DetailedOrderTrade;
        detailedShipment: { value: Shipment; phase: ShipmentPhase };
    }>();
    const [detailedOrderTrade, setDetailedOrderTrade] = useState<DetailedOrderTrade>();
    const { getDetailedTradesAsync } = useEthOrderTrade();
    const { getShipmentService } = useEthShipment();

    // const shipmentPhaseDocumentTypes: ShipmentDocumentType[][] = useMemo(
    //     () =>
    //         tradeSelected?.detailedShipment
    //             ? [
    //                   [],
    //                   tradeSelected.detailedShipment.value.landTransportationRequiredDocumentsTypes,
    //                   tradeSelected.detailedShipment.value.seaTransportationRequiredDocumentsTypes
    //               ]
    //             : [],
    //     [tradeSelected?.detailedShipment]
    // );
    const detailedShipment = useMemo(
        () => {
            if (!detailedOrderTrade) return [];
            const shipmentService = getShipmentService(detailedOrderTrade.shipmentAddress!);
            const shipment =
            const shipmentPhaseDocumentTypes: ShipmentDocumentType[][] = [
                [],
                tradeSelected.detailedShipment.value.landTransportationRequiredDocumentsTypes,
                tradeSelected.detailedShipment.value.seaTransportationRequiredDocumentsTypes
            ];
            if (!detailedOrderTrade) return [];
            const shipmentPhase = shipmentService.getPhase();
            const documentsInfo = ShipmentDocumentType[shipmentPhase];
            return [
                [],
                documentsInfo.landTransportationRequiredDocumentsTypes,
                documentsInfo.seaTransportationRequiredDocumentsTypes
            ];
        },
        [detailedOrderTrade]
    );

    const loadData = async () => {
        const detailedOrders = await getDetailedTradesAsync();
        setOrdersWithShipment(
            detailedOrders.filter(({ shipmentAddress }) => shipmentAddress !== undefined)
        );
    };

    const handleChange = async (value: number) => {
        const detailedOrder = ordersWithShipment[value];
        const shipmentService = getShipmentService(detailedOrder.shipmentAddress!);
        const shipmentPhase = await shipmentService.getPhase();
        const documentsInfo = await Promise.all(Object.values(ShipmentDocumentType)
            .filter((value): value is ShipmentDocumentType => typeof value === 'number')
            .map(async (documentType) => {
                const documentId = (await shipmentService.getDocumentsIdsByType(documentType))[0];
                return shipmentService.getDocumentInfo(documentId);
            }
        ));
        setTradeSelected({
            detailedOrder: detailedOrder,
            detailedShipment: {
                value: await shipmentService.getShipment(),
                phase: await shipmentService.getPhase(),
                documentsInfo
            }
        });
    };

    const computeCounterpart = (trade: OrderTrade) => {
        return signer._address === trade.supplier
            ? getName(trade.commissioner)
            : getName(trade.supplier);
    };

    const documentSubmit = async (
        documentType: ShipmentDocumentType,
        documentReferenceId: string,
        filename: string,
        fileContent: Blob
    ) => {
        const shipmentService = getShipmentService(tradeSelected!.detailedOrder.shipmentAddress!);
        const resourceSpec: ICPResourceSpec = {
            name: filename,
            type: fileContent.type
        };
        await shipmentService.addDocument(
            documentType,
            documentReferenceId,
            new Uint8Array(await new Response(fileContent).arrayBuffer()),
            resourceSpec
        );
    };

    const elements: FormElement[] = useMemo(
        () => [
            {
                type: FormElementType.SELECT,
                span: 12,
                name: 'orders',
                label: 'Orders',
                required: false,
                defaultValue: tradeSelected ? tradeSelected.detailedOrder.trade.tradeId : undefined,
                options: ordersWithShipment.map((orderDetail, index) => ({
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
                        <Divider style={{ margin: '10px' }} />
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
                    <></>
                )
            },
            {
                type: FormElementType.CARD,
                span: 24,
                name: 'shipmentSelected',
                title: 'Shipment',
                hidden: tradeSelected === undefined,
                content: tradeSelected ? (
                    <Flex vertical>
                        <Flex justify="space-between">
                            <div>
                                <span style={{ fontWeight: 'bold' }}>ID: </span>
                                #GeneratedID (in commercial invoice)
                            </div>
                            <div>
                                <span style={{ fontWeight: 'bold' }}>Status: </span>
                                {ShipmentPhase[tradeSelected.detailedShipment.phase]}
                            </div>
                        </Flex>
                        <Flex justify="space-between" style={{ marginBottom: '1rem' }}>
                            <div>
                                <span style={{ fontWeight: 'bold' }}>Quantity: </span>
                                {`${tradeSelected.detailedShipment.value.quantity} ${tradeSelected.detailedOrder.trade.lines[0].unit}`}
                            </div>
                            <div>
                                <span style={{ fontWeight: 'bold' }}>Weight: </span>
                                {`${tradeSelected.detailedShipment.value.weight} kg`}
                            </div>
                            <div>
                                <span style={{ fontWeight: 'bold' }}>Price: </span>
                                {`${tradeSelected.detailedShipment.value.price} ${(tradeSelected.detailedOrder.trade.lines[0] as OrderLine).price.fiat}`}
                            </div>
                        </Flex>
                        <ShipmentDocumentUpload
                            documentTypes={
                                shipmentPhaseDocumentTypes[tradeSelected.detailedShipment.phase]
                            }
                            onSubmit={documentSubmit}
                        />
                    </Flex>
                ) : (
                    <Empty></Empty>
                )
            }
        ],
        [ordersWithShipment, tradeSelected]
    );

    useEffect(() => {
        if (rawTrades.length) loadData();
    }, [rawTrades]);

    return (
        <CardPage title="Documents">
            <GenericForm
                elements={elements}
                confirmText="This will upload the document for the order selected, proceed?"
                submittable={false}
            />
        </CardPage>
    );
};
