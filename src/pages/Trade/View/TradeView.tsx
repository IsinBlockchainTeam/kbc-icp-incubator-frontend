import React, { useEffect, useState } from 'react';
import { TradeType } from '@kbc-lib/coffee-trading-management-lib';
import { FormElement, FormElementType } from '@/components/GenericForm/GenericForm';
import { BasicTradePresentable, OrderTradePresentable } from '@/api/types/TradePresentable';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import useTrade from '@/hooks/useTrade';
import useActorName from '@/hooks/useActorName';
import OrderTradeView from '@/pages/Trade/View/OrderTradeView';
import { BasicTradeView } from '@/pages/Trade/View/BasicTradeView';
import { paths } from '@/constants/paths';

export const TradeView = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [areNamesReady, setAreNamesReady] = useState<boolean>(false);
    const [supplierName, setSupplierName] = useState<string>('Unknown');
    const [commissionerName, setCommissionerName] = useState<string>('Unknown');

    const type = parseInt(new URLSearchParams(location.search).get('type')!);
    const { getActorName } = useActorName();
    const { loadData, dataLoaded, trade } = useTrade();
    const [disabled, setDisabled] = useState<boolean>(true);

    useEffect(() => {
        loadData(parseInt(id || ''));
        fetchNames();
    }, [trade]);

    const fetchNames = async () => {
        if (trade) {
            setSupplierName(await getActorName(trade.trade.supplier));
            setCommissionerName(await getActorName(trade.trade.commissioner));
            setAreNamesReady(true);
        }
    };

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

    if (!Object.values(TradeType).includes(type)) {
        navigate(paths.HOME);
    }
    if (!dataLoaded || !areNamesReady) {
        return <></>;
    }
    if (!trade) {
        return <div>Trade not available</div>;
    }
    if (type === TradeType.ORDER) {
        return (
            <OrderTradeView
                orderTradePresentable={trade as OrderTradePresentable}
                disabled={disabled}
                toggleDisabled={toggleDisabled}
                commonElements={elements}
            />
        );
    }
    return (
        <BasicTradeView
            basicTradePresentable={trade as BasicTradePresentable}
            disabled={disabled}
            toggleDisabled={toggleDisabled}
            commonElements={elements}
        />
    );
};

export default TradeView;
