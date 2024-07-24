import { Navigate, useNavigate } from 'react-router-dom';
import { FormElement, FormElementType, GenericForm } from '@/components/GenericForm/GenericForm';
import { NotificationType, openNotification } from '@/utils/notification';
import { CardPage } from '@/components/structure/CardPage/CardPage';
import { Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import React, { useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { hideLoading, showLoading } from '@/redux/reducers/loadingSlice';
import { RootState } from '@/redux/store';
import { SignerContext } from '@/providers/SignerProvider';
import { EthContext } from '@/providers/EthProvider';
import { formatAddress } from '@/utils/format';
import { paths } from '@/constants/paths';
import { NOTIFICATION_DURATION } from '@/constants/notification';
import { credentials } from '@/constants/ssi';

export const OfferSupplierNew = () => {
    const { signer } = useContext(SignerContext);
    const { ethOfferService } = useContext(EthContext);
    const userInfo = useSelector((state: RootState) => state.userInfo);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const elements: FormElement[] = [
        { type: FormElementType.TITLE, span: 24, label: 'Data' },
        {
            type: FormElementType.INPUT,
            span: 8,
            name: 'supplier-address',
            label: 'Supplier Address',
            required: false,
            defaultValue: signer?._address || 'Unknown',
            disabled: true
        },
        {
            type: FormElementType.INPUT,
            span: 8,
            name: 'supplier-name',
            label: 'Supplier Name',
            required: false,
            defaultValue: userInfo.legalName || 'Unknown',
            disabled: true
        }
    ];

    const onSubmit = async (values: any) => {
        values['supplier-address'] = signer?._address || 'Unknown';
        values['supplier-name'] = userInfo.legalName || 'Unknown';
        await saveSupplier(values['supplier-address'], values['supplier-name']);
        navigate(paths.OFFERS);
    };

    useEffect(() => {
        return () => {
            dispatch(hideLoading());
        };
    }, []);

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
                    New Offer Supplier
                    <Button
                        type="primary"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => navigate(paths.OFFERS)}>
                        Delete Offer Supplier
                    </Button>
                </div>
            }>
            <GenericForm elements={elements} submittable={true} onSubmit={onSubmit} />
        </CardPage>
    );
};

export default OfferSupplierNew;
