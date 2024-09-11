import React from 'react';
import { useEthShipment } from '@/providers/entities/EthShipmentProvider';
import { Card, Descriptions, DescriptionsProps, Flex, Tag, Typography } from 'antd';
import { ShipmentEvaluationStatus } from '@kbc-lib/coffee-trading-management-lib';
import { ConfirmButton } from '@/components/ConfirmButton/ConfirmButton';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { credentials } from '@/constants/ssi';

const { Paragraph } = Typography;

export const SeaTransportation = () => {
    const { detailedShipment, approveQuality, rejectQuality } = useEthShipment();
    const userInfo = useSelector((state: RootState) => state.userInfo);
    const isImporter = userInfo.companyClaims.role.toUpperCase() === credentials.ROLE_IMPORTER;

    if (!detailedShipment) {
        return <>Shipment not found</>;
    }

    const items: DescriptionsProps['items'] = [
        {
            key: '1',
            label: 'Quality Evaluation Status',
            children: (
                <Tag
                    color={
                        detailedShipment.shipment.qualityEvaluationStatus ===
                        ShipmentEvaluationStatus.NOT_EVALUATED
                            ? 'orange'
                            : detailedShipment.shipment.qualityEvaluationStatus ===
                                ShipmentEvaluationStatus.APPROVED
                              ? 'green'
                              : 'red'
                    }
                    key="status">
                    {ShipmentEvaluationStatus[detailedShipment.shipment.qualityEvaluationStatus]}
                </Tag>
            ),
            span: 12
        }
    ];
    if (
        isImporter &&
        detailedShipment.shipment.qualityEvaluationStatus !== ShipmentEvaluationStatus.APPROVED
    ) {
        items.push({
            key: '2',
            label: 'Have you received and are you satisfied with the goods?',
            children: (
                <Flex gap="middle">
                    <ConfirmButton
                        text="Confirm"
                        confirmText="Are you sure you want to confirm the goods?"
                        onConfirm={approveQuality}
                        type="primary"
                        block
                    />
                    <ConfirmButton
                        text="Reject"
                        confirmText="Are you sure you want to reject the goods?"
                        onConfirm={rejectQuality}
                        danger
                        block
                    />
                </Flex>
            ),
            span: 12
        });
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
                    Phase from when the ship leaves port to when the importer receives it.
                </Paragraph>
            </Card>
            <Descriptions title="Quality Evaluation" items={items} bordered />
        </>
    );
};
