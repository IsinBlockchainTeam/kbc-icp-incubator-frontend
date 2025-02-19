import React from 'react';
import { CardPage } from '@/components/CardPage/CardPage';
import { Table, Tag, Typography } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { Link } from 'react-router-dom';
import { Order, OrderStatus, TradeType } from '@kbc-lib/coffee-trading-management-lib';
import { setParametersPath } from '@/utils/page';
import { paths } from '@/constants/paths';
import { useOrder } from '@/providers/entities/icp/OrderProvider';
import { AsyncComponent } from '@/components/AsyncComponent/AsyncComponent';
import { useOrganization } from '@/providers/entities/icp/OrganizationProvider';
import { useShipment } from '@/providers/entities/icp/ShipmentProvider';
import { ShipmentPhaseDisplayName } from '@/constants/shipmentPhase';
import { InfoCard } from '@/components/InfoCard/InfoCard';

const { Text } = Typography;

export const Trades = () => {
    const { orders } = useOrder();
    const { getOrganization } = useOrganization();
    const { getShipmentPhaseAsync } = useShipment();

    const columns: ColumnsType<Order> = [
        {
            title: 'Id',
            dataIndex: 'id',
            sorter: (a, b) => a.id - b.id,
            sortDirections: ['descend', 'ascend'],
            render: (id) => (
                // TODO: was this correct?
                // <Link to={setParametersPath(`${paths.TRADE_VIEW}?type=order`, { id })}>{id}</Link>
                <Link to={setParametersPath(`${paths.TRADE_VIEW}?type=1`, { id })}>{id}</Link>
            )
        },
        {
            title: 'Supplier',
            dataIndex: 'supplier',
            render: (_, { supplier }) => <div>{getOrganization(supplier).legalName}</div>
        },
        {
            title: 'Commissioner',
            dataIndex: 'commissioner',
            render: (_, { commissioner }) => <div>{getOrganization(commissioner).legalName}</div>
        },
        {
            title: 'Type',
            dataIndex: 'type',
            render: (type) => {
                return TradeType[type];
            }
        },
        {
            title: 'Negotiation status',
            dataIndex: 'negotiationStatus',
            render: (_, { status }) => (
                <Tag color="geekblue">
                    <AsyncComponent asyncFunction={async () => OrderStatus[status]} defaultElement={<>UNKNOWN</>} />
                </Tag>
            )
        },
        {
            title: 'Shipment phase',
            dataIndex: 'shipmentPhase',
            render: (_, { id }) => (
                <Tag color="geekblue">
                    <AsyncComponent
                        asyncFunction={async () => {
                            const phase = await getShipmentPhaseAsync(id);
                            return phase ? ShipmentPhaseDisplayName[phase].toUpperCase() : 'NOT CREATED';
                        }}
                        defaultElement={<>NOT CREATED</>}
                    />
                </Tag>
            )
        }
    ];

    const tradeInfo = {
        title: 'Trade Process Information',
        items: [
            <Text>This table contains all trades where the company is involved. To start a trade an importer should accept a counterpart offer.</Text>,
            <>
                <Text strong>
                    {'Negotiation status: '}
                </Text>
                <Text>
                    PENDING (initial negotiation) → CONFIRMED (deal agreed) → EXPIRED (negotiation expired).
                </Text>
            </>,
            <>
                <Text strong>
                    {'Shipment phases track the physical movement: '}
                </Text>
                <Text>
                    SAMPLE APPROVAL → SHIPMENT CONFIRMATION → WAITING FOR LAND TRANSPORTATION → LAND TRANSPORTATION → SEA TRANSPORTATION → CONFIRMED → ARBITRATION.
                </Text>
            </>,
            <Text>
                Each trade is uniquely identified and associated to a Supplier and a Commissioner for complete traceability.
            </Text>
        ],
        marginTop: '0px',
        collapsed: true,
        image: './assets/trade.png',
    };

    return (
        <>
            <CardPage
                title={
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                        Trades
                    </div>
                }>
                <InfoCard {...tradeInfo} />

                <Table columns={columns} dataSource={orders.sort((o1, o2) => o1.id - o2.id)} />
            </CardPage>
        </>
    );
};

export default Trades;
