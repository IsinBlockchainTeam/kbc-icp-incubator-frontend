import { Modal } from 'antd';
import React, { useEffect, useState } from 'react';
import { Viewer } from '@react-pdf-viewer/core';
import { JSONTemplate } from '../../templates/JSONTemplate';

type Props = {
    visible: boolean;
    useGeneration: {
        generateJsonSpec: () => JSONTemplate;
        generatePdf: () => Promise<Blob>;
    };
    footer?: React.ReactNode[];
    centered?: boolean;
    children?: React.ReactNode;
};

export default (props: Props) => {
    const { centered = false, visible, useGeneration, children } = props;
    const [open, setOpen] = useState(visible);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            const jsonSpec = useGeneration.generateJsonSpec();
        }
    }, [open]);

    return (
        <Modal centered={centered} open={open} loading={loading}>
            {/*<Viewer fileUrl={URL.createObjectURL(file)} />*/}
            {children}
        </Modal>
    );
};
