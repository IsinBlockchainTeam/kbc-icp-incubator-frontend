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
            type: FormElementType.INPUT,
            span: 12,
            name: 'name',
            label: 'Name',
            required: true,
            defaultValue: '',
            disabled: false
        },
        {
            type: FormElementType.SELECT,
            span: 12,
            name: 'product-category-id',
            label: 'Product Category ID',
            required: true,
            options: productCategories.map((productCategory) => ({
                label: productCategory.name,
                value: productCategory.id
            })),
            defaultValue: '',
            disabled: false
        },
        {
            type: FormElementType.INPUT,
            span: 12,
            name: 'typology',
            label: 'Typology',
            required: true,
            defaultValue: '',
            disabled: false
        },
        {
            type: FormElementType.INPUT,
            span: 12,
            name: 'quality',
            label: 'Quality',
            required: true,
            defaultValue: '',
            disabled: false
        },
        {
            type: FormElementType.INPUT,
            span: 12,
            name: 'moisture',
            label: 'Moisture',
            required: true,
            defaultValue: '',
            disabled: false
        },
        {
            type: FormElementType.SELECT,
            span: 12,
            name: 'type',
            label: 'Type',
            required: true,
            options: [
                { label: 'Input', value: 'input' },
                { label: 'Output', value: 'output' }
            ],
            defaultValue: 'output',
            disabled: false
        }
    ];

    const onSubmit = async (values: any) => {
        const productCategoryId: number = parseInt(values['product-category-id']);
        const isInput = values.type === 'input';
        await saveMaterial(values.name, productCategoryId, values.typology, values.quality, values.moisture, isInput);
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
                        Cancel
                    </Button>
                </div>
            }>
            <GenericForm elements={elements} confirmText="Are you sure you want to create this material?" submittable={true} onSubmit={onSubmit} />
        </CardPage>
    );
};

export default MaterialNew;
