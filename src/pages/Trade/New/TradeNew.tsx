import { FormElement, FormElementType } from '@/components/GenericForm/GenericForm';
import { TradeType } from '@kbc-lib/coffee-trading-management-lib';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { paths } from '@/constants/paths';
import { useSigner } from '@/providers/SignerProvider';
import { BasicTradeNew } from '@/pages/Trade/New/BasicTradeNew';
import { OrderTradeNew } from '@/pages/Trade/New/OrderTradeNew';
import { useICPName } from '@/providers/entities/ICPNameProvider';

export const TradeNew = () => {
    const { signer } = useSigner();
    const navigate = useNavigate();
    const location = useLocation();
    const { getName } = useICPName();

    const type = TradeType.ORDER;

    const elements: FormElement[] = [];
    const supplierAddress: string = location?.state?.supplierAddress;
    const customerAddress: string = signer._address;
    const productCategoryId: number = location?.state?.productCategoryId;
    const supplierName = getName(supplierAddress);
    const commissionerName = getName(customerAddress);

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
