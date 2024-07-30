import React from 'react';
import { Button, InputNumber, InputNumberProps, Modal } from 'antd';
import { useEthEscrow } from '@/providers/entities/EthEscrowProvider';

type DepositModalProps = {
    isOpen: boolean;
    onClose: () => void;
};
export const DepositModal = ({ isOpen, onClose }: DepositModalProps) => {
    const [amount, setAmount] = React.useState<number>(0);
    const { tokenDetails, deposit } = useEthEscrow();

    const onChange: InputNumberProps['onChange'] = (value) => {
        setAmount(value as number);
    };

    const onDeposit = async () => {
        onClose();
        await deposit(amount);
    };

    return (
        <Modal
            title="Deposit"
            open={isOpen}
            onCancel={onClose}
            footer={[
                <Button key="back" style={{ width: '49%' }} onClick={onClose}>
                    Cancel
                </Button>,
                <Button
                    type="primary"
                    style={{ width: '49%' }}
                    onClick={onDeposit}
                    disabled={amount <= 0}>
                    Deposit
                </Button>
            ]}>
            <InputNumber
                addonAfter={tokenDetails.symbol}
                placeholder="Amount"
                onChange={onChange}
            />
            <p>
                Fees: {0} {tokenDetails.symbol}
            </p>
        </Modal>
    );
};
