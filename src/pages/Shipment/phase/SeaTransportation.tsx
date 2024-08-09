import { useParams } from 'react-router-dom';
import { useEthOrderTrade } from '@/providers/entities/EthOrderTradeProvider';
import React from 'react';
import { ShipmentDocumentRules, useEthShipment } from '@/providers/entities/EthShipmentProvider';
import { Button, Card, Space, Table, TableProps, Tag, Typography, Upload } from 'antd';
import {
    ShipmentDocumentInfo,
    ShipmentDocumentStatus,
    ShipmentDocumentType
} from '@kbc-lib/coffee-trading-management-lib';
import { UploadOutlined } from '@ant-design/icons';
import { UploadChangeParam } from 'antd/es/upload';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { credentials } from '@/constants/ssi';
import { PreviewModal } from '@/components/PreviewModal/PreviewModal';

const { Paragraph } = Typography;

interface DataType {
    type: ShipmentDocumentType;
    info: ShipmentDocumentInfo | null;
}
export const SeaTransportation = () => {
    const { id } = useParams();
    const { detailedShipment, addDocument, getDocument, approveDocument, rejectDocument } =
        useEthShipment();
    const { orderTrades } = useEthOrderTrade();
    const [previewDocumentId, setPreviewDocumentId] = React.useState<number | null>(null);
    const userInfo = useSelector((state: RootState) => state.userInfo);
    const isExporter = userInfo.role.toUpperCase() === credentials.ROLE_EXPORTER;

    const orderTrade = orderTrades.find((trade) => trade.tradeId === Number(id));
    if (!orderTrade) {
        return <>Order not found</>;
    }
    if (!detailedShipment) {
        return <>Shipment not found</>;
    }

    const retrieveDocument = async () => {
        if (!previewDocumentId) return null;
        const document = await getDocument(previewDocumentId);
        return new Blob([document.content]);
    };

    const onFileChange = async (info: UploadChangeParam, record: DataType) => {
        if (info.file.status != 'uploading' && info.file.originFileObj) {
            await addDocument(record.type, info.file.name, info.file.originFileObj);
        }
    };

    const onApprove = async (record: DataType) => {
        if (!record.info) return;
        await approveDocument(record.info.id);
    };

    const onReject = async (record: DataType) => {
        if (!record.info) return;
        await rejectDocument(record.info.id);
    };

    const columns: TableProps<DataType>['columns'] = [
        {
            title: 'Document Type',
            dataIndex: 'documentType',
            key: 'documentType',
            render: (_, { type }) => <>{ShipmentDocumentRules[type].name}</>
        },
        {
            title: 'Duty',
            dataIndex: 'duty',
            key: 'duty',
            render: (_, { type }) => (
                <>{ShipmentDocumentRules[type].isExporterUploader ? 'Exporter' : 'Importer'}</>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (_, { info }) => (
                <Tag
                    color={
                        !info || info.status === ShipmentDocumentStatus.NOT_EVALUATED
                            ? 'orange'
                            : info.status === ShipmentDocumentStatus.APPROVED
                              ? 'green'
                              : 'red'
                    }
                    key="status">
                    {info !== null ? ShipmentDocumentStatus[info.status] : 'NOT UPLOADED'}
                </Tag>
            )
        },
        {
            title: 'Actions',
            key: 'action',
            render: (_, record) => {
                const isUploader = isExporter
                    ? ShipmentDocumentRules[record.type].isExporterUploader
                    : !ShipmentDocumentRules[record.type].isExporterUploader;
                return (
                    <Space size="middle">
                        {record.info != null && (
                            <a onClick={() => setPreviewDocumentId(record.info?.id || null)}>
                                Preview
                            </a>
                        )}
                        {isUploader && record.info?.status !== ShipmentDocumentStatus.APPROVED && (
                            <Upload
                                onChange={(e) => onFileChange(e, record)}
                                showUploadList={false}>
                                <Button icon={<UploadOutlined />}>Click to Upload</Button>
                            </Upload>
                        )}
                        {!isUploader &&
                            record.info &&
                            record.info.status === ShipmentDocumentStatus.NOT_EVALUATED && (
                                <>
                                    <a onClick={() => onApprove(record)}>Approve</a>
                                    <a onClick={() => onReject(record)}>Reject</a>
                                </>
                            )}
                    </Space>
                );
            }
        }
    ];

    const data: DataType[] = detailedShipment.shipment.seaTransportationRequiredDocumentsTypes.map(
        (type) => {
            const documentsInfo = detailedShipment.documents.filter((d) => d.type === type);
            let info: ShipmentDocumentInfo | null = null;
            if (documentsInfo.length > 0) {
                info =
                    documentsInfo.find((d) => d.status === ShipmentDocumentStatus.APPROVED) || null;
                if (!info) {
                    info = documentsInfo[documentsInfo.length - 1];
                }
            }
            return {
                type,
                info
            };
        }
    );

    return (
        <>
            <PreviewModal
                open={previewDocumentId != null}
                getDocument={retrieveDocument}
                onClose={() => setPreviewDocumentId(null)}
            />
            <Card
                style={{
                    width: '100%',
                    background: '#E6F4FF',
                    borderColor: '#91CAFF',
                    marginTop: 10,
                    marginBottom: 10
                }}
                role="card">
                <Paragraph>
                    This stage ranges from when the goods leave the warehouse to when the goods are
                    loaded onto the ship.
                </Paragraph>
            </Card>
            <Table columns={columns} dataSource={data} />
        </>
    );
};
