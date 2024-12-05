import React from 'react';
import { Button, InputNumber, InputNumberProps, Modal, Skeleton } from 'antd';
import { useEthDownPayment } from '@/providers/entities/EthDownPaymentProvider';

type WithdrawModalProps = {
    isOpen: boolean;
    onClose: () => void;
};
export const WithdrawModal = ({ isOpen, onClose }: WithdrawModalProps) => {
    const [amount, setAmount] = React.useState<number>(0);
    const [fees, setFees] = React.useState<number>(0);
    const [feesLoading, setFeesLoading] = React.useState<boolean>(false);

    const { downPaymentDetails, tokenDetails, withdraw, getFees } = useEthDownPayment();

    const onChange: InputNumberProps['onChange'] = async (value) => {
        const amount = value as number;
        setAmount(amount);
        if (amount) {
            setFeesLoading(true);
            const fees = await getFees(amount);
            setFees(fees);
            setFeesLoading(false);
        }
    };

    const onWithdraw = async () => {
        onClose();
        await withdraw(amount);
    };

    const feesElement = feesLoading ? <Skeleton.Input active size="small" /> : `${fees} ${tokenDetails.symbol}`;

    return (
        <Modal
            title="Withdraw"
            open={isOpen}
            onCancel={onClose}
            footer={[
                <Button key="back" style={{ width: '49%' }} onClick={onClose}>
                    Cancel
                </Button>,
                <Button type="primary" style={{ width: '49%' }} onClick={onWithdraw} disabled={amount <= 0}>
                    Withdraw
                </Button>
            ]}>
            <InputNumber addonAfter={tokenDetails.symbol} placeholder="Amount" onChange={onChange} />
            <p style={{ height: 25 }}>Fees: {feesElement}</p>
            <p>
                Withdrawable amount: {downPaymentDetails.withdrawableAmount} {tokenDetails.symbol}
            </p>
        </Modal>
    );
};
