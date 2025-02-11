import React, { useEffect, useState } from 'react';
import { FormElement, FormElementType, GenericForm } from '@/components/GenericForm/GenericForm';
import { useNavigate, useParams } from 'react-router-dom';
import { AssetOperationRequest, useAssetOperation } from '@/providers/entities/icp/AssetOperationProvider';
import { regex } from '@/constants/regex';
import { CardPage } from '@/components/CardPage/CardPage';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useMaterial } from '@/providers/entities/icp/MaterialProvider';
import { useEnumeration } from '@/providers/entities/icp/EnumerationProvider';
import { Material } from '@kbc-lib/coffee-trading-management-lib';
import { paths } from '@/constants/paths';
import { MaterialInfoCardContent } from '@/components/CardContents/MaterialInfoCardContent';
import { ConfirmButton } from '@/components/ConfirmButton/ConfirmButton';

let newInputMaterialElementId = 0

export const AssetOperationView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { assetOperations, updateAssetOperation, deleteAssetOperationById } = useAssetOperation();
    const [disabled, setDisabled] = React.useState(true);
    const { materials } = useMaterial();
    const { processTypes } = useEnumeration();

    const assetOperation = assetOperations.find((assetOperation) => assetOperation.id === parseInt(id || ''));
    const [inputMaterialsInfo, setInputMaterialsInfo] = useState<{ id: number, isOld: boolean }[]>([]);

    useEffect(() => {
        if (!assetOperation) return
        setInputMaterialsInfo(assetOperation.inputMaterials.map(m => ({ id: m.id, isOld: true })));
        // get the higher id from the old input materials of the asset operation, so we can start the new ones from there
        newInputMaterialElementId = Math.max(...assetOperation.inputMaterials.map(m => m.id)) + 1;
    }, [assetOperation]);

    if (!assetOperation) return <div>Asset operation not available</div>;

    const defineMaterialElements = (isInput: boolean, materialId: number, material?: Material): FormElement[] => {
        const name = `${isInput ? 'input' : 'output'}-material-${materialId}`;

        return [{
            type: FormElementType.SELECT,
            span: 12,
            name,
            label: `${isInput ? 'Input' : 'Output'} Material`,
            required: true,
            defaultValue: material ? material.id : '',
            // defaultValue: material ? materials.findIndex(m => m.id === material.id) : '',
            options: materials.filter(m => m.isInput === isInput).map((m) => ({
                label: m.name,
                value: m.id
            })),
            disabled
        },
        {
            type: FormElementType.CARD,
            span: 8,
            name: `details-${name}`,
            title: 'Material details',
            hidden: false,
            content: (values) => {
                if (values && values[name] !== undefined) {
                    const selectedMaterial = materials.find((material) => material.id === values[name]);
                    return <MaterialInfoCardContent material={selectedMaterial} />;
                }
                return <div></div>;
            }
        }];
    };


    const removeInputMaterial = (elementId: number) => {
        setInputMaterialsInfo((materialInfo) => materialInfo.filter(info => info.id !== elementId));
    };

    const addInputMaterial = () => {
        setInputMaterialsInfo((ids) => [...ids, { id: newInputMaterialElementId, isOld: false }]);
        newInputMaterialElementId++;
    };

    const onDelete = async (id: number) => {
        await deleteAssetOperationById(id);
        navigate(paths.ASSET_OPERATIONS);
    }

    const onSubmit = async (values: any) => {
        const inputMaterialIds: number[] = [];
        for (const key in values) {
            if (key.startsWith('input-material-')) {
                inputMaterialIds.push(parseInt(values[key]));
            }
        }
        const updatedAssetOperation: AssetOperationRequest = {
            name: values['name'],
            inputMaterialIds,
            outputMaterialId: parseInt(values['output-material-0']),
            latitude: values['latitude'],
            longitude: values['longitude'],
            processTypes: values['process-types']
        };
        await updateAssetOperation(updatedAssetOperation);
        navigate(paths.ASSET_OPERATIONS);
    }

    const inputMaterials: FormElement[] = inputMaterialsInfo.flatMap((materialInfo, i) => {
        const material = materialInfo.isOld ? assetOperation.inputMaterials.find(m => m.id === materialInfo.id) : undefined;
        return [
            ...defineMaterialElements(true, materialInfo.id, material),
            ...(i === 0
                ? ([
                    {
                        type: FormElementType.BUTTON,
                        span: 4,
                        name: `add-input-material`,
                        label: 'Add',
                        icon: <PlusOutlined />,
                        disabled,
                        onClick: addInputMaterial,
                        buttonType: 'primary'
                    },
                ] as FormElement[])
                : ([
                    {
                        type: FormElementType.BUTTON,
                        span: 4,
                        name: `remove-input-material-${materialInfo.id}`,
                        label: `Remove`,
                        icon: <DeleteOutlined />,
                        disabled,
                        onClick: () => removeInputMaterial(materialInfo.id),
                        additionalProperties: 'danger'
                    }
                ] as FormElement[]))
        ]
    })


    const elements: FormElement[] = [
        { type: FormElementType.TITLE, span: 24, label: 'Data' },
        {
            type: FormElementType.INPUT,
            span: 12,
            name: 'name',
            label: 'Name',
            required: true,
            defaultValue: assetOperation.name,
            disabled
        },
        {
            type: FormElementType.SELECT,
            span: 12,
            name: 'process-types',
            label: 'Process Types',
            required: true,
            options: processTypes.map((processType) => ({
                label: processType,
                value: processType
            })),
            defaultValue: assetOperation.processTypes,
            mode: 'multiple',
            disabled
        },
        { type: FormElementType.TITLE, span: 24, label: 'Input' },
        ...inputMaterials,
        { type: FormElementType.TITLE, span: 24, label: 'Output' },
        ...defineMaterialElements(false, 0, assetOperation.outputMaterial),
        { type: FormElementType.TITLE, span: 24, label: 'Coordinates' },
        {
            type: FormElementType.INPUT,
            span: 12,
            name: 'latitude',
            label: 'Latitude',
            required: true,
            regex: regex.COORDINATES,
            defaultValue: assetOperation.latitude,
            disabled
        },
        {
            type: FormElementType.INPUT,
            span: 12,
            name: 'longitude',
            label: 'Longitude',
            required: true,
            regex: regex.COORDINATES,
            defaultValue: assetOperation.longitude,
            disabled
        }
    ];

    return (
        <CardPage
            title={
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                    Asset Operation

                    <ConfirmButton
                        danger
                        icon={<DeleteOutlined />}
                        role="delete-asset-operation"
                        confirmText={'Are you sure you want to delete this asset operation?'}
                        onConfirm={() => onDelete(parseInt(id || ''))}
                        text={'Delete'}
                    />
                </div>
            }>
            <GenericForm elements={elements} onSubmit={onSubmit} submittable={!disabled} toggleEditable={() => setDisabled(!disabled)} />
        </CardPage>
    );
};

export default AssetOperationView;
