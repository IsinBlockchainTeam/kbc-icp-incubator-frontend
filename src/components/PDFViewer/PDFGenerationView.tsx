import { Button, Modal } from 'antd';
import React, { useEffect, useState } from 'react';
import { JSONTemplate } from '../../templates/JSONTemplate';
import { SpecialZoomLevel, Viewer } from '@react-pdf-viewer/core';
import { createDownloadWindow } from '@/utils/page';
import { DownloadOutlined } from '@ant-design/icons';

type Props = {
    visible: boolean;
    handleClose: () => void;
    useGeneration: {
        generateJsonSpec: () => JSONTemplate;
        generatePdf: () => Promise<Blob>;
    };
    downloadable?: boolean;
    filename?: string;
    title?: string;
    centered?: boolean;
    children?: React.ReactNode;
};

export default (props: Props) => {
    const {
        centered = false,
        visible,
        downloadable = false,
        title,
        filename,
        handleClose,
        useGeneration,
        children
    } = props;
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<Blob | null>(null);

    useEffect(() => {
        if (visible) {
            setLoading(true);
            useGeneration.generatePdf().then((pdf) => {
                setFile(pdf);
                setLoading(false);
            });
        }
    }, [visible]);

    return (
        <Modal
            title={title}
            centered={centered}
            open={visible}
            loading={loading}
            onCancel={handleClose}
            footer={(_, { CancelBtn }) => (
                <>
                    {downloadable && (
                        <Button
                            type="default"
                            onClick={() => createDownloadWindow(file!, filename || 'file.pdf')}
                            icon={<DownloadOutlined />}>
                            {' '}
                            Download
                        </Button>
                    )}
                </>
            )}>
            {file && (
                <div
                    style={{
                        height: '65vh',
                        maxHeight: '65vh',
                        overflow: 'scroll'
                    }}>
                    <Viewer
                        defaultScale={SpecialZoomLevel.PageWidth}
                        fileUrl={URL.createObjectURL(file)}
                    />
                </div>
            )}
            {children}
        </Modal>
    );
};
