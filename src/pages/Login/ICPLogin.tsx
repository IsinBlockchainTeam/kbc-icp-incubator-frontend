import {Col, Image, Row, Typography} from "antd";
import "./ICPLogin.css";

export default function ICPLogin() {

    return (
        <Row justify="center" align="middle" style={{ height: "85vh" }}>
            <Col style={{ textAlign: 'center' }}>
                <Image src={"./assets/icp-logo.png"} preview={false} style={{ width: '20%' }} className="resize"/>
                <Typography.Title>We are deriving your Internet Identity...</Typography.Title>
            </Col>
        </Row>
    )
};
