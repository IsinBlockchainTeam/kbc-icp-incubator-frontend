import { useNavigate } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import AssetOperations from '../AssetOperations';
import userEvent from '@testing-library/user-event';
import { paths } from '@/constants/paths';
import { AssetOperation } from '@kbc-lib/coffee-trading-management-lib';
import { useEthAssetOperation } from '@/providers/entities/EthAssetOperationProvider';

jest.mock('react-router-dom');
jest.mock('@/utils/notification');
jest.mock('@/providers/entities/EthAssetOperationProvider');

describe('Asset Operations', () => {
    const assetOperations: AssetOperation[] = [
        {
            id: 1,
            name: 'Asset Operation 1',
            outputMaterial: { productCategory: { name: 'Product Category 1' } }
        } as AssetOperation,
        {
            id: 2,
            name: 'Asset Operation 2',
            outputMaterial: { productCategory: { name: 'Product Category 2' } }
        } as AssetOperation
    ];

    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.clearAllMocks();

        (useEthAssetOperation as jest.Mock).mockReturnValue({ assetOperations });
    });

    it('should render correctly', () => {
        render(<AssetOperations />);

        expect(screen.getByText('Asset Operations')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'plus New Asset Operation' })
        ).toBeInTheDocument();

        expect(screen.getByText('Asset Operation 1')).toBeInTheDocument();
        expect(screen.getByText('Product Category 1')).toBeInTheDocument();
    });

    it("should call navigate when clicking on 'New Asset Operation' button", async () => {
        const navigate = jest.fn();
        (useNavigate as jest.Mock).mockReturnValue(navigate);
        render(<AssetOperations />);

        userEvent.click(screen.getByRole('button', { name: 'plus New Asset Operation' }));
        expect(navigate).toHaveBeenCalledTimes(1);
        expect(navigate).toHaveBeenCalledWith(paths.ASSET_OPERATIONS_NEW);
    });

    it('should call sorter function correctly when clicking on a table header', async () => {
        render(<AssetOperations />);

        let tableRows = screen.getAllByRole('row');
        expect(tableRows).toHaveLength(3);
        expect(tableRows[1]).toHaveTextContent('1Asset Operation 1Product Category 1');
        expect(tableRows[2]).toHaveTextContent('2Asset Operation 2Product Category 2');

        userEvent.click(screen.getByText('Id'));

        tableRows = screen.getAllByRole('row');
        expect(tableRows).toHaveLength(3);
        expect(tableRows[1]).toHaveTextContent('2Asset Operation 2Product Category 2');
        expect(tableRows[2]).toHaveTextContent('1Asset Operation 1Product Category 1');

        userEvent.click(screen.getByText('Name'));

        tableRows = screen.getAllByRole('row');
        expect(tableRows).toHaveLength(3);
        expect(tableRows[1]).toHaveTextContent('2Asset Operation 2Product Category 2');
        expect(tableRows[2]).toHaveTextContent('1Asset Operation 1Product Category 1');
    });
});
