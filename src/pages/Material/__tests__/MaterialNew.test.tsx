import { useNavigate } from 'react-router-dom';
import MaterialNew from '../MaterialNew';
import { act, render, screen, waitFor } from '@testing-library/react';
import { EthMaterialService } from '@/api/services/EthMaterialService';
import userEvent from '@testing-library/user-event';
import { paths } from '@/constants/paths';
import { EthContext, EthContextState } from '@/providers/EthProvider';
import configureStore from 'redux-mock-store';
import { ProductCategory } from '@kbc-lib/coffee-trading-management-lib';
import { Provider } from 'react-redux';
import { GenericForm } from '@/components/GenericForm/GenericForm';
import { NotificationType, openNotification } from '@/utils/notification';

jest.mock('react-router-dom');
jest.mock('@/providers/EthProvider');
jest.mock('@/components/GenericForm/GenericForm');
jest.mock('@/utils/notification');

const mockStore = configureStore([]);

describe('Materials New', () => {
    const contextValue = {
        ethMaterialService: {
            saveMaterial: jest.fn(),
            getProductCategories: jest.fn()
        } as unknown as EthMaterialService
    } as EthContextState;
    const store = mockStore({});

    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.clearAllMocks();

        (contextValue.ethMaterialService.getProductCategories as jest.Mock).mockResolvedValue([
            new ProductCategory(1, 'Product category 1', 1, ''),
            new ProductCategory(2, 'Product category 2', 2, '')
        ]);
    });

    it('should render correctly', async () => {
        await act(async () => {
            render(
                <Provider store={store}>
                    <EthContext.Provider value={contextValue}>
                        <MaterialNew />
                    </EthContext.Provider>
                </Provider>
            );
        });
        await waitFor(() => {
            expect(GenericForm).toHaveBeenCalledTimes(2);
        });

        expect(screen.getByText('New Material')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'delete Delete Material' })).toBeInTheDocument();
        expect(GenericForm).toHaveBeenCalled();
        expect(GenericForm).toHaveBeenCalledWith(
            {
                elements: expect.any(Array),
                submittable: true,
                onSubmit: expect.any(Function)
            },
            {}
        );
        expect((GenericForm as jest.Mock).mock.calls[0][0].elements).toHaveLength(2);
    });
    it('should open notifications if load fails', async () => {
        (contextValue.ethMaterialService.getProductCategories as jest.Mock).mockRejectedValue(
            new Error('Error loading product categories')
        );
        await act(async () => {
            render(
                <Provider store={store}>
                    <EthContext.Provider value={contextValue}>
                        <MaterialNew />
                    </EthContext.Provider>
                </Provider>
            );
        });
        await waitFor(() => {
            expect(GenericForm).toHaveBeenCalledTimes(1);
        });

        expect(openNotification).toHaveBeenCalledTimes(1);
        expect(openNotification).toHaveBeenCalledWith(
            'Error',
            'Error loading product categories',
            NotificationType.ERROR
        );
    });

    it('should create material on submit', async () => {
        const navigate = jest.fn();
        (useNavigate as jest.Mock).mockReturnValue(navigate);
        await act(async () => {
            render(
                <Provider store={store}>
                    <EthContext.Provider value={contextValue}>
                        <MaterialNew />
                    </EthContext.Provider>
                </Provider>
            );
        });
        await waitFor(() => {
            expect(GenericForm).toHaveBeenCalledTimes(2);
        });

        const values = {
            'product-category-id': 1
        };
        await (GenericForm as jest.Mock).mock.calls[1][0].onSubmit(values);
        expect(contextValue.ethMaterialService.saveMaterial).toHaveBeenCalledTimes(1);
        expect(contextValue.ethMaterialService.saveMaterial).toHaveBeenCalledWith(1);
        expect(navigate).toHaveBeenCalledTimes(1);
        expect(navigate).toHaveBeenCalledWith(paths.MATERIALS);
    });

    it('should open notification if save fails', async () => {
        const navigate = jest.fn();
        (useNavigate as jest.Mock).mockReturnValue(navigate);
        (contextValue.ethMaterialService.saveMaterial as jest.Mock).mockRejectedValue(
            new Error('Error saving material')
        );
        await act(async () => {
            render(
                <Provider store={store}>
                    <EthContext.Provider value={contextValue}>
                        <MaterialNew />
                    </EthContext.Provider>
                </Provider>
            );
        });
        await waitFor(() => {
            expect(GenericForm).toHaveBeenCalledTimes(2);
        });

        const values = {};
        await (GenericForm as jest.Mock).mock.calls[1][0].onSubmit(values);
        expect(contextValue.ethMaterialService.saveMaterial).toHaveBeenCalled();
        expect(openNotification).toHaveBeenCalledTimes(1);
        expect(openNotification).toHaveBeenCalledWith(
            'Error',
            'Error saving material',
            NotificationType.ERROR
        );
        expect(navigate).not.toHaveBeenCalled();
    });

    it("should navigate to 'Materials' when clicking on 'Delete Material' button", async () => {
        const navigate = jest.fn();
        (useNavigate as jest.Mock).mockReturnValue(navigate);
        await act(async () => {
            render(
                <Provider store={store}>
                    <EthContext.Provider value={contextValue}>
                        <MaterialNew />
                    </EthContext.Provider>
                </Provider>
            );
        });
        await waitFor(() => {
            expect(GenericForm).toHaveBeenCalledTimes(2);
        });

        act(() => userEvent.click(screen.getByRole('button', { name: 'delete Delete Material' })));

        expect(navigate).toHaveBeenCalledTimes(1);
        expect(navigate).toHaveBeenCalledWith(paths.MATERIALS);
    });
});
