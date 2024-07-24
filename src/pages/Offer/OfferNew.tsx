import { Navigate, useNavigate } from 'react-router-dom';
import { FormElement, FormElementType, GenericForm } from '@/components/GenericForm/GenericForm';
import { CardPage } from '@/components/structure/CardPage/CardPage';
import { Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useSigner } from '@/providers/SignerProvider';
import { paths } from '@/constants/paths';
import { credentials } from '@/constants/ssi';
import { useEthMaterial } from '@/providers/entities/EthMaterialProvider';
import { useEthOffer } from '@/providers/entities/EthOfferProvider';
import { useICPName } from '@/providers/entities/ICPNameProvider';

export const OfferNew = () => {
    const { productCategories } = useEthMaterial();
    const { saveOffer } = useEthOffer();
    const { getName } = useICPName();
    const { signer } = useSigner();
    const navigate = useNavigate();
    const userInfo = useSelector((state: RootState) => state.userInfo);

    const onSubmit = async (values: any) => {
        values['offeror'] = signer?._address || 'Unknown';
        await saveOffer(values.offeror, values['product-category-id']);
        navigate(paths.OFFERS);
    };

    if (userInfo.role !== credentials.ROLE_EXPORTER) {
        return <Navigate to={paths.HOME} />;
    }

    const elements: FormElement[] = [
        { type: FormElementType.TITLE, span: 24, label: 'Data' },
        {
            type: FormElementType.INPUT,
            span: 8,
            name: 'offeror',
            label: 'Offeror Company Address',
            required: true,
            defaultValue: getName(signer._address),
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
