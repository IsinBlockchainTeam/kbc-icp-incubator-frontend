import { Button, Modal } from 'antd';
import React from 'react';

type ConfirmButtonProps = {
    text: string;
    confirmText: string;
    disabled?: boolean;
    onConfirm: () => void;
    style?: React.CSSProperties;
    [x: string]: any;
};
export const ConfirmButton = ({
    text,
    confirmText,
    disabled,
    onConfirm,
    style,
    ...props
}: ConfirmButtonProps) => {
    return (
        <Button
            style={style}
            type="primary"
            disabled={disabled}
            onClick={() => {
                Modal.confirm({
                    title: 'Confirm',
                    content: confirmText,
                    onOk: onConfirm
                });
            }}
            {...props}>
            {text}
        </Button>
    );
};
