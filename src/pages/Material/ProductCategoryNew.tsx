import { CardPage } from '@/components/structure/CardPage/CardPage';
import { Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { FormElement, FormElementType, GenericForm } from '@/components/GenericForm/GenericForm';
import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NotificationType, openNotification } from '@/utils/notification';
import { regex } from '@/utils/regex';
import { hideLoading, showLoading } from '@/redux/reducers/loadingSlice';
import { useDispatch } from 'react-redux';
import { EthContext } from '@/providers/EthProvider';
import { paths } from '@/constants/paths';

export const ProductCategoryNew = () => {
    const { ethMaterialService } = useContext(EthContext);
    const navigate = useNavigate();
    const dispatch = useDispatch();

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
        try {
            dispatch(showLoading('Creating product category...'));
            await ethMaterialService.saveProductCategory(
                values.name,
                values.quality,
                values.description
            );
            openNotification(
                'Product category registered',
                `Product category "${values.name}" has been registered correctly!`,
                NotificationType.SUCCESS,
                1
            );
            navigate(paths.MATERIALS);
        } catch (e: any) {
            console.log('error: ', e);
            openNotification('Error', e.message, NotificationType.ERROR);
        } finally {
            dispatch(hideLoading());
        }
    };

    useEffect(() => {
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
