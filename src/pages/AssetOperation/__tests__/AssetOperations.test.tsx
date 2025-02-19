import { Link, useNavigate } from 'react-router-dom';
import { act, render, screen } from '@testing-library/react';
import React from 'react';
import AssetOperations from '../AssetOperations';
import { AssetOperation, Material } from '@kbc-lib/coffee-trading-management-lib';
import { useAssetOperation } from '@/providers/entities/icp/AssetOperationProvider';
import { Button, Table } from 'antd';
import { paths } from '@/constants/paths';

jest.mock('react-router-dom', () => {
    return {
        ...jest.requireActual('react-router-dom'),
        Link: jest.fn(() => <div />),
        useNavigate: jest.fn()
    };
});
jest.mock('antd', () => {
    return {
        ...jest.requireActual('antd'),
        Table: jest.fn(),
        Button: jest.fn()
    };
});
jest.mock('@/providers/entities/icp/AssetOperationProvider');
jest.mock('@/components/InfoCard/InfoCard');

describe('Asset Operations', () => {
    const navigate = jest.fn();

    const assetOperations: AssetOperation[] = [
        {
            id: 1,
            name: 'Asset Operation 1',
            inputMaterials: [{ id: 1, name: 'in mat 1' } as Material, { id: 2, name: 'in mat 2' } as Material],
            outputMaterial: { id: 3, name: 'out mat 1' } as Material,
            latitude: '1',
            longitude: '1',
            processTypes: ['type1', 'type2']
        } as AssetOperation,
        {
            id: 2,
            name: 'Asset Operation 2',
            inputMaterials: [{ id: 3, name: 'in mat 3' } as Material, { id: 4, name: 'in mat 4' } as Material],
            outputMaterial: { id: 5, name: 'out mat 2' } as Material,
            latitude: '2',
            longitude: '2',
            processTypes: ['type3', 'type4']
        } as AssetOperation
    ];

    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.clearAllMocks();

        (useAssetOperation as jest.Mock).mockReturnValue({ assetOperations });
        (useNavigate as jest.Mock).mockReturnValue(navigate);
    });

    it('should render correctly', () => {
        render(<AssetOperations />);

        expect(screen.getByText('Asset Operations')).toBeInTheDocument();

        expect(Table).toHaveBeenCalledTimes(1);

        const tableProps = (Table as unknown as jest.Mock).mock.calls[0][0];
        expect(tableProps.columns).toHaveLength(3);
        expect(tableProps.dataSource).toEqual(assetOperations);

        act(() => {
            (Button as jest.Mock).mock.calls[0][0].onClick();
        });
        expect(navigate).toHaveBeenCalledTimes(1);
        expect(navigate).toHaveBeenCalledWith(paths.ASSET_OPERATIONS_NEW);

        const columnsProps = [
            { title: 'Id', dataIndex: 'id' },
            { title: 'Name', dataIndex: 'name' },
            { title: 'Material (output)', dataIndex: 'outputMaterial.name' },
        ];
        columnsProps.forEach((prop, index) => {
            expect(tableProps.columns[index].title).toBe(prop.title);
            expect(tableProps.columns[index].dataIndex).toBe(prop.dataIndex);
        });
    });

    it('columns sorting', async () => {
        render(<AssetOperations />);
        expect(Table).toHaveBeenCalledTimes(1);
        const columns = (Table as unknown as jest.Mock).mock.calls[0][0].columns;
        expect(columns[0].sorter({ id: 1 }, { id: 2 })).toBeLessThan(0);
        expect(columns[1].sorter({ name: 'c' }, { name: 'a' })).toEqual(1);
        expect(columns[2].sorter({ outputMaterial: { name: 'c' } }, { outputMaterial: { name: 'a' } })).toEqual(1);
    });

    it('columns render', async () => {
        render(<AssetOperations />);
        expect(Table).toHaveBeenCalledTimes(1);
        const columns = (Table as unknown as jest.Mock).mock.calls[0][0].columns;
        render(columns[0].render(1, { id: 1 }));
        expect(Link).toHaveBeenCalled();

        const col2Rendered = render(columns[2].render(0, { outputMaterial: assetOperations[0].outputMaterial }));
        expect(col2Rendered.getByText(assetOperations[0].outputMaterial.name)).toBeDefined();

    });

});
