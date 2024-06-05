import React, {useContext, useEffect} from "react";
import {CardPage} from "../../components/structure/CardPage/CardPage";
import {Table, TableProps, Tag, Tooltip} from "antd";
import {ExclamationCircleOutlined, CheckCircleOutlined, SettingOutlined} from "@ant-design/icons";
import {ColumnsType} from "antd/es/table";
import {NotificationType, openNotification} from "../../utils/notification";
import {setParametersPath} from "../../utils/utils";
import {TradePreviewPresentable} from "../../api/types/TradePresentable";
import {Link} from "react-router-dom";
import {paths} from "../../constants";
import {NegotiationStatus, TradeType} from "@kbc-lib/coffee-trading-management-lib";
import {useDispatch} from "react-redux";
import {hideLoading, showLoading} from "../../redux/reducers/loadingSlice";
import {EthContext} from "../../providers/EthProvider";

export const Trades = () => {
    const {ethTradeService} = useContext(EthContext);
    const [trades, setTrades] = React.useState<TradePreviewPresentable[]>();
    const dispatch = useDispatch();

    const loadData = async () => {
        try {
            dispatch(showLoading("Retrieving trades..."));
            const trades = await ethTradeService.getGeneralTrades();

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
                return TradeType[type];
            })
        },
        {
            title: 'Status',
            dataIndex: 'negotiationStatus',
            sorter: (a, b) => (a.negotiationStatus?.toString() || '').localeCompare((b.negotiationStatus?.toString() || '')),
            render: (_, {negotiationStatus}) => (
                <Tag color="geekblue" key={negotiationStatus}>
                    {negotiationStatus ?
                        (NegotiationStatus[negotiationStatus]?.toString().toUpperCase()) :
                        '-'
                    }
                </Tag>
            )
        },
        {
            title: <SettingOutlined />,
            dataIndex: 'actionRequired',
            render: (_, {actionRequired}) => {
                return actionRequired ?
                    <Tooltip title={actionRequired}><ExclamationCircleOutlined style={{fontSize: '1.5rem', color: 'orange'}}/></Tooltip> :
                    <Tooltip title={"There are no operations charged to you at this time"}><CheckCircleOutlined style={{fontSize: '1.5rem', color: 'green'}}/></Tooltip>
            }
        }
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
