import {CardPage} from "@/components/structure/CardPage/CardPage";
import {Button} from "antd";
import {DeleteOutlined} from "@ant-design/icons";
import {paths} from "@/constants/index";
import {FormElement, FormElementType, GenericForm} from "@/components/GenericForm/GenericForm";
import React, {useContext, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {NotificationType, openNotification} from "@/utils/notification";
import {useDispatch} from "react-redux";
import {hideLoading, showLoading} from "@/redux/reducers/loadingSlice";
import {EthContext} from "@/providers/EthProvider";
import {ProductCategory} from "@kbc-lib/coffee-trading-management-lib";

export const MaterialNew = () => {
    const {ethMaterialService} = useContext(EthContext);
    const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const elements: FormElement[] = [
        {type: FormElementType.TITLE, span: 24, label: 'Data'},
        {
            type: FormElementType.SELECT,
            span: 8,
            name: 'product-category-id',
            label: 'Product Category ID',
            required: true,
            options: productCategories.map((productCategory) => ({label: productCategory.name, value: productCategory.id})),
            defaultValue: '',
            disabled: false,
        },
    ];

    const onSubmit = async (values: any) => {
        try {
            dispatch(showLoading("Creating material..."));
            const productCategoryId: number = parseInt(values['product-category-id']);
            await ethMaterialService.saveMaterial(productCategoryId);
            openNotification("Material registered", `Material referencing product category with ID "${productCategoryId}" has been registered correctly!`, NotificationType.SUCCESS, 1);
            navigate(paths.MATERIALS);
        } catch (e: any) {
            console.log("error: ", e);
            openNotification("Error", e.message, NotificationType.ERROR);
        } finally {
            dispatch(hideLoading())
        }
    }

    useEffect(() => {
        loadProductCategories();
        return () => {
            dispatch(hideLoading())
        }
    }, []);

    async function loadProductCategories() {
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

    return (
        <CardPage title={
            <div
                style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                New Material
                <Button type="primary" danger icon={<DeleteOutlined/>} onClick={() => navigate(paths.MATERIALS)}>
                    Delete Material
                </Button>
            </div>
        }>
            <GenericForm elements={elements} submittable={true} onSubmit={onSubmit}/>
        </CardPage>
    );
}

export default MaterialNew;
