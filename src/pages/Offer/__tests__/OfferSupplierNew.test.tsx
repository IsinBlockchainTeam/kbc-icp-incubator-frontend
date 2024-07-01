import { useNavigate } from 'react-router-dom';
import { EthOfferService } from '@/api/services/EthOfferService';
import OfferSupplierNew from '../OfferSupplierNew';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { paths } from '@/constants/paths';
import { SignerContext, SignerContextState } from '@/providers/SignerProvider';
import { EthContext, EthContextState } from '@/providers/EthProvider';
import { credentials } from '@/constants/ssi';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { GenericForm } from '@/components/GenericForm/GenericForm';
import { NotificationType, openNotification } from '@/utils/notification';
import { NOTIFICATION_DURATION } from '@/constants/notification';

jest.mock('react-router-dom');
jest.mock('@/providers/SignerProvider');
jest.mock('@/providers/EthProvider');
jest.mock('@/components/GenericForm/GenericForm');
jest.mock('@/utils/notification');

const mockStore = configureStore([]);

describe('Offers Supplier New', () => {
    const signerContextValue = {
        signer: {
            address: '0x123'
        }
    } as unknown as SignerContextState;
    const ethContextValue = {
        ethOfferService: {
            saveSupplier: jest.fn()
        } as unknown as EthOfferService
    } as EthContextState;
    const store = mockStore({
        userInfo: {
            legalName: 'Legal Name',
            role: credentials.ROLE_EXPORTER
        }
    });

    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.clearAllMocks();
    });

    it('should render correctly', async () => {
        await act(async () => {
            render(
                <Provider store={store}>
                    <SignerContext.Provider value={signerContextValue}>
                        <EthContext.Provider value={ethContextValue}>
                            <OfferSupplierNew />
                        </EthContext.Provider>
                    </SignerContext.Provider>
                </Provider>
            );
        });
        await waitFor(() => {
            expect(GenericForm).toHaveBeenCalledTimes(1);
        });

        expect(screen.getByText('New Offer Supplier')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'delete Delete Offer Supplier' })
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
        expect((GenericForm as jest.Mock).mock.calls[0][0].elements).toHaveLength(3);
    });

    it("should navigate to 'Home' if user is an importer", async () => {
        const store = mockStore({
            userInfo: {
                legalName: 'Legal Name',
                role: credentials.ROLE_IMPORTER
            }
        });
        await act(async () => {
            render(
                <Provider store={store}>
                    <SignerContext.Provider value={signerContextValue}>
                        <EthContext.Provider value={ethContextValue}>
                            <OfferSupplierNew />
                        </EthContext.Provider>
                    </SignerContext.Provider>
                </Provider>
            );
        });
        expect(GenericForm).not.toHaveBeenCalled();
    });

    it('should call onSubmit function when clicking on submit button', async () => {
        const navigate = jest.fn();
        (useNavigate as jest.Mock).mockReturnValue(navigate);
        await act(async () => {
            render(
                <Provider store={store}>
                    <SignerContext.Provider value={signerContextValue}>
                        <EthContext.Provider value={ethContextValue}>
                            <OfferSupplierNew />
                        </EthContext.Provider>
                    </SignerContext.Provider>
                </Provider>
            );
        });
        await waitFor(() => {
            expect(GenericForm).toHaveBeenCalledTimes(1);
        });

        const values = {};
        await (GenericForm as jest.Mock).mock.calls[0][0].onSubmit(values);

        expect(ethContextValue.ethOfferService.saveSupplier).toHaveBeenCalledTimes(1);
        expect(ethContextValue.ethOfferService.saveSupplier).toHaveBeenCalledWith(
            '0x123',
            'Legal Name'
        );
        expect(navigate).toHaveBeenCalledTimes(1);
        expect(navigate).toHaveBeenCalledWith(paths.OFFERS);
    });

    it('should open notification if save fails', async () => {
        const navigate = jest.fn();
        (useNavigate as jest.Mock).mockReturnValue(navigate);
        (ethContextValue.ethOfferService.saveSupplier as jest.Mock).mockRejectedValue(
            new Error('Error saving offer supplier')
        );
        await act(async () => {
            render(
                <Provider store={store}>
                    <SignerContext.Provider value={signerContextValue}>
                        <EthContext.Provider value={ethContextValue}>
                            <OfferSupplierNew />
                        </EthContext.Provider>
                    </SignerContext.Provider>
                </Provider>
            );
        });
        await waitFor(() => {
            expect(GenericForm).toHaveBeenCalledTimes(1);
        });

        const values = {};
        await (GenericForm as jest.Mock).mock.calls[0][0].onSubmit(values);

        expect(ethContextValue.ethOfferService.saveSupplier).toHaveBeenCalledTimes(1);
        expect(openNotification).toHaveBeenCalledTimes(1);
        expect(openNotification).toHaveBeenCalledWith(
            'Error',
            'Error saving offer supplier',
            NotificationType.ERROR,
            NOTIFICATION_DURATION
        );
        expect(navigate).not.toHaveBeenCalled();
    });

    it("should navigate to 'Offers' when clicking on 'Delete Offer Supplier' button", async () => {
        const navigate = jest.fn();
        (useNavigate as jest.Mock).mockReturnValue(navigate);
        await act(async () => {
            render(
                <Provider store={store}>
                    <SignerContext.Provider value={signerContextValue}>
                        <EthContext.Provider value={ethContextValue}>
                            <OfferSupplierNew />
                        </EthContext.Provider>
                    </SignerContext.Provider>
                </Provider>
            );
        });
        await waitFor(() => {
            expect(GenericForm).toHaveBeenCalledTimes(1);
        });

        act(() =>
            userEvent.click(screen.getByRole('button', { name: 'delete Delete Offer Supplier' }))
        );

        expect(navigate).toHaveBeenCalledTimes(1);
        expect(navigate).toHaveBeenCalledWith(paths.OFFERS);
    });
});
