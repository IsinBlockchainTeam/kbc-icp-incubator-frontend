import { GenericForm } from '@/components/GenericForm/GenericForm';
import { OrderStatus, TradeType } from '@kbc-lib/coffee-trading-management-lib';
import { Button } from 'antd';
import { CardPage } from '@/components/structure/CardPage/CardPage';
import React from 'react';
import { DeleteOutlined } from '@ant-design/icons';
import { paths } from '@/constants/index';
import { useLocation, useNavigate } from 'react-router-dom';
import useTradeNew from './logic/tradeNew';
import OrderTradeStatusForms from '@/components/OrderStatusForms/OrderTradeStatusForms';

export const TradeNew = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { type, elements, onSubmit } = useTradeNew();

    if (!location?.state?.supplierAddress || !location?.state?.productCategoryId) {
        navigate(paths.HOME);
    } else {
        return (
            <CardPage
                title={
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                        New Trade
                        <Button
                            type="primary"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => navigate(paths.TRADES)}>
                            Delete Trade
                        </Button>
                    </div>
                }>
                {type === TradeType.ORDER ? (
                    <OrderTradeStatusForms
                        status={OrderStatus.CONTRACTING}
                        submittable={true}
                        negotiationElements={elements}
                    />
                ) : (
                    <GenericForm elements={elements} submittable={true} onSubmit={onSubmit} />
                )}
            </CardPage>
        );
    }
    return <></>;
};
