import { CardPage } from '@/components/CardPage/CardPage';
import { Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { FormElement, FormElementType, GenericForm } from '@/components/GenericForm/GenericForm';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { paths } from '@/constants/paths';
import { useMaterial } from '@/providers/entities/icp/MaterialProvider';
import { useProductCategory } from '@/providers/entities/icp/ProductCategoryProvider';

export const MaterialNew = () => {
    const { saveMaterial } = useMaterial();
    const { productCategories } = useProductCategory();
    const navigate = useNavigate();

    const elements: FormElement[] = [
        { type: FormElementType.TITLE, span: 24, label: 'Data' },
        {
            type: FormElementType.SELECT,
            span: 8,
            name: 'product-category-id',
            label: 'Product Category ID',
            required: true,
            options: productCategories.map((productCategory) => ({
                label: productCategory.name,
                value: productCategory.id
            })),
            defaultValue: '',
            disabled: false
        }
    ];

    const onSubmit = async (values: any) => {
        const productCategoryId: number = parseInt(values['product-category-id']);
        await saveMaterial(productCategoryId);
        navigate(paths.MATERIALS);
    };

    return (
        <CardPage
            title={
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                    New Material
                    <Button type="primary" danger icon={<DeleteOutlined />} onClick={() => navigate(paths.MATERIALS)}>
                        Delete Material
                    </Button>
                </div>
            }>
            <GenericForm elements={elements} confirmText="Are you sure you want to create this material?" submittable={true} onSubmit={onSubmit} />
        </CardPage>
    );
};

export default MaterialNew;
