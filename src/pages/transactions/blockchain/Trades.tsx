import React, {useEffect} from "react";
import {CardPage} from "../../../components/structure/CardPage/CardPage";
import {NotificationType, openNotification} from "../../../utils/notification";
import {TradeService} from "../../../api/services/TradeService";
import {BlockchainTradeStrategy} from "../../../api/strategies/trade/BlockchainTradeStrategy";
import {TradePresentable} from "../../../api/types/TradePresentable";
import {ColumnsType} from "antd/es/table";
import {Table, TableProps} from "antd";
import {Link} from "react-router-dom";
import {getEnumKeyByValue, setParametersPath} from "../../../utils/utils";
import {paths} from "../../../constants";
import {TradeType} from "@kbc-lib/coffee-trading-management-lib";
import {TradeLinePresentable} from "../../../api/types/TradeLinePresentable";
import {MaterialPresentable} from "../../../api/types/MaterialPresentable";

export const Trades = () => {
    const [trades, setTrades] = React.useState<TradePresentable[]>();
    const loadData = async () => {
        try {
            const tradeService = new TradeService(new BlockchainTradeStrategy());
            const trades = await tradeService.getGeneralTrades();
            console.log("trades: ", trades)

            setTrades(trades.map(t => {
                // @ts-ignore
                t['key'] = `${t.id}_${t.supplier}`;
                return t;
            }));
        }
        catch (e: any) {
            console.log("error: ", e);
            openNotification("Error", e.message, NotificationType.ERROR);
        }
    }

    const columns: ColumnsType<TradePresentable> = [
        {
            title: 'Id',
            dataIndex: 'id',
            sorter: (a, b) => a.id - b.id,
            sortDirections: ['descend'],
            render: ((id, {type}) => {
                return (
                    <Link to={setParametersPath(`${paths.TRADE_VIEW}?type=:type`, {id}, {type})}>{id}</Link>
                )
            })
        },
        // {
        //     title: 'Name',
        //     dataIndex: 'name',
        //     sorter: (a, b) => (a.name|| '').localeCompare(b.name || ''),
        //     render: (name => {
        //         return name ? name : '-';
        //     })
        // },
        {
            title: 'Supplier',
            dataIndex: 'supplier',
            sorter: (a, b) => a.supplier.localeCompare(b.supplier),
        },
        {
            title: 'Customer',
            dataIndex: 'customer',
            sorter: (a, b) => (a.customer || '').localeCompare((b.customer || '')),
            render: (customer => {
                return customer ? customer : '-'
            })
        },
        {
            title: 'Type',
            dataIndex: 'type',
            render: (type => {
                return getEnumKeyByValue(TradeType, type);
            })
            // render: (type, trade) => {
            //     const constraints = [
            //         {incoterms: trade.incoterms},
            //         {paymentDeadline: trade.paymentDeadline},
            //         {documentDeliveryDeadline: trade.documentDeliveryDeadline},
            //         {shipper: trade.shipper},
            //         {arbiter: trade.arbiter},
            //         {shippingPort: trade.shippingPort},
            //         {shippingDeadline: trade.shippingDeadline},
            //         {deliveryPort: trade.deliveryPort},
            //         {deliveryDeadline: trade.deliveryDeadline},
            //     ];
            //
            //     const items: MenuProps['items'] = [];
            //     constraints.map((c, index) => {
            //         const item: {key: string, label: string} = {key: '', label: ''};
            //         for (let key in constraints[index]) {
            //             // @ts-ignore
            //             const value = constraints[index][key];
            //             item.key = key;
            //             if (!value) item.label = `${toTitleCase(key)}: Not specified`;
            //             else item.label = `${toTitleCase(key)}: ${(value instanceof Date) ? value.toLocaleDateString() : value}`;
            //         }
            //         items.push(item);
            //     })
            //     return (
            //         <Dropdown menu={{ items }} placement="bottom" arrow>
            //             <p>{type}</p>
            //         </Dropdown>
            //     )
            // }
        }
    ];

    const onChange: TableProps<TradePresentable>['onChange'] = (pagination, filters, sorter, extra) => {
        console.log('params', pagination, filters, sorter, extra);
    };

    useEffect(() => {
        loadData();
    }, []);

    return (
        <CardPage title="Trades">
            <Table columns={columns} dataSource={trades} onChange={onChange} />
        </CardPage>
);
}

export default Trades;
