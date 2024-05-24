import React from "react";
import {Col, Image, Row, Typography} from "antd";
import styles from "./ICPLoading.module.scss";

export default function ICPLoading() {

    return (
        <Row justify="center" align="middle" style={{ height: "85vh" }}>
            <Col style={{ textAlign: 'center' }}>
                <Image src={"./icp-logo.png"} preview={false} style={{ width: '20%' }} className={styles.resize}/>
                <Typography.Title>We are deriving your Internet Identity...</Typography.Title>
            </Col>
        </Row>
    )
};
