import React from 'react';
import {InboxOutlined, RollbackOutlined} from '@ant-design/icons';
import {Button, Upload, UploadProps} from 'antd';
import {NotificationType, openNotification} from "../../utils/notification";

const {Dragger} = Upload;

export interface PDFUploaderProps {
    onFileUpload: (file: Blob) => void;
    onRevert: () => void;
}

export default function PDFUploader({onFileUpload, onRevert}: PDFUploaderProps) {
    const props: UploadProps = {
        name: 'file',
        multiple: false,
        // The following operation is needed as the Uploader component expects an endpoint to upload the file
        // In this case we are using a mock server to simulate the file upload
        action: 'https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188',
        maxCount: 1,
        showUploadList: false,
        beforeUpload: (file) => {
            if (file.type !== 'application/pdf') {
                openNotification('Unsupported format', 'You can only upload PDF files', NotificationType.ERROR);
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

    return (
        <div style={{ display: 'flex', width: '100%' }}>
            <div style={{ flex: '1' }}>
                <Dragger {...props} style={{ width: '100%' }}>
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">Click or drag PDF file to this area to upload</p>
                </Dragger>
            </div>
            <div style={{ width: '20%' }}>
                <Button type={"dashed"} style={{ width: '100%', height: '100%', fontSize: '20px' }} icon={<RollbackOutlined/>} onClick={onRevert}>
                    Revert
                </Button>
            </div>
        </div>
    );

}