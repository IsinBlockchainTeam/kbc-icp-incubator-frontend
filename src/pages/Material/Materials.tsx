import { Button, Col, Table, Typography } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { CardPage } from '@/components/CardPage/CardPage';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Material, ProductCategory } from '@kbc-lib/coffee-trading-management-lib';
import { paths } from '@/constants/paths';
import { useProductCategory } from '@/providers/entities/icp/ProductCategoryProvider';
import { useMaterial } from '@/providers/entities/icp/MaterialProvider';
import { InfoCard } from '@/components/InfoCard/InfoCard';

const { Text } = Typography;

export const Materials = () => {
    const { productCategories } = useProductCategory();
    const { materials } = useMaterial();
    const navigate = useNavigate();

    const productCategoryInfo = {
        title: 'Product Categories Overview',
        items: [
            <Text>
                Product categories help organize your materials into logical groups. Each material must belong to a specific category.
            </Text>,
            <Text>
                Product categories are defined by the platform based on the most common ones.
            </Text>,
        ],
        marginTop: '0px',
        collapsed: true,
        image: './assets/coffee-bag-category.png'
    };

    const materialInfo = {
        title: 'Materials Overview',
        items: [
            <Text>
                This page manages your coffee materials and their categories. Each material is classified as either an input or output type:
            </Text>,
            <>
                <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                    Material Types:
                </Text>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    <li>
                        <Text strong>Input Materials: </Text>
                        <Text>Products received from external companies (e.g., green coffee beans from suppliers)</Text>
                    </li>
                    <li>
                        <Text strong>Output Materials: </Text>
                        <Text>Products you send to other companies (e.g., processed coffee ready for export)</Text>
                    </li>
                </ul>
            </>,
            <Text>
                Each material tracks important attributes like quality grade, moisture content, and typology to ensure product standards throughout the supply chain.
            </Text>
        ],
        marginTop: '0px',
        collapsed: true,
        image: './assets/coffee-bag-material.png'
    };

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
            title: 'Name',
            dataIndex: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name)
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
        },
        {
            title: 'Type',
            dataIndex: 'isInput',
            render: (isInput) => (isInput ? 'Input' : 'Output'),
            sorter: (a, b) => (a.isInput && b.isInput ? 0 : 1)
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
                    </div>
                }>
                <InfoCard {...productCategoryInfo} />
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
                <InfoCard {...materialInfo} />
                <Table columns={materialsColumns} dataSource={materials} rowKey="id" />
            </CardPage>
        </>
    );
};

export default Materials;
