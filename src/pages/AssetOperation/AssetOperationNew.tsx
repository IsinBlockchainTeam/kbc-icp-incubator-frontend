import React, { useMemo, useState } from 'react';
import { useMaterial } from '@/providers/entities/icp/MaterialProvider';
import { useEnumeration } from '@/providers/entities/icp/EnumerationProvider';
import { AssetOperationRequest, useAssetOperation } from '@/providers/entities/icp/AssetOperationProvider';
import { useNavigate } from 'react-router-dom';
import { paths } from '@/constants/paths';
import { ClickableElement, FormElement, FormElementType, GenericForm } from '@/components/GenericForm/GenericForm';
import { regex } from '@/constants/regex';
import { CardPage } from '@/components/CardPage/CardPage';
import { Button } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { MaterialInfoCardContent } from '@/components/CardContents/MaterialInfoCardContent';

export const AssetOperationNew = () => {
    const { materials } = useMaterial();
    const { processTypes } = useEnumeration();
    const { createAssetOperation } = useAssetOperation();
    const navigate = useNavigate();

    const [newInputMaterialElementId, setNewInputMaterialElementId] = useState<number>(1);
    const [otherInputMaterials, setOtherInputMaterials] = useState<FormElement[]>([]);

    const addInputMaterial = () => {
        setOtherInputMaterials((elements) => [
            ...elements,
            ...defineMaterialElements(true, newInputMaterialElementId),
            {
                type: FormElementType.BUTTON,
                span: 4,
                name: `remove-input-material-${newInputMaterialElementId}`,
                label: 'Remove',
                icon: <DeleteOutlined />,
                disabled: false,
                onClick: () => removeInputMaterial(newInputMaterialElementId),
                additionalProperties: 'danger'
            }
        ]);
        setNewInputMaterialElementId((id) => id + 1);
    };

    const removeInputMaterial = (materialId: number) => {
        setOtherInputMaterials((elements) => {
            const namePrefix = `input-material-${materialId}`;
            return elements.filter((element) => {
                const elementName = (element as ClickableElement).name;
                return elementName !== namePrefix && elementName !== `details-${namePrefix}` && elementName !== `remove-input-material-${materialId}`;
            });
        });
    };

    const defineMaterialElements = (isInput: boolean, materialId: number): FormElement[] => {
        const name = `${isInput ? 'input' : 'output'}-material-${materialId}`;

        return [{
            type: FormElementType.SELECT,
            span: 12,
            name,
            label: `${isInput ? 'Input' : 'Output'} Material`,
            required: true,
            defaultValue: '',
            // defaultValue: material ? materials.findIndex(m => m.id === material.id) : '',
            options: materials.filter(m => m.isInput === isInput).map((m) => ({
                label: m.name,
                value: m.id
            })),
            disabled: false
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
    }

    const onSubmit = async (values: any) => {
        const inputMaterialIds: number[] = [];
        for (const key in values) {
            if (key.startsWith('input-material-')) {
                inputMaterialIds.push(parseInt(values[key]));
            }
        }
        const newAssetOperation: AssetOperationRequest = {
            name: values['name'],
            inputMaterialIds,
            outputMaterialId: parseInt(values['output-material-0']),
            latitude: values['latitude'],
            longitude: values['longitude'],
            processTypes: values['process-types']
        };
        await createAssetOperation(newAssetOperation);
        navigate(paths.ASSET_OPERATIONS);
    };

    const elements: FormElement[] = useMemo(
        () => [
            { type: FormElementType.TITLE, span: 24, label: 'Data' },
            {
                type: FormElementType.INPUT,
                span: 12,
                name: 'name',
                label: 'Name',
                required: true,
                defaultValue: '',
                disabled: false
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
                mode: 'multiple',
                disabled: false
            },
            { type: FormElementType.TITLE, span: 24, label: 'Input' },
            ...defineMaterialElements(true, 0),
            {
                type: FormElementType.BUTTON,
                span: 4,
                name: 'add-input-material',
                label: 'Add',
                icon: <PlusOutlined />,
                disabled: false,
                onClick: addInputMaterial,
                buttonType: 'primary'
            },
            ...otherInputMaterials,
            { type: FormElementType.TITLE, span: 24, label: 'Output' },
            ...defineMaterialElements(false, 0),
            { type: FormElementType.TITLE, span: 24, label: 'Coordinates' },
            {
                type: FormElementType.INPUT,
                span: 12,
                name: 'latitude',
                label: 'Latitude',
                required: true,
                regex: regex.COORDINATES,
                defaultValue: '',
                disabled: false
            },
            {
                type: FormElementType.INPUT,
                span: 12,
                name: 'longitude',
                label: 'Longitude',
                required: true,
                regex: regex.COORDINATES,
                defaultValue: '',
                disabled: false
            }
        ],
        [processTypes, otherInputMaterials, materials]
    );

    return (
        <CardPage
            title={
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                    New Asset Operation
                    <Button type="primary" danger icon={<DeleteOutlined />} onClick={() => navigate(paths.ASSET_OPERATIONS)}>
                        Delete Asset Operation
                    </Button>
                </div>
            }>
            <GenericForm
                elements={elements}
                confirmText="Are you sure you want to create this asset operation?"
                submittable={true}
                onSubmit={onSubmit}
            />
        </CardPage>
    );
};

export default AssetOperationNew;
