import React from 'react';
import { act, render, screen } from '@testing-library/react';
import AssetOperationView from '../AssetOperationView';
import { useNavigate, useParams } from 'react-router-dom';
import { AssetOperation, Material } from '@kbc-lib/coffee-trading-management-lib';
import { GenericForm } from '@/components/GenericForm/GenericForm';
import { useAssetOperation } from '@/providers/entities/icp/AssetOperationProvider';
import { useEnumeration } from '@/providers/entities/icp/EnumerationProvider';
import { useMaterial } from '@/providers/entities/icp/MaterialProvider';
import { paths } from '@/constants/paths';
import { ConfirmButton } from '@/components/ConfirmButton/ConfirmButton';

jest.mock('react-router-dom');
jest.mock('@/components/GenericForm/GenericForm');
jest.mock('@/providers/entities/icp/AssetOperationProvider');
jest.mock('@/providers/entities/icp/EnumerationProvider');
jest.mock('@/providers/entities/icp/MaterialProvider');
jest.mock('@/components/ConfirmButton/ConfirmButton');

describe('Asset Operations View', () => {
    const processTypes = ['Process Type 1', 'Process Type 2'];
    const materials: Material[] = [
        { name: 'Material 1', productCategory: { name: 'Product Category 1' }, id: 1 } as Material,
        { name: 'Material 2', productCategory: { name: 'Product Category 2' }, id: 2 } as Material,
        { name: 'Material 3', productCategory: { name: 'Product Category 1' }, id: 3 } as Material,
        { name: 'Material 4', productCategory: { name: 'Product Category 2' }, id: 4 } as Material,
        { name: 'Output material 1', productCategory: { name: 'Product Category 1' }, id: 8 } as Material,
        { name: 'Output material 2', productCategory: { name: 'Product Category 2' }, id: 9 } as Material
    ];
    const assetOperations: AssetOperation[] = [
        {
            id: 1,
            name: 'Asset Operation 1',
            inputMaterials: [materials[0], materials[1]],
            outputMaterial: materials[4],
            processTypes: [processTypes[0]],
            latitude: '8.565',
            longitude: '9.565'
        } as AssetOperation,
        {
            id: 2,
            name: 'Asset Operation 2',
            inputMaterials: [materials[2], materials[3]],
            outputMaterial: materials[5],
            processTypes,
            latitude: '8.565',
            longitude: '9.565'
        } as AssetOperation
    ];

    const mockedNavigate = jest.fn();
    const mockedUseAssetOperation = {
        assetOperations,
        updateAssetOperation: jest.fn(),
        deleteAssetOperationById: jest.fn()
    }
    const mockedGenericForm = GenericForm as jest.Mock;
    const mockedConfirmButton = ConfirmButton as jest.Mock;

    beforeEach(() => {
        // jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.clearAllMocks();

        (useAssetOperation as jest.Mock).mockReturnValue(mockedUseAssetOperation);
        (useEnumeration as jest.Mock).mockReturnValue({ processTypes });
        (useMaterial as jest.Mock).mockReturnValue({ materials });
        (useParams as jest.Mock).mockReturnValue({ id: '1' });
        (useNavigate as jest.Mock).mockReturnValue(mockedNavigate);
    });

    it('should render correctly', async () => {
        render(<AssetOperationView />);

        const formProps = (mockedGenericForm).mock.calls.at(-1)?.[0];

        expect(screen.getByText('Asset Operation')).toBeInTheDocument();
        expect(mockedConfirmButton).toHaveBeenCalled();
        expect(mockedGenericForm).toHaveBeenCalled();
        // 8 elements + (1 output material + 1 element) + 2 input materials * 3 elements each
        expect(formProps.elements).toHaveLength(10 + assetOperations[0].inputMaterials.length * 3)
        expect(formProps.elements).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ label: 'Data' }),
                expect.objectContaining({ label: 'Name', name: 'name', defaultValue: assetOperations[0].name }),
                expect.objectContaining({ label: 'Process Types', name: 'process-types', defaultValue: assetOperations[0].processTypes }),
                expect.objectContaining({ label: 'Input' }),
                ...assetOperations[0].inputMaterials.flatMap((material, i) => [
                    expect.objectContaining({ label: `Input Material`, name: `input-material-${material.id}`, defaultValue: material.id }),
                    expect.objectContaining({ title: 'Material details', name: `details-input-material-${material.id}` }),
                    i === 0 ? expect.objectContaining({ label: 'Add', name: 'add-input-material' }) : expect.objectContaining({ label: 'Remove', name: `remove-input-material-${material.id}` })
                ]),
                expect.objectContaining({ label: 'Output' }),
                expect.objectContaining({ label: 'Output Material', name: 'output-material-0', defaultValue: assetOperations[0].outputMaterial.id }),
                expect.objectContaining({ title: 'Material details', name: 'details-output-material-0' }),
                expect.objectContaining({ label: 'Coordinates' }),
                expect.objectContaining({ label: 'Latitude', name: 'latitude', defaultValue: assetOperations[0].latitude }),
                expect.objectContaining({ label: 'Longitude', name: 'longitude', defaultValue: assetOperations[0].longitude }),
            ])
        )
    });
    it('should render a default message if asset operation is not found', async () => {
        (useParams as jest.Mock).mockReturnValue({ id: '3' });
        render(<AssetOperationView />);

        expect(screen.getByText('Asset operation not available')).toBeInTheDocument();
        expect(GenericForm).not.toHaveBeenCalled();
    });

    it('should add and remove input material when clicking on buttons', async () => {
        render(<AssetOperationView />);

        const genericFormCalls = mockedGenericForm.mock.calls.length;
        act(() => {
            const elements: any[] = mockedGenericForm.mock.calls[genericFormCalls - 1][0].elements;
            expect(elements).toHaveLength(16);
            elements.find((e) => e.name == 'add-input-material').onClick();
        });
        expect(GenericForm).toHaveBeenCalledTimes(genericFormCalls + 1);
        expect(mockedGenericForm.mock.calls[genericFormCalls][0].elements).toHaveLength(19);
        act(() => {
            const elements: any[] = mockedGenericForm.mock.calls[genericFormCalls][0].elements;
            expect(elements).toHaveLength(19);
            elements.find((e) => e.name == 'remove-input-material-2').onClick();
        });

        expect(GenericForm).toHaveBeenCalledTimes(genericFormCalls + 2);
        expect(mockedGenericForm.mock.calls[genericFormCalls + 1][0].elements).toHaveLength(16);
    });

    it('should update the asset operation', async () => {
        render(<AssetOperationView />);

        const formProps = (mockedGenericForm).mock.calls.at(-1)?.[0];
        const values = {
            name: 'New Name',
            'process-types': [processTypes[1]],
            'input-material-1': materials[2].id,
            'input-material-2': materials[3].id,
            'output-material-0': materials[5].id,
            latitude: 1,
            longitude: 2
        }

        await act(async () => {
            formProps.onSubmit(values);
        });

        expect(mockedUseAssetOperation.updateAssetOperation).toHaveBeenCalledWith({
            name: values.name,
            inputMaterialIds: [values['input-material-1'], values['input-material-2']],
            outputMaterialId: values['output-material-0'],
            latitude: values.latitude,
            longitude: values.longitude,
            processTypes: values['process-types']
        });
        expect(mockedNavigate).toHaveBeenCalledWith(paths.ASSET_OPERATIONS);
    });

    it('should delete the asset operation and navigate back to asset operations', async () => {
        render(<AssetOperationView />);

        await act(async () => {
            mockedConfirmButton.mock.calls[0][0].onConfirm();
        });

        expect(mockedUseAssetOperation.deleteAssetOperationById).toHaveBeenCalled();
        expect(mockedUseAssetOperation.deleteAssetOperationById).toHaveBeenCalledWith(1);
        expect(mockedNavigate).toHaveBeenCalledWith(paths.ASSET_OPERATIONS);
    });
});
