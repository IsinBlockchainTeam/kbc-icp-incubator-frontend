import React, { useContext, useEffect, useState } from 'react';
import { NotificationType, openNotification } from '@/utils/notification';
import { ColumnsType } from 'antd/es/table';
import { Button, Table, TableProps } from 'antd';
import { CardPage } from '@/components/structure/CardPage/CardPage';
import { AssetOperation } from '@kbc-lib/coffee-trading-management-lib';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { hideLoading, showLoading } from '@/redux/reducers/loadingSlice';
import { useDispatch } from 'react-redux';
import { EthContext } from '@/providers/EthProvider';
import { paths } from '@/constants/paths';

export const AssetOperations = () => {
    const { ethAssetOperationService } = useContext(EthContext);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [assetOperations, setAssetOperations] = useState<AssetOperation[]>();
    const loadData = async () => {
        try {
            dispatch(showLoading('Retrieving asset operations...'));
            const assetOperations = await ethAssetOperationService.getAssetOperations();
            setAssetOperations(
                assetOperations.map((t) => {
                    // @ts-ignore
                    t['key'] = t.id;
                    return t;
                })
            );
        } catch (e: any) {
            console.log('error: ', e);
            openNotification('Error', e.message, NotificationType.ERROR);
        } finally {
            dispatch(hideLoading());
        }
    };

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

    useEffect(() => {
        loadData();
        return () => {
            dispatch(hideLoading());
        };
    }, []);

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
