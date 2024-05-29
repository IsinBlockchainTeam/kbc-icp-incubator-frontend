import {Col, Image, Row, Typography} from "antd";

// TODO: DEMO ONLY!! Remove this!!!
export default function ConfirmedTradeView() {
    return(
        <Row justify="center" align="middle">
            <Col style={{ textAlign: 'center' }}>
                <Image src={"./coffee-production.jpg"} preview={false} style={{ width: '80%' }}/>
                <Typography.Title level={3}>The exporter has not uploaded the Payment Invoice yet.<br />
                    You will be notified when there are new developments.</Typography.Title>
            </Col>
        </Row>
    )
}
