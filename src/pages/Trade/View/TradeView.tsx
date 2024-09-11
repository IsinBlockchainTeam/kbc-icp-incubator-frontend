import React, { useState } from 'react';
import { Trade, TradeType } from '@kbc-lib/coffee-trading-management-lib';
import { FormElement, FormElementType } from '@/components/GenericForm/GenericForm';
import { useLocation, useNavigate } from 'react-router-dom';
import OrderTradeView from '@/pages/Trade/View/OrderTradeView';
import { BasicTradeView } from '@/pages/Trade/View/BasicTradeView';
import { paths } from '@/constants/paths';
import { useICPOrganization } from '@/providers/entities/ICPOrganizationProvider';
import { useEthBasicTrade } from '@/providers/entities/EthBasicTradeProvider';
import { useEthOrderTrade } from '@/providers/entities/EthOrderTradeProvider';
import { Collapse } from 'antd';
import { ShipmentPanel } from '@/components/ShipmentPanel/ShipmentPanel';
import { CardPage } from '@/components/structure/CardPage/CardPage';
import { EscrowPanel } from '@/components/EscrowPanel/EscrowPanel';

export const TradeView = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const { getCompany } = useICPOrganization();
    const { detailedOrderTrade } = useEthOrderTrade();
    const { detailedBasicTrade } = useEthBasicTrade();
    const [disabled, setDisabled] = useState<boolean>(true);

    const type = parseInt(new URLSearchParams(location.search).get('type')!);

    if (!Object.values(TradeType).includes(type)) {
        navigate(paths.HOME);
    }
    const trade: Trade | undefined =
        type === TradeType.ORDER ? detailedOrderTrade?.trade : detailedBasicTrade?.trade;

    if (!trade) return <div>Trade not available</div>;

    const supplierName = getCompany(trade.supplier).legalName;
    const commissionerName = getCompany(trade.commissioner).legalName;

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
        if (!detailedOrderTrade) return <div>Order not found</div>;
        return (
            <CardPage title={'Order'}>
                <Collapse
                    size="large"
                    defaultActiveKey={['1']}
                    items={[
                        {
                            key: '1',
                            label: 'Details',
                            children: (
                                <OrderTradeView
                                    orderTrade={detailedOrderTrade.trade}
                                    disabled={disabled}
                                    toggleDisabled={toggleDisabled}
                                    commonElements={elements}
                                />
                            )
                        },
                        {
                            key: '2',
                            label: 'Shipment',
                            children: <ShipmentPanel />
                        },

                        {
                            key: '3',
                            label: 'Escrow',
                            children: <EscrowPanel />
                        },
                        {
                            key: '4',
                            label: 'Documents',
                            children: <></>
                        }
                    ]}
                />
            </CardPage>
        );
    }
    if (!detailedBasicTrade) return <div>Trade not found</div>;
    return (
        <BasicTradeView
            basicTrade={detailedBasicTrade.trade}
            disabled={disabled}
            toggleDisabled={toggleDisabled}
            commonElements={elements}
        />
    );
};

export default TradeView;
