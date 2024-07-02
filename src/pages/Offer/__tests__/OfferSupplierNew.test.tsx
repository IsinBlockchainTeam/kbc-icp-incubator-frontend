import { useNavigate } from 'react-router-dom';
import OfferSupplierNew from '../OfferSupplierNew';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { paths } from '@/constants/paths';
import { SignerContext, SignerContextState } from '@/providers/SignerProvider';
import { credentials } from '@/constants/ssi';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { GenericForm } from '@/components/GenericForm/GenericForm';
import { useEthOffer } from '@/providers/entities/EthOfferProvider';

jest.mock('react-router-dom');
jest.mock('@/providers/SignerProvider');
jest.mock('@/components/GenericForm/GenericForm');
jest.mock('@/providers/entities/EthOfferProvider');

const mockStore = configureStore([]);

describe('Offers Supplier New', () => {
    const signerContextValue = {
        signer: {
            address: '0x123'
        }
    } as unknown as SignerContextState;
    const store = mockStore({
        userInfo: {
            legalName: 'Legal Name',
            role: credentials.ROLE_EXPORTER
        }
    });
    const saveSupplier = jest.fn();

    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.clearAllMocks();

        (useEthOffer as jest.Mock).mockReturnValue({
            saveSupplier
        });
    });

    it('should render correctly', async () => {
        render(
            <Provider store={store}>
                <SignerContext.Provider value={signerContextValue}>
                    <OfferSupplierNew />
                </SignerContext.Provider>
            </Provider>
        );
        expect(GenericForm).toHaveBeenCalledTimes(1);

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
        render(
            <Provider store={store}>
                <SignerContext.Provider value={signerContextValue}>
                    <OfferSupplierNew />
                </SignerContext.Provider>
            </Provider>
        );
        expect(GenericForm).not.toHaveBeenCalled();
    });

    it('should call onSubmit function when clicking on submit button', async () => {
        const navigate = jest.fn();
        (useNavigate as jest.Mock).mockReturnValue(navigate);
        render(
            <Provider store={store}>
                <SignerContext.Provider value={signerContextValue}>
                    <OfferSupplierNew />
                </SignerContext.Provider>
            </Provider>
        );

        const values = {};
        await (GenericForm as jest.Mock).mock.calls[0][0].onSubmit(values);

        expect(saveSupplier).toHaveBeenCalledTimes(1);
        expect(saveSupplier).toHaveBeenCalledWith('0x123', 'Legal Name');
        expect(navigate).toHaveBeenCalledTimes(1);
        expect(navigate).toHaveBeenCalledWith(paths.OFFERS);
    });

    it("should navigate to 'Offers' when clicking on 'Delete Offer Supplier' button", async () => {
        const navigate = jest.fn();
        (useNavigate as jest.Mock).mockReturnValue(navigate);
        render(
            <Provider store={store}>
                <SignerContext.Provider value={signerContextValue}>
                    <OfferSupplierNew />
                </SignerContext.Provider>
            </Provider>
        );

        act(() =>
            userEvent.click(screen.getByRole('button', { name: 'delete Delete Offer Supplier' }))
        );

        expect(navigate).toHaveBeenCalledTimes(1);
        expect(navigate).toHaveBeenCalledWith(paths.OFFERS);
    });
});
