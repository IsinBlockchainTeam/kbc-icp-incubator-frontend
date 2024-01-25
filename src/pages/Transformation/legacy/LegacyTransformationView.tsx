import React, {useEffect, useState} from "react";
import {CardPage} from "../../../components/structure/CardPage/CardPage";
import {Button, Col, Divider, Form, Input, List, Row, Space, Typography} from "antd";
import styles from './LegacyTransformation.module.scss';
import TextArea from "antd/es/input/TextArea";
import dayjs from "dayjs";
import DatePicker from "../../../components/DatePicker/DatePicker";
import {useNavigate, useParams} from "react-router-dom";
import {ConfirmationCertificationPresentable, TransformationPlanPresentable} from "@unece/cotton-fetch";
import {TransformationService} from "../../../api/services/TransformationService";
import {LegacyTransformationStrategy} from "../../../api/strategies/transformation/LegacyTransformationStrategy";
import {CertificationService} from "../../../api/services/CertificationService";
import {LegacyCertificationStrategy} from "../../../api/strategies/certification/LegacyCertificationStrategy";


export const LegacyTransformationView = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [transformation, setTransformation] = useState<TransformationPlanPresentable>();
    const [certifications, setCertifications] = useState<ConfirmationCertificationPresentable[]>([]);
    const getTransformationInfo = async (id: number) => {
        const transformationService = new TransformationService(new LegacyTransformationStrategy());
        const resp = await transformationService.getTransformationById(id);
        resp && setTransformation(resp);
    }

    const getTransformationCertifications = async (id: number) => {
        const certificationService = new CertificationService(new LegacyCertificationStrategy());
        const resp = await certificationService.getCertificationsByTransactionId(id, 'transformation') as ConfirmationCertificationPresentable[];
        resp && setCertifications(resp);
    }

    useEffect(() => {
        (async function loadDropdownInfo() {
            await getTransformationInfo(parseInt(id!));
            await getTransformationCertifications(parseInt(id!));
        })();
    }, []);

    const positionRows = transformation?.inputPositions?.map((position, index) => {
        return <div key={index} >
            <Row gutter={[8, 8]}>
                <Col span={10}>
                    <Form.Item label="Material (input)" name="contractorMaterialName">
                        <Input placeholder={position.contractorMaterialName} />
                    </Form.Item>
                </Col>
                <Col span={10}>
                    <Form.Item label="Supplier" name="contractorSupplierName">
                        <Input placeholder={position.contractorSupplierName} />
                    </Form.Item>
                </Col>
                <Col span={4}>
                    <Form.Item label="Percentage / Value" name="quantity">
                        <Input placeholder={`${position.quantity}`} />
                    </Form.Item>
                </Col>
            </Row>
        </div>
    });

    if (!transformation)
        return (
            <div>Loading...</div>
        )
    return (
        <CardPage title="Transformation">

            <Form layout="vertical" disabled fields={[
                {name: ['name'], value: transformation.name},
                {name: ['validFrom'], value: dayjs(transformation.validFrom)},
                {name: ['validUntil'], value: dayjs(transformation.validUntil)}
            ]}>
                <Row gutter={8}>
                    <Col span={12}>
                        <Form.Item label="Name" name="name">
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Material (output)" name="outputMaterialName">
                            <Space.Compact block>
                                <Input placeholder={transformation?.outputMaterial?.name} />
                                <Button disabled={false} type="primary" onClick={() => navigate(`/graph/${transformation?.outputMaterial?.id}`)}>Show Supply Chain</Button>
                            </Space.Compact>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={[8, 8]}>
                    <Col span={12}>
                        <Form.Item label="Assessment Reference Standards" name="processingStandardList">
                            { transformation.processingStandardList?.length
                                ?
                                <List
                                dataSource={transformation.processingStandardList}
                                renderItem={(item) => (
                                    <List.Item>{item.name}</List.Item>
                                )} />
                                : <Typography.Text type="secondary">No Standards</Typography.Text>
                            }
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Product category" name="productCategoryName">
                            <Input placeholder={transformation?.productCategory?.name} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={[8, 8]}>
                    <Col span={12}>
                        <Form.Item label="Process types" name="processTypeList">
                            <List
                                dataSource={transformation.processTypeList}
                                renderItem={(item) => (
                                    <List.Item>{`${item.code} - ${item.name}`}</List.Item>
                                )} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Notes" name="notes">
                            <TextArea rows={5} placeholder={transformation.notes} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={[8, 8]}>
                    <Col span={12}>
                        <Form.Item label="Start Date" name="validFrom">
                            <DatePicker />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="End Date" name="validUntil">
                            <DatePicker />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={[8, 8]}>
                    <Col span={12}>
                        <Form.Item label="Traceability Level" name="traceabilityLevel">
                            <Input placeholder={transformation?.traceabilityLevel} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Transparency Level" name="transparencyLevel">
                            <Input placeholder={transformation?.transparencyLevel} />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider />

                <h1>Line Items</h1>
                { positionRows }

                <Row gutter={[8, 8]}>
                    <Col span={24}>
                        <Form.Item label="Certificates" className={styles.ButtonsContainer}>
                            {
                                certifications.length > 0
                                ? certifications.map((certificate, index) => {
                                        const refStd = certificate?.processingStandardName;
                                        const certType = certificate?.subject?.toLowerCase();
                                        return (
                                            <Button disabled={false} className={styles.CertificateButton} key={'cert_id'} onClick={() => navigate(`/certifications/${certType}/${certificate.id}`)}>
                                                {`Show certificate ${certifications.length > 1 ? index : ''} ${refStd && '- '+refStd} `}
                                            </Button>
                                        )
                                    })
                                    : <Typography.Text type="secondary">No Certificates</Typography.Text>
                            }
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </CardPage>
    );
}

export default LegacyTransformationView;
