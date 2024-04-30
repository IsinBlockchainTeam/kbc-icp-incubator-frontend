import React from "react";
import {CardPage} from "../../components/structure/CardPage/CardPage";
import {GenericForm} from "../../components/GenericForm/GenericForm";
import {Spin, Tag} from "antd";
import {EditOutlined} from "@ant-design/icons";
import {TradeType} from "@kbc-lib/coffee-trading-management-lib";
import {getEnumKeyByValue, isValueInEnum} from "../../utils/utils";
import useTradeView from "./logic/tradeView";

export const TradeView = () => {
    const { type, orderState, elements, trade, documents, loadingDocuments, disabled, toggleDisabled, onSubmit } = useTradeView();
    console.log("trade: ", trade)
    console.log("documents: ", documents)

    if (!trade)
        return <Spin style={{width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}/>;
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
            <GenericForm elements={elements} submittable={!disabled} onSubmit={onSubmit}/>
        </CardPage>
    )
}

export default TradeView;
