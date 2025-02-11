import React from 'react';
import { Card, Descriptions, DescriptionsProps, Flex, Tag, Typography } from 'antd';
import { ShipmentDocumentTable } from '@/components/ShipmentPanel/ShipmentDocumentTable';
import { EvaluationStatus, ShipmentPhase } from '@kbc-lib/coffee-trading-management-lib';
import { ConfirmButton } from '@/components/ConfirmButton/ConfirmButton';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { credentials } from '@/constants/ssi';
import { useShipment } from '@/providers/entities/icp/ShipmentProvider';

const { Paragraph } = Typography;

export const SampleApproval = () => {
    const { detailedShipment, approveSample, rejectSample } = useShipment();
    const userInfo = useSelector((state: RootState) => state.userInfo);
    const isImporter = userInfo.companyClaims.role.toUpperCase() === credentials.ROLE_IMPORTER;

    if (!detailedShipment) {
        return <>Shipment not found</>;
    }

    const items: DescriptionsProps['items'] = [
        {
            key: '1',
            label: 'Sample Evaluation status',
            children: (
                <Tag
                    color={
                        detailedShipment.shipment.sampleEvaluationStatus === EvaluationStatus.NOT_EVALUATED
                            ? 'orange'
                            : detailedShipment.shipment.sampleEvaluationStatus === EvaluationStatus.APPROVED
                              ? 'green'
                              : 'red'
                    }
                    key="status">
                    {EvaluationStatus[detailedShipment.shipment.sampleEvaluationStatus]}
                </Tag>
            ),
            span: 12
        }
    ];
    if (isImporter && detailedShipment.shipment.sampleEvaluationStatus !== EvaluationStatus.APPROVED) {
        items.push({
            key: '2',
            label: 'Have you received and are you satisfied with the sample?',
            children: (
                <Flex gap="middle">
                    <ConfirmButton
                        text="Confirm"
                        confirmText="Are you sure you want to confirm the sample?"
                        onConfirm={approveSample}
                        type="primary"
                        block
                    />
                    <ConfirmButton text="Reject" confirmText="Are you sure you want to reject the sample?" onConfirm={rejectSample} danger block />
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
                <Paragraph>Initial stage where the exporter sends a sample of the product to the importer.</Paragraph>
            </Card>
            <ShipmentDocumentTable selectedPhase={ShipmentPhase.PHASE_1} />
            <Descriptions title="Sample" items={items} bordered />
        </>
    );
};
