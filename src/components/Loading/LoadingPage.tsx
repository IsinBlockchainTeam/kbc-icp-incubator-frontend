import { Card, Col, Row, Skeleton, Typography } from 'antd';
import React from 'react';

const { Text } = Typography;

export const LoadingPage = () => {
    return (
        <Col
            style={{
                display: 'flex',
                justifyContent: 'center',
                flexDirection: 'column'
            }}>
            <Card>
                <Skeleton.Input active size="large" block />

                <Skeleton
                    active
                    paragraph={{
                        rows: 3,
                        width: ['100%', '80%', '60%']
                    }}
                    title={false}
                />

                <Skeleton.Button active size="large" block />
            </Card>

            <Row justify={'center'} style={{ paddingTop: 8 }}>
                <Col style={{ display: 'flex', flexDirection: 'column' }}>
                    <Text strong={true}>Loading your content...</Text>
                    <Text>This may take a few moments</Text>
                </Col>
            </Row>
        </Col>
    );
};
