import {Col, DatePicker, Form, Spin} from "antd";
import React, {useEffect, useState} from "react";
import {Document} from "../GenericForm/GenericForm";
import {Viewer} from "@react-pdf-viewer/core";
import PDFUploader from "../PDFUploader/PDFUploader";

export default function PDFViewer(element: Document) {
    const {height = '100%', uploadable} = element;
    const [file, setFile] = useState<Blob>();

    useEffect(() => {
        if (element.content) {
            setFile(element.content);
        }
    }, [element.content]);

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
                {element.content && file ? (
                    <Viewer
                        fileUrl={URL.createObjectURL(file)}
                    />
                ) : (
                    <Spin />
                )}
            </div>
            {uploadable &&
                <div style={{height: '30%'}}>
                    <PDFUploader onFileUpload={updateFileUrl} name={element.name}/>
                </div>
            }
        </div>

    )
}