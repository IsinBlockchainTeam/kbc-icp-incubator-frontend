import React from "react";
import {CardPage} from "../../components/structure/CardPage/CardPage";
import {GenericForm} from "../../components/GenericForm/GenericForm";
import {Tag, Tooltip} from "antd";
import {EditOutlined, CheckCircleOutlined} from "@ant-design/icons";
import {NegotiationStatus, TradeType} from "@kbc-lib/coffee-trading-management-lib";
import {getEnumKeyByValue, isValueInEnum} from "../../utils/utils";
import useTradeView from "./logic/tradeView";

export const TradeView = () => {
    const { type, orderState, elements, trade, documents, loadingDocuments, disabled, toggleDisabled, onSubmit, confirmNegotiation } = useTradeView();

    if (!isValueInEnum(type, TradeType))
        return <div>Wrong type</div>;

    return (
        <CardPage title={
            <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                {getEnumKeyByValue(TradeType, type)}
                <div style={{display: 'flex', alignItems: 'center'}}>
                    {/*{trade?.status && (*/}
                    {/*    <Tag color='green' key={trade.status}>*/}
                    {/*        {trade.negotiationStatus?.toUpperCase()}*/}
                    {/*    </Tag>*/}
                    {/*)}*/}
                    {/*{ trade?.negotiationStatus !== getEnumKeyByValue(NegotiationStatus, NegotiationStatus.CONFIRMED) && <EditOutlined style={{marginLeft: '8px'}} onClick={toggleDisabled}/> }*/}
                    <Tooltip title="Confirm the negotiation if everything is OK">
                        <CheckCircleOutlined style={{marginLeft: '8px'}} onClick={confirmNegotiation}/>
                    </Tooltip>
                </div>
            </div>}
        >
            <GenericForm elements={elements} submittable={!disabled} onSubmit={onSubmit}/>
        </CardPage>
    )
}

export default TradeView;
