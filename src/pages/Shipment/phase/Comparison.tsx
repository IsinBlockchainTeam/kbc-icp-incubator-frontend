import { useParams } from 'react-router-dom';
import { useEthOrderTrade } from '@/providers/entities/EthOrderTradeProvider';
import React from 'react';
import { useEthShipment } from '@/providers/entities/EthShipmentProvider';
import { Card, Col, Row, Tag, Typography } from 'antd';
import { EscrowPanel } from '@/components/EscrowPanel/EscrowPanel';
import { ShipmentEvaluationStatus } from '@kbc-lib/coffee-trading-management-lib';
import { ConfirmButton } from '@/components/ConfirmButton/ConfirmButton';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { credentials } from '@/constants/ssi';

const { Paragraph } = Typography;

export const Comparison = () => {
    const { id } = useParams();
    const { detailedShipment, confirmShipment, startShipmentArbitration } = useEthShipment();
    const { orderTrades } = useEthOrderTrade();
    const userInfo = useSelector((state: RootState) => state.userInfo);
    const isImporter = userInfo.role.toUpperCase() === credentials.ROLE_IMPORTER;

    const orderTrade = orderTrades.find((trade) => trade.tradeId === Number(id));
    if (!orderTrade) {
        return <>Order not found</>;
    }
    if (!detailedShipment) {
        return <>Shipment not found</>;
    }

    return (
        <>
            <Card
                style={{
                    width: '100%',
                    background: '#E6F4FF',
                    borderColor: '#91CAFF',
                    marginTop: 10,
                    marginBottom: 10
                }}
                role="card">
                <Paragraph>
                    This phase ranges from when the ship leaves port to when the importer receives
                    it.
                </Paragraph>
            </Card>
            <Row gutter={16} style={{ marginTop: 40, marginBottom: 40 }}>
                <Col span={12}>
                    <Typography>Status</Typography>
                </Col>
                <Col span={12}>
                    <Tag color={'orange'} key="status">
                        {ShipmentEvaluationStatus[detailedShipment.shipment.evaluationStatus]}
                    </Tag>
                </Col>
            </Row>
            {isImporter &&
                detailedShipment.shipment.evaluationStatus ===
                    ShipmentEvaluationStatus.NOT_EVALUATED && (
                    <Row gutter={16} style={{ marginTop: 40, marginBottom: 40 }}>
                        <Col span={12}>
                            <Typography>
                                Have you received and are you satisfied with the goods?
                            </Typography>
                        </Col>
                        <Col span={6}>
                            <ConfirmButton
                                text="Confirm"
                                confirmText="Are you sure you want to confirm this shipment?"
                                onConfirm={confirmShipment}
                                type="primary"
                                block
                            />
                        </Col>
                        <Col span={6}>
                            <ConfirmButton
                                text="Start Arbitration"
                                confirmText="Are you sure you want to start an arbitration for this shipment?"
                                onConfirm={startShipmentArbitration}
                                danger
                                block
                            />
                        </Col>
                    </Row>
                )}
            <EscrowPanel />
        </>
    );
};
