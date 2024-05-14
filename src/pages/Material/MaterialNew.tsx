import {CardPage} from "../../components/structure/CardPage/CardPage";
import {Button} from "antd";
import {DeleteOutlined} from "@ant-design/icons";
import {paths} from "../../constants";
import {FormElement, FormElementType, GenericForm} from "../../components/GenericForm/GenericForm";
import React, {useContext, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {NotificationType, openNotification} from "../../utils/notification";
import {regex} from "../../utils/regex";
import {useDispatch} from "react-redux";
import {hideLoading, showLoading} from "../../redux/reducers/loadingSlice";
import {EthServicesContext} from "../../providers/EthServicesProvider";

export const MaterialNew = () => {
    const {ethMaterialService} = useContext(EthServicesContext);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const elements: FormElement[] = [
        {type: FormElementType.TITLE, span: 24, label: 'Data'},
        {
            type: FormElementType.INPUT,
            span: 8,
            name: 'product-category-id',
            label: 'Product Category ID',
            required: true,
            regex: regex.ONLY_DIGITS,
            defaultValue: '',
            disabled: false,
        },
    ];

    const onSubmit = async (values: any) => {
        if (!ethMaterialService) {
            console.error("EthMaterialService not found");
            return;
        }
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
        return () => {
            dispatch(hideLoading())
        }
    }, []);

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
