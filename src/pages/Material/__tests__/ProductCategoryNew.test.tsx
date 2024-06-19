import { useNavigate } from 'react-router-dom';
import ProductCategoryNew from '../ProductCategoryNew';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EthMaterialService } from '@/api/services/EthMaterialService';
import { paths } from '@/constants/paths';
import { EthContext, EthContextState } from '@/providers/EthProvider';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { GenericForm } from '@/components/GenericForm/GenericForm';
import { NotificationType, openNotification } from '@/utils/notification';

jest.mock('react-router-dom');
jest.mock('@/providers/EthProvider');
jest.mock('@/components/GenericForm/GenericForm');
jest.mock('@/utils/notification');

const mockStore = configureStore([]);

describe('Product Category New', () => {
    const contextValue = {
        ethMaterialService: {
            saveProductCategory: jest.fn()
        } as unknown as EthMaterialService
    } as EthContextState;
    const store = mockStore({});

    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.clearAllMocks();
    });

    it('should render correctly', () => {
        render(
            <Provider store={store}>
                <EthContext.Provider value={contextValue}>
                    <ProductCategoryNew />
                </EthContext.Provider>
            </Provider>
        );

        expect(screen.getByText('New Product Category')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'delete Delete Product Category' })
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
        expect((GenericForm as jest.Mock).mock.calls[0][0].elements).toHaveLength(4);
    });

    it('should call onSubmit function when clicking on submit button', async () => {
        const navigate = jest.fn();
        (useNavigate as jest.Mock).mockReturnValue(navigate);
        render(
            <Provider store={store}>
                <EthContext.Provider value={contextValue}>
                    <ProductCategoryNew />
                </EthContext.Provider>
            </Provider>
        );

        const values = {
            name: 'product category 1',
            quality: 1,
            description: 'description 1'
        };
        await (GenericForm as jest.Mock).mock.calls[0][0].onSubmit(values);

        expect(contextValue.ethMaterialService.saveProductCategory).toHaveBeenCalledTimes(1);
        expect(contextValue.ethMaterialService.saveProductCategory).toHaveBeenCalledWith(
            values.name,
            values.quality,
            values.description
        );
        expect(navigate).toHaveBeenCalledTimes(1);
        expect(navigate).toHaveBeenCalledWith(paths.MATERIALS);
    });

    it('should open notification if save fails', async () => {
        const navigate = jest.fn();
        (useNavigate as jest.Mock).mockReturnValue(navigate);
        (contextValue.ethMaterialService.saveProductCategory as jest.Mock).mockRejectedValue(
            new Error('Error saving product category')
        );
        render(
            <Provider store={store}>
                <EthContext.Provider value={contextValue}>
                    <ProductCategoryNew />
                </EthContext.Provider>
            </Provider>
        );

        const values = {};
        await (GenericForm as jest.Mock).mock.calls[0][0].onSubmit(values);

        expect(contextValue.ethMaterialService.saveProductCategory).toHaveBeenCalledTimes(1);
        expect(openNotification).toHaveBeenCalledTimes(1);
        expect(openNotification).toHaveBeenCalledWith(
            'Error',
            'Error saving product category',
            NotificationType.ERROR
        );
        expect(navigate).not.toHaveBeenCalled();
    });

    it("should navigate to 'Materials' when clicking on 'Delete Product Category' button", async () => {
        const navigate = jest.fn();
        (useNavigate as jest.Mock).mockReturnValue(navigate);
        (contextValue.ethMaterialService.saveProductCategory as jest.Mock).mockRejectedValue(
            new Error('Error saving product category')
        );
        render(
            <Provider store={store}>
                <EthContext.Provider value={contextValue}>
                    <ProductCategoryNew />
                </EthContext.Provider>
            </Provider>
        );

        act(() => {
            userEvent.click(screen.getByRole('button', { name: 'delete Delete Product Category' }));
        });
        expect(navigate).toHaveBeenCalledTimes(1);
        expect(navigate).toHaveBeenCalledWith(paths.MATERIALS);
    });
});
