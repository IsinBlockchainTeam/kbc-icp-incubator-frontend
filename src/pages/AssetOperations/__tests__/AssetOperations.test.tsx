import { useNavigate } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import AssetOperations from '../AssetOperations';
import { AssetOperationPresentable } from '@/api/types/AssetOperationPresentable';
import { EthAssetOperationService } from '@/api/services/EthAssetOperationService';
import { MaterialPresentable } from '@/api/types/MaterialPresentable';
import { BlockchainAssetOperationStrategy } from '@/api/strategies/asset_operation/BlockchainAssetOperationStrategy';
import userEvent from '@testing-library/user-event';

import { paths } from '@/constants/paths';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn()
}));
jest.mock('../../../../api/services/AssetOperationService');
jest.mock('../../../../api/strategies/asset_operation/BlockchainAssetOperationStrategy');

describe('Asset Operations', () => {
    const navigate = jest.fn();

    beforeEach(() => {
        (useNavigate as jest.Mock).mockReturnValue(navigate);
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.clearAllMocks();
    });

    it('should render correctly', () => {
        render(<AssetOperations />);

        expect(screen.getByText('Asset Operations')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'plus New Asset Operation' })
        ).toBeInTheDocument();
    });

    it('should fetch data', async () => {
        const mockedAssetOperations: AssetOperationPresentable[] = [
            new AssetOperationPresentable(
                1,
                'Asset Operation 1',
                [],
                new MaterialPresentable(1, 'Material 1')
            ),
            new AssetOperationPresentable(
                2,
                'Asset Operation 2',
                [],
                new MaterialPresentable(2, 'Material 2')
            )
        ];
        const mockedGetTransformations = jest.fn().mockResolvedValueOnce(mockedAssetOperations);
        (EthAssetOperationService as jest.Mock).mockImplementation(() => ({
            getTransformations: mockedGetTransformations
        }));
        render(<AssetOperations />);

        await waitFor(() => {
            expect(EthAssetOperationService).toHaveBeenCalledTimes(1);
            expect(BlockchainAssetOperationStrategy).toHaveBeenCalledTimes(1);
            expect(mockedGetTransformations).toHaveBeenCalledTimes(1);
            expect(screen.getByText('Asset Operation 1')).toBeInTheDocument();
            expect(screen.getByText('Asset Operation 2')).toBeInTheDocument();
        });
    });

    it('should call onChange function when clicking on a table header', async () => {
        render(<AssetOperations />);

        await waitFor(() => {
            userEvent.click(screen.getByText('Id'));
            expect(console.log).toHaveBeenCalledTimes(1);
        });
    });

    it("should call navigate when clicking on 'New Asset Operation' button", async () => {
        render(<AssetOperations />);

        await waitFor(() => {
            userEvent.click(screen.getByRole('button', { name: 'plus New Asset Operation' }));
            expect(navigate).toHaveBeenCalledTimes(1);
            expect(navigate).toHaveBeenCalledWith(paths.ASSET_OPERATIONS_NEW);
        });
    });

    it("should render 'No output material' when there is no output material", async () => {
        const mockedAssetOperations: AssetOperationPresentable[] = [
            new AssetOperationPresentable(1, 'Asset Operation 1', [], undefined)
        ];
        const mockedGetTransformations = jest.fn().mockResolvedValueOnce(mockedAssetOperations);
        (EthAssetOperationService as jest.Mock).mockImplementation(() => ({
            getTransformations: mockedGetTransformations
        }));
        render(<AssetOperations />);

        await waitFor(() => {
            expect(screen.getByText('No output material')).toBeInTheDocument();
        });
    });

    it('should call sorter function correctly when clicking on a table header', async () => {
        const mockedAssetOperations: AssetOperationPresentable[] = [
            new AssetOperationPresentable(
                1,
                '2. Asset Operation 1',
                [],
                new MaterialPresentable(1, 'Material 1')
            ),
            new AssetOperationPresentable(
                2,
                '1. Asset Operation 2',
                [],
                new MaterialPresentable(2, 'Material 2')
            )
        ];
        const mockedGetTransformations = jest.fn().mockResolvedValueOnce(mockedAssetOperations);
        (EthAssetOperationService as jest.Mock).mockImplementation(() => ({
            getTransformations: mockedGetTransformations
        }));
        render(<AssetOperations />);

        await waitFor(() => {
            const tableRows = screen.getAllByRole('row');
            expect(tableRows).toHaveLength(3);
            expect(tableRows[1]).toHaveTextContent('12. Asset Operation 1Material 1');
            expect(tableRows[2]).toHaveTextContent('21. Asset Operation 2Material 2');
        });

        userEvent.click(screen.getByText('Id'));

        await waitFor(() => {
            const tableRows = screen.getAllByRole('row');
            expect(tableRows).toHaveLength(3);
            expect(tableRows[1]).toHaveTextContent('21. Asset Operation 2Material 2');
            expect(tableRows[2]).toHaveTextContent('12. Asset Operation 1Material 1');
        });

        userEvent.click(screen.getByText('Name'));

        await waitFor(() => {
            const tableRows = screen.getAllByRole('row');
            expect(tableRows).toHaveLength(3);
            expect(tableRows[1]).toHaveTextContent('12. Asset Operation 1Material 1');
            expect(tableRows[2]).toHaveTextContent('21. Asset Operation 2Material 2');
        });
    });

    it('should sort also when working with falsy names', async () => {
        const mockedAssetOperations: AssetOperationPresentable[] = [
            new AssetOperationPresentable(
                0,
                undefined,
                [],
                new MaterialPresentable(0, 'Zero material')
            ),
            new AssetOperationPresentable(1, 'Valid', [], new MaterialPresentable(1, 'Material 1')),
            new AssetOperationPresentable(
                2,
                undefined,
                [],
                new MaterialPresentable(2, 'Material 2')
            )
        ];
        const mockedGetTransformations = jest.fn().mockResolvedValueOnce(mockedAssetOperations);
        (EthAssetOperationService as jest.Mock).mockImplementation(() => ({
            getTransformations: mockedGetTransformations
        }));
        render(<AssetOperations />);

        userEvent.click(screen.getByText('Name'));

        await waitFor(() => {
            const tableRows = screen.getAllByRole('row');
            expect(tableRows).toHaveLength(4);
            expect(tableRows[1]).toHaveTextContent('1ValidMaterial 1');
            expect(tableRows[2]).toHaveTextContent('0Zero material');
            expect(tableRows[3]).toHaveTextContent('2Material 2');
        });
    });
});
