import {Col, Image, Row, Typography} from "antd";
import React from "react";
import {showTextWithHtmlLinebreaks} from "../../utils/utils";

export enum DutiesWaiting {
    EXPORTER_PRODUCTION, EXPORTER_EXPORT, EXPORTER_SHIPPING
}

type Props = {
    waitingType: DutiesWaiting,
    message: string
}

export default function TradeDutiesWaiting(props: Props) {
    const {
        waitingType,
        message
    } = props;
    const imagePath = waitingType === DutiesWaiting.EXPORTER_PRODUCTION ? "./assets/coffee-production.jpg" : waitingType === DutiesWaiting.EXPORTER_EXPORT ? "./assets/coffee-export.webp" : "./assets/coffee-shipping.jpg";
    return(
        <Row justify="center" align="middle">
            <Col style={{ textAlign: 'center' }}>
                <Image src={imagePath} preview={false} style={{ width: '80%' }}/>
                <Typography.Title level={3}>
                    {showTextWithHtmlLinebreaks(message)}
                </Typography.Title>
            </Col>
        </Row>
    )
}
