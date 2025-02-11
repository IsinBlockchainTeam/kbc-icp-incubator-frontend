import { useState } from 'react';
import { TradeType } from '@kbc-lib/coffee-trading-management-lib';
import { useLocation, useNavigate } from 'react-router-dom';
import { paths } from '@/constants/paths';
import { Collapse, Typography } from 'antd';
import { ShipmentPanel } from '@/components/ShipmentPanel/ShipmentPanel';
import { CardPage } from '@/components/CardPage/CardPage';
import { DownPaymentPanel } from '@/components/DownPaymentPanel/DownPaymentPanel';
import { OrderTradeView } from '@/pages/Trade/View/OrderTradeView';
import { useOrder } from '@/providers/entities/icp/OrderProvider';
import { FormElement, FormElementType } from '@/components/GenericForm/GenericForm';
import { useOrganization } from '@/providers/entities/icp/OrganizationProvider';
import { BusinessRelationGuard } from '@/guards/organization/BusinessRelationGuard';

export const TradeView = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const { getOrganization } = useOrganization();
    const { order } = useOrder();
    const [disabled, setDisabled] = useState<boolean>(true);

    const type = parseInt(new URLSearchParams(location.search).get('type')!);

    if (!Object.values(TradeType).includes(type)) {
        navigate(paths.HOME);
    }

    if (!order) return <div>Order not available</div>;

    const supplierName = getOrganization(order.supplier).legalName;
    const commissionerName = getOrganization(order.commissioner).legalName;
    const commissioner = getOrganization(order.commissioner);

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
            <CardPage title={'Order'}>
                <BusinessRelationGuard supplierEthAddress={order.supplier} commissionerEthAddress={order.commissioner} />
                <Collapse
                    size="large"
                    defaultActiveKey={['1']}
                    items={[
                        {
                            key: '1',
                            label: 'Details',
                            children: <OrderTradeView disabled={disabled} toggleDisabled={toggleDisabled} commonElements={elements} />
                        },
                        {
                            key: '2',
                            label: 'Shipment',
                            children: <ShipmentPanel />
                        },

                        {
                            key: '3',
                            label: 'Down Payment',
                            children: <DownPaymentPanel />
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
    // if (!detailedBasicTrade) return <div>Trade not found</div>;
    return (
        // <BasicTradeView
        //     basicTrade={detailedBasicTrade.trade}
        //     disabled={disabled}
        //     toggleDisabled={toggleDisabled}
        //     commonElements={elements}
        // />
        <Typography>BasicTradeView</Typography>
    );
};

export default TradeView;
