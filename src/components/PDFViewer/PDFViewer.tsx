import {Col, DatePicker, Form, Spin} from "antd";
import React, {useEffect, useState} from "react";
import {Document} from "../GenericForm/GenericForm";
import {Viewer} from "@react-pdf-viewer/core";
import PDFUploader from "../PDFUploader/PDFUploader";

export default function PDFViewer(element: Document, index: number, normFile: (e: any) => any) {
    const {height = '100%', content, uploadable} = element;
    const [file, setFile] = useState<Blob>();

    useEffect(() => {
        if (content) {
            setFile(content);
        }
    }, []);

    const updateFileUrl = (file: Blob) => {
        setFile(file);
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
                        overflowY: 'scroll',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    >
                        {content && file ? (
                            <Viewer
                                fileUrl={URL.createObjectURL(file)}
                            />
                        ) : (
                            <Spin/>
                        )}
                    </div>
                    <div style={{height: '30%'}}>
                        {uploadable && <PDFUploader onFileUpload={updateFileUrl}/>}
                    </div>
                </div>

    )
}