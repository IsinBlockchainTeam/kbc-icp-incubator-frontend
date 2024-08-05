import { Button, Space, Table, Tag } from 'antd';
import { ColumnsType } from 'antd/es/table';
import React from 'react';
import { Shipment, ShipmentStatus } from '@kbc-lib/coffee-trading-management-lib';
import { useEthShipment } from '@/providers/entities/EthShipmentProvider';
import { setParametersPath } from '@/utils/page';
import { paths } from '@/constants/paths';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { credentials } from '@/constants/ssi';

export const Shipments = () => {
    const { id } = useParams();
    const { shipments, getShipmentStatus } = useEthShipment();
    const navigate = useNavigate();
    const userInfo = useSelector((state: RootState) => state.userInfo);
    const isExporter = userInfo.role.toUpperCase() === credentials.ROLE_EXPORTER;

    const onAddClick = () => {
        navigate(setParametersPath(paths.SHIPMENT_NEW, { id: id || '' }));
    };

    const onDetailsClick = (shipment: Shipment) => {
        navigate(
            setParametersPath(paths.SHIPMENT_VIEW, {
                id: id || '',
                shipmentId: shipment.id.toString()
            })
        );
    };

    const columns: ColumnsType<Shipment> = [
        {
            title: 'ID',
            dataIndex: 'id',
            sorter: (a, b) => a.id - b.id
        },
        {
            title: 'Date',
            dataIndex: 'date',
            sorter: (a, b) => a.date - b.date
        },
        {
            title: 'Quantity',
            dataIndex: 'quantity',
            sorter: (a, b) => a.quantity - b.quantity
        },
        {
            title: 'Weight',
            dataIndex: 'weight',
            sorter: (a, b) => a.weight - b.weight
        },
        {
            title: 'Status',
            render: (_, shipment) => (
                <Tag color="geekblue" key="status">
                    {ShipmentStatus[getShipmentStatus(shipment.id)]}
                </Tag>
            )
        },
        {
            key: 'details',
            render: (_, shipment) => (
                <Space size="middle">
                    <a role="details" onClick={() => onDetailsClick(shipment)}>
                        Details
                    </a>
                </Space>
            )
        }
    ];
    return (
        <>
            <Table columns={columns} dataSource={shipments} />
            {isExporter && (
                <Button type="primary" block style={{ marginTop: 10 }} onClick={onAddClick}>
                    Add Shipment
                </Button>
            )}
        </>
    );
};
