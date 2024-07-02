import { useNavigate } from 'react-router-dom';
import { EthOfferService } from '@/api/services/EthOfferService';
import OfferNew from '../OfferNew';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { paths } from '@/constants/paths';
import configureStore from 'redux-mock-store';
import { ICPContext, ICPContextState } from '@/providers/ICPProvider';
import { EthContext, EthContextState } from '@/providers/EthProvider';
import { credentials } from '@/constants/ssi';
import { Provider } from 'react-redux';
import { SignerContext, SignerContextState } from '@/providers/SignerProvider';
import { GenericForm } from '@/components/GenericForm/GenericForm';
import { NotificationType, openNotification } from '@/utils/notification';
import { ProductCategory } from '@kbc-lib/coffee-trading-management-lib';
import { NOTIFICATION_DURATION } from '@/constants/notification';
import { useEthMaterial } from '@/providers/entities/EthMaterialProvider';

jest.mock('react-router-dom');
jest.mock('@/providers/SignerProvider');
jest.mock('@/providers/ICPProvider');
jest.mock('@/providers/EthProvider');
jest.mock('@/components/GenericForm/GenericForm');
jest.mock('@/utils/notification');
jest.mock('@/providers/entities/EthMaterialProvider');

const mockStore = configureStore([]);

describe('Offers New', () => {
    const signerContextValue = {
        signer: {
            address: '0x123'
        }
    } as unknown as SignerContextState;
    const icpContextValue = {
        getNameByDID: jest.fn()
    } as unknown as ICPContextState;
    const ethContextValue = {
        ethOfferService: {
            saveOffer: jest.fn()
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
        (useEthMaterial as jest.Mock).mockReturnValue({
            productCategories: [
                new ProductCategory(1, 'Product Category 1', 1, ''),
                new ProductCategory(2, 'Product Category 2', 2, '')
            ]
        });
    });

    it('should render correctly', async () => {
        await act(async () => {
            render(
                <Provider store={store}>
                    <SignerContext.Provider value={signerContextValue}>
                        <ICPContext.Provider value={icpContextValue}>
                            <EthContext.Provider value={ethContextValue}>
                                <OfferNew />
                            </EthContext.Provider>
                        </ICPContext.Provider>
                    </SignerContext.Provider>
                </Provider>
            );
        });
        await waitFor(() => {
            expect(GenericForm).toHaveBeenCalledTimes(2);
        });

        expect(screen.getByText('New Offer')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'delete Delete Offer' })).toBeInTheDocument();
        expect(GenericForm).toHaveBeenCalled();
        expect(GenericForm).toHaveBeenCalledWith(
            {
                elements: expect.any(Array),
                submittable: true,
                onSubmit: expect.any(Function)
            },
            {}
        );
        expect((GenericForm as jest.Mock).mock.calls[1][0].elements).toHaveLength(3);
    });

    it('should open notifications if load fails - getNameByDID', async () => {
        (icpContextValue.getNameByDID as jest.Mock).mockRejectedValue(
            new Error('Error loading name')
        );
        await act(async () => {
            render(
                <Provider store={store}>
                    <SignerContext.Provider value={signerContextValue}>
                        <ICPContext.Provider value={icpContextValue}>
                            <EthContext.Provider value={ethContextValue}>
                                <OfferNew />
                            </EthContext.Provider>
                        </ICPContext.Provider>
                    </SignerContext.Provider>
                </Provider>
            );
        });
        await waitFor(() => {
            expect(GenericForm).toHaveBeenCalledTimes(1);
        });

        expect(openNotification).toHaveBeenCalledTimes(1);
        expect(openNotification).toHaveBeenCalledWith(
            'Error',
            'Error loading elements',
            NotificationType.ERROR,
            NOTIFICATION_DURATION
        );
    });

    it('should call onSubmit function when clicking on submit button', async () => {
        const navigate = jest.fn();
        (useNavigate as jest.Mock).mockReturnValue(navigate);
        await act(async () => {
            render(
                <Provider store={store}>
                    <SignerContext.Provider value={signerContextValue}>
                        <ICPContext.Provider value={icpContextValue}>
                            <EthContext.Provider value={ethContextValue}>
                                <OfferNew />
                            </EthContext.Provider>
                        </ICPContext.Provider>
                    </SignerContext.Provider>
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

        expect(ethContextValue.ethOfferService.saveOffer).toHaveBeenCalledTimes(1);
        expect(ethContextValue.ethOfferService.saveOffer).toHaveBeenCalledWith('0x123', 1);
        expect(navigate).toHaveBeenCalledTimes(1);
        expect(navigate).toHaveBeenCalledWith(paths.OFFERS);
    });

    it('should open notification if save fails', async () => {
        const navigate = jest.fn();
        (useNavigate as jest.Mock).mockReturnValue(navigate);
        (ethContextValue.ethOfferService.saveOffer as jest.Mock).mockRejectedValue(
            new Error('Error saving offer')
        );
        await act(async () => {
            render(
                <Provider store={store}>
                    <SignerContext.Provider value={signerContextValue}>
                        <ICPContext.Provider value={icpContextValue}>
                            <EthContext.Provider value={ethContextValue}>
                                <OfferNew />
                            </EthContext.Provider>
                        </ICPContext.Provider>
                    </SignerContext.Provider>
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

        expect(ethContextValue.ethOfferService.saveOffer).toHaveBeenCalledTimes(1);
        expect(openNotification).toHaveBeenCalledTimes(1);
        expect(openNotification).toHaveBeenCalledWith(
            'Error',
            'Error saving offer',
            NotificationType.ERROR,
            NOTIFICATION_DURATION
        );
        expect(navigate).not.toHaveBeenCalled();
    });

    it("should navigate to 'Offers' when clicking on 'Delete Offer' button", async () => {
        const navigate = jest.fn();
        (useNavigate as jest.Mock).mockReturnValue(navigate);
        await act(async () => {
            render(
                <Provider store={store}>
                    <SignerContext.Provider value={signerContextValue}>
                        <ICPContext.Provider value={icpContextValue}>
                            <EthContext.Provider value={ethContextValue}>
                                <OfferNew />
                            </EthContext.Provider>
                        </ICPContext.Provider>
                    </SignerContext.Provider>
                </Provider>
            );
        });
        await waitFor(() => {
            expect(GenericForm).toHaveBeenCalledTimes(2);
        });

        act(() => userEvent.click(screen.getByRole('button', { name: 'delete Delete Offer' })));

        expect(navigate).toHaveBeenCalledTimes(1);
        expect(navigate).toHaveBeenCalledWith(paths.OFFERS);
    });
    it("should navigate to 'Home' if user is an importer", async () => {
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
                    <SignerContext.Provider value={signerContextValue}>
                        <ICPContext.Provider value={icpContextValue}>
                            <EthContext.Provider value={ethContextValue}>
                                <OfferNew />
                            </EthContext.Provider>
                        </ICPContext.Provider>
                    </SignerContext.Provider>
                </Provider>
            );
        });
        expect(GenericForm).not.toHaveBeenCalled();
    });
});
