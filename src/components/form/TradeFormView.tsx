import React, {useEffect, useState} from "react";
import {Button, Col, Divider, Form, Input, Row, Space} from "antd";
import TextArea from "antd/es/input/TextArea";
import {useNavigate, useParams} from "react-router-dom";
import {DownloadOutlined, SafetyCertificateOutlined, WarningOutlined} from "@ant-design/icons"
import styles from "./TradeForm.module.scss";
import {SpecialZoomLevel, Viewer, ViewMode} from '@react-pdf-viewer/core';
import {downloadFile} from "../../utils/utils";
import DatePicker from "../DatePicker/DatePicker";
import dayjs from "dayjs";
import {requestPath} from "../../constants";
import {Company, ConfirmationTradePresentable} from "@unece/cotton-fetch";
import {TradeService} from "../../api/services/TradeService";
import {LegacyTradeStrategy} from "../../api/strategies/trade/LegacyTradeStrategy";

type Props = {
    tradeType: string,
    documentTypeTitle: string,
    validFromTitle: string,
    validUntilTitle?: string,
}

export const TradeFormView = (props: Props) => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [trade, setTrade] = useState<ConfirmationTradePresentable>();

    const getTradeInfo = async (id: number, tradeType: string) => {
        let resp;
        const tradeService = new TradeService(new LegacyTradeStrategy());
        if (tradeType === "contract") resp = await tradeService.getContractById(id);
        else if (tradeType === "order") resp = await tradeService.getOrderById(id);
        else if (tradeType === "shipping") resp = await tradeService.getShippingById(id);

        resp && setTrade(resp);
    }

    useEffect(() => {
        (async () => {
            await getTradeInfo(parseInt(id!), props.tradeType);
        })();
    }, []);

    const positionRows = trade?.positions?.map((position, index) => {
        return <div key={index} >
            <Row gutter={[8, 8]}>
                <Col span={12}>
                    <Form.Item label="Buyer Material Name" name="consigneeMaterialName">
                        <Input placeholder={position.consigneeMaterialName} />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item label="Supplier Material Name" name="contractorMaterialName">
                        <Space.Compact block>
                            <Input placeholder={position.contractorMaterialName} />
                            <Button disabled={false} type="primary" onClick={() => navigate(`/graph/${position.contractorMaterialId}`)}>Show Supply Chain</Button>
                        </Space.Compact>
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={[8, 8]}>
                <Col span={8}>
                    <Form.Item label="Quantity" name="quantity">
                        <Input placeholder={`${position.quantity}`} />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item label="Unit" name="unit">
                        <Input placeholder={`${position.unit}`} />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item label="Weight (kg)" name="weight">
                        <Input placeholder={`${position.weight}`} />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={[8, 8]}>
                <Col span={24}>
                    <Form.Item label="Description" name="description">
                        <TextArea rows={5} placeholder={`${position.externalDescription}`}/>
                    </Form.Item>
                </Col>
            </Row>
        </div>
    });

    if (!trade)
        return (
            <div>Loading...</div>
        )
    return (
        <Form layout="vertical" disabled fields={[
            {name: ['contractorName'], value: trade.contractorName},
            {name: ['validFrom'], value: dayjs(trade.validFrom)}
        ]}>
            <Row gutter={[8, 8]}>
                <Col span={12}>
                    <Form.Item label="Supplier/Contractor" name="contractorName">
                        <Input />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item label="Supplier email" name="contractorEmail">
                        <Input placeholder={trade?.contractorEmail} />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={[8, 8]}>
                <Col span={12}>
                    <Form.Item label="Buyer/Consignee" name="consigneeName">
                        <Input placeholder={trade?.consigneeName} />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item label="Supplier email" name="consigneeEmail">
                        <Input placeholder={trade?.consigneeEmail} />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={[8, 8]}>
                <Col span={12}>
                    <Row gutter={[8, 8]}>
                        <Col span={24}>
                            <Form.Item label={props.documentTypeTitle} name="documentType">
                                <Input placeholder={trade?.documentType} />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item label="Assessment Reference Standard" name="assessmentStandard">
                                <Input placeholder={trade?.processingStandardName ? trade.processingStandardName : 'No assessment standard specified'} />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item label={props.validFromTitle} name="validFrom">
                                <DatePicker />
                            </Form.Item>
                        </Col>
                        { props.validUntilTitle &&
                            <Col span={24}>
                                <Form.Item label={props.validUntilTitle} name="validUntil">
                                    <DatePicker defaultValue={dayjs(trade?.validUntil)} />
                                </Form.Item>
                            </Col>
                        }
                        <Col span={24}>
                            <Form.Item label="Notes" name="notes">
                                <TextArea rows={5} placeholder={trade.notes} />
                            </Form.Item>
                        </Col>
                    </Row>
                </Col>
                <Col span={12}>
                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <Form.Item className={styles.DocumentArea}>
                                {trade?.document ?
                                    <div style={{display: "flex", flexDirection: "row"}}>
                                        <div className={styles.DocumentPreview} >
                                            { trade.document.contentType?.includes("pdf") ?
                                                <div className={styles.Preview} style={{maxHeight: `calc(${props.validUntilTitle ? 5: 4} * 102px`}}>
                                                    <Viewer
                                                        fileUrl={"data:application/pdf;base64," + trade.document?.content}
                                                        viewMode={ViewMode.SinglePage}
                                                        defaultScale={SpecialZoomLevel.ActualSize}
                                                    />
                                                </div>
                                                :
                                                trade.document.contentType?.includes("image") ?
                                                    <img
                                                        src={"data:" + trade.document.contentType + ";base64, " + trade.document.content}
                                                        style={{width: '100%'}}
                                                    />
                                                    :
                                                    <p className={`${styles.ErrorText} ${styles.DocumentPreview} text-center`}>Preview not supported</p>
                                            }

                                        </div>
                                        <DownloadOutlined  className={styles.Download} onClick={() => downloadFile(`${requestPath.BACKEND_BASE_URL}/documents/${trade?.document?.id}`, trade?.document?.fileName || 'no-name', () => console.log("Error while reading document"))} />

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
                    <Form.Item label="Supplier Reference ID" name="contractorReferenceNumber">
                        <Input placeholder={trade?.contractorReferenceNumber} />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item label="Buyer Reference ID" name="consigneeReferenceNumber">
                        <Input placeholder={trade?.consigneeReferenceNumber} />
                    </Form.Item>
                </Col>
            </Row>

            <Divider />

            <h1>Line Items</h1>
            { positionRows }
        </Form>
    );
}

export default TradeFormView;
