import { act, render, screen, waitFor } from '@testing-library/react';
import Offers from '../Offers';
import { EthOfferService } from '@/api/services/EthOfferService';
import userEvent from '@testing-library/user-event';
import { paths } from '@/constants/paths';
import configureStore from 'redux-mock-store';
import { EthContext, EthContextState } from '@/providers/EthProvider';
import { Offer, ProductCategory } from '@kbc-lib/coffee-trading-management-lib';
import { Provider } from 'react-redux';
import { ICPContext, ICPContextState } from '@/providers/ICPProvider';
import { credentials } from '@/constants/ssi';
import { useNavigate } from 'react-router-dom';
import { NotificationType, openNotification } from '@/utils/notification';
import { NOTIFICATION_DURATION } from '@/constants/notification';

jest.mock('react-router-dom');
jest.mock('@/providers/ICPProvider');
jest.mock('@/providers/EthProvider');
jest.mock('@/utils/notification');

const mockStore = configureStore([]);

describe('Offers', () => {
    const icpContextValue = {
        getNameByDID: jest.fn()
    } as unknown as ICPContextState;
    const ethContextValue = {
        ethOfferService: {
            getAllOffers: jest.fn()
        } as unknown as EthOfferService
    } as EthContextState;
    const store = mockStore({
        userInfo: {
            role: credentials.ROLE_EXPORTER
        }
    });

    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.clearAllMocks();

        (icpContextValue.getNameByDID as jest.Mock).mockResolvedValue('Supplier Name');
        (ethContextValue.ethOfferService.getAllOffers as jest.Mock).mockResolvedValue([
            new Offer(1, 'Owner 1', new ProductCategory(1, 'Product Category 1', 1, '')),
            new Offer(2, 'Owner 2', new ProductCategory(2, 'Product Category 2', 2, ''))
        ]);
    });

    it('should render correctly', async () => {
        await act(async () => {
            render(
                <Provider store={store}>
                    <ICPContext.Provider value={icpContextValue}>
                        <EthContext.Provider value={ethContextValue}>
                            <Offers />
                        </EthContext.Provider>
                    </ICPContext.Provider>
                </Provider>
            );
        });
        await waitFor(() => {
            expect(screen.getByText('Product Category 1')).toBeInTheDocument();
        });

        expect(screen.getByText('Product Category 1')).toBeInTheDocument();
        expect(screen.getByText('Product Category 2')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'plus New Offer Supplier' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'plus New Offer' })).toBeInTheDocument();
    });

    it('should open notifications if load fails', async () => {
        (ethContextValue.ethOfferService.getAllOffers as jest.Mock).mockRejectedValue(
            new Error('Error loading offers')
        );
        await act(async () => {
            render(
                <Provider store={store}>
                    <ICPContext.Provider value={icpContextValue}>
                        <EthContext.Provider value={ethContextValue}>
                            <Offers />
                        </EthContext.Provider>
                    </ICPContext.Provider>
                </Provider>
            );
        });

        expect(openNotification).toHaveBeenCalledTimes(1);
        expect(openNotification).toHaveBeenCalledWith(
            'Error',
            'Error loading offers',
            NotificationType.ERROR,
            NOTIFICATION_DURATION
        );
    });

    it("should call navigator functions when clicking on 'New' buttons", async () => {
        const navigate = jest.fn();
        (useNavigate as jest.Mock).mockReturnValue(navigate);
        await act(async () => {
            render(
                <Provider store={store}>
                    <ICPContext.Provider value={icpContextValue}>
                        <EthContext.Provider value={ethContextValue}>
                            <Offers />
                        </EthContext.Provider>
                    </ICPContext.Provider>
                </Provider>
            );
        });
        await waitFor(() => {
            expect(screen.getByText('Product Category 1')).toBeInTheDocument();
        });

        act(() => {
            userEvent.click(screen.getByRole('button', { name: 'plus New Offer Supplier' }));
        });
        expect(navigate).toHaveBeenCalledTimes(1);
        expect(navigate).toHaveBeenCalledWith(paths.OFFERS_SUPPLIER_NEW);

        act(() => {
            userEvent.click(screen.getByRole('button', { name: 'plus New Offer' }));
        });
        expect(navigate).toHaveBeenCalledTimes(2);
        expect(navigate).toHaveBeenCalledWith(paths.OFFERS_NEW);
    });

    it("should call navigator functions when clicking on 'Start a negotiation' buttons", async () => {
        const store = mockStore({
            userInfo: {
                role: credentials.ROLE_IMPORTER
            }
        });
        const navigate = jest.fn();
        (useNavigate as jest.Mock).mockReturnValue(navigate);
        await act(async () => {
            render(
                <Provider store={store}>
                    <ICPContext.Provider value={icpContextValue}>
                        <EthContext.Provider value={ethContextValue}>
                            <Offers />
                        </EthContext.Provider>
                    </ICPContext.Provider>
                </Provider>
            );
        });
        await waitFor(() => {
            expect(screen.getByText('Product Category 1')).toBeInTheDocument();
        });

        act(() => {
            userEvent.click(screen.getAllByRole('start-negotiation')[0]);
        });
        expect(navigate).toHaveBeenCalledTimes(1);
        expect(navigate).toHaveBeenCalledWith(paths.TRADE_NEW, {
            state: { productCategoryId: 1, supplierAddress: 'Owner 1' }
        });
    });

    it('should call sorter function correctly when clicking on a table header', async () => {
        await act(async () => {
            render(
                <Provider store={store}>
                    <ICPContext.Provider value={icpContextValue}>
                        <EthContext.Provider value={ethContextValue}>
                            <Offers />
                        </EthContext.Provider>
                    </ICPContext.Provider>
                </Provider>
            );
        });
        await waitFor(() => {
            expect(screen.getByText('Product Category 1')).toBeInTheDocument();
        });

        let tableRows = screen.getAllByRole('row');
        expect(tableRows).toHaveLength(3);
        expect(tableRows[1]).toHaveTextContent('1Supplier NameProduct Category 1');
        expect(tableRows[2]).toHaveTextContent('2Supplier NameProduct Category 2');

        act(() => {
            userEvent.click(screen.getByText('Id'));
        });

        tableRows = screen.getAllByRole('row');
        expect(tableRows).toHaveLength(3);
        expect(tableRows[1]).toHaveTextContent('2Supplier NameProduct Category 2');
        expect(tableRows[2]).toHaveTextContent('1Supplier NameProduct Category 1');

        act(() => {
            userEvent.click(screen.getByText('Company'));
        });

        tableRows = screen.getAllByRole('row');
        expect(tableRows).toHaveLength(3);
        expect(tableRows[1]).toHaveTextContent('1Supplier NameProduct Category 1');
        expect(tableRows[2]).toHaveTextContent('2Supplier NameProduct Category 2');

        act(() => {
            userEvent.click(screen.getByText('Product category'));
        });

        tableRows = screen.getAllByRole('row');
        expect(tableRows).toHaveLength(3);
        expect(tableRows[1]).toHaveTextContent('1Supplier NameProduct Category 1');
        expect(tableRows[2]).toHaveTextContent('2Supplier NameProduct Category 2');
    });

    it('should filter offers', async () => {
        await act(async () => {
            render(
                <Provider store={store}>
                    <ICPContext.Provider value={icpContextValue}>
                        <EthContext.Provider value={ethContextValue}>
                            <Offers />
                        </EthContext.Provider>
                    </ICPContext.Provider>
                </Provider>
            );
        });
        await waitFor(() => {
            expect(screen.getByText('Product Category 1')).toBeInTheDocument();
        });

        let tableRows = screen.getAllByRole('row');
        expect(tableRows).toHaveLength(3);

        userEvent.type(
            screen.getByPlaceholderText('Search by product category'),
            'Product Category 1'
        );
        act(() => {
            userEvent.click(screen.getByLabelText('search'));
        });

        tableRows = screen.getAllByRole('row');
        expect(tableRows).toHaveLength(2);
        expect(tableRows[1]).toHaveTextContent('1Supplier NameProduct Category 1');
    });
});
