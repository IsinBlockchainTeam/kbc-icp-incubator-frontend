import {useNavigate} from "react-router-dom";
import {BlockchainOfferStrategy} from "../../api/strategies/offer/BlockchainOfferStrategy";
import {OfferService} from "../../api/services/OfferService";
import {FormElement, FormElementType, GenericForm} from "../../components/GenericForm/GenericForm";
import {NotificationType, openNotification} from "../../utils/notification";
import {paths} from "../../constants";
import {CardPage} from "../../components/structure/CardPage/CardPage";
import {Button} from "antd";
import {DeleteOutlined} from "@ant-design/icons";
import React from "react";

export const OffersNew = () => {
    const navigate = useNavigate();

    const offerService = new OfferService(new BlockchainOfferStrategy());

    const elements: FormElement[] = [
        {type: FormElementType.TITLE, span: 24, label: 'Data'},
        {
            type: FormElementType.INPUT,
            span: 8,
            name: 'offeror',
            label: 'Offeror Company Address',
            required: true,
            regex: '0x[a-fA-F0-9]{40}',
            defaultValue: '',
            disabled: false
        },
        {
            type: FormElementType.INPUT,
            span: 8,
            name: 'product-category-id',
            label: 'Product Category ID',
            required: true,
            regex: '^\\d+$',
            defaultValue: '',
            disabled: false
        },
    ];

    const onSubmit = async (values: any) => {
        await offerService.saveOffer(values.offeror, values['product-category-id']);
        openNotification("Offer registered", `Offer for product category with ID "${values['product-category-id']}" has been registered correctly!`, NotificationType.SUCCESS, 1);
        navigate(paths.OFFERS);
    }

    return (
        <CardPage title={
            <div
                style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                New Offer
                <Button type="primary" danger icon={<DeleteOutlined/>} onClick={() => navigate(paths.OFFERS)}>
                    Delete Offer
                </Button>
            </div>
        }>
            <GenericForm elements={elements} submittable={true} onSubmit={onSubmit}/>
        </CardPage>
    );
}

export default OffersNew;