import { Modal } from 'antd';
import React, { useState } from 'react';
import { Viewer } from '@react-pdf-viewer/core';

type Props = {
    visible: boolean;
    footer?: React.ReactNode[];
    centered?: boolean;
    children?: React.ReactNode;
};

enum Templates {
    ORDER_DOCUMENT = 'order-document',
    SHIPPING_INVOICE = 'shipping-invoice'
}

export default (props: Props) => {
    const { centered = false, visible, children } = props;
    const [open, setOpen] = useState(visible);
    const [loading, setLoading] = useState(false);

    return (
        <Modal centered={centered} open={open} loading={loading}>
            {/*<Viewer fileUrl={URL.createObjectURL(file)} />*/}
            {children}
        </Modal>
    );
};
