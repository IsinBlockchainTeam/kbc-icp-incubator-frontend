import { Badge, Empty, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import { DocumentElement } from '@/components/GenericForm/GenericForm';
import { Viewer } from '@react-pdf-viewer/core';
import PDFUploader from '@/components/PDFUploader/PDFUploader';
import { DocumentStatus } from '@kbc-lib/coffee-trading-management-lib';

import '@react-pdf-viewer/core/lib/styles/index.css';

export interface PDFViewerProps {
    element: DocumentElement;
    onDocumentChange: (name: string, file?: Blob) => void;
    validationStatus?: DocumentStatus;
}

export default function PDFViewer(props: PDFViewerProps) {
    const { element, onDocumentChange, validationStatus } = props;
    const { height = '100%', uploadable, loading, content, name } = element;
    const [file, setFile] = useState<Blob | undefined>(undefined);

    useEffect(() => {
        if (content) setFile(content.content);
    }, [content?.content]);

    const onFileUpload = (file: Blob) => {
        setFile(file);
        onDocumentChange(name, file);
    };

    const onRevert = () => {
        setFile(content?.content);
        onDocumentChange(name, content?.content);
    };

    return (
        <Badge.Ribbon
            text={
                validationStatus !== undefined && validationStatus !== DocumentStatus.NOT_EVALUATED
                    ? validationStatus === DocumentStatus.APPROVED
                        ? 'Approved'
                        : 'Rejected'
                    : ''
            }
            color={
                validationStatus !== undefined && validationStatus !== DocumentStatus.NOT_EVALUATED
                    ? validationStatus === DocumentStatus.APPROVED
                        ? 'green'
                        : 'red'
                    : 'rgba(0,0,0,0)'
            }>
            <div
                style={{
                    height,
                    width: '100%'
                }}>
                <div
                    style={{
                        border: '1px solid #d9d9d9',
                        borderRadius: '6px',
                        height: uploadable ? '70%' : '100%',
                        width: '100%',
                        overflowY: file ? 'scroll' : 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                    {!loading ? file ? <Viewer fileUrl={URL.createObjectURL(file)} /> : <Empty /> : <Spin />}
                </div>
                {uploadable && (
                    <div style={{ height: '30%' }}>
                        <PDFUploader onFileUpload={onFileUpload} onRevert={onRevert} />
                    </div>
                )}
            </div>
        </Badge.Ribbon>
    );
}
