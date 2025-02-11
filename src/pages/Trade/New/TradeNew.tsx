import { FormElement, FormElementType } from '@/components/GenericForm/GenericForm';
import { Material } from '@kbc-lib/coffee-trading-management-lib';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { paths } from '@/constants/paths';
import { OrderTradeNew } from '@/pages/Trade/New/OrderTradeNew';
import { useOrganization } from '@/providers/entities/icp/OrganizationProvider';
import { useSession } from '@/providers/auth/SessionProvider';

export const TradeNew = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { getOrganization } = useOrganization();
    const { getLoggedOrganization } = useSession();

    // const type = TradeType.ORDER;

    if (location?.state === undefined) {
        console.error('No supplier address or product category id provided');
        navigate(paths.HOME);
    }

    const elements: FormElement[] = [];
    const supplierAddress: string = location.state.supplierAddress;
    const customerAddress: string = getLoggedOrganization().ethAddress;
    const materialJson: any = location.state.material;
    // This is a workaround to fix the issue with the material not being passed correctly
    const supplierMaterial = Material.fromJson(materialJson);
    const supplierName = getOrganization(supplierAddress).legalName;
    const commissionerName = getLoggedOrganization().legalName;

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
            supplierMaterial={supplierMaterial}
            commonElements={elements}
        />
    );
};
