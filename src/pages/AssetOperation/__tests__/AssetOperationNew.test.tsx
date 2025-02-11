import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import { Material } from '@kbc-lib/coffee-trading-management-lib';
import { GenericForm } from '@/components/GenericForm/GenericForm';
import { useAssetOperation } from '@/providers/entities/icp/AssetOperationProvider';
import { useEnumeration } from '@/providers/entities/icp/EnumerationProvider';
import { useMaterial } from '@/providers/entities/icp/MaterialProvider';
import { paths } from '@/constants/paths';
import AssetOperationNew from '../AssetOperationNew';
import userEvent from '@testing-library/user-event';

jest.mock('react-router-dom');
jest.mock('@/components/GenericForm/GenericForm');
jest.mock('@/providers/entities/icp/AssetOperationProvider');
jest.mock('@/providers/entities/icp/EnumerationProvider');
jest.mock('@/providers/entities/icp/MaterialProvider');

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

    const mockedNavigate = jest.fn();
    const mockedUseAssetOperation = {
        createAssetOperation: jest.fn()
    }
    const mockedGenericForm = GenericForm as jest.Mock;

    beforeEach(() => {
        // jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.clearAllMocks();

        (useAssetOperation as jest.Mock).mockReturnValue(mockedUseAssetOperation);
        (useEnumeration as jest.Mock).mockReturnValue({ processTypes });
        (useMaterial as jest.Mock).mockReturnValue({ materials });
        (useNavigate as jest.Mock).mockReturnValue(mockedNavigate);
    });

    it('should render correctly', async () => {
        render(<AssetOperationNew />);

        const formProps = (mockedGenericForm).mock.calls.at(-1)?.[0];

        expect(screen.getByText('New Asset Operation')).toBeInTheDocument();
        expect(mockedGenericForm).toHaveBeenCalled();
        // 8 elements + (1 output material + 1 element) + 1 input materials * 3 elements each
        expect(formProps.elements).toHaveLength(13)
        expect(formProps.elements).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ label: 'Data' }),
                expect.objectContaining({ label: 'Name', name: 'name' }),
                expect.objectContaining({ label: 'Process Types', name: 'process-types' }),
                expect.objectContaining({ label: 'Input' }),
                expect.objectContaining({ label: `Input Material`, name: `input-material-0` }),
                expect.objectContaining({ title: 'Material details', name: `details-input-material-0` }),
                expect.objectContaining({ label: 'Add', name: 'add-input-material' }),
                expect.objectContaining({ label: 'Output' }),
                expect.objectContaining({ label: 'Output Material', name: 'output-material-0' }),
                expect.objectContaining({ title: 'Material details', name: 'details-output-material-0' }),
                expect.objectContaining({ label: 'Coordinates' }),
                expect.objectContaining({ label: 'Latitude', name: 'latitude' }),
                expect.objectContaining({ label: 'Longitude', name: 'longitude' }),
            ])
        )
    });

    it("should navigate back to 'Asset Operations' when clicking on 'Delete Asset Operation' button", async () => {
        render(<AssetOperationNew />);

        userEvent.click(screen.getByRole('button', { name: 'delete Delete Asset Operation' }));
        expect(mockedNavigate).toHaveBeenCalledTimes(1);
        expect(mockedNavigate).toHaveBeenCalledWith(paths.ASSET_OPERATIONS);
    });

    it('should add and remove input material when clicking on buttons', async () => {
        render(<AssetOperationNew />);

        const genericFormCalls = mockedGenericForm.mock.calls.length;
        act(() => {
            const elements: any[] = mockedGenericForm.mock.calls[genericFormCalls - 1][0].elements;
            expect(elements).toHaveLength(13);
            elements.find((e) => e.name == 'add-input-material').onClick();
        });
        expect(GenericForm).toHaveBeenCalledTimes(genericFormCalls + 1);
        expect(mockedGenericForm.mock.calls[genericFormCalls][0].elements).toHaveLength(16);
        act(() => {
            const elements: any[] = mockedGenericForm.mock.calls[genericFormCalls][0].elements;
            expect(elements).toHaveLength(16);
            elements.find((e) => e.name == 'remove-input-material-1').onClick();
        });
        expect(GenericForm).toHaveBeenCalledTimes(genericFormCalls + 2);
        expect(mockedGenericForm.mock.calls[genericFormCalls + 1][0].elements).toHaveLength(13);
    });

    it('should create the asset operation', async () => {
        render(<AssetOperationNew />);

        const formProps = (mockedGenericForm).mock.calls.at(-1)?.[0];
        const values = {
            name: 'New Name',
            'process-types': [processTypes[1]],
            'input-material-0': materials[2].id,
            'output-material-0': materials[5].id,
            latitude: 1,
            longitude: 2
        }

        await act(async () => {
            formProps.onSubmit(values);
        });

        expect(mockedUseAssetOperation.createAssetOperation).toHaveBeenCalledWith({
            name: values['name'],
            inputMaterialIds: [values['input-material-0']],
            outputMaterialId: values['output-material-0'],
            latitude: values['latitude'],
            longitude: values['longitude'],
            processTypes: values['process-types']
        });
        expect(mockedNavigate).toHaveBeenCalledWith(paths.ASSET_OPERATIONS);
    });
});
