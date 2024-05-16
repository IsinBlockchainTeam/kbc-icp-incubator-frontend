import {Navigate, useNavigate} from "react-router-dom";
import {FormElement, FormElementType, GenericForm} from "../../components/GenericForm/GenericForm";
import {NotificationType, openNotification} from "../../utils/notification";
import {credentials, paths} from "../../constants";
import {CardPage} from "../../components/structure/CardPage/CardPage";
import {Button} from "antd";
import {DeleteOutlined} from "@ant-design/icons";
import React, {useContext, useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {hideLoading, showLoading} from "../../redux/reducers/loadingSlice";
import {RootState} from "../../redux/store";
import {EthServicesContext} from "../../providers/EthServicesProvider";
import {SignerContext} from "../../providers/SignerProvider";
import {ProductCategory} from "@kbc-lib/coffee-trading-management-lib";

export const OffersNew = () => {
    const {signer} = useContext(SignerContext);
    const {ethOfferService, ethMaterialService} = useContext(EthServicesContext);
    const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const userInfo = useSelector((state: RootState) => state.userInfo);

    useEffect(() => {
        loadProductCategories();
        return () => {
            dispatch(hideLoading());
        }
    }, []);

    async function loadProductCategories() {
        if (!ethMaterialService) {
            console.error("EthMaterialService not found");
            return;
        }
        try {
            dispatch(showLoading("Loading product categories..."));
            const pC = await ethMaterialService.getProductCategories();
            setProductCategories(pC);
        } catch (e: any) {
            console.log("error: ", e);
            openNotification("Error", "Error loading product categories", NotificationType.ERROR);
        } finally {
            dispatch(hideLoading());
        }
    }


    const onSubmit = async (values: any) => {
        if(!ethOfferService) {
            console.error("EthOfferService not found");
            return;
        }
        try {
            values['offeror'] = signer?.address || 'Unknown';
            dispatch(showLoading("Creating offer..."));
            await ethOfferService.saveOffer(values.offeror, values['product-category-id']);
            openNotification("Offer registered", `Offer for product category with ID "${values['product-category-id']}" has been registered correctly!`, NotificationType.SUCCESS, 1);
            navigate(paths.OFFERS);
        } catch (e: any) {
            console.log("error: ", e);
            openNotification("Error",   "Supplier not register", NotificationType.ERROR);
        } finally {
            dispatch(hideLoading())
        }
    }

    if(userInfo.role !== credentials.ROLE_EXPORTER) {
        return (
            <Navigate to={paths.HOME} />
        )
    }

    const elements: FormElement[] = [
        {type: FormElementType.TITLE, span: 24, label: 'Data'},
        {
            type: FormElementType.INPUT,
            span: 8,
            name: 'offeror',
            label: 'Offeror Company Address',
            required: false,
            defaultValue: signer?.address || 'Unknown',
            disabled: true
        },
        {
            type: FormElementType.SELECT,
            span: 8,
            name: 'product-category-id',
            label: 'Product Category ID',
            required: true,
            options: productCategories.map((productCategory) => ({label: productCategory.name, value: productCategory.id})),
            defaultValue: '',
            disabled: false
        },
    ];

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
