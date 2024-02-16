import {CardPage} from "../../components/structure/CardPage/CardPage";
import {Button} from "antd";
import {DeleteOutlined} from "@ant-design/icons";
import {paths} from "../../constants";
import {FormElement, FormElementType, GenericForm} from "../../components/GenericForm/GenericForm";
import React from "react";
import {useNavigate} from "react-router-dom";
import {BlockchainMaterialStrategy} from "../../api/strategies/material/BlockchainMaterialStrategy";
import {MaterialService} from "../../api/services/MaterialService";
import {NotificationType, openNotification} from "../../utils/notification";

export const MaterialNew = () => {
    const navigate = useNavigate();

    const materialService = new MaterialService(new BlockchainMaterialStrategy());

    const elements: FormElement[] = [
        {type: FormElementType.TITLE, span: 24, label: 'Data'},
        {
            type: FormElementType.INPUT,
            span: 8,
            name: 'product-category-id',
            label: 'Product Category Id',
            required: true,
            regex: '[0-9]+',
            defaultValue: '',
            disabled: false,
        },

    ];

    const onSubmit = async (values: any) => {
        const productCategoryId: number = parseInt(values['product-category-id']);
        await materialService.saveMaterial(productCategoryId);
        openNotification("Material registered", `Material referencing product category with ID "${productCategoryId}" has been registered correctly!`, NotificationType.SUCCESS);
        navigate(paths.MATERIALS);
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
