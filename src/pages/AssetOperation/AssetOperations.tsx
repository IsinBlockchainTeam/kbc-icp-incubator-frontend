import React from 'react';
import { CardPage } from '@/components/CardPage/CardPage';
import { Button, Table, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { paths } from '@/constants/paths';
import { useAssetOperation } from '@/providers/entities/icp/AssetOperationProvider';
import { Link, useNavigate } from 'react-router-dom';
import { ColumnsType } from 'antd/es/table';
import { AssetOperation } from '@kbc-lib/coffee-trading-management-lib';
import { setParametersPath } from '@/utils/page';
import { InfoCard } from '@/components/InfoCard/InfoCard';

const { Text } = Typography;

export const AssetOperations = () => {
    const { assetOperations } = useAssetOperation();
    const navigate = useNavigate();

    const assetOperationInfo = {
        title: 'Asset Operations Overview',
        items: [
            <Text>
                This page displays all asset operations in your supply chain.
            </Text>,
            <Text>
                Each operation represents a transformation step in your asset management process, from raw materials to finished products.
            </Text>
        ],
        marginTop: '0px',
        collapsed: true,
        image: './assets/coffee-operations.png'
    };

    const columns: ColumnsType<AssetOperation> = [
        {
            title: 'Id',
            dataIndex: 'id',
            sorter: (a, b) => a.id - b.id,
            sortDirections: ['descend'],
            render: (id) => {
                return <Link to={setParametersPath(`${paths.ASSET_OPERATIONS_VIEW}`, { id })}>{id}</Link>;
            }
        },
        {
            title: 'Name',
            dataIndex: 'name',
            sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
            sortDirections: ['descend']
        },
        {
            title: 'Material (output)',
            dataIndex: 'outputMaterial.name',
            render: (_, { outputMaterial }) => {
                return outputMaterial ? outputMaterial.name : 'No output material';
            },
            sorter: (a, b) => (a.outputMaterial?.name || '').localeCompare(b.outputMaterial?.name || ''),
            sortDirections: ['descend']
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
                    Asset Operations
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate(paths.ASSET_OPERATIONS_NEW)}
                        style={{ marginRight: '16px' }}>
                        New Asset Operation
                    </Button>
                </div>
            }>
            <InfoCard {...assetOperationInfo} />
            <Table columns={columns} dataSource={assetOperations} />
        </CardPage>
    );
};

export default AssetOperations;
