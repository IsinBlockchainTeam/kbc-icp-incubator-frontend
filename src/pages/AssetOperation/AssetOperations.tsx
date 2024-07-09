import React from 'react';
import { ColumnsType } from 'antd/es/table';
import { Button, Table } from 'antd';
import { CardPage } from '@/components/structure/CardPage/CardPage';
import { AssetOperation } from '@kbc-lib/coffee-trading-management-lib';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { paths } from '@/constants/paths';
import { useEthAssetOperation } from '@/providers/entities/EthAssetOperationProvider';

export const AssetOperations = () => {
    const { assetOperations } = useEthAssetOperation();
    const navigate = useNavigate();

    const columns: ColumnsType<AssetOperation> = [
        {
            title: 'Id',
            dataIndex: 'id',
            sorter: (a, b) => a.id - b.id,
            sortDirections: ['descend']
        },
        {
            title: 'Name',
            dataIndex: 'name',
            sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
            sortDirections: ['descend']
        },
        {
            title: 'Product category',
            dataIndex: 'outputMaterial.name',
            render: (_, { outputMaterial }) => {
                return outputMaterial ? outputMaterial.productCategory.name : 'No output material';
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
            <Table columns={columns} dataSource={assetOperations} />
        </CardPage>
    );
};

export default AssetOperations;
