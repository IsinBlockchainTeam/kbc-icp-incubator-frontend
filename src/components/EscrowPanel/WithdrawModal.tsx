import React from 'react';
import { Button, InputNumber, InputNumberProps, Modal, Skeleton } from 'antd';
import { useEthEscrow } from '@/providers/entities/EthEscrowProvider';
import { EscrowStatus } from '@kbc-lib/coffee-trading-management-lib';

type WithdrawModalProps = {
    isOpen: boolean;
    onClose: () => void;
};
export const WithdrawModal = ({ isOpen, onClose }: WithdrawModalProps) => {
    const [amount, setAmount] = React.useState<number>(0);
    const [fees, setFees] = React.useState<number>(0);
    const [feesLoading, setFeesLoading] = React.useState<boolean>(false);

    const { escrowDetails, tokenDetails, payerWithdraw, getFees } = useEthEscrow();

    const onChange: InputNumberProps['onChange'] = async (value) => {
        const amount = value as number;
        setAmount(amount);
        console.log(amount, escrowDetails.state);
        if (amount && escrowDetails.state !== EscrowStatus.ACTIVE) {
            setFeesLoading(true);
            const fees = await getFees(amount);
            setFees(fees);
            setFeesLoading(false);
        }
    };

    const onWithdraw = async () => {
        onClose();
        await payerWithdraw(amount);
    };

    const withdrawableAmount =
        escrowDetails.state == EscrowStatus.ACTIVE
            ? escrowDetails.depositedAmount
            : escrowDetails.withdrawableAmount;

    const feesElement = feesLoading ? (
        <Skeleton.Input active size="small" />
    ) : (
        `${fees} ${tokenDetails.symbol}`
    );

    return (
        <Modal
            title="Withdraw"
            open={isOpen}
            onCancel={onClose}
            footer={[
                <Button key="back" style={{ width: '49%' }} onClick={onClose}>
                    Cancel
                </Button>,
                <Button
                    type="primary"
                    style={{ width: '49%' }}
                    onClick={onWithdraw}
                    disabled={amount <= 0}>
                    Withdraw
                </Button>
            ]}>
            <InputNumber
                addonAfter={tokenDetails.symbol}
                placeholder="Amount"
                onChange={onChange}
            />
            <p style={{ height: 25 }}>Fees: {feesElement}</p>
            <p>
                Withdrawable amount: {withdrawableAmount} {tokenDetails.symbol}
            </p>
        </Modal>
    );
};
