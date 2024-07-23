import { Card, Col, Divider, Flex, Image, Row, Typography } from 'antd';
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import React from 'react';
import { useEthEscrow } from '@/providers/entities/EthEscrowProvider';
import { EscrowStatus } from '@kbc-lib/coffee-trading-management-lib';
import { DepositModal } from '@/components/EscrowPanel/DepositModal';
import { WithdrawModal } from '@/components/EscrowPanel/WithdrawModal';

const { Paragraph, Text } = Typography;

export const EscrowPanel = () => {
    const { escrowDetails, tokenDetails } = useEthEscrow();
    const [isDepositModalOpen, setIsDepositModalOpen] = React.useState(false);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = React.useState(false);

    const openDepositModal = () => setIsDepositModalOpen(true);
    const closeDepositModal = () => setIsDepositModalOpen(false);
    const openWithdrawModal = () => setIsWithdrawModalOpen(true);
    const closeWithdrawModal = () => setIsWithdrawModalOpen(false);

    const actions: React.ReactNode[] = [
        <Flex
            gap="middle"
            align="center"
            justify="center"
            style={{ fontSize: 16 }}
            onClick={openWithdrawModal}>
            <UploadOutlined key="withdraw" />
            Withdraw
        </Flex>,
        <Flex
            gap="middle"
            align="center"
            justify="center"
            style={{ fontSize: 16 }}
            onClick={openDepositModal}>
            <DownloadOutlined key="edit" />
            Deposit
        </Flex>
    ];

    const getDescription = (escrowStatus: EscrowStatus) => {
        switch (escrowStatus) {
            case EscrowStatus.ACTIVE:
                return (
                    <>
                        Status: <Text strong>Active</Text>. Funds have been securely deposited and
                        are held in the escrow account. The funds will remain locked in the escrow
                        until all terms are met and verified.
                    </>
                );
            case EscrowStatus.REFUNDING:
                return (
                    <>
                        Status: <Text strong>Refunding</Text>. The conditions of the agreement were
                        not met, and the process of returning the funds to the original sender has
                        been initiated.
                    </>
                );
            case EscrowStatus.WITHDRAWING:
                return (
                    <>
                        Status: <Text strong>Withdrawing</Text>. The agreed-upon conditions have
                        been met, and the process of releasing the funds to the recipient has begun.
                    </>
                );
        }
    };

    return (
        <>
            <Card
                style={{ width: '100%', background: '#E6F4FF', borderColor: '#91CAFF' }}
                actions={actions}
                role="escrow-card">
                <Row justify="space-around" align="middle">
                    <Col span={16}>
                        <Typography.Text style={{ fontSize: 'x-large' }}>
                            KBC Escrow
                        </Typography.Text>
                        <Paragraph style={{ marginTop: 20 }}>
                            Protect your transactions with our on-chain escrow service. Ensure funds
                            are released only when all agreement conditions are met, fostering trust
                            and security between parties.
                        </Paragraph>
                        <Divider plain>Details</Divider>
                        <Paragraph style={{ marginTop: 20 }}>
                            {getDescription(escrowDetails.state)}
                        </Paragraph>
                        <Paragraph>
                            Your deposits:{' '}
                            <Text strong>
                                {escrowDetails.depositedAmount} {tokenDetails.symbol}
                            </Text>
                        </Paragraph>
                        <Paragraph>
                            Total deposits:{' '}
                            <Text strong>
                                {escrowDetails.totalDepositedAmount} {tokenDetails.symbol}
                            </Text>
                        </Paragraph>
                        <Paragraph>
                            Token balance:{' '}
                            <Text strong>
                                {tokenDetails.balance} {tokenDetails.symbol}
                            </Text>
                        </Paragraph>
                    </Col>
                    <Col span={8}>
                        <Image src={'./assets/escrow.png'} preview={false} />
                    </Col>
                </Row>
            </Card>
            <WithdrawModal isOpen={isWithdrawModalOpen} onClose={closeWithdrawModal} />
            <DepositModal isOpen={isDepositModalOpen} onClose={closeDepositModal} />
        </>
    );
};
