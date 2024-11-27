import { CardPage } from '@/components/structure/CardPage/CardPage';
import { FormElement, FormElementType, GenericForm } from '@/components/GenericForm/GenericForm';
import React, { useMemo } from 'react';
import { Alert, Empty, Flex, Tag, Typography } from 'antd';
import { EvaluationStatus, DocumentType, ShipmentPhaseDocument, Order, OrderLine } from '@kbc-lib/coffee-trading-management-lib';
import DocumentUpload from '@/pages/Documents/DocumentUpload';
import { ConfirmButton } from '@/components/ConfirmButton/ConfirmButton';
import { useLocation, useNavigate } from 'react-router-dom';
import { setParametersPath } from '@/utils/page';
import { paths } from '@/constants/paths';
import { credentials } from '@/constants/ssi';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { ShipmentPhaseDisplayName } from '@/constants/shipmentPhase';
import { DetailedShipment, useShipment } from '@/providers/icp/ShipmentProvider';
import { useOrder } from '@/providers/icp/OrderProvider';
import { useOrganization } from '@/providers/icp/OrganizationProvider';

type SelectedOrder = {
    order: Order | null;
    detailedShipment: DetailedShipment | null;
};

export default () => {
    const navigate = useNavigate();
    const location = useLocation();
    const userInfo = useSelector((state: RootState) => state.userInfo);
    const isExporter = userInfo.companyClaims.role.toUpperCase() === credentials.ROLE_EXPORTER;
    const { getOrganization } = useOrganization();
    const { order, orders } = useOrder();
    const { detailedShipment, addDocument } = useShipment();
    const selectedDocumentType: DocumentType | undefined = location.state?.selectedDocumentType;

    const tradeSelected: SelectedOrder | undefined = useMemo(() => {
        if (!order) return undefined;
        return {
            order,
            detailedShipment
        };
    }, [order, detailedShipment]);

    const handleChange = (value: number) => {
        const detailedOrder = orders[value];
        navigate(
            setParametersPath(paths.ORDER_DOCUMENTS, {
                id: detailedOrder.id.toString()
            })
        );
    };

    const computeCounterpart = (trade: Order) => {
        return isExporter ? getOrganization(trade.commissioner).legalName : getOrganization(trade.supplier).legalName;
    };

    const documentSubmit = async (documentType: DocumentType, documentReferenceId: string, filename: string, fileContent: Blob) => {
        await addDocument(documentType, documentReferenceId, filename, fileContent);
        navigate(paths.DOCUMENTS);
    };

    const approvedDocumentTypes: DocumentType[] = [];
    const allPhasesDocuments: ShipmentPhaseDocument[] = [];
    detailedShipment?.shipment.documents.forEach((value) => {
        const documentInfo = value[0];
        if (documentInfo.evaluationStatus === EvaluationStatus.APPROVED) approvedDocumentTypes.push(documentInfo.documentType);
    });
    detailedShipment?.phaseDocuments?.forEach((value) => {
        value.forEach((doc) => {
            if (!approvedDocumentTypes.includes(doc.documentType)) allPhasesDocuments.push(doc);
        });
    });

    if (tradeSelected && !tradeSelected.order) return <Typography>You have not created any order yet</Typography>;

    const elements: FormElement[] = useMemo(
        () => [
            {
                type: FormElementType.SELECT,
                span: 12,
                name: 'orders',
                label: 'Orders',
                required: false,
                defaultValue: tradeSelected && tradeSelected.order ? tradeSelected.order.id.toString() : undefined,
                options: orders.map((orderDetail, index) => ({
                    value: index,
                    label: orderDetail.id.toString(),
                    counterpart: computeCounterpart(orderDetail)
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
                        option.label.toString().includes(input) || option.counterpart.toLowerCase().includes(input.toLowerCase())
                }
            },
            {
                type: FormElementType.CARD,
                span: 12,
                name: 'orderSelected',
                title: 'Order Details',
                hidden: tradeSelected === undefined,
                content:
                    tradeSelected && tradeSelected.order ? (
                        <Flex vertical>
                            <div>
                                <span style={{ fontWeight: 'bold' }}>Counterpart: </span>
                                {computeCounterpart(tradeSelected.order)}
                            </div>
                            <div>
                                <span style={{ fontWeight: 'bold' }}>Issue Date: </span>
                                {/*TODO: add issue date to order entity*/}
                                {new Date(tradeSelected.order.deliveryDeadline.getTime() * 1000).toLocaleDateString()}
                            </div>
                            <ConfirmButton
                                style={{ padding: 0, marginTop: 10, textAlign: 'left' }}
                                type="link"
                                text="Go to Order page"
                                confirmText="Do you want to go to the order page?"
                                onConfirm={() =>
                                    navigate(
                                        setParametersPath(`${paths.TRADE_VIEW}?type=1`, {
                                            id: tradeSelected!.order!.id.toString()
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
                content:
                    tradeSelected && tradeSelected.order && tradeSelected.detailedShipment ? (
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
                                    {`${tradeSelected.detailedShipment.shipment.quantity} ${tradeSelected.order.lines[0].unit}`}
                                </div>
                                <div>
                                    <span style={{ fontWeight: 'bold' }}>Weight: </span>
                                    {`${tradeSelected.detailedShipment.shipment.grossWeight} kg`}
                                </div>
                                <div>
                                    <span style={{ fontWeight: 'bold' }}>Price: </span>
                                    {`${tradeSelected.detailedShipment.shipment.price} ${(tradeSelected.order.lines[0] as OrderLine).price.fiat}`}
                                </div>
                            </Flex>
                            <DocumentUpload
                                documentTypes={allPhasesDocuments.map((s) => s.documentType)}
                                onSubmit={documentSubmit}
                                oldDocumentsInfo={
                                    tradeSelected?.detailedShipment
                                        ? Array.from(tradeSelected.detailedShipment.shipment.documents.values()).flat()
                                        : []
                                }
                                selectedDocumentType={selectedDocumentType}
                            />
                        </Flex>
                    ) : (
                        <Alert
                            style={{ textAlign: 'center' }}
                            message={<span>No shipment available for this order, please continue with order negotiation.</span>}
                            type={'warning'}
                        />
                    )
            }
        ],
        [orders, tradeSelected]
    );

    return (
        <CardPage title="Shipment Documents">
            <GenericForm elements={elements} confirmText="This will upload the document for the order selected, proceed?" submittable={false} />
        </CardPage>
    );
};
