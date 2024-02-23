import {useNavigate} from "react-router-dom";
import {
    BlockchainAssetOperationStrategy
} from "../../../api/strategies/asset_operation/BlockchainAssetOperationStrategy";
import {TransformationService} from "../../../api/services/TransformationService";
import {FormElement, FormElementType, GenericForm} from "../../../components/GenericForm/GenericForm";
import {Button} from "antd";
import {DeleteOutlined} from "@ant-design/icons";
import {paths} from "../../../constants";
import {CardPage} from "../../../components/structure/CardPage/CardPage";
import React, {useEffect, useState} from "react";
import {MaterialPresentable} from "../../../api/types/MaterialPresentable";
import {AssetOperationPresentable} from "../../../api/types/AssetOperationPresentable";
import {NotificationType, openNotification} from "../../../utils/notification";
import {v4 as uuid} from "uuid";
import {regex} from "../../../utils/regex";

export const AssetOperationsNew = () => {
    const navigate = useNavigate();

    const transformationService = new TransformationService(new BlockchainAssetOperationStrategy());

    const [inputMaterials, setInputMaterials] = useState<FormElement[]>([
        {
            type: FormElementType.INPUT,
            span: 8,
            name: 'input-material-id-1',
            label: 'Input Material ID',
            required: true,
            regex: regex.ONLY_DIGITS,
            defaultValue: '',
            disabled: false,
        },
        {type: FormElementType.SPACE, span: 16},
    ]);

    const [, setLineOrder] = useState<string[]>([]);

    const getLineId = (): string => {
        const id: string = uuid();
        setLineOrder((prev) => [...prev, id]);
        return id;
    }

    const addInputMaterial = () => {
        const id: string = getLineId();
        setInputMaterials([...inputMaterials,
            {
                type: FormElementType.INPUT,
                span: 8,
                name: `input-material-id-${id}`,
                label: 'Input Material ID',
                required: true,
                regex: regex.ONLY_DIGITS,
                defaultValue: '',
                disabled: false,
            },
            {
                type: FormElementType.BUTTON,
                span: 4,
                name: `delete-input-material-${id}`,
                label: 'Delete input material',
                disabled: false,
                onClick: () => deleteInputMaterial(id),
                buttonType: 'default',
                additionalProperties: 'danger',
            },
            {type: FormElementType.SPACE, span: 12},
        ]);
    }

    const deleteInputMaterial = (id: string) => {
        let index: number;
        setLineOrder((currentLineOrder) => {
            index = currentLineOrder.indexOf(id);
            return currentLineOrder.filter((lineId) => lineId !== id);
        });

        setInputMaterials((currentInputMaterials) => {
            const start: number = 2 + index * 3;
            const end = start + 3;

            return currentInputMaterials.filter((_, i) => i < start || i >= end);
        });
    }

    const [elements, setElements] = useState<FormElement[]>([]);

    useEffect(() => {
        setElements([
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
            {type: FormElementType.SPACE, span: 16},
            ...inputMaterials,
            {
                type: FormElementType.BUTTON,
                span: 24,
                name: 'new-input-material',
                label: 'New input material',
                disabled: false,
                onClick: addInputMaterial
            },
            {
                type: FormElementType.INPUT,
                span: 8,
                name: 'output-material-id',
                label: 'Output Material ID',
                required: true,
                regex: regex.ONLY_DIGITS,
                defaultValue: '',
                disabled: false,
            },
            {type: FormElementType.TITLE, span: 24, label: 'Coordinates'},
            {
                type: FormElementType.INPUT,
                span: 12,
                name: 'latitude',
                label: 'Latitude',
                required: true,
                regex: regex.COORDINATES,
                defaultValue: '',
                disabled: false,
            },
            {
                type: FormElementType.INPUT,
                span: 12,
                name: 'longitude',
                label: 'Longitude',
                required: true,
                regex: regex.COORDINATES,
                defaultValue: '',
                disabled: false,
            },
        ])
    }, [inputMaterials]);

    const onSubmit = async (values: any) => {
        const assetOperation: AssetOperationPresentable = new AssetOperationPresentable();
        assetOperation.setName(values['name']);
        assetOperation.setOutputMaterial(new MaterialPresentable(values['output-material-id']));
        assetOperation.setLatitude(values['latitude']);
        assetOperation.setLongitude(values['longitude']);

        const inputMaterialIds: MaterialPresentable[] = [];
        for (const key in values) {
            if (key.startsWith('input-material-id-')) {
                const id: number = parseInt(values[key]);
                inputMaterialIds.push(new MaterialPresentable(id))
            }
        }
        assetOperation.setInputMaterials(inputMaterialIds);

        await transformationService.saveTransformation(assetOperation);
        openNotification("Asset operation registered", `Asset operation "${assetOperation.name}" has been registered correctly!`, NotificationType.SUCCESS, 1);
        navigate(paths.ASSET_OPERATIONS);
    }

    return (
        <CardPage title={
            <div
                style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                New Asset Operation
                <Button type="primary" danger icon={<DeleteOutlined/>} onClick={() => navigate(paths.ASSET_OPERATIONS)}>
                    Delete Asset Operation
                </Button>
            </div>
        }>
            <GenericForm elements={elements} submittable={true} onSubmit={onSubmit}/>
        </CardPage>
    );
}

export default AssetOperationsNew;
