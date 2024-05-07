import {Navigate, useNavigate} from "react-router-dom";
import {EthOfferService} from "../../api/services/EthOfferService";
import {FormElement, FormElementType, GenericForm} from "../../components/GenericForm/GenericForm";
import {NotificationType, openNotification} from "../../utils/notification";
import {credentials, paths} from "../../constants";
import {CardPage} from "../../components/structure/CardPage/CardPage";
import {Button} from "antd";
import {DeleteOutlined} from "@ant-design/icons";
import React, {useEffect} from "react";
import {regex} from "../../utils/regex";
import {useDispatch, useSelector} from "react-redux";
import {hideLoading, showLoading} from "../../redux/reducers/loadingSlice";
import {RootState} from "../../redux/store";

export const OffersNew = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const userInfo = useSelector((state: RootState) => state.userInfo);

    const offerService = new EthOfferService();

    const elements: FormElement[] = [
        {type: FormElementType.TITLE, span: 24, label: 'Data'},
        {
            type: FormElementType.INPUT,
            span: 8,
            name: 'offeror',
            label: 'Offeror Company Address',
            required: true,
            regex: regex.ETHEREUM_ADDRESS,
            defaultValue: '',
            disabled: false
        },
        {
            type: FormElementType.INPUT,
            span: 8,
            name: 'product-category-id',
            label: 'Product Category ID',
            required: true,
            regex: regex.ONLY_DIGITS,
            defaultValue: '',
            disabled: false
        },
    ];

    const onSubmit = async (values: any) => {
        try {
            dispatch(showLoading("Creating offer..."));
            await offerService.saveOffer(values.offeror, values['product-category-id']);
            openNotification("Offer registered", `Offer for product category with ID "${values['product-category-id']}" has been registered correctly!`, NotificationType.SUCCESS, 1);
            navigate(paths.OFFERS);
        } catch (e: any) {
            console.log("error: ", e);
            openNotification("Error", e.message, NotificationType.ERROR);
        } finally {
            dispatch(hideLoading())
        }
    }

    useEffect(() => {
        return () => {
            dispatch(hideLoading());
        }
    }, []);

    if(userInfo.role !== credentials.ROLE_EXPORTER) {
        return (
            <Navigate to={paths.HOME} />
        )
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
