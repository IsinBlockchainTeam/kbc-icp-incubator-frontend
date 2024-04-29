import {GenericForm} from "../../../components/GenericForm/GenericForm";
import {TradeType} from "@kbc-lib/coffee-trading-management-lib";
import {getEnumKeyByValue} from "../../../utils/utils";
import {Alert, Button, Divider, Dropdown, Steps, Typography} from "antd";
import {CardPage} from "../../../components/structure/CardPage/CardPage";
import React, {useEffect} from "react";
import {
    DeleteOutlined,
    DownOutlined,
    EditOutlined,
    ImportOutlined,
    ProductOutlined,
    SendOutlined,
    TruckOutlined
} from '@ant-design/icons';
import {paths} from "../../../constants";
import {useNavigate} from "react-router-dom";
import useTradeNew from "./logic/tradeNew";
import {useDispatch} from "react-redux";
import {hideLoading} from "../../../redux/reducers/loadingSlice";

const {Text} = Typography;

export const TradeNew = () => {
    const navigate = useNavigate();
    const {type, orderState, elements, menuProps, onSubmit} = useTradeNew();
    const dispatch = useDispatch();

    useEffect(() => {
        return () => {
            dispatch(hideLoading())
        }
    }, []);

    return (
        <CardPage title={
            <div
                style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                New Trade
                <Button type="primary" danger icon={<DeleteOutlined/>} onClick={() => navigate(paths.TRADES)}>
                    Delete Trade
                </Button>
            </div>
        }>
            <div style={{display: "flex", alignItems: "center"}}>
                <Text style={{marginRight: '16px'}} strong>Trade Type:</Text>
                <Dropdown menu={menuProps} trigger={['click']}>
                    <Button>{getEnumKeyByValue(TradeType, type)} <DownOutlined/></Button>
                </Dropdown>
            </div>
            {type === TradeType.ORDER &&
                <>
                    <Alert
                        message="Work in progress"
                        description="Due to the migration to ICP storage, some of the trade constraints are not uploadable."
                        type="warning"
                        showIcon
                        style={{marginTop: '16px'}}
                    />
                    <Divider>Order status</Divider>
                    <Steps
                        type="navigation"
                        current={orderState}
                        className="order-status"
                        items={[
                            {
                                status: 'process',
                                title: 'Contract stipulation',
                                icon: <EditOutlined/>
                            },
                            {
                                title: 'Coffee Production',
                                icon: <ProductOutlined />
                            },
                            {
                                title: 'Coffee Export',
                                icon: <SendOutlined/>
                            },
                            {
                                title: 'Coffee Shipment',
                                icon: <TruckOutlined />
                            },
                            {
                                title: 'Coffee Import',
                                icon: <ImportOutlined />
                            }
                        ]}
                    />
                </>
            }
            <GenericForm elements={elements} submittable={true} onSubmit={onSubmit}/>
        </CardPage>
    )
}
