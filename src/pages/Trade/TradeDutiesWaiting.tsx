import { Col, Image, Row, Typography } from 'antd';
import React, { ReactNode } from 'react';

export enum DutiesWaiting {
    EXPORTER_PRODUCTION,
    EXPORTER_EXPORT,
    EXPORTER_SHIPPING,
    IMPORTER_IMPORT
}

type Props = {
    waitingType: DutiesWaiting;
    message: string;
    marginVertical?: string;
};

const showTextWithHtmlLinebreaks = (text: string): ReactNode => {
    return (
        <>
            {text.split('\n').map((str, index) => (
                <React.Fragment key={index}>
                    {' '}
                    {str}
                    <br />{' '}
                </React.Fragment>
            ))}
        </>
    );
};

export default function TradeDutiesWaiting(props: Props) {
    const { waitingType, message, marginVertical } = props;
    const imagePaths = new Map<DutiesWaiting, string>([
        [DutiesWaiting.EXPORTER_PRODUCTION, './assets/coffee-production.jpg'],
        [DutiesWaiting.EXPORTER_EXPORT, './assets/coffee-export.webp'],
        [DutiesWaiting.EXPORTER_SHIPPING, './assets/coffee-shipping.jpg'],
        [DutiesWaiting.IMPORTER_IMPORT, './assets/coffee-import.jpeg']
    ]);
    return (
        <Row justify="center" align="middle">
            <Col style={{ textAlign: 'center', margin: `${marginVertical} 0` }}>
                <Image src={imagePaths.get(waitingType)} preview={false} style={{ width: '80%' }} />
                <Typography.Title level={3}>{showTextWithHtmlLinebreaks(message)}</Typography.Title>
            </Col>
        </Row>
    );
}
