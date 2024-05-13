import React, {useEffect} from "react";
import {CardPage} from "../../components/structure/CardPage/CardPage";
import {Table, TableProps, Tag} from "antd";
import {ColumnsType} from "antd/es/table";
import {NotificationType, openNotification} from "../../utils/notification";
import {getEnumKeyByValue, setParametersPath} from "../../utils/utils";
import {EthTradeService} from "../../api/services/EthTradeService";
import {TradePreviewPresentable} from "../../api/types/TradePresentable";
import {Link} from "react-router-dom";
import {paths} from "../../constants";
import {NegotiationStatus, TradeType} from "@kbc-lib/coffee-trading-management-lib";
import {useDispatch} from "react-redux";
import {hideLoading, showLoading} from "../../redux/reducers/loadingSlice";

export const Trades = () => {
    const [trades, setTrades] = React.useState<TradePreviewPresentable[]>();
    const dispatch = useDispatch();

    const loadData = async () => {
        try {
            dispatch(showLoading("Retrieving trades..."));
            const tradeService = new EthTradeService();
            const trades = await tradeService.getGeneralTrades();

            setTrades(trades.map(t => {
                // @ts-ignore
                t['key'] = `${t.id}_${t.supplier}`;
                return t;
            }));
        } catch (e: any) {
            console.log("error: ", e);
            openNotification("Error", e.message, NotificationType.ERROR);
        } finally {
            dispatch(hideLoading())
        }
    }

    const columns: ColumnsType<TradePreviewPresentable> = [
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
        {
            title: 'Supplier',
            dataIndex: 'supplier',
            sorter: (a, b) => a.supplier.localeCompare(b.supplier),
        },
        {
            title: 'Commissioner',
            dataIndex: 'commissioner',
            sorter: (a, b) => (a.commissioner || '').localeCompare((b.commissioner || '')),
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
        },
        {
            title: 'Status',
            dataIndex: 'negotiationStatus',
            sorter: (a, b) => (a.negotiationStatus?.toString() || '').localeCompare((b.negotiationStatus?.toString() || '')),
            render: (_, {negotiationStatus}) => (
                <Tag color="geekblue" key={negotiationStatus}>
                    {negotiationStatus ?
                        (getEnumKeyByValue(NegotiationStatus, negotiationStatus)?.toString().toUpperCase()) :
                        '-'
                    }
                </Tag>
            )
        },
    ];

    const onChange: TableProps<TradePreviewPresentable>['onChange'] = (pagination, filters, sorter, extra) => {
        console.log('params', pagination, filters, sorter, extra);
    };

    useEffect(() => {
        loadData();

        return () => {
            dispatch(hideLoading());
        }
    }, []);

    return (
        <CardPage title={
            <div
                style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                Trades
            </div>
        }>
            <Table columns={columns} dataSource={trades} onChange={onChange}/>
        </CardPage>
    );
}

export default Trades;
