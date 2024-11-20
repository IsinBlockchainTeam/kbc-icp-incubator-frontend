import { FormElement, FormElementType } from '@/components/GenericForm/GenericForm';
import { TradeType } from '@isinblockchainteam/kbc-icp-incubator-library';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { paths } from '@/constants/paths';
import { useSigner } from '@/providers/SignerProvider';
import { OrderTradeNew } from '@/pages/Trade/New/OrderTradeNew';
import { useOrganization } from '@/providers/icp/OrganizationProvider';

export const TradeNew = () => {
    const { signer } = useSigner();
    const navigate = useNavigate();
    const location = useLocation();
    const { getOrganization } = useOrganization();

    const type = TradeType.ORDER;

    if (location?.state === undefined) {
        console.error('No supplier address or product category id provided');
        navigate(paths.HOME);
    }

    const elements: FormElement[] = [];
    const supplierAddress: string = location.state.supplierAddress;
    const customerAddress: string = signer._address;
    const productCategoryId: number = location.state.productCategoryId;
    const supplierName = getOrganization(supplierAddress).legalName;
    const commissionerName = getOrganization(customerAddress).legalName;

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

    return (
        <OrderTradeNew
            supplierAddress={supplierAddress}
            customerAddress={customerAddress}
            productCategoryId={productCategoryId}
            commonElements={elements}
        />
    );
};
