import { EthAssetOperationService } from '@/api/services/EthAssetOperationService';
import { act, render, screen, waitFor } from '@testing-library/react';
import AssetOperationsNew from '../AssetOperationsNew';
import userEvent from '@testing-library/user-event';

import { paths } from '@/constants/paths';
import configureStore from 'redux-mock-store';
import { EthContext, EthContextState } from '@/providers/EthProvider';
import { Provider } from 'react-redux';
import { EthEnumerableTypeService, EthMaterialService } from '@/api/services';
import { useNavigate } from 'react-router-dom';
import { Material, ProductCategory } from '@kbc-lib/coffee-trading-management-lib';
import { GenericForm } from '@/components/GenericForm/GenericForm';
import { NotificationType, openNotification } from '@/utils/notification';

jest.mock('react-router-dom');
jest.mock('@/providers/EthProvider');
jest.mock('@/components/GenericForm/GenericForm');
jest.mock('@/utils/notification');

const mockStore = configureStore([]);

describe('Asset Operations New', () => {
    const contextValue = {
        ethAssetOperationService: {
            saveAssetOperation: jest.fn()
        } as unknown as EthAssetOperationService,
        ethProcessTypeService: {
            getAll: jest.fn()
        } as unknown as EthEnumerableTypeService,
        ethMaterialService: {
            getMaterials: jest.fn()
        } as unknown as EthMaterialService
    } as EthContextState;
    const store = mockStore({});

    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.clearAllMocks();

        (contextValue.ethMaterialService.getMaterials as jest.Mock).mockResolvedValue([
            new Material(1, new ProductCategory(1, 'Product category 1', 1, '')),
            new Material(2, new ProductCategory(2, 'Product category 2', 2, ''))
        ]);
        (contextValue.ethProcessTypeService.getAll as jest.Mock).mockResolvedValue([
            'Process Type 1',
            'Process Type 2'
        ]);
    });

    it('should render correctly', async () => {
        await act(async () => {
            render(
                <Provider store={store}>
                    <EthContext.Provider value={contextValue}>
                        <AssetOperationsNew />
                    </EthContext.Provider>
                </Provider>
            );
        });
        await waitFor(() => {
            expect(GenericForm).toHaveBeenCalledTimes(3);
        });

        expect(screen.getByText('New Asset Operation')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'delete Delete Asset Operation' })
        ).toBeInTheDocument();
        expect(GenericForm).toHaveBeenCalled();
        expect(GenericForm).toHaveBeenCalledWith(
            {
                elements: expect.any(Array),
                submittable: true,
                onSubmit: expect.any(Function)
            },
            {}
        );
        expect((GenericForm as jest.Mock).mock.calls[0][0].elements).toHaveLength(12);
    });

    it('should open notifications if load fails', async () => {
        (contextValue.ethMaterialService.getMaterials as jest.Mock).mockRejectedValue(
            new Error('Error loading materials')
        );
        (contextValue.ethProcessTypeService.getAll as jest.Mock).mockRejectedValue(
            new Error('Error loading process types')
        );
        await act(async () => {
            render(
                <Provider store={store}>
                    <EthContext.Provider value={contextValue}>
                        <AssetOperationsNew />
                    </EthContext.Provider>
                </Provider>
            );
        });
        await waitFor(() => {
            expect(GenericForm).toHaveBeenCalledTimes(3);
        });

        expect(openNotification).toHaveBeenCalledTimes(2);
        expect(openNotification).toHaveBeenCalledWith(
            'Error',
            'Error loading materials',
            NotificationType.ERROR
        );
        expect(openNotification).toHaveBeenCalledWith(
            'Error',
            'Error loading process types',
            NotificationType.ERROR
        );
    });

    it('should create asset operation on submit', async () => {
        const navigate = jest.fn();
        (useNavigate as jest.Mock).mockReturnValue(navigate);
        await act(async () => {
            render(
                <Provider store={store}>
                    <EthContext.Provider value={contextValue}>
                        <AssetOperationsNew />
                    </EthContext.Provider>
                </Provider>
            );
        });
        await waitFor(() => {
            expect(GenericForm).toHaveBeenCalledTimes(3);
        });

        const values = {
            name: 'Asset Operation 1',
            'input-material-id-1': '1',
            'output-material-id': '2',
            latitude: 1.234,
            longitude: 2.345,
            'process-types': 'Process Type 1'
        };
        await (GenericForm as jest.Mock).mock.calls[2][0].onSubmit(values);

        expect(contextValue.ethAssetOperationService.saveAssetOperation).toHaveBeenCalled();
        expect(contextValue.ethAssetOperationService.saveAssetOperation).toHaveBeenCalledWith({
            name: 'Asset Operation 1',
            inputMaterialIds: [1],
            outputMaterialId: 2,
            latitude: 1.234,
            longitude: 2.345,
            processTypes: 'Process Type 1'
        });
        expect(navigate).toHaveBeenCalledTimes(1);
        expect(navigate).toHaveBeenCalledWith(paths.ASSET_OPERATIONS);
    });

    it('should open notification if save fails', async () => {
        const navigate = jest.fn();
        (useNavigate as jest.Mock).mockReturnValue(navigate);
        (contextValue.ethAssetOperationService.saveAssetOperation as jest.Mock).mockRejectedValue(
            new Error('Error saving asset operation')
        );
        await act(async () => {
            render(
                <Provider store={store}>
                    <EthContext.Provider value={contextValue}>
                        <AssetOperationsNew />
                    </EthContext.Provider>
                </Provider>
            );
        });
        await waitFor(() => {
            expect(GenericForm).toHaveBeenCalledTimes(3);
        });

        const values = {};
        await (GenericForm as jest.Mock).mock.calls[2][0].onSubmit(values);

        expect(contextValue.ethAssetOperationService.saveAssetOperation).toHaveBeenCalled();
        expect(openNotification).toHaveBeenCalledTimes(1);
        expect(openNotification).toHaveBeenCalledWith(
            'Error',
            'Error saving asset operation',
            NotificationType.ERROR
        );
        expect(navigate).not.toHaveBeenCalled();
    });

    it("should navigate to 'Asset Operations' when clicking on 'Delete Asset Operation' button", async () => {
        const navigate = jest.fn();
        (useNavigate as jest.Mock).mockReturnValue(navigate);
        await act(async () => {
            render(
                <Provider store={store}>
                    <EthContext.Provider value={contextValue}>
                        <AssetOperationsNew />
                    </EthContext.Provider>
                </Provider>
            );
        });
        await waitFor(() => {
            expect(GenericForm).toHaveBeenCalledTimes(3);
        });

        userEvent.click(screen.getByRole('button', { name: 'delete Delete Asset Operation' }));

        expect(navigate).toHaveBeenCalledTimes(1);
        expect(navigate).toHaveBeenCalledWith(paths.ASSET_OPERATIONS);
    });

    it('should add and remove input material when clicking on buttons', async () => {
        await act(async () => {
            render(
                <Provider store={store}>
                    <EthContext.Provider value={contextValue}>
                        <AssetOperationsNew />
                    </EthContext.Provider>
                </Provider>
            );
        });
        await waitFor(() => {
            expect(GenericForm).toHaveBeenCalledTimes(3);
        });

        act(() => {
            const elements: any[] = (GenericForm as jest.Mock).mock.calls[2][0].elements;
            expect(elements).toHaveLength(12);
            elements.find((e) => e.name == 'new-input-material').onClick();
        });
        expect(GenericForm).toHaveBeenCalledTimes(4);
        expect((GenericForm as jest.Mock).mock.calls[3][0].elements).toHaveLength(13);
        act(() => {
            const elements: any[] = (GenericForm as jest.Mock).mock.calls[3][0].elements;
            expect(elements).toHaveLength(13);
            elements.find((e) => e.name == 'remove-input-material').onClick();
        });
        expect(GenericForm).toHaveBeenCalledTimes(5);
        expect((GenericForm as jest.Mock).mock.calls[4][0].elements).toHaveLength(12);
    });
});
