import React from 'react';
import {InboxOutlined} from '@ant-design/icons';
import type {UploadProps} from 'antd';
import {Upload, Form} from 'antd';
import {NotificationType, openNotification} from "../../utils/notification";
import {RcFile} from "antd/lib/upload";

const {Dragger} = Upload;

export interface PDFUploaderProps {
    onFileUpload: (file: Blob) => void;
    name: string;
}

export default function PDFUploader({onFileUpload, name}: PDFUploaderProps) {
    const props: UploadProps = {
        name: 'file',
        multiple: false,
        // The following operation is needed as the Uploader component expects an endpoint to upload the file
        // In this case we are using a mock server to simulate the file upload
        action: 'https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188',
        maxCount: 1,
        showUploadList: false,
        beforeUpload: (file: RcFile) => {
            if (file.type !== 'application/pdf') {
                openNotification('Error', 'You can only upload PDF files', NotificationType.ERROR);
                return Upload.LIST_IGNORE;
            }
            onFileUpload(file);
            return true;
        },
        onChange(info) {
            const {status, name} = info.file;
            if (status === 'done') {
                openNotification('File uploaded', `${name} file has been uploaded successfully`, NotificationType.SUCCESS);
            } else if (status === 'error') {
                openNotification('Error', `${name} file upload failed`, NotificationType.ERROR);
            }
        },
    };

    const normFile = (e: any) => {
        if (Array.isArray(e)) {
            return e;
        }
        console.log("Not an array");
        console.log(e?.fileList[0]?.originFileObj);
        return e?.fileList;
    };

    return (
        <Form.Item name={name} valuePropName="fileList" getValueFromEvent={normFile} noStyle >
            <Dragger {...props}>
                <p className="ant-upload-drag-icon">
                    <InboxOutlined/>
                </p>
                <p className="ant-upload-text">Click or drag PDF file to this area to upload</p>
            </Dragger>
        </Form.Item>
    )
}