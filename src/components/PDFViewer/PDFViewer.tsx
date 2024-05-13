import {Empty, Spin} from "antd";
import React, {useEffect, useState} from "react";
import {DocumentElement} from "../GenericForm/GenericForm";
import {Viewer} from "@react-pdf-viewer/core";
import PDFUploader from "../PDFUploader/PDFUploader";

export interface PDFViewerProps {
    element: DocumentElement;
    onDocumentChange: (name: string, file?: Blob) => void;
}

export default function PDFViewer({element, onDocumentChange}: PDFViewerProps) {
    const {height = '100%', uploadable, loading, content, name} = element;
    const [file, setFile] = useState<Blob | undefined>(undefined);

    useEffect(() => {
        if (content) {
            setFile(content);
        }
    }, [content]);

    const onFileUpload = (file: Blob) => {
        setFile(file);
        onDocumentChange(name, file);
    }

    const onRevert = () => {
        setFile(content);
        onDocumentChange(name, content);
    }

    return (
        <div style={{
            height,
            width: '100%',
        }}>
            <div style={{
                border: '1px solid #d9d9d9',
                borderRadius: '6px',
                height: uploadable ? '70%' : '100%',
                width: '100%',
                overflowY: file ? 'scroll' : 'hidden',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
            }}
            >
                {
                    !loading ? (
                        file ? (
                                <Viewer
                                    fileUrl={URL.createObjectURL(file)}
                                />
                            ) :
                            (
                                <Empty />
                            )
                    ) : (
                        <Spin/>
                    )}
            </div>
            {uploadable &&
                <div style={{height: '30%'}}>
                    <PDFUploader onFileUpload={onFileUpload} onRevert={onRevert}/>
                </div>
            }
        </div>

    )
}
