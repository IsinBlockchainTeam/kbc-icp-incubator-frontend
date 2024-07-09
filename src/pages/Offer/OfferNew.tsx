import { Navigate, useNavigate } from 'react-router-dom';
import { FormElement, FormElementType, GenericForm } from '@/components/GenericForm/GenericForm';
import { NotificationType, openNotification } from '@/utils/notification';
import { CardPage } from '@/components/structure/CardPage/CardPage';
import { Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import React, { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { hideLoading, showLoading } from '@/redux/reducers/loadingSlice';
import { RootState } from '@/redux/store';
import { EthContext } from '@/providers/EthProvider';
import { SignerContext } from '@/providers/SignerProvider';
import { ProductCategory } from '@kbc-lib/coffee-trading-management-lib';
import { ICPContext } from '@/providers/ICPProvider';
import { paths } from '@/constants/paths';
import { NOTIFICATION_DURATION } from '@/constants/notification';
import { credentials, DID_METHOD } from '@/constants/ssi';

export const OfferNew = () => {
    const { signer } = useContext(SignerContext);
    const { ethOfferService, ethMaterialService } = useContext(EthContext);
    const { getNameByDID } = useContext(ICPContext);
    const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const userInfo = useSelector((state: RootState) => state.userInfo);
    const [elements, setElements] = React.useState<FormElement[]>([]);

    useEffect(() => {
        loadProductCategories();
        return () => {
            dispatch(hideLoading());
        };
    }, []);

    useEffect(() => {
        loadElements();
    }, [productCategories]);

    async function loadProductCategories() {
        try {
            dispatch(showLoading('Loading product categories...'));
            const pC = await ethMaterialService.getProductCategories();
            setProductCategories(pC);
        } catch (e: any) {
            console.log('error: ', e);
            openNotification(
                'Error',
                'Error loading product categories',
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(hideLoading());
        }
    }

    async function loadElements() {
        try {
            dispatch(showLoading('Loading elements...'));
            const supplierName =
                (await getNameByDID(DID_METHOD + ':' + signer?.address)) || 'Unknown';
            setElements([
                { type: FormElementType.TITLE, span: 24, label: 'Data' },
                {
                    type: FormElementType.INPUT,
                    span: 8,
                    name: 'offeror',
                    label: 'Offeror Company Address',
                    required: true,
                    defaultValue: supplierName,
                    disabled: true
                },
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
            ]);
        } catch (e: any) {
            console.log('error: ', e);
            openNotification(
                'Error',
                'Error loading elements',
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(hideLoading());
        }
    }

    const onSubmit = async (values: any) => {
        try {
            values['offeror'] = signer?.address || 'Unknown';
            dispatch(showLoading('Creating offer...'));
            await ethOfferService.saveOffer(values.offeror, values['product-category-id']);
            openNotification(
                'Offer registered',
                `Offer for product category with ID "${values['product-category-id']}" has been registered correctly!`,
                NotificationType.SUCCESS,
                NOTIFICATION_DURATION
            );
            navigate(paths.OFFERS);
        } catch (e: any) {
            console.log('error: ', e);
            openNotification(
                'Error',
                'Error saving offer',
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(hideLoading());
        }
    };

    if (userInfo.role !== credentials.ROLE_EXPORTER) {
        return <Navigate to={paths.HOME} />;
    }

    return (
        <CardPage
            title={
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                    New Offer
                    <Button
                        type="primary"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => navigate(paths.OFFERS)}>
                        Delete Offer
                    </Button>
                </div>
            }>
            {elements && <GenericForm elements={elements} submittable={true} onSubmit={onSubmit} />}
        </CardPage>
    );
};

export default OfferNew;
