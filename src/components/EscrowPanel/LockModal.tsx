import React from 'react';
import { Button, InputNumber, Modal } from 'antd';
import { useEthEscrow } from '@/providers/entities/EthEscrowProvider';
import { useEthShipment } from '@/providers/entities/EthShipmentProvider';

type DepositModalProps = {
    isOpen: boolean;
    onClose: () => void;
};
export const LockModal = ({ isOpen, onClose }: DepositModalProps) => {
    const { tokenDetails } = useEthEscrow();
    const { detailedShipment } = useEthShipment();
    if (!detailedShipment) {
        return <>Shipment not found</>;
    }

    return (
        <Modal
            title="Lock funds"
            open={isOpen}
            onCancel={onClose}
            footer={[
                <Button key="back" style={{ width: '49%' }} onClick={onClose}>
                    Cancel
                </Button>
            ]}>
            <InputNumber
                addonAfter={tokenDetails.symbol}
                placeholder={detailedShipment.shipment.price.toString()}
                disabled={true}
            />
        </Modal>
    );
};
