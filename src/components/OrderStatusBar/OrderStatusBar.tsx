import {Divider, Steps} from "antd";
import {EditOutlined, ImportOutlined, ProductOutlined, SendOutlined, TruckOutlined} from "@ant-design/icons";
import React from "react";

export interface OrderStatusBarProps {
    orderState: number;
}

export default function OrderStatusBar({orderState}: OrderStatusBarProps) {
    return (
        <>
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
                        icon: <ProductOutlined/>
                    },
                    {
                        title: 'Coffee Export',
                        icon: <SendOutlined/>
                    },
                    {
                        title: 'Coffee Shipment',
                        icon: <TruckOutlined/>
                    },
                    {
                        title: 'Coffee Import',
                        icon: <ImportOutlined/>
                    }
                ]}
            />
        </>
    )
}
