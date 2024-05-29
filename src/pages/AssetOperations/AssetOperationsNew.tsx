import {useNavigate} from "react-router-dom";
import {FormElement, FormElementType, GenericForm} from "../../components/GenericForm/GenericForm";
import {Button} from "antd";
import {DeleteOutlined} from "@ant-design/icons";
import {paths} from "../../constants";
import {CardPage} from "../../components/structure/CardPage/CardPage";
import React, {useContext, useEffect, useState} from "react";
import {NotificationType, openNotification} from "../../utils/notification";
import {regex} from "../../utils/regex";
import {hideLoading, showLoading} from "../../redux/reducers/loadingSlice";
import {useDispatch} from "react-redux";
import {AssetOperationRequest} from "../../api/types/AssetOperationRequest";
import {EthServicesContext} from "../../providers/EthServicesProvider";
import {Material} from "@kbc-lib/coffee-trading-management-lib";

export const AssetOperationsNew = () => {
    const {ethAssetOperationService, ethProcessTypeService, ethMaterialService} = useContext(EthServicesContext);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [inputMaterialsCount, setInputMaterialsCount] = useState<number>(1);
    const [processTypes, setProcessTypes] = useState<string[]>([]);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loadingCount, setLoadingCount] = useState<number>(0);

    useEffect(() => {
        loadProcessTypes();
        loadMaterials();
        return () => {
            dispatch(hideLoading())
        }
    }, []);

    useEffect(() => {
        if(loadingCount > 0)
            dispatch(showLoading("Loading process types and materials..."));
        else
            dispatch(hideLoading())
    }, [loadingCount]);

    async function loadProcessTypes() {
        try {
            setLoadingCount(c => c + 1);
            const pT: string[] = await ethProcessTypeService.getAll();
            setProcessTypes(pT);
        } catch (e: any) {
            console.log("error: ", e);
            openNotification("Error", e.message, NotificationType.ERROR);
        } finally {
            setLoadingCount(c => c - 1);
        }
    }

    async function loadMaterials() {
        try {
            setLoadingCount(c => c + 1);
            const m = await ethMaterialService.getMaterials();
            setMaterials(m);
        } catch (e: any) {
            console.log("error: ", e);
            openNotification("Error", e.message, NotificationType.ERROR);
        } finally {
            setLoadingCount(c => c - 1);
        }
    }

    const addInputMaterial = () => {
        setInputMaterialsCount(c => c + 1);
    }
    const removeInputMaterial = () => {
        setInputMaterialsCount(c => c - 1);
    }

    const onSubmit = async (values: any) => {
        try {
            dispatch(showLoading("Creating asset operation..."));

            const inputMaterialIds: number[] = [];
            for (const key in values) {
                if (key.startsWith('input-material-id-')) {
                    inputMaterialIds.push(parseInt(values[key]));
                }
            }
            const newAssetOperation: AssetOperationRequest = {
                name: values['name'],
                inputMaterialIds,
                outputMaterialId: parseInt(values['output-material-id']),
                latitude: values['latitude'],
                longitude: values['longitude'],
                processTypes: values['process-types'],
            }

            await ethAssetOperationService.saveAssetOperation(newAssetOperation);
            openNotification("Asset operation registered", `Asset operation "${newAssetOperation.name}" has been registered correctly!`, NotificationType.SUCCESS, 1);
            navigate(paths.ASSET_OPERATIONS);
        } catch (e: any) {
            console.log("error: ", e);
            openNotification("Error", e.message, NotificationType.ERROR);
        } finally {
            dispatch(hideLoading())
        }
    }

    const inputMaterials: FormElement[] = Array(inputMaterialsCount).fill(0).map((_, i) => ({
            type: FormElementType.SELECT,
            span: 8,
            name: `input-material-id-${i+1}`,
            label: 'Input Material ID',
            required: true,
            options: materials.map((material) => ({
                label: material.productCategory.name + ' ' + material.id,
                value: material.id
            })),
            defaultValue: '',
            disabled: false,
        }),
    );
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
        {type: FormElementType.SPACE, span: 16},

        ...inputMaterials,
        {type: FormElementType.SPACE, span: 24},
        {
            type: FormElementType.BUTTON,
            span: 12,
            name: 'new-input-material',
            label: 'New input material',
            disabled: false,
            onClick: addInputMaterial
        },
        {
            type: FormElementType.BUTTON,
            span: 12,
            name: 'remove-input-material',
            label: 'Remove input material',
            disabled: inputMaterialsCount === 1,
            onClick: removeInputMaterial,
            additionalProperties: 'danger',
        },
        {
            type: FormElementType.SELECT,
            span: 8,
            name: 'output-material-id',
            label: 'Output Material ID',
            required: true,
            options: materials.map((material) => ({label: material.productCategory.name + ' ' + material.id, value: material.id})),
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
        }
    ]
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
