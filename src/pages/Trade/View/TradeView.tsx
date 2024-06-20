import React, { useEffect, useState } from 'react';
import { FormInstance } from 'antd';
import { TradeType } from '@kbc-lib/coffee-trading-management-lib';
import { FormElement, FormElementType } from '@/components/GenericForm/GenericForm';
import { BasicTradePresentable, OrderTradePresentable } from '@/api/types/TradePresentable';
import dayjs from 'dayjs';
import { useLocation, useParams } from 'react-router-dom';
import useTrade from '@/hooks/useTrade';
import useActorName from '@/hooks/useActorName';
import OrderTradeView from '@/pages/Trade/View/OrderTradeView';
import { BasicTradeView } from '@/pages/Trade/View/BasicTradeView';

const validateDates = (
    dataFieldName: string,
    dateFieldNameToCompare: string,
    comparison: 'greater' | 'less',
    errorMessage: string
) => {
    return (form: FormInstance): Promise<void> => {
        const date = dayjs(form.getFieldValue(dataFieldName));
        const dateToCompare = dayjs(form.getFieldValue(dateFieldNameToCompare));
        if (date && dateToCompare)
            if (
                (comparison === 'greater' && date.isBefore(dateToCompare)) ||
                (comparison === 'less' && date.isAfter(dateToCompare))
            )
                return Promise.reject(errorMessage);

        return Promise.resolve();
    };
};
export type ValidateDatesType = typeof validateDates;

export const TradeView = () => {
    const { id } = useParams();
    const location = useLocation();

    const [areNamesReady, setAreNamesReady] = useState<boolean>(false);
    const [supplierName, setSupplierName] = useState<string>('Unknown');
    const [commissionerName, setCommissionerName] = useState<string>('Unknown');

    const type = parseInt(new URLSearchParams(location.search).get('type')!);
    const { getActorName } = useActorName();
    const { dataLoaded, trade, confirmNegotiation } = useTrade(parseInt(id || ''));
    const [disabled, setDisabled] = useState<boolean>(true);

    useEffect(() => {
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
        return <div>Wrong type</div>;
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
                confirmNegotiation={confirmNegotiation}
                commonElements={elements}
                validateDates={validateDates}
            />
        );
    }
    return (
        <BasicTradeView
            basicTradePresentable={trade as BasicTradePresentable}
            disabled={disabled}
            toggleDisabled={toggleDisabled}
            confirmNegotiation={confirmNegotiation}
            commonElements={elements}
        />
    );
};

export default TradeView;
