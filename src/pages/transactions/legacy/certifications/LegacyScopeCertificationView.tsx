import React from "react";
import {CardPage} from "../../../../components/structure/CardPage/CardPage";
import {Col, Form, Input, List, Row, Typography} from "antd";
import TextArea from "antd/es/input/TextArea";
import dayjs from "dayjs";
import styles from "./LegacyCertificationView.module.scss";
import {DownloadOutlined} from "@ant-design/icons";
import {SpecialZoomLevel, Viewer, ViewMode} from "@react-pdf-viewer/core";
import {downloadFile} from "../../../../utils/utils";
import {requestPath} from "../../../../constants";
import DatePicker from "../../../../components/DatePicker/DatePicker";
import {CertificationViewerChildProps} from "./LegacyCertificationView";


export const LegacyScopeCertificationView = (props: CertificationViewerChildProps) => {

    return (
        <CardPage title="Scope Certification">
            <Form layout="vertical" disabled fields={[
                {name: ['validFrom'], value: dayjs(props.certification.validFrom)},
                {name: ['validUntil'], value: dayjs(props.certification.validUntil)},
            ]}>
                <Row gutter={[8, 8]}>
                    <Col span={12}>
                        <Form.Item label="Verifier" name="contractorName">
                            <Input placeholder={props.certification.contractorName} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Document Type" name="documentType">
                            <Input placeholder={props.certification.documentType} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={[8, 8]}>
                    <Col span={12}>
                        <Form.Item label="Verifier Email" name="contractorEmail">
                            <Input placeholder={props.certification.contractorEmail} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Assessment Standard" name="processingStandardName">
                            <Input placeholder={props.certification.processingStandardName} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={[8, 8]}>
                    <Col span={12}>
                        <Row gutter={[8, 8]}>
                            <Col span={24}>
                                <Form.Item label="Company" name="consigneeName">
                                    <Input placeholder={props.certification.consigneeName} />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item label="Company Email" name="consigneeEmail">
                                    <Input placeholder={props.certification.consigneeEmail} />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item label="Report ID" name="certificateReferenceNumber">
                                    <Input placeholder={props.certification.certificateReferenceNumber} />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item label="Notes" name="notes">
                                    <TextArea rows={5} placeholder={props.certification.notes} />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Col>
                    <Col span={12}>
                        <Row gutter={[16, 16]}>
                            <Col span={24}>
                                <Form.Item className={styles.DocumentArea}>
                                    {props.certification?.document ?
                                        <div style={{display: "flex", flexDirection: "row"}}>
                                            <div className={styles.DocumentPreview} >
                                                { props.certification.document.contentType?.includes("pdf") ?
                                                    <div className={styles.Preview} style={{maxHeight: `calc(4 * 102px`}}>
                                                        <Viewer
                                                            fileUrl={"data:application/pdf;base64," + props.certification.document?.content}
                                                            viewMode={ViewMode.SinglePage}
                                                            defaultScale={SpecialZoomLevel.ActualSize}
                                                        />
                                                    </div>
                                                    :
                                                    props.certification.document.contentType?.includes("image") ?
                                                        <img
                                                            src={"data:" + props.certification.document.contentType + ";base64, " + props.certification.document.content}
                                                            style={{width: '100%'}}
                                                        />
                                                        :
                                                        <p className={`${styles.ErrorText} ${styles.DocumentPreview} text-center`}>Preview not supported</p>
                                                }

                                            </div>
                                            <DownloadOutlined  className={styles.Download} onClick={() => downloadFile(`${requestPath.BACKEND_BASE_URL}/documents/${props.certification?.document?.id}`, props.certification?.document?.fileName || 'no-name', () => console.log("Error while reading document"))} />

                                        </div>
                                        :
                                        <p className={`${styles.ErrorText} ${styles.Preview} text-center`}>Cannot load the document</p>
                                    }
                                </Form.Item>
                            </Col>
                        </Row>
                    </Col>
                </Row>

                <Row gutter={[8, 8]}>
                    <Col span={12}>
                        <Form.Item label="Assessment Level" name="assessmentType">
                            <Input placeholder={props.certification.assessmentType} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Product Categories" name="productCategories">
                            { props.certification.productCategories?.length
                                ?
                                <List
                                    dataSource={props.certification.productCategories}
                                    renderItem={(item) => (
                                        <List.Item>{item}</List.Item>
                                    )} />
                                : <Typography.Text type="secondary">No Product Categories</Typography.Text>
                            }
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={[8, 8]}>
                    <Col span={12}>
                        <Form.Item label="Process Types" name="processTypes">
                            { props.certification.processTypes?.length
                                ?
                                <List
                                    dataSource={props.certification.processTypes}
                                    renderItem={(item) => (
                                        <List.Item>{item}</List.Item>
                                    )} />
                                : <Typography.Text type="secondary">No Process Types</Typography.Text>
                            }
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Materials (output)" name="outputMaterials">
                            { props.certification.outputMaterials?.length
                                ?
                                <List
                                    dataSource={props.certification.outputMaterials}
                                    renderItem={(item) => (
                                        <List.Item>{item.name}</List.Item>
                                    )} />
                                : <Typography.Text type="secondary">No Output Materials</Typography.Text>
                            }
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={[8, 8]}>
                    <Col span={12}>
                        <Form.Item label="Valid From" name="validFrom">
                            <DatePicker />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Valid Until" name="validUntil">
                            <DatePicker />
                        </Form.Item>
                    </Col>
                </Row>

            </Form>
        </CardPage>
    );
}

export default LegacyScopeCertificationView;
