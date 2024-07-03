import React from 'react';
import { CardPage } from '@/components/structure/CardPage/CardPage';
import { Table, Tag, Tooltip } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined, SettingOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import { TradePreviewPresentable } from '@/api/types/TradePresentable';
import { Link } from 'react-router-dom';
import { NegotiationStatus, OrderStatus, TradeType } from '@kbc-lib/coffee-trading-management-lib';
import { setParametersPath } from '@/utils/page';
import { paths } from '@/constants/paths';
import { useEthTrade } from '@/providers/entities/EthTradeProvider';
import { useICPName } from '@/providers/entities/ICPNameProvider';

export const Trades = () => {
    const { basicTrades, orderTrades, getActionRequired, getNegotiationStatus, getOrderStatus } =
        useEthTrade();
    const { getName } = useICPName();

    const tradesPresentable: TradePreviewPresentable[] = basicTrades.map((t) => ({
        id: t.tradeId,
        supplier: getName(t.supplier),
        commissioner: getName(t.commissioner),
        type: TradeType.BASIC
    }));
    tradesPresentable.push(
        ...orderTrades.map((o) => ({
            id: o.tradeId,
            supplier: getName(o.supplier),
            commissioner: getName(o.commissioner),
            type: TradeType.ORDER,
            actionRequired: getActionRequired(o.tradeId),
            negotiationStatus: getNegotiationStatus(o.tradeId),
            orderStatus: getOrderStatus(o.tradeId)
        }))
    );

    const columns: ColumnsType<TradePreviewPresentable> = [
        {
            title: 'Id',
            dataIndex: 'id',
            sorter: (a, b) => a.id - b.id,
            sortDirections: ['descend'],
            render: (id, { type }) => {
                return (
                    <Link
                        to={setParametersPath(`${paths.TRADE_VIEW}?type=:type`, { id }, { type })}>
                        {id}
                    </Link>
                );
            }
        },
        {
            title: 'Supplier',
            dataIndex: 'supplier',
            sorter: (a, b) => a.supplier.localeCompare(b.supplier)
        },
        {
            title: 'Commissioner',
            dataIndex: 'commissioner',
            sorter: (a, b) => (a.commissioner || '').localeCompare(b.commissioner || ''),
            render: (customer) => {
                return customer ? customer : '-';
            }
        },
        {
            title: 'Type',
            dataIndex: 'type',
            render: (type) => {
                return TradeType[type];
            }
        },
        {
            title: 'Status',
            dataIndex: 'orderStatus',
            sorter: (a, b) =>
                (a.orderStatus?.toString() || '').localeCompare(b.orderStatus?.toString() || ''),
            render: (_, { negotiationStatus, orderStatus }) => (
                <Tag color="geekblue" key={negotiationStatus}>
                    {negotiationStatus
                        ? negotiationStatus !== NegotiationStatus.CONFIRMED
                            ? NegotiationStatus[negotiationStatus]?.toString().toUpperCase()
                            : OrderStatus[orderStatus!]?.toString().toUpperCase()
                        : '-'}
                </Tag>
            )
        },
        {
            title: <SettingOutlined />,
            dataIndex: 'actionRequired',
            render: (_, { actionRequired }) => {
                return actionRequired ? (
                    <Tooltip title={actionRequired}>
                        <ExclamationCircleOutlined
                            style={{ fontSize: '1.5rem', color: 'orange' }}
                        />
                    </Tooltip>
                ) : (
                    <Tooltip title={'There are no operations charged to you at this time'}>
                        <CheckCircleOutlined style={{ fontSize: '1.5rem', color: 'green' }} />
                    </Tooltip>
                );
            }
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
            <Table columns={columns} dataSource={tradesPresentable} />
        </CardPage>
    );
};

export default Trades;
