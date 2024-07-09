import { useNavigate } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import AssetOperations from '../AssetOperations';
import { EthAssetOperationService } from '@/api/services/EthAssetOperationService';
import userEvent from '@testing-library/user-event';

import { paths } from '@/constants/paths';
import { EthContext, EthContextState } from '@/providers/EthProvider';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { AssetOperation } from '@kbc-lib/coffee-trading-management-lib';
import { openNotification } from '@/utils/notification';

jest.mock('react-router-dom');
jest.mock('@/providers/EthProvider');
jest.mock('@/utils/notification');

const mockStore = configureStore([]);

describe('Asset Operations', () => {
    const ethAssetOperationService = {
        getAssetOperations: jest.fn()
    } as unknown as EthAssetOperationService;
    const store = mockStore({});

    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.clearAllMocks();
    });

    it('should render correctly', () => {
        render(
            <Provider store={store}>
                <EthContext.Provider value={{ ethAssetOperationService } as EthContextState}>
                    <AssetOperations />
                </EthContext.Provider>
            </Provider>
        );

        expect(screen.getByText('Asset Operations')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'plus New Asset Operation' })
        ).toBeInTheDocument();
    });

    it('should fetch data', async () => {
        const mockedAssetOperations: AssetOperation[] = [
            {
                id: 1,
                name: 'Asset Operation 1',
                outputMaterial: { productCategory: { name: 'Product Category 1' } }
            } as AssetOperation
        ];
        (ethAssetOperationService.getAssetOperations as jest.Mock).mockResolvedValueOnce(
            mockedAssetOperations
        );
        render(
            <Provider store={store}>
                <EthContext.Provider value={{ ethAssetOperationService } as EthContextState}>
                    <AssetOperations />
                </EthContext.Provider>
            </Provider>
        );

        await waitFor(() => {
            expect(ethAssetOperationService.getAssetOperations).toHaveBeenCalledTimes(1);
            expect(screen.getByText('Asset Operation 1')).toBeInTheDocument();
            expect(screen.getByText('Product Category 1')).toBeInTheDocument();
        });
    });

    it('should show notification when loadData fails', async () => {
        (ethAssetOperationService.getAssetOperations as jest.Mock).mockRejectedValue(
            new Error('Error')
        );
        render(
            <Provider store={store}>
                <EthContext.Provider value={{ ethAssetOperationService } as EthContextState}>
                    <AssetOperations />
                </EthContext.Provider>
            </Provider>
        );

        await waitFor(() => {
            expect(ethAssetOperationService.getAssetOperations).toHaveBeenCalledTimes(1);
            expect(openNotification).toHaveBeenCalledTimes(1);
        });
    });

    it("should call navigate when clicking on 'New Asset Operation' button", async () => {
        const navigate = jest.fn();
        (useNavigate as jest.Mock).mockReturnValue(navigate);
        render(
            <Provider store={store}>
                <EthContext.Provider value={{ ethAssetOperationService } as EthContextState}>
                    <AssetOperations />
                </EthContext.Provider>
            </Provider>
        );

        await waitFor(() => {
            userEvent.click(screen.getByRole('button', { name: 'plus New Asset Operation' }));
            expect(navigate).toHaveBeenCalledTimes(1);
            expect(navigate).toHaveBeenCalledWith(paths.ASSET_OPERATIONS_NEW);
        });
    });

    it('should call sorter function correctly when clicking on a table header', async () => {
        const mockedAssetOperations: AssetOperation[] = [
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
        (ethAssetOperationService.getAssetOperations as jest.Mock).mockResolvedValueOnce(
            mockedAssetOperations
        );
        render(
            <Provider store={store}>
                <EthContext.Provider value={{ ethAssetOperationService } as EthContextState}>
                    <AssetOperations />
                </EthContext.Provider>
            </Provider>
        );

        await waitFor(() => {
            const tableRows = screen.getAllByRole('row');
            expect(tableRows).toHaveLength(3);
            expect(tableRows[1]).toHaveTextContent('1Asset Operation 1Product Category 1');
            expect(tableRows[2]).toHaveTextContent('2Asset Operation 2Product Category 2');
        });

        userEvent.click(screen.getByText('Id'));

        await waitFor(() => {
            const tableRows = screen.getAllByRole('row');
            expect(tableRows).toHaveLength(3);
            expect(tableRows[1]).toHaveTextContent('2Asset Operation 2Product Category 2');
            expect(tableRows[2]).toHaveTextContent('1Asset Operation 1Product Category 1');
        });

        userEvent.click(screen.getByText('Name'));

        await waitFor(() => {
            const tableRows = screen.getAllByRole('row');
            expect(tableRows).toHaveLength(3);
            expect(tableRows[1]).toHaveTextContent('2Asset Operation 2Product Category 2');
            expect(tableRows[2]).toHaveTextContent('1Asset Operation 1Product Category 1');
        });
    });
});
