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


export const LegacyTransactionCertificationView = (props: CertificationViewerChildProps) => {

    return (
        <CardPage title="Self Certification">
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
                                            <DownloadOutlined className={styles.Download} onClick={() => downloadFile(`${requestPath.UNECE_BACKEND_URL}/documents/${props.certification?.document?.id}`, props.certification?.document?.fileName || 'no-name', () => console.log("Error while reading document"))} />

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
                    <Form.Item label="Shipments Reference ID" name="shippingReferenceNumbers">
                        { props.certification.shippingReferenceNumbers?.length
                            ?
                            <List
                                dataSource={props.certification.shippingReferenceNumbers}
                                renderItem={(item) => (
                                    <List.Item>{item}</List.Item>
                                )} />
                            : <Typography.Text type="secondary">No Shipments</Typography.Text>
                        }
                    </Form.Item>
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

export default LegacyTransactionCertificationView;
