import React from 'react';
import { Button, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { CardPage } from '@/components/CardPage/CardPage';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Material, ProductCategory } from '@kbc-lib/coffee-trading-management-lib';
import { paths } from '@/constants/paths';
import { useProductCategory } from '@/providers/entities/icp/ProductCategoryProvider';
import { useMaterial } from '@/providers/entities/icp/MaterialProvider';

export const Materials = () => {
    const { productCategories } = useProductCategory();
    const { materials } = useMaterial();
    const navigate = useNavigate();

    const productCategoriesColumns: ColumnsType<ProductCategory> = [
        {
            title: 'Id',
            dataIndex: 'id',
            sorter: (a, b) => (a.id && b.id ? a.id - b.id : 0),
            sortDirections: ['descend']
        },
        {
            title: 'Name',
            dataIndex: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name)
        },
        {
            title: 'Quality',
            dataIndex: 'quality',
            sorter: (a, b) => (a.quality && b.quality ? a.quality - b.quality : 0)
        }
    ];

    const materialsColumns: ColumnsType<Material> = [
        {
            title: 'Id',
            dataIndex: 'id',
            sorter: (a, b) => (a.id && b.id ? a.id - b.id : 0),
            sortDirections: ['descend']
        },
        {
            title: 'Product category',
            dataIndex: 'name',
            render: (_, { productCategory }) => productCategory.name,
            sorter: (a, b) => a.productCategory.name.localeCompare(b.productCategory.name)
        },
        {
            title: 'Typology',
            dataIndex: 'typology',
            sorter: (a, b) => a.typology.localeCompare(b.typology)
        },
        {
            title: 'Quality',
            dataIndex: 'quality',
            sorter: (a, b) => a.quality.localeCompare(b.quality)
        },
        {
            title: 'Moisture',
            dataIndex: 'moisture',
            sorter: (a, b) => a.moisture.localeCompare(b.moisture)
        }
    ];

    return (
        <>
            <CardPage
                title={
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                        Product Categories
                        <div>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => navigate(paths.PRODUCT_CATEGORY_NEW)}
                                style={{ marginRight: '16px' }}>
                                New Product Category
                            </Button>
                        </div>
                    </div>
                }>
                <Table columns={productCategoriesColumns} dataSource={productCategories} rowKey="id" />
            </CardPage>
            <div style={{ height: '16px' }} />
            <CardPage
                title={
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                        Materials
                        <div>
                            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate(paths.MATERIAL_NEW)}>
                                New Material
                            </Button>
                        </div>
                    </div>
                }>
                <Table columns={materialsColumns} dataSource={materials} rowKey="id" />
            </CardPage>
        </>
    );
};

export default Materials;
