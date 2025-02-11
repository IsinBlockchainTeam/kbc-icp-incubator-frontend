import React from 'react';
import { ICPBaseCertificate, ICPCertificateDocumentType } from '@kbc-lib/coffee-trading-management-lib';
import { Avatar, Button, List, Modal, Space, Tag, Typography } from 'antd';
import { CalendarOutlined, DownloadOutlined, FileTextOutlined, SafetyCertificateOutlined, UserOutlined } from '@ant-design/icons';
import { createDownloadWindow } from '@/utils/page';
import { useCertification } from '@/providers/entities/icp/CertificationProvider';
import { CertificateDocumentNames } from '@/constants/certificationDocument';

export type CertificationsModalProps = {
    open: boolean;
    title: string;
    certifications: ICPBaseCertificate[];
    onClose: () => void;
};

export const CertificationsModal = (props: CertificationsModalProps) => {
    const { open, title, certifications, onClose } = props;
    const { getDocument } = useCertification();

    return (
        <Modal title={title} open={open} onCancel={onClose} footer={[]} width="60%">
            <div
                style={{
                    height: '60vh',
                    maxHeight: '60vh',
                    overflow: 'scroll'
                }}>
                <List
                    itemLayout="horizontal"
                    dataSource={certifications}
                    renderItem={(cert) => (
                        <List.Item
                            actions={[
                                <Space align="center" key={`document-cert-${cert.id}`} direction="horizontal" size="large">
                                    <Space direction="vertical">
                                        <Typography.Text>
                                            <FileTextOutlined /> Document Type:
                                        </Typography.Text>
                                        <Tag color="geekblue">
                                            {CertificateDocumentNames[cert.document.documentType as ICPCertificateDocumentType]}
                                        </Tag>
                                    </Space>
                                    <Button
                                        key={cert.id}
                                        type="primary"
                                        icon={<DownloadOutlined />}
                                        onClick={async () => {
                                            const filenameSlices = cert.document.metadata.filename.split('/');
                                            const content = await getDocument(cert.id);
                                            createDownloadWindow(new Blob([content.fileContent]), filenameSlices[filenameSlices.length - 1]);
                                        }}>
                                        Download
                                    </Button>
                                </Space>
                            ]}>
                            <List.Item.Meta
                                avatar={
                                    <Avatar
                                        style={{ cursor: 'pointer' }}
                                        src={cert.assessmentReferenceStandard.logoUrl}
                                        size="large"
                                        alt={`Avatar for ${cert.assessmentReferenceStandard.name}`}
                                        onClick={() => window.open(cert.assessmentReferenceStandard.siteUrl, '_blank')}
                                    />
                                }
                                title={cert.assessmentReferenceStandard.name}
                                description={
                                    <Space style={{ color: 'rgba(0, 0, 0, 0.7)' }} direction="vertical" size="small">
                                        <Space>
                                            <CalendarOutlined />
                                            <Typography.Text>Issue Date: {new Date(cert.issueDate).toLocaleDateString()}</Typography.Text>
                                        </Space>
                                        <Space>
                                            <UserOutlined />
                                            <Typography.Text>Certifier: {cert.issuer}</Typography.Text>
                                        </Space>
                                        <Space>
                                            <SafetyCertificateOutlined />
                                            <Typography.Text>Assurance Level: {cert.assessmentAssuranceLevel}</Typography.Text>
                                        </Space>
                                        <Space>
                                            <Typography.Text>Status:</Typography.Text>
                                            <Tag color="geekblue">{cert.evaluationStatus}</Tag>
                                        </Space>
                                    </Space>
                                }
                            />
                        </List.Item>
                    )}
                />
            </div>
        </Modal>
    );
};
