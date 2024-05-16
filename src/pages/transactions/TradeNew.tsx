import {GenericForm} from "../../components/GenericForm/GenericForm";
import {TradeType} from "@kbc-lib/coffee-trading-management-lib";
import {Button} from "antd";
import {CardPage} from "../../components/structure/CardPage/CardPage";
import React, {useEffect} from "react";
import {DeleteOutlined} from '@ant-design/icons';
import {paths} from "../../constants";
import {useNavigate, useLocation} from "react-router-dom";
import useTradeNew from "./logic/tradeNew";
import {useDispatch} from "react-redux";
import {hideLoading} from "../../redux/reducers/loadingSlice";
import OrderStatusBar from "../../components/OrderStatusBar/OrderStatusBar";

export const TradeNew = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const {type, elements, onSubmit} = useTradeNew();
    const dispatch = useDispatch();

    useEffect(() => {
        return () => {
            dispatch(hideLoading())
        }
    }, []);

    if (!location?.state?.supplierAddress || !location?.state?.productCategoryId) {
        navigate(paths.HOME);
    }
    else {
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
                {type === TradeType.ORDER && <OrderStatusBar orderState={0}/>}
                <GenericForm elements={elements} submittable={true} onSubmit={onSubmit}/>
            </CardPage>
        )
    }
    return(<></>);
}
