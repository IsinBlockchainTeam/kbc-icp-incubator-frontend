import React from "react";
import {CardPage} from "../../../components/structure/CardPage/CardPage";
import {FormElementType, GenericForm} from "../../../components/GenericForm/GenericForm";
import {Spin, Tag} from "antd";
import {EditOutlined} from "@ant-design/icons";
import {TradeType} from "@kbc-lib/coffee-trading-management-lib";
import {getEnumKeyByValue, isValueInEnum} from "../../../utils/utils";
import {useNavigate} from "react-router-dom";
import useTradeView from "./logic/tradeView";
import PDFViewer from "../../../components/PDFViewer/PDFViewer";

export const TradeView = () => {
    const navigate = useNavigate();
    const { type, orderState, elements, trade, loadingDocuments, documents, disabled, toggleDisabled, onSubmit } = useTradeView();

    if (!trade)
        return <Spin
            style={{width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}/>;
    if (!isValueInEnum(type, TradeType))
        return <div>Wrong type</div>;

    return (
        <CardPage title={
            <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                {getEnumKeyByValue(TradeType, type)}
                <div style={{display: 'flex', alignItems: 'center'}}>
                    {trade?.status && (
                        <Tag color='green' key={trade.status}>
                            {trade.status?.toUpperCase()}
                        </Tag>
                    )}
                    <EditOutlined style={{marginLeft: '8px'}} onClick={toggleDisabled}/>
                </div>
            </div>}
        >
            <Spin spinning={!trade || !documents}>
                <GenericForm elements={elements} submittable={!disabled} onSubmit={onSubmit}/>
            </Spin>

            {/*{ documents?.map((doc, index) => (*/}
            {/*    <PDFViewer element={{*/}
            {/*        type: FormElementType.DOCUMENT,*/}
            {/*        span: 12,*/}
            {/*        content: doc.content,*/}
            {/*        name: doc.name,*/}
            {/*        label: doc.name,*/}
            {/*        required: false,*/}
            {/*        loading: false,*/}
            {/*        uploadable: true,*/}
            {/*        height: "500px"*/}
            {/*    }} onDocumentChange={() => {}} />*/}
            {/*))}*/}
        </CardPage>
    )
}

export default TradeView;
