import React, {useEffect} from "react";
import {CardPage} from "../../components/structure/CardPage/CardPage";
import {GenericForm} from "../../components/GenericForm/GenericForm";
import {Tag, Tooltip} from "antd";
import {EditOutlined, CheckCircleOutlined} from "@ant-design/icons";
import {NegotiationStatus, TradeType} from "@kbc-lib/coffee-trading-management-lib";
import {getEnumKeyByValue, isValueInEnum} from "../../utils/utils";
import useTradeView from "./logic/tradeView";
import OrderStatusBar from "../../components/OrderStatusBar/OrderStatusBar";
import ConfirmedTradeView from "./ConfirmedTradeView";

export const TradeView = () => {
    const {
        trade,
        type,
        elements,
        disabled,
        negotiationStatus,
        orderStatus,
        toggleDisabled,
        onSubmit,
        confirmNegotiation
    } = useTradeView();

    const [current, setCurrent] = React.useState(-1);

    useEffect(() => {
        setCurrent(orderStatus);
    }, [orderStatus]);

    const onChange = (value: number) => {
        console.log(value, orderStatus)
        if(value > orderStatus)
            return;
        setCurrent(value);
    }

    if (!isValueInEnum(type, TradeType)) {
        return <div>Wrong type</div>;
    }

    return (
        <CardPage title={
            <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                {getEnumKeyByValue(TradeType, type)}
                <div style={{display: 'flex', alignItems: 'center'}}>
                    {negotiationStatus &&
                        <Tag color='green' key={negotiationStatus}>
                            {negotiationStatus.toUpperCase()}
                        </Tag>
                    }
                    {negotiationStatus !== getEnumKeyByValue(NegotiationStatus, NegotiationStatus.CONFIRMED) &&
                        <div>
                            <EditOutlined style={{marginLeft: '8px'}} onClick={toggleDisabled}/>
                            <Tooltip title="Confirm the negotiation if everything is OK">
                                <CheckCircleOutlined style={{marginLeft: '8px'}} onClick={confirmNegotiation}/>
                            </Tooltip>
                        </div>
                    }
                </div>
            </div>}
        >
            {type === TradeType.ORDER && <OrderStatusBar trade={trade?.trade} orderStatus={current} onChange={onChange}/>}
            {
                current === 0 &&
                <GenericForm elements={elements} submittable={!disabled} onSubmit={onSubmit}/>
            }
            {
                current === 1 &&
                <ConfirmedTradeView/>
            }
        </CardPage>
    )
}

export default TradeView;
