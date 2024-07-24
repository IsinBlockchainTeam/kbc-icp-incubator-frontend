import React, { useState } from 'react';
import { BasicTrade, OrderTrade, TradeType } from '@kbc-lib/coffee-trading-management-lib';
import { FormElement, FormElementType } from '@/components/GenericForm/GenericForm';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import OrderTradeView from '@/pages/Trade/View/OrderTradeView';
import { BasicTradeView } from '@/pages/Trade/View/BasicTradeView';
import { paths } from '@/constants/paths';
import { useICPName } from '@/providers/entities/ICPNameProvider';
import { useEthBasicTrade } from '@/providers/entities/EthBasicTradeProvider';
import { useEthOrderTrade } from '@/providers/entities/EthOrderTradeProvider';

export const TradeView = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const { getName } = useICPName();
    const { basicTrades } = useEthBasicTrade();
    const { orderTrades } = useEthOrderTrade();
    const [disabled, setDisabled] = useState<boolean>(true);

    const type = parseInt(new URLSearchParams(location.search).get('type')!);
    const trade =
        type === TradeType.ORDER
            ? orderTrades.find((t) => t.tradeId === parseInt(id || ''))
            : basicTrades.find((t) => t.tradeId === parseInt(id || ''));

    if (!Object.values(TradeType).includes(type)) {
        navigate(paths.HOME);
    }
    if (!trade) return <div>Trade not available</div>;

    const supplierName = getName(trade.supplier);
    const commissionerName = getName(trade.commissioner);

    const toggleDisabled = () => {
        setDisabled((d) => !d);
    };

    const elements: FormElement[] = [
        { type: FormElementType.TITLE, span: 24, label: 'Actors' },
        {
            type: FormElementType.INPUT,
            span: 8,
            name: 'supplier',
            label: 'Supplier',
            required: true,
            defaultValue: supplierName,
            disabled: true
        },
        {
            type: FormElementType.INPUT,
            span: 8,
            name: 'customer',
            label: 'Customer',
            required: true,
            defaultValue: commissionerName,
            disabled: true
        },
        {
            type: FormElementType.INPUT,
            span: 8,
            name: 'commissioner',
            label: 'Commissioner',
            required: true,
            defaultValue: commissionerName,
            disabled: true
        }
    ];

    if (type === TradeType.ORDER) {
        return (
            <OrderTradeView
                orderTrade={trade as OrderTrade}
                disabled={disabled}
                toggleDisabled={toggleDisabled}
                commonElements={elements}
            />
        );
    }
    return (
        <BasicTradeView
            basicTrade={trade as BasicTrade}
            disabled={disabled}
            toggleDisabled={toggleDisabled}
            commonElements={elements}
        />
    );
};

export default TradeView;
