import React from 'react';
import { CardPage } from '@/components/structure/CardPage/CardPage';
import { Spin, Tag, Tooltip } from 'antd';
import { EditOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { NegotiationStatus, OrderTrade, TradeType } from '@kbc-lib/coffee-trading-management-lib';
import useTradeView from './logic/tradeView';
import OrderTradeStatusForms from '@/components/OrderStatusForms/OrderTradeStatusForms';
import { GenericForm } from '@/components/GenericForm/GenericForm';
import { OrderTradePresentable } from '@/api/types/TradePresentable';

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

    if (!Object.values(TradeType).includes(type)) {
        return <div>Wrong type</div>;
    }

    if (!trade) return <Spin />;

    return (
        <CardPage
            title={
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                    {TradeType[type]}
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        {negotiationStatus && (
                            <Tag color="green" key={negotiationStatus}>
                                {negotiationStatus.toUpperCase()}
                            </Tag>
                        )}
                    </div>
                </div>
            }>
            {type === TradeType.ORDER ? (
                <OrderTradeStatusForms
                    status={(trade as OrderTradePresentable).status}
                    orderInfo={trade as OrderTradePresentable}
                    submittable={!disabled}
                    negotiationElements={elements}
                />
            ) : (
                <GenericForm elements={elements} submittable={!disabled} onSubmit={onSubmit} />
            )}
            {/*{*/}
            {/*    current === 0 &&*/}
            {/*    <GenericForm elements={elements} submittable={!disabled} onSubmit={onSubmit}/>*/}
            {/*}*/}
            {/*{*/}
            {/*    current === 1 &&*/}
            {/*    <ConfirmedTradeView/>*/}
            {/*}*/}
        </CardPage>
    );
};

export default TradeView;
