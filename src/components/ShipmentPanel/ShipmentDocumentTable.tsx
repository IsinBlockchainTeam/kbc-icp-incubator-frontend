import { Space, Table, TableProps, Tag } from 'antd';
import React from 'react';
import {
    EvaluationStatus,
    ShipmentDocumentInfo,
    ShipmentDocumentType,
    ShipmentPhase
} from '@kbc-lib/coffee-trading-management-lib';
import { ShipmentDocumentRules } from '@/constants/shipmentDocument';
import { setParametersPath } from '@/utils/page';
import { paths } from '@/constants/paths';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { PreviewModal } from '@/components/PreviewModal/PreviewModal';
import { useNavigate } from 'react-router-dom';
import { useSigner } from '@/providers/SignerProvider';
import { ConfirmButton } from '@/components/ConfirmButton/ConfirmButton';
import { useShipment } from '@/providers/icp/ShipmentProvider';

interface ShipmentDocumentTableProps {
    selectedPhase: ShipmentPhase;
}
interface DataType {
    type: ShipmentDocumentType;
    info: ShipmentDocumentInfo | null;
    required: boolean;
}
export const ShipmentDocumentTable = (props: ShipmentDocumentTableProps) => {
    const [previewDocumentId, setPreviewDocumentId] = React.useState<number | null>(null);
    const { detailedShipment, getDocument, approveDocument, rejectDocument } = useShipment();
    const navigate = useNavigate();
    const { signer } = useSigner();

    if (!detailedShipment) {
        return <>Shipment not found</>;
    }

    const onApprove = async (info: ShipmentDocumentInfo) => {
        if (!info) return;
        await approveDocument(info.id);
    };

    const onReject = async (info: ShipmentDocumentInfo) => {
        if (!info) return;
        await rejectDocument(info.id);
    };

    const retrieveDocument = async () => {
        if (previewDocumentId === null) return null;
        const document = await getDocument(previewDocumentId);
        return new Blob([document.content]);
    };

    const columns: TableProps<DataType>['columns'] = [
        {
            title: 'Document Type',
            dataIndex: 'documentType',
            key: 'documentType',
            render: (_, { type }) => <>{ShipmentDocumentRules[type].name}</>
        },
        {
            title: 'Suggested party',
            dataIndex: 'suggestedParty',
            key: 'suggestedParty',
            render: (_, { type }) => (
                <>
                    {ShipmentDocumentRules[type].isExporterSuggestedUploader
                        ? 'Exporter'
                        : 'Importer'}
                </>
            )
        },
        {
            title: 'Required',
            dataIndex: 'required',
            key: 'required',
            render: (_, { required }) => <>{required ? <CheckOutlined /> : <CloseOutlined />}</>
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (_, { info }) => (
                <Tag
                    color={
                        !info || info.evaluationStatus === EvaluationStatus.NOT_EVALUATED
                            ? 'orange'
                            : info.evaluationStatus === EvaluationStatus.APPROVED
                              ? 'green'
                              : 'red'
                    }
                    key="status">
                    {info !== null ? EvaluationStatus[info.evaluationStatus] : 'NOT UPLOADED'}
                </Tag>
            )
        },
        {
            title: 'Actions',
            key: 'action',
            render: (_, { info, type }) => {
                return (
                    <Space size="middle">
                        {info != null && (
                            <a onClick={() => setPreviewDocumentId(info.id)}>Preview</a>
                        )}
                        {info?.evaluationStatus !== EvaluationStatus.APPROVED && (
                            <a
                                onClick={() =>
                                    navigate(
                                        setParametersPath(paths.ORDER_DOCUMENTS, {
                                            id: detailedShipment.orderId.toString()
                                        }),
                                        { state: { selectedDocumentType: type } }
                                    )
                                }>
                                Go to upload page
                            </a>
                        )}
                        {info != null &&
                            info.evaluationStatus === EvaluationStatus.NOT_EVALUATED &&
                            info.uploadedBy != signer._address && (
                                <>
                                    <ConfirmButton
                                        type={'link'}
                                        text={'Approve'}
                                        confirmText={
                                            'Are you sure you want to approve this document?'
                                        }
                                        onConfirm={() => onApprove(info)}
                                    />
                                    <ConfirmButton
                                        type={'link'}
                                        text={'Reject'}
                                        confirmText={
                                            'Are you sure you want to reject this document?'
                                        }
                                        onConfirm={() => onReject(info)}
                                    />
                                </>
                            )}
                    </Space>
                );
            }
        }
    ];
    const selectedPhaseDocuments = detailedShipment.phaseDocuments.get(props.selectedPhase);

    const data: DataType[] = selectedPhaseDocuments
        ? selectedPhaseDocuments.map((phaseDocument) => {
              const documentInfo = detailedShipment.shipment.documents.get(
                  phaseDocument.documentType
              );
              return {
                  type: phaseDocument.documentType,
                  info: documentInfo ? documentInfo[0] : null,
                  required: phaseDocument.required
              };
          })
        : [];

    return (
        <>
            <PreviewModal
                open={previewDocumentId != null}
                getDocument={retrieveDocument}
                onClose={() => setPreviewDocumentId(null)}
            />
            <Table columns={columns} dataSource={data} />
        </>
    );
};
