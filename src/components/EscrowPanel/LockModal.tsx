import React from 'react';
import { Button, InputNumber, Modal } from 'antd';
import { useEthEscrow } from '@/providers/entities/EthEscrowProvider';
import { useEthShipment } from '@/providers/entities/EthShipmentProvider';
import { useParams } from 'react-router-dom';

type DepositModalProps = {
    isOpen: boolean;
    onClose: () => void;
};
export const LockModal = ({ isOpen, onClose }: DepositModalProps) => {
    const { shipmentId } = useParams();
    const { tokenDetails } = useEthEscrow();
    const { shipments, lockFunds } = useEthShipment();
    const shipment = shipments.find((s) => s.id === Number(shipmentId));
    if (!shipment) {
        return <>Shipment not found</>;
    }

    const onLock = async () => {
        onClose();
        await lockFunds(shipment.id);
    };

    return (
        <Modal
            title="Lock funds"
            open={isOpen}
            onCancel={onClose}
            footer={[
                <Button key="back" style={{ width: '49%' }} onClick={onClose}>
                    Cancel
                </Button>,
                <Button type="primary" style={{ width: '49%' }} onClick={onLock}>
                    Lock
                </Button>
            ]}>
            <InputNumber
                addonAfter={tokenDetails.symbol}
                placeholder={shipment.price.toString()}
                disabled={true}
            />
        </Modal>
    );
};
