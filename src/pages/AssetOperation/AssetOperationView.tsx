import { useParams } from 'react-router-dom';
import { FormElement, FormElementType, GenericForm } from '@/components/GenericForm/GenericForm';
import { CardPage } from '@/components/structure/CardPage/CardPage';
import React from 'react';
import { regex } from '@/constants/regex';
import { useEthAssetOperation } from '@/providers/entities/EthAssetOperationProvider';

export const AssetOperationView = () => {
    const { id } = useParams();
    const { assetOperations } = useEthAssetOperation();

    const assetOperation = assetOperations.find(
        (assetOperation) => assetOperation.id === parseInt(id || '')
    );
    if (!assetOperation) return <div>Asset operation not available</div>;

    const inputMaterials: FormElement[] = assetOperation.inputMaterials.map((material, i) => ({
        type: FormElementType.SELECT,
        span: 8,
        name: `input-material-${i + 1}`,
        label: 'Input Material',
        required: false,
        options: [],
        defaultValue: material.productCategory.name + ' ' + material.id,
        disabled: true
    }));
    const elements: FormElement[] = [
        { type: FormElementType.TITLE, span: 24, label: 'Data' },
        {
            type: FormElementType.INPUT,
            span: 8,
            name: 'name',
            label: 'Name',
            required: false,
            defaultValue: assetOperation.name,
            disabled: true
        },
        { type: FormElementType.SPACE, span: 16 },
        ...inputMaterials,
        { type: FormElementType.SPACE, span: 24 },
        {
            type: FormElementType.SELECT,
            span: 8,
            name: 'output-material',
            label: 'Output Material',
            required: false,
            options: [],
            defaultValue:
                assetOperation.outputMaterial.productCategory.name +
                ' ' +
                assetOperation.outputMaterial.productCategory.id,
            disabled: true
        },
        {
            type: FormElementType.SELECT,
            span: 8,
            name: 'process-types',
            label: 'Process Types',
            required: false,
            options: [],
            defaultValue: assetOperation.processTypes,
            mode: 'multiple',
            disabled: true
        },
        { type: FormElementType.TITLE, span: 24, label: 'Coordinates' },
        {
            type: FormElementType.INPUT,
            span: 12,
            name: 'latitude',
            label: 'Latitude',
            required: false,
            regex: regex.COORDINATES,
            defaultValue: assetOperation.latitude,
            disabled: true
        },
        {
            type: FormElementType.INPUT,
            span: 12,
            name: 'longitude',
            label: 'Longitude',
            required: false,
            regex: regex.COORDINATES,
            defaultValue: assetOperation.longitude,
            disabled: true
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
                </div>
            }>
            <GenericForm elements={elements} submittable={false} />
        </CardPage>
    );
};

export default AssetOperationView;
