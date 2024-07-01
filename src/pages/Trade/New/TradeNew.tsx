import { FormElement, FormElementType } from '@/components/GenericForm/GenericForm';
import { TradeType } from '@kbc-lib/coffee-trading-management-lib';
import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { paths } from '@/constants/paths';
import { SignerContext } from '@/providers/SignerProvider';
import useActorName from '@/hooks/useActorName';
import { BasicTradeNew } from '@/pages/Trade/New/BasicTradeNew';
import { OrderTradeNew } from '@/pages/Trade/New/OrderTradeNew';

export const TradeNew = () => {
    const { signer } = useContext(SignerContext);
    const { getActorName } = useActorName();

    const navigate = useNavigate();
    const location = useLocation();

    const [areNamesReady, setAreNamesReady] = useState<boolean>(false);
    const [supplierName, setSupplierName] = useState<string>('Unknown');
    const [commissionerName, setCommissionerName] = useState<string>('Unknown');

    const type = TradeType.ORDER;
    const elements: FormElement[] = [];

    const supplierAddress: string = location?.state?.supplierAddress;
    const customerAddress: string = signer?.address;
    const productCategoryId: number = location?.state?.productCategoryId;

    useEffect(() => {
        fetchNames();
    }, []);

    const fetchNames = async () => {
        setSupplierName(await getActorName(location?.state?.supplierAddress));
        setCommissionerName(await getActorName(signer?.address));
        setAreNamesReady(true);
    };

    if (!areNamesReady) {
        return <></>;
    }

    elements.push(
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
    );

    if (!supplierAddress || !productCategoryId) {
        navigate(paths.HOME);
    }
    if (type === TradeType.ORDER) {
        return (
            <OrderTradeNew
                supplierAddress={supplierAddress}
                customerAddress={customerAddress}
                productCategoryId={productCategoryId}
                commonElements={elements}
            />
        );
    }
    return (
        <BasicTradeNew
            supplierAddress={supplierAddress}
            customerAddress={customerAddress}
            productCategoryId={productCategoryId}
            commonElements={elements}
        />
    );
};
