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
import { useNavigate } from 'react-router-dom';
import { setParametersPath } from '@/utils/page';
import { paths } from '@/constants/paths';

const { Paragraph } = Typography;

interface DataType {
    type: ShipmentDocumentType;
    info: ShipmentDocumentInfo | null;
}
export const LandTransportation = () => {
    const navigate = useNavigate();
    const { detailedShipment, getDocument, approveDocument, rejectDocument } = useEthShipment();
    const [previewDocumentId, setPreviewDocumentId] = React.useState<number | null>(null);
    const userInfo = useSelector((state: RootState) => state.userInfo);
    const isExporter = userInfo.companyClaims.role.toUpperCase() === credentials.ROLE_EXPORTER;

    if (!detailedShipment) {
        return <>Shipment not found</>;
    }

    const retrieveDocument = async () => {
        if (!previewDocumentId) return null;
        const document = await getDocument(previewDocumentId);
        return new Blob([document.content]);
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
                            <a
                                onClick={() =>
                                    navigate(
                                        setParametersPath(paths.ORDER_DOCUMENTS, {
                                            id: detailedShipment.orderId.toString()
                                        }),
                                        { state: { selectedDocumentType: record.type } }
                                    )
                                }>
                                Go to upload page
                            </a>
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

    const data: DataType[] = detailedShipment.shipment.landTransportationRequiredDocumentsTypes.map(
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
                    This phase ranges from when the shipment is approved to when the goods leave the
                    warehouse.
                </Paragraph>
            </Card>
            <Table columns={columns} dataSource={data} />
        </>
    );
};
