import { Card, Col, Divider, Flex, Image, Row, Tag, Typography } from 'antd';
import React, { useEffect } from 'react';
import { useEthDownPayment } from '@/providers/entities/evm/EthDownPaymentProvider';
import { DepositModal } from '@/components/DownPaymentPanel/DepositModal';
import { WithdrawModal } from '@/components/DownPaymentPanel/WithdrawModal';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { credentials } from '@/constants/ssi';
import { FundStatus } from '@kbc-lib/coffee-trading-management-lib';
import { useShipment } from '@/providers/entities/icp/ShipmentProvider';
import { DownloadOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';

const { Paragraph, Text } = Typography;

const DownPaymentHeader = () => {
    return (
        <>
            <Typography.Text style={{ fontSize: 'x-large' }}>Alcomex Down payment</Typography.Text>
            <Paragraph style={{ marginTop: 20 }}>
                Protect your transactions with our on-chain down payment service. Ensure funds are released only when all agreement conditions are
                met, fostering trust and security between parties.
            </Paragraph>
            <Divider plain>Details</Divider>
        </>
    );
};

export const DownPaymentPanel = () => {
    const { detailedShipment, determineDownPaymentAddress } = useShipment();
    const { exists, downPaymentDetails, tokenDetails, loadDownPaymentDetails } = useEthDownPayment();
    const userInfo = useSelector((state: RootState) => state.userInfo);
    const isImporter = userInfo.companyClaims.role.toUpperCase() === credentials.ROLE_IMPORTER;

    const [refresh, setRefresh] = React.useState(false);
    const [isDepositModalOpen, setIsDepositModalOpen] = React.useState(false);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = React.useState(false);

    useEffect(() => {
        if (refresh) loadDownPaymentDetails();
    }, [refresh]);

    if (!detailedShipment) {
        return <>Shipment not created</>;
    }

    const onDetermineDownPaymentAddressClick = async () => {
        await determineDownPaymentAddress();
        setRefresh(!refresh);
    };

    const openDepositModal = () => setIsDepositModalOpen(true);
    const closeDepositModal = () => setIsDepositModalOpen(false);
    const openWithdrawModal = () => setIsWithdrawModalOpen(true);
    const closeWithdrawModal = () => setIsWithdrawModalOpen(false);

    if (!exists) {
        return (
            <Card
                actions={[
                    <Flex gap="middle" align="center" justify="center" style={{ fontSize: 16 }} onClick={onDetermineDownPaymentAddressClick}>
                        <PlusOutlined key="withdraw" />
                        Determine Down Payment
                    </Flex>
                ]}
                style={{ width: '100%', background: '#E6F4FF', borderColor: '#91CAFF' }}
                role="down-payment-card">
                <Row justify="space-around" align="middle">
                    <Col span={16}>
                        <DownPaymentHeader />
                        <Paragraph>Down payment contract not determined yet.</Paragraph>
                    </Col>
                    <Col span={8}>
                        <Image src={'./assets/down-payment.png'} preview={false} />
                    </Col>
                </Row>
            </Card>
        );
    }

    const actions: React.ReactNode[] = [];
    if (isImporter) {
        actions.push(
            <Flex gap="middle" align="center" justify="center" style={{ fontSize: 16 }} onClick={openWithdrawModal}>
                <UploadOutlined key="withdraw" />
                Withdraw
            </Flex>
        );
        actions.push(
            <Flex gap="middle" align="center" justify="center" style={{ fontSize: 16 }} onClick={openDepositModal}>
                <DownloadOutlined key="edit" />
                Deposit
            </Flex>
        );
    }

    return (
        <>
            <Card style={{ width: '100%', background: '#E6F4FF', borderColor: '#91CAFF' }} actions={actions} role="down-payment-card">
                <Row justify="space-around" align="middle">
                    <Col span={16}>
                        <DownPaymentHeader />
                        <Paragraph>
                            Shipping funds status: <Tag color="blue">{FundStatus[detailedShipment.shipment.fundsStatus]}</Tag>
                        </Paragraph>
                        <Paragraph>
                            Your deposits:{' '}
                            <Text strong>
                                {downPaymentDetails.depositedAmount} {tokenDetails.symbol}
                            </Text>
                        </Paragraph>
                        <Paragraph>
                            Total deposits:{' '}
                            <Text strong>
                                {downPaymentDetails.totalDepositedAmount} {tokenDetails.symbol}
                            </Text>
                        </Paragraph>
                        <Paragraph>
                            Already locked funds:{' '}
                            <Text strong>
                                {downPaymentDetails.lockedAmount} {tokenDetails.symbol}
                            </Text>
                        </Paragraph>
                        <Paragraph>
                            Down payment balance:{' '}
                            <Text strong>
                                {downPaymentDetails.balance} {tokenDetails.symbol}
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
                        <Image src={'./assets/down-payment.png'} preview={false} />
                    </Col>
                </Row>
            </Card>
            <WithdrawModal isOpen={isWithdrawModalOpen} onClose={closeWithdrawModal} />
            <DepositModal isOpen={isDepositModalOpen} onClose={closeDepositModal} />
        </>
    );
};
