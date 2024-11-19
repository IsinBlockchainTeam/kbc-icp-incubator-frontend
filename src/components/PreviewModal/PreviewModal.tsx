import { Flex, Modal, Spin } from 'antd';
import { Viewer } from '@react-pdf-viewer/core';
import React, { useEffect } from 'react';
import { LoadingOutlined } from '@ant-design/icons';

export type PreviewModalProps = {
    open: boolean;
    getDocument: () => Promise<Blob | null>;
    onClose: () => void;
};
export const PreviewModal = ({ open, getDocument, onClose }: PreviewModalProps) => {
    const [loading, setLoading] = React.useState(false);
    const [content, setContent] = React.useState<Blob | null>(null);

    useEffect(() => {
        retrieveDocument();
    }, [open]);

    const retrieveDocument = async () => {
        setLoading(true);
        setContent(await getDocument());
        setLoading(false);
    };
    return (
        <Modal title="Document preview" open={open} onCancel={onClose} footer={[]} width={1000}>
            {loading ? (
                <Flex align="center" justify="center" role="loading">
                    <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
                </Flex>
            ) : (
                content && (
                    <div
                        style={{
                            height: '60vh',
                            maxHeight: '60vh',
                            overflow: 'scroll'
                        }}>
                        <Viewer fileUrl={URL.createObjectURL(content)} />
                    </div>
                )
            )}
        </Modal>
    );
};
