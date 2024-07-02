import { CardPage } from '@/components/structure/CardPage/CardPage';
import { Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { FormElement, FormElementType, GenericForm } from '@/components/GenericForm/GenericForm';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { regex } from '@/utils/regex';
import { paths } from '@/constants/paths';
import { useEthMaterial } from '@/providers/entities/EthMaterialProvider';

export const ProductCategoryNew = () => {
    const { saveProductCategory } = useEthMaterial();
    const navigate = useNavigate();

    const elements: FormElement[] = [
        { type: FormElementType.TITLE, span: 24, label: 'Data' },
        {
            type: FormElementType.INPUT,
            span: 8,
            name: 'name',
            label: 'Name',
            required: true,
            defaultValue: '',
            disabled: false
        },
        {
            type: FormElementType.INPUT,
            span: 8,
            name: 'quality',
            label: 'Quality',
            required: true,
            regex: regex.ONLY_DIGITS,
            defaultValue: '',
            disabled: false
        },
        {
            type: FormElementType.INPUT,
            span: 8,
            name: 'description',
            label: 'Description',
            required: true,
            defaultValue: '',
            disabled: false
        }
    ];

    const onSubmit = async (values: any) => {
        await saveProductCategory(values.name, values.quality, values.description);
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
                    New Product Category
                    <Button
                        type="primary"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => navigate(paths.MATERIALS)}>
                        Delete Product Category
                    </Button>
                </div>
            }>
            <GenericForm elements={elements} submittable={true} onSubmit={onSubmit} />
        </CardPage>
    );
};

export default ProductCategoryNew;
