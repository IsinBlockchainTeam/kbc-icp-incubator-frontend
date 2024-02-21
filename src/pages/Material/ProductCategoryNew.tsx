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
import {regex} from "../../utils/regex";

export const ProductCategoryNew = () => {
    const navigate = useNavigate();

    const materialService = new MaterialService(new BlockchainMaterialStrategy());

    const elements: FormElement[] = [
        {type: FormElementType.TITLE, span: 24, label: 'Data'},
        {
            type: FormElementType.INPUT,
            span: 8,
            name: 'name',
            label: 'Name',
            required: true,
            defaultValue: '',
            disabled: false,
        },
        {
            type: FormElementType.INPUT,
            span: 8,
            name: 'quality',
            label: 'Quality',
            required: true,
            regex: regex.ONLY_DIGITS,
            defaultValue: '',
            disabled: false,
        },
        {
            type: FormElementType.INPUT,
            span: 8,
            name: 'description',
            label: 'Description',
            required: true,
            defaultValue: '',
            disabled: false,
        },
    ];

    const onSubmit = async (values: any) => {
        await materialService.saveProductCategory(values.name, values.quality, values.description);
        openNotification("Product category registered", `Product category "${values.name}" has been registered correctly!`, NotificationType.SUCCESS, 1);
        navigate(paths.MATERIALS);
    }

    return (
        <CardPage title={
            <div
                style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                New Product Category
                <Button type="primary" danger icon={<DeleteOutlined/>} onClick={() => navigate(paths.MATERIALS)}>
                    Delete Product Category
                </Button>
            </div>
        }>
            <GenericForm elements={elements} submittable={true} onSubmit={onSubmit}/>
        </CardPage>
    );
}

export default ProductCategoryNew;
