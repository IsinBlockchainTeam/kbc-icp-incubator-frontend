import {useNavigate} from "react-router-dom";
import {EthAssetOperationService} from "../../api/services/EthAssetOperationService";
import {FormElement, FormElementType, GenericForm} from "../../components/GenericForm/GenericForm";
import {Button} from "antd";
import {DeleteOutlined} from "@ant-design/icons";
import {paths} from "../../constants";
import {CardPage} from "../../components/structure/CardPage/CardPage";
import React, {useEffect, useState} from "react";
import {Material} from "@kbc-lib/coffee-trading-management-lib";
import {AssetOperation} from "@kbc-lib/coffee-trading-management-lib";
import {NotificationType, openNotification} from "../../utils/notification";
import {v4 as uuid} from "uuid";
import {regex} from "../../utils/regex";
import {hideLoading, showLoading} from "../../redux/reducers/loadingSlice";
import {useDispatch} from "react-redux";
import {EnumerableDefinition, EthEnumerableTypeService} from "../../api/services/EthEnumerableTypeService";
import {EthMaterialService} from "../../api/services/EthMaterialService";
import {AssetOperationRequest} from "../../api/types/AssetOperationRequest";

export const AssetOperationsNew = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const assetOperationService = new EthAssetOperationService();
    const materialService = new EthMaterialService();
    const [processTypes, setProcessTypes] = useState<string[]>([]);

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
        const processTypeService = new EthEnumerableTypeService(EnumerableDefinition.PROCESS_TYPE);
        (async () => {
            try {
                dispatch(showLoading("Loading process types..."));
                const processTypesResp: string[] = await processTypeService.getAll();
                setProcessTypes(processTypesResp);
            } catch (e: any) {
                console.log("error: ", e);
                openNotification("Error", e.message, NotificationType.ERROR);
            } finally {
                dispatch(hideLoading())
            }
        })();
        return () => {
            dispatch(hideLoading())
        }
    }, []);

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
            {
                type: FormElementType.SELECT,
                span: 8,
                name: 'process-types',
                label: 'Process Types',
                required: true,
                options: processTypes.map((processType) => ({label: processType, value: processType})),
                mode: 'multiple',
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
        ]);
    }, [inputMaterials, processTypes]);

    const onSubmit = async (values: any) => {
        try {
            dispatch(showLoading("Creating asset operation..."));

            const inputMaterialIds: number[] = [];
            for (const key in values) {
                if (key.startsWith('input-material-id-')) {
                    inputMaterialIds.push(parseInt(values[key]));
                }
            }
            const newAssetOperation = new AssetOperationRequest(
                values['name'],
                inputMaterialIds,
                parseInt(values['output-material-id']),
                values['latitude'],
                values['longitude'],
                values['process-types'],
            )

            await assetOperationService.saveAssetOperation(newAssetOperation);
            openNotification("Asset operation registered", `Asset operation "${newAssetOperation.name}" has been registered correctly!`, NotificationType.SUCCESS, 1);
            navigate(paths.ASSET_OPERATIONS);
        } catch (e: any) {
            console.log("error: ", e);
            openNotification("Error", e.message, NotificationType.ERROR);
        } finally {
            dispatch(hideLoading())
        }
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
