import React from 'react';
import { CardPage } from '@/components/structure/CardPage/CardPage';
import { Table, Tag } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { Link } from 'react-router-dom';
import {
    NegotiationStatus,
    ShipmentPhase,
    TradeType
} from '@kbc-lib/coffee-trading-management-lib';
import { setParametersPath } from '@/utils/page';
import { paths } from '@/constants/paths';
import { useICPOrganization } from '@/providers/entities/ICPOrganizationProvider';
import { useEthOrderTrade } from '@/providers/entities/EthOrderTradeProvider';
import { useEthShipment } from '@/providers/entities/EthShipmentProvider';
import { RawTrade, useEthRawTrade } from '@/providers/entities/EthRawTradeProvider';
import { AsyncComponent } from '@/components/AsyncComponent/AsyncComponent';

export const Trades = () => {
    const { rawTrades } = useEthRawTrade();
    const { getSupplierAsync, getCustomerAsync, getNegotiationStatusAsync } = useEthOrderTrade();
    const { getShipmentPhaseAsync } = useEthShipment();
    const { getCompany } = useICPOrganization();

    const columns: ColumnsType<RawTrade> = [
        {
            title: 'Id',
            dataIndex: 'id',
            sorter: (a, b) => a.id - b.id,
            sortDirections: ['descend'],
            render: (id, { type }) => (
                <Link to={setParametersPath(`${paths.TRADE_VIEW}?type=:type`, { id }, { type })}>
                    {id}
                </Link>
            )
        },
        {
            title: 'Supplier',
            dataIndex: 'supplier',
            render: (_, { id }) => (
                <AsyncComponent
                    asyncFunction={async () => getCompany(await getSupplierAsync(id)).legalName}
                    defaultElement={<>Unknown</>}
                />
            )
        },
        {
            title: 'Commissioner',
            dataIndex: 'commissioner',
            render: (_, { id }) => (
                <AsyncComponent
                    asyncFunction={async () => getCompany(await getCustomerAsync(id)).legalName}
                    defaultElement={<>Unknown</>}
                />
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
            render: (_, { id }) => (
                <Tag color="geekblue">
                    <AsyncComponent
                        asyncFunction={async () =>
                            NegotiationStatus[await getNegotiationStatusAsync(id)]
                        }
                        defaultElement={<>UNKNOWN</>}
                    />
                </Tag>
            )
        },
        {
            title: 'Shipment phase',
            dataIndex: 'shipmentPhase',
            render: (_, { id }) => (
                <Tag color="geekblue">
                    <AsyncComponent
                        asyncFunction={async () => ShipmentPhase[await getShipmentPhaseAsync(id)]}
                        defaultElement={<>NOT CREATED</>}
                    />
                </Tag>
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
            <Table columns={columns} dataSource={rawTrades} />
        </CardPage>
    );
};

export default Trades;
