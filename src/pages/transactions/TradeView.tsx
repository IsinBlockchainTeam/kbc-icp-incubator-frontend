import React from "react";
import {CardPage} from "../../components/structure/CardPage/CardPage";
import {Spin, Tag, Tooltip} from "antd";
import {EditOutlined, CheckCircleOutlined} from "@ant-design/icons";
import {NegotiationStatus, TradeType} from "@kbc-lib/coffee-trading-management-lib";
import useTradeView from "./logic/tradeView";
import OrderTradeStatusForms from "../../components/OrderStatusForms/OrderTradeStatusForms";
import {GenericForm} from "../../components/GenericForm/GenericForm";
import {OrderTradePresentable} from "../../api/types/TradePresentable";

export const TradeView = () => {
    const {
        trade,
        type,
        elements,
        negotiationStatus,
        disabled,
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

    if (!Object.values(TradeType).includes(type)) {
        return <div>Wrong type</div>;
    }

    if (!trade) return <Spin />;

    return (
        <CardPage title={
            <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                {TradeType[type]}
                <div style={{display: 'flex', alignItems: 'center'}}>
                    {negotiationStatus &&
                        <Tag color='green' key={negotiationStatus}>
                            {negotiationStatus.toUpperCase()}
                        </Tag>
                    }
                    {negotiationStatus !== NegotiationStatus[NegotiationStatus.CONFIRMED] &&
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
            {type === TradeType.ORDER ?
                <OrderTradeStatusForms status={(trade as OrderTradePresentable).status} tradeInfo={trade} submittable={!disabled} negotiationElements={elements}/>
                :
                <GenericForm elements={elements} submittable={!disabled} onSubmit={onSubmit}/>
            }
            {/*{*/}
            {/*    current === 0 &&*/}
            {/*    <GenericForm elements={elements} submittable={!disabled} onSubmit={onSubmit}/>*/}
            {/*}*/}
            {/*{*/}
            {/*    current === 1 &&*/}
            {/*    <ConfirmedTradeView/>*/}
            {/*}*/}
        </CardPage>
    )
}

export default TradeView;
