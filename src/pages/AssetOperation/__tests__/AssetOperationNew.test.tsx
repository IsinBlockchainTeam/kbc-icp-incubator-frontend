import { EthAssetOperationService } from '@/api/services/EthAssetOperationService';
import { act, render, screen } from '@testing-library/react';
import AssetOperationNew from '../AssetOperationNew';
import userEvent from '@testing-library/user-event';

import { paths } from '@/constants/paths';
import configureStore from 'redux-mock-store';
import { EthContext, EthContextState } from '@/providers/EthProvider';
import { Provider } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Material, ProductCategory } from '@kbc-lib/coffee-trading-management-lib';
import { GenericForm } from '@/components/GenericForm/GenericForm';
import { NotificationType, openNotification } from '@/utils/notification';
import { NOTIFICATION_DURATION } from '@/constants/notification';
import { useEthMaterial } from '@/providers/entities/EthMaterialProvider';
import { useEthEnumerable } from '@/providers/entities/EthEnumerableProvider';

jest.mock('react-router-dom');
jest.mock('@/providers/EthProvider');
jest.mock('@/components/GenericForm/GenericForm');
jest.mock('@/utils/notification');
jest.mock('@/providers/entities/EthMaterialProvider');
jest.mock('@/providers/entities/EthEnumerableProvider');

const mockStore = configureStore([]);

describe('Asset Operations New', () => {
    const contextValue = {
        ethAssetOperationService: {
            saveAssetOperation: jest.fn()
        } as unknown as EthAssetOperationService
    } as EthContextState;

    const store = mockStore({});

    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.clearAllMocks();

        (useEthMaterial as jest.Mock).mockReturnValue({
            materials: [
                new Material(1, new ProductCategory(1, 'Product category 1', 1, '')),
                new Material(2, new ProductCategory(2, 'Product category 2', 2, ''))
            ]
        });
        (useEthEnumerable as jest.Mock).mockReturnValue({
            processTypes: ['Process Type 1', 'Process Type 2']
        });
    });

    it('should render correctly', async () => {
        render(
            <Provider store={store}>
                <EthContext.Provider value={contextValue}>
                    <AssetOperationNew />
                </EthContext.Provider>
            </Provider>
        );

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

    it('should create asset operation on submit', async () => {
        const navigate = jest.fn();
        (useNavigate as jest.Mock).mockReturnValue(navigate);
        render(
            <Provider store={store}>
                <EthContext.Provider value={contextValue}>
                    <AssetOperationNew />
                </EthContext.Provider>
            </Provider>
        );

        const values = {
            name: 'Asset Operation 1',
            'input-material-id-1': '1',
            'output-material-id': '2',
            latitude: 1.234,
            longitude: 2.345,
            'process-types': 'Process Type 1'
        };
        await (GenericForm as jest.Mock).mock.calls[0][0].onSubmit(values);

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
        render(
            <Provider store={store}>
                <EthContext.Provider value={contextValue}>
                    <AssetOperationNew />
                </EthContext.Provider>
            </Provider>
        );

        const values = {};
        await (GenericForm as jest.Mock).mock.calls[0][0].onSubmit(values);

        expect(contextValue.ethAssetOperationService.saveAssetOperation).toHaveBeenCalled();
        expect(openNotification).toHaveBeenCalledTimes(1);
        expect(openNotification).toHaveBeenCalledWith(
            'Error',
            'Error saving asset operation',
            NotificationType.ERROR,
            NOTIFICATION_DURATION
        );
        expect(navigate).not.toHaveBeenCalled();
    });

    it("should navigate to 'Asset Operations' when clicking on 'Delete Asset Operation' button", async () => {
        const navigate = jest.fn();
        (useNavigate as jest.Mock).mockReturnValue(navigate);
        render(
            <Provider store={store}>
                <EthContext.Provider value={contextValue}>
                    <AssetOperationNew />
                </EthContext.Provider>
            </Provider>
        );

        userEvent.click(screen.getByRole('button', { name: 'delete Delete Asset Operation' }));

        expect(navigate).toHaveBeenCalledTimes(1);
        expect(navigate).toHaveBeenCalledWith(paths.ASSET_OPERATIONS);
    });

    it('should add and remove input material when clicking on buttons', async () => {
        render(
            <Provider store={store}>
                <EthContext.Provider value={contextValue}>
                    <AssetOperationNew />
                </EthContext.Provider>
            </Provider>
        );

        act(() => {
            const elements: any[] = (GenericForm as jest.Mock).mock.calls[0][0].elements;
            expect(elements).toHaveLength(12);
            elements.find((e) => e.name == 'new-input-material').onClick();
        });
        expect(GenericForm).toHaveBeenCalledTimes(2);
        expect((GenericForm as jest.Mock).mock.calls[1][0].elements).toHaveLength(13);
        act(() => {
            const elements: any[] = (GenericForm as jest.Mock).mock.calls[1][0].elements;
            expect(elements).toHaveLength(13);
            elements.find((e) => e.name == 'remove-input-material').onClick();
        });
        expect(GenericForm).toHaveBeenCalledTimes(3);
        expect((GenericForm as jest.Mock).mock.calls[2][0].elements).toHaveLength(12);
    });
});
