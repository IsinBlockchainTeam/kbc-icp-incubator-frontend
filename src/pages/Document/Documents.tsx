import { CardPage } from '@/components/structure/CardPage/CardPage';
import { FormElement, FormElementType, GenericForm } from '@/components/GenericForm/GenericForm';
import { useEthRawTrade } from '@/providers/entities/EthRawTradeProvider';
import { OrderTrade, TradeType } from '@kbc-lib/coffee-trading-management-lib';
import { DetailedOrderTrade, useEthOrderTrade } from '@/providers/entities/EthOrderTradeProvider';
import { useEffect, useMemo, useState } from 'react';
import { Divider, Flex, List } from 'antd';
import { useSigner } from '@/providers/SignerProvider';
import { useICPName } from '@/providers/entities/ICPNameProvider';
import { useEthShipment } from '@/providers/entities/EthShipmentProvider';

export default () => {
    const { rawTrades } = useEthRawTrade();
    const { signer } = useSigner();
    const { getName } = useICPName();
    const [ordersWithShipment, setOrdersWithShipment] = useState<DetailedOrderTrade[]>([]);
    const { getDetailedTradesAsync } = useEthOrderTrade();
    const { getShipmentService } = useEthShipment();

    const loadData = async () => {
        const detailedOrders = await getDetailedTradesAsync();
        setOrdersWithShipment(
            detailedOrders.filter(({ shipmentAddress }) => shipmentAddress !== undefined)
        );
    };

    const handleChange = async (value: number) => {
        const detailedOrder = ordersWithShipment[value];
        const shipmentService = getShipmentService(detailedOrder.shipmentAddress!);
        const shipment = await shipmentService.getShipment();
        console.log('shipment', shipment);
    };

    const elements: FormElement[] = useMemo(
        () => [
            {
                type: FormElementType.SELECT,
                span: 12,
                name: 'order',
                label: 'Order',
                required: true,
                options: ordersWithShipment.map((orderDetail, index) => ({
                    value: index,
                    label: orderDetail.trade.tradeId,
                    counterpart:
                        signer._address === orderDetail.trade.supplier
                            ? getName(orderDetail.trade.commissioner)
                            : getName(orderDetail.trade.supplier)
                })),
                optionRender: ({ data }) => (
                    <Flex vertical>
                        <div>
                            <span style={{ fontWeight: 'bold' }}>ID: </span>
                            {data.label}
                        </div>
                        <div>
                            <span style={{ fontWeight: 'bold' }}>Counterpart: </span>
                            {data.counterpart}
                        </div>
                        <Divider style={{ margin: '10px' }} />
                    </Flex>
                ),
                onChange: handleChange,
                search: {
                    showIcon: true,
                    filterOption: (input: string, option: any) =>
                        option.label.toString().includes(input) ||
                        option.counterpart.toLowerCase().includes(input.toLowerCase())
                }
            }
        ],
        [ordersWithShipment]
    );

    useEffect(() => {
        if (rawTrades.length) loadData();
    }, [rawTrades]);

    return (
        <CardPage title="Documents">
            <GenericForm
                elements={elements}
                confirmText="This will upload the document for the order selected, proceed?"
                submittable={true}
                onSubmit={() => {}}
            />
        </CardPage>
    );
};
