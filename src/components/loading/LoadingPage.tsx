import { Card, Col, Row, Skeleton, Spin, Typography } from 'antd';
import loadingLogo from '@/assets/coffee-loading.gif';
import React from 'react';

const { Text } = Typography;

const LoadingPage = () => {
    return (
        <Col
            style={{
                display: 'flex',
                justifyContent: 'center',
                flexDirection: 'column'
            }}>
            <Spin
                indicator={
                    <img
                        src={loadingLogo}
                        alt="loading..."
                        style={{
                            width: 150,
                            height: 'auto'
                        }}
                    />
                }
                size={'large'}
            />

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

export default LoadingPage;
