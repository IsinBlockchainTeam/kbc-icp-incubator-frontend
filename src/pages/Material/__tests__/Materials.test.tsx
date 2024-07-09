import { act, render, screen, waitFor } from '@testing-library/react';
import Materials from '../Materials';
import { EthMaterialService } from '@/api/services/EthMaterialService';
import userEvent from '@testing-library/user-event';
import { useNavigate } from 'react-router-dom';
import { paths } from '@/constants/paths';
import configureStore from 'redux-mock-store';
import { EthContext, EthContextState } from '@/providers/EthProvider';
import { Material, ProductCategory } from '@kbc-lib/coffee-trading-management-lib';
import { Provider } from 'react-redux';
import { NotificationType, openNotification } from '@/utils/notification';

jest.mock('react-router-dom');
jest.mock('@/providers/EthProvider');
jest.mock('@/components/GenericForm/GenericForm');
jest.mock('@/utils/notification');

const mockStore = configureStore([]);

describe('Materials', () => {
    const contextValue = {
        ethMaterialService: {
            getMaterials: jest.fn(),
            getProductCategories: jest.fn()
        } as unknown as EthMaterialService
    } as EthContextState;
    const store = mockStore({});

    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.clearAllMocks();

        const productCategories = [
            new ProductCategory(1, 'Product category 1', 1, ''),
            new ProductCategory(2, 'Product category 2', 2, '')
        ];
        (contextValue.ethMaterialService.getMaterials as jest.Mock).mockResolvedValue([
            new Material(1, productCategories[0]),
            new Material(2, productCategories[1])
        ]);
        (contextValue.ethMaterialService.getProductCategories as jest.Mock).mockResolvedValue(
            productCategories
        );
    });

    it('should render correctly', async () => {
        await act(async () => {
            render(
                <Provider store={store}>
                    <EthContext.Provider value={contextValue}>
                        <Materials />
                    </EthContext.Provider>
                </Provider>
            );
        });
        await waitFor(() => {
            expect(screen.getByText('Product category')).toBeInTheDocument();
        });

        expect(screen.getByText('Product Categories')).toBeInTheDocument();
        expect(screen.getByText('Your Materials')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'plus New Product Category' })
        ).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'plus New Material' })).toBeInTheDocument();
        expect(screen.getAllByText('Product category 1')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Product category 1')[1]).toBeInTheDocument();
        expect(screen.getAllByText('Product category 2')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Product category 2')[1]).toBeInTheDocument();
    });

    it('should open notifications if load fails', async () => {
        (contextValue.ethMaterialService.getProductCategories as jest.Mock).mockRejectedValue(
            new Error('Error loading product categories')
        );
        await act(async () => {
            render(
                <Provider store={store}>
                    <EthContext.Provider value={contextValue}>
                        <Materials />
                    </EthContext.Provider>
                </Provider>
            );
        });
        await waitFor(() => {
            expect(openNotification).toHaveBeenCalled();
        });

        expect(openNotification).toHaveBeenCalledTimes(1);
        expect(openNotification).toHaveBeenCalledWith(
            'Error',
            'Error loading product categories',
            NotificationType.ERROR
        );
    });

    it("should call navigator functions when clicking on 'New' buttons", async () => {
        const navigate = jest.fn();
        (useNavigate as jest.Mock).mockReturnValue(navigate);
        await act(async () => {
            render(
                <Provider store={store}>
                    <EthContext.Provider value={contextValue}>
                        <Materials />
                    </EthContext.Provider>
                </Provider>
            );
        });
        await waitFor(() => {
            expect(screen.getByText('Product category')).toBeInTheDocument();
        });

        await waitFor(() => {
            userEvent.click(screen.getByRole('button', { name: 'plus New Product Category' }));
            expect(navigate).toHaveBeenCalledTimes(1);
            expect(navigate).toHaveBeenCalledWith(paths.PRODUCT_CATEGORY_NEW);
        });

        await waitFor(() => {
            userEvent.click(screen.getByRole('button', { name: 'plus New Material' }));
            expect(navigate).toHaveBeenCalledTimes(2);
            expect(navigate).toHaveBeenCalledWith(paths.MATERIAL_NEW);
        });
    });

    it('should call sorter function correctly when clicking on product categories table header', async () => {
        await act(async () => {
            render(
                <Provider store={store}>
                    <EthContext.Provider value={contextValue}>
                        <Materials />
                    </EthContext.Provider>
                </Provider>
            );
        });

        let tableRows = screen.getAllByRole('row');
        expect(tableRows).toHaveLength(6);
        expect(tableRows[1]).toHaveTextContent('1Product category 11');
        expect(tableRows[2]).toHaveTextContent('2Product category 22');

        act(() => {
            userEvent.click(screen.getAllByText('Id')[0]);
        });

        tableRows = screen.getAllByRole('row');
        expect(tableRows).toHaveLength(6);
        expect(tableRows[1]).toHaveTextContent('2Product category 22');
        expect(tableRows[2]).toHaveTextContent('1Product category 11');

        act(() => {
            userEvent.click(screen.getByText('Name'));
        });

        tableRows = screen.getAllByRole('row');
        expect(tableRows).toHaveLength(6);
        expect(tableRows[1]).toHaveTextContent('1Product category 11');
        expect(tableRows[2]).toHaveTextContent('2Product category 22');

        act(() => {
            userEvent.click(screen.getByText('Quality'));
        });

        tableRows = screen.getAllByRole('row');
        expect(tableRows).toHaveLength(6);
        expect(tableRows[1]).toHaveTextContent('1Product category 11');
        expect(tableRows[2]).toHaveTextContent('2Product category 22');
    });

    it('should call sorter function correctly when clicking on material table header', async () => {
        await act(async () => {
            render(
                <Provider store={store}>
                    <EthContext.Provider value={contextValue}>
                        <Materials />
                    </EthContext.Provider>
                </Provider>
            );
        });

        let tableRows = screen.getAllByRole('row');
        expect(tableRows).toHaveLength(6);
        expect(tableRows[4]).toHaveTextContent('1Product category 1');
        expect(tableRows[5]).toHaveTextContent('2Product category 2');

        act(() => {
            userEvent.click(screen.getAllByText('Id')[1]);
        });

        tableRows = screen.getAllByRole('row');
        expect(tableRows).toHaveLength(6);
        expect(tableRows[4]).toHaveTextContent('2Product category 2');
        expect(tableRows[5]).toHaveTextContent('1Product category 1');

        act(() => {
            userEvent.click(screen.getByText('Product category'));
        });

        tableRows = screen.getAllByRole('row');
        expect(tableRows).toHaveLength(6);
        expect(tableRows[4]).toHaveTextContent('1Product category 1');
        expect(tableRows[5]).toHaveTextContent('2Product category 2');
    });
});
