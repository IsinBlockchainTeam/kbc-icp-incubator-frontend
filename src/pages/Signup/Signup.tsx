import {Button, Card, Col, Divider, Form, Input, Row,} from 'antd';
import React, {useState} from 'react';
import Title from "antd/es/typography/Title";
import styles from "./Signup.module.scss";
import {mattrCredentialController} from "../../api"
import RangePicker from "../../components/RangePicker/RangePicker";
import {useNavigate} from "react-router-dom";
import {paths} from "../../constants";
import {NotificationType, openNotification} from "../../utils/notification";

type CredentialFormValues = {
    name: string,
    description: string,
    subjectName: string,
    subjectDID: string,
    dateRange: any[]
}

export const Signup = () => {
    const navigate = useNavigate();

    const [waitingApi, setWaitingApi] = useState<boolean>(false);

    const submit = async (values: CredentialFormValues) => {
        const body = {
            name: values.name,
            description: values.description,
            subjectName : values.subjectName,
            subjectDID : values.subjectDID,
            expDate : values.dateRange[1]
        }
        setWaitingApi(true);
        await mattrCredentialController.create(body);
        setWaitingApi(false);
        openNotification('Credential creation', 'Open you Mattr mobile application to accept the incoming new credential', NotificationType.INFO);
        setTimeout(() => navigate(paths.HOME), 3000);
    }

    return (
        <Card className={styles.SignupContainer}>
            <Title>Credential registration</Title>
            <Form layout="vertical" onFinish={submit}>
                <Row gutter={[8, 8]}>
                    <Divider orientation="left">Info</Divider>
                    <Col xs={24} md={12}>
                        <Form.Item label="Name" name="name">
                            <Input/>
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item label="Description" name="description">
                            <Input/>
                        </Form.Item>
                    </Col>
                    <Divider orientation="left">Subject</Divider>
                    <Col xs={24} md={12}>
                        <Form.Item label="Name" name="subjectName">
                            <Input/>
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item label="DID" name="subjectDID">
                            <Input/>
                        </Form.Item>
                    </Col>

                    <Col span={24}>
                        <Form.Item label="Expiration date" name="dateRange">
                            <RangePicker />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item >
                            <Button type="primary" htmlType="submit" loading={waitingApi}>Confirm</Button>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Card>
    )
}

export default Signup;
