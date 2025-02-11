import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { FormElement, FormElementType, GenericForm } from '@/components/GenericForm/GenericForm';
import { CardPage } from '@/components/CardPage/CardPage';
import { Button, Empty } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useSigner } from '@/providers/auth/SignerProvider';
import { paths } from '@/constants/paths';
import { credentials } from '@/constants/ssi';
import { useOffer } from '@/providers/entities/icp/OfferProvider';
import { useMaterial } from '@/providers/entities/icp/MaterialProvider';
import { useSession } from '@/providers/auth/SessionProvider';
import { MaterialInfoCardContent } from '@/components/CardContents/MaterialInfoCardContent';

export const OfferNew = () => {
    const { materials } = useMaterial();
    const { saveOffer } = useOffer();
    const { getLoggedOrganization } = useSession();
    const { signer } = useSigner();
    const navigate = useNavigate();
    const userInfo = useSelector((state: RootState) => state.userInfo);

    const onSubmit = async (values: any) => {
        values['offeror'] = signer._address;
        await saveOffer(values['material-id']);
        navigate(paths.OFFERS);
    };

    if (userInfo.companyClaims.role !== credentials.ROLE_EXPORTER) {
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
            defaultValue: getLoggedOrganization().legalName,
            disabled: true
        },
        {
            type: FormElementType.SELECT,
            span: 8,
            name: 'material-id',
            label: 'Material',
            required: true,
            options: materials
                .filter((material) => !material.isInput)
                .map((material) => ({
                    label: material.name,
                    value: material.id
                })),
            defaultValue: '',
            disabled: false
        },
        {
            type: FormElementType.CARD,
            span: 8,
            name: 'material-details',
            title: 'Material details',
            hidden: false,
            content: (values) => {
                if (values && values['material-id'] !== undefined) {
                    const selectedMaterial = materials.find((material) => material.id === values['material-id']);
                    return <MaterialInfoCardContent material={selectedMaterial} />;
                }
                return <Empty />;
            }
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
                    <Button type="primary" danger icon={<DeleteOutlined />} onClick={() => navigate(paths.OFFERS)}>
                        Delete Offer
                    </Button>
                </div>
            }>
            {elements && (
                <GenericForm elements={elements} confirmText="Are you sure you want to create this offer?" submittable={true} onSubmit={onSubmit} />
            )}
        </CardPage>
    );
};

export default OfferNew;
