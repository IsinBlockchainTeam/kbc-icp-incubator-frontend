import React from 'react';
import { CardPage } from '@/components/structure/CardPage/CardPage';
import { Table, Tag } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { Link } from 'react-router-dom';
import { Order, OrderStatus, TradeType } from '@kbc-lib/coffee-trading-management-lib';
import { setParametersPath } from '@/utils/page';
import { paths } from '@/constants/paths';
import { useOrder } from '@/providers/icp/OrderProvider';
import { AsyncComponent } from '@/components/AsyncComponent/AsyncComponent';

export const Trades = () => {
    const { orders } = useOrder();
    // const { rawTrades } = useEthRawTrade();
    // const { getSupplierAsync, getCustomerAsync, getNegotiationStatusAsync } = useEthOrderTrade();
    // const { getShipmentPhaseAsync } = useEthShipment();
    // const { getCompany } = useICPOrganization();

    const columns: ColumnsType<Order> = [
        {
            title: 'Id',
            dataIndex: 'id',
            sorter: (a, b) => a.id - b.id,
            sortDirections: ['descend'],
            render: (id) => (
                // TODO: was this correct?
                // <Link to={setParametersPath(`${paths.TRADE_VIEW}?type=order`, { id })}>{id}</Link>
                <Link to={setParametersPath(`${paths.TRADE_VIEW}?type=1`, { id })}>{id}</Link>
            )
        },
        {
            title: 'Supplier',
            dataIndex: 'supplier',
            render: (_, { id }) => (
                // <AsyncComponent
                //     asyncFunction={async () => getCompany(await getSupplierAsync(id)).legalName}
                //     defaultElement={<>Unknown</>}
                // />
                <div>Company 1</div>
            )
        },
        {
            title: 'Commissioner',
            dataIndex: 'commissioner',
            render: (_, { id }) => (
                // <AsyncComponent
                //     asyncFunction={async () => getCompany(await getCustomerAsync(id)).legalName}
                //     defaultElement={<>Unknown</>}
                // />
                <div>Company 2</div>
            )
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
            render: (_, { id, status }) => (
                <Tag color="geekblue">
                    <AsyncComponent
                        asyncFunction={async () => OrderStatus[status]}
                        defaultElement={<>UNKNOWN</>}
                    />
                </Tag>
            )
        },
        {
            title: 'Shipment phase',
            dataIndex: 'shipmentPhase',
            render: (_, { id }) => (
                // <Tag color="geekblue">
                //     <AsyncComponent
                //         asyncFunction={async () =>
                //             ShipmentPhaseDisplayName[await getShipmentPhaseAsync(id)]
                //         }
                //         defaultElement={<>NOT CREATED</>}
                //     />
                // </Tag>
                <div>Shipment phase</div>
            )
        }
    ];

    return (
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
            <Table columns={columns} dataSource={orders} />
        </CardPage>
    );
};

export default Trades;
