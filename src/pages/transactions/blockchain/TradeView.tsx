import React, {useEffect, useState} from "react";
import {CardPage} from "../../../components/structure/CardPage/CardPage";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import {TradeService} from "../../../api/services/TradeService";
import {Button, Carousel, Col, Collapse, Divider, Form, Input, Row, Space, Spin, Tag} from "antd";
import styles from "../../../components/form/TradeForm.module.scss";
import dayjs from "dayjs";
import DatePicker from "../../../components/DatePicker/DatePicker";
import {ScrollMode, SpecialZoomLevel, Viewer, ViewMode} from "@react-pdf-viewer/core";
import {getEnumKeyByValue, isValueInEnum} from "../../../utils/utils";
import {TradePresentable} from "../../../api/types/TradePresentable";
import {DocumentPresentable} from "../../../api/types/DocumentPresentable";
import {BlockchainTradeStrategy} from "../../../api/strategies/trade/BlockchainTradeStrategy";
import {DocumentService} from "../../../api/services/DocumentService";
import {BlockchainDocumentStrategy} from "../../../api/strategies/document/BlockchainDocumentStrategy";
import {TradeType} from "@kbc-lib/coffee-trading-management-lib";
import {getWalletAddress} from "../../../utils/storage";

export const TradeView = () => {
    const navigate = useNavigate();
    const {id} = useParams();
    const location = useLocation();
    const type = parseInt(new URLSearchParams(location.search).get('type')!);

    const [trade, setTrade] = useState<TradePresentable>();
    const [documents, setDocuments] = useState<DocumentPresentable[]>();
    const [loadingDocuments, setLoadingDocuments] = useState<boolean>(true);

    const getTradeInfo = async (id: number, type: number) => {
        const tradeService = new TradeService(new BlockchainTradeStrategy());
        const resp = await tradeService.getTradeByIdAndType(id, type);
        resp && setTrade(resp);
    }

    const getTradeDocuments = async (id: number) => {
        const documentService = new DocumentService(new BlockchainDocumentStrategy());
        const resp = await documentService.getDocumentsByTransactionIdAndType(id, 'trade');
        resp && setDocuments(resp);
    }

    const printConstraint = (constraint: string | Date | undefined): string => {
        if (!constraint) return 'Not specified';
        return constraint instanceof Date ? constraint.toLocaleDateString() : constraint;
    }

    useEffect(() => {
        (async () => {
            await getTradeInfo(parseInt(id!), type);
            await getTradeDocuments(parseInt(id!));
            setLoadingDocuments(false);
        })();
    }, []);

    const positionRows = trade?.lines?.map((line, index) => {
        const lineRow = <Row gutter={[8, 8]} key={index}>
            <Col span={10}>
                <Form.Item label="Material Name" name="materialName">
                    <Space.Compact block>
                            <Input placeholder={line.material ? line.material.name: "No material assigned"} />
                            <Button disabled={!line.material} type="primary"
                                    onClick={() => navigate(`/graph/${line.material?.id}${trade?.supplier.toLowerCase() !== getWalletAddress()?.toLowerCase() ? `?supplier=${trade?.supplier}` : ''}`)}>
                                Show Supply Chain
                            </Button>
                    </Space.Compact>
                </Form.Item>
            </Col>
            { type === TradeType.ORDER &&
                <>
                    <Col span={10}>
                        <Form.Item label="Quantity" name="quantity">
                            <Input placeholder={`${line.quantity}`} />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item label="Price" name="price">
                            <Input placeholder={`${line.price?.amount} ${line.price?.fiat}`} />
                        </Form.Item>
                    </Col>
                </>
            }
        </Row>;

        const documentsCarousel = <Carousel className={styles.CustomCarousel} dotPosition="top">
            { documents?.filter(d => d.transactionLines?.map(l => l.id).includes(line.id)).length ?
                documents.filter(d => d.transactionLines?.map(l => l.id).includes(line.id)).map(document => {
                    return <div className={styles.DocumentArea} key={document.id}>
                        { document.contentType?.includes("pdf") ?
                            <div className={styles.Preview} style={{maxHeight: `calc(5 * 120px)`, overflow: 'scroll'}}>
                                <Viewer
                                    fileUrl={URL.createObjectURL(document.content!)}
                                    viewMode={ViewMode.SinglePage}
                                    defaultScale={SpecialZoomLevel.PageWidth}
                                    scrollMode={ScrollMode.Vertical}
                                />
                            </div>
                            :
                            document.contentType?.includes("image") ?
                                <img
                                    src={URL.createObjectURL(document.content!)}
                                    style={{width: '100%'}}
                                />
                                :
                                <p className={`${styles.ErrorText} ${styles.DocumentPreview} text-center`}>Preview not supported</p>
                        }
                    </div>
                })
                :
                <div>There are no documents</div>
            }
        </Carousel>;

        return <div key={index} >
            <Row gutter={[8, 8]}>
                <Col span={24}>
                    <Collapse ghost items={[{
                        key: '1',
                        label: lineRow,
                        children: documentsCarousel
                    }]} />
                </Col>
            </Row>
        </div>
    });

    if (!trade)
        return <Spin style={{width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}/>;
    if (!isValueInEnum(type, TradeType))
        return <div>Wrong type</div>;

    return (
        <CardPage title={
            <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                {getEnumKeyByValue(TradeType, type)}
                {trade.status && <Tag color='green' key={trade.status}>{trade.status?.toUpperCase()}</Tag>}
            </div>}>
            <Form layout="vertical" disabled fields={[
                {name: ['paymentDeadline'], value: dayjs(trade.paymentDeadline)},
                {name: ['documentDeliveryDeadline'], value: dayjs(trade.documentDeliveryDeadline)},
                {name: ['deliveryDeadline'], value: dayjs(trade.deliveryDeadline)},
                {name: ['shippingDeadline'], value: dayjs(trade.shippingDeadline)},
            ]}>
                <Row gutter={[8, 8]}>
                    <Col style={{flex: 1}}>
                        <Form.Item label="Supplier" name="supplier">
                            <Input placeholder={trade.supplier}/>
                        </Form.Item>
                    </Col>
                    <Col style={{flex: 1}}>
                        { type === TradeType.ORDER ?
                            <Form.Item label="Customer" name="customer">
                                <Input placeholder={trade.customer} />
                            </Form.Item>
                            :
                            <Form.Item label="Name" name="name">
                                <Input placeholder={trade.name} />
                            </Form.Item>
                        }

                    </Col>
                </Row>

                { type === TradeType.ORDER &&
                    <>
                        <Divider>Constraints</Divider>
                        <Row gutter={[8, 8]}>
                            <Col span={4}>
                                <Form.Item label="Incoterms" name="incoterms">
                                    <Input placeholder={printConstraint(trade.incoterms)}/>
                                </Form.Item>
                            </Col>
                            <Col span={10}>
                                <Form.Item label="Payment Deadline" name="paymentDeadline">
                                    <DatePicker/>
                                </Form.Item>
                            </Col>
                            <Col span={10}>
                                <Form.Item label="Document Delivery Deadline" name="documentDeliveryDeadline">
                                    <DatePicker/>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={[8, 8]}>
                            <Col span={12}>
                                <Form.Item label="Shipper" name="shipper">
                                    <Input placeholder={printConstraint(trade.shipper)}/>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Arbiter" name="arbiter">
                                    <Input placeholder={printConstraint(trade.arbiter)}/>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={[8, 8]}>
                            <Col span={12}>
                                <Form.Item label="Shipping Port" name="shippingPort">
                                    <Input placeholder={printConstraint(trade.shippingPort)}/>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Shipping Deadline" name="shippingDeadline">
                                    <DatePicker/>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={[8, 8]}>
                            <Col span={12}>
                                <Form.Item label="Delivery Port" name="deliveryPort">
                                    <Input placeholder={printConstraint(trade.deliveryPort)}/>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Delivery Deadline" name="deliveryDeadline">
                                    <DatePicker/>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={[8, 8]}>
                            <Col span={12}>
                                <Form.Item label="Escrow" name="escrow">
                                    <Input placeholder={printConstraint(trade.escrow)}/>
                                </Form.Item>
                            </Col>
                        </Row>
                    </>
                }

                <Row gutter={[8, 8]}>
                    <Col span={24}>
                        <Carousel className={styles.CustomCarousel} dotPosition="top">
                            {loadingDocuments ? (<Spin/>)
                                : (
                                    documents ?
                                        documents.filter(d => !d.transactionLines).map(document => {
                                            return <div className={styles.DocumentArea} key={document.id}>
                                                {document.contentType?.includes("pdf") ?
                                                    <div className={styles.Preview}
                                                         style={{maxHeight: `calc(5 * 120px)`, overflow: 'scroll'}}>
                                                        <Viewer
                                                            fileUrl={URL.createObjectURL(document.content!)}
                                                            viewMode={ViewMode.SinglePage}
                                                            defaultScale={SpecialZoomLevel.PageWidth}
                                                            scrollMode={ScrollMode.Vertical}
                                                        />
                                                    </div>
                                                    :
                                                    document.contentType?.includes("image") ?
                                                        <img
                                                            src={URL.createObjectURL(document.content!)}
                                                            style={{width: '100%'}}
                                                        />
                                                        :
                                                        <p className={`${styles.ErrorText} ${styles.DocumentPreview} text-center`}>Preview
                                                            not supported</p>
                                                }
                                            </div>
                                        })
                                        :
                                        <div>There are no documents</div>

                                )
                            }

                        </Carousel>
                    </Col>
                </Row>

                <Divider/>

                <h1>Line Items</h1>
                {positionRows}
            </Form>
        </CardPage>
    )
}

export default TradeView;
