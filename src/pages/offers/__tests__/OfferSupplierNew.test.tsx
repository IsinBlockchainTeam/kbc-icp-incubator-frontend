import {useNavigate} from "react-router-dom";
import {OfferService} from "../../../api/services/OfferService";
import OffersSupplierNew from "../OffersSupplierNew";
import {render, screen, waitFor} from "@testing-library/react";
import OffersNew from "../OffersNew";
import userEvent from "@testing-library/user-event";
import {paths} from "../../../constants";

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(),
}));
jest.mock('../../../api/services/OfferService');
jest.mock('../../../api/strategies/offer/BlockchainOfferStrategy');

describe('Offers Supplier New', () => {
    const navigate = jest.fn();
    const mockedSaveSupplier = jest.fn();

    beforeEach(() => {
        (useNavigate as jest.Mock).mockReturnValue(navigate);
        (OfferService as jest.Mock).mockImplementation(() => ({
            saveSupplier: mockedSaveSupplier
        }));
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.clearAllMocks();
    });

    it('should render correctly', () => {
        render(<OffersSupplierNew />);

        expect(screen.getByText('New Offer Supplier')).toBeInTheDocument();
        expect(screen.getByRole('button', {name: 'delete Delete Offer Supplier'})).toBeInTheDocument();
        expect(screen.getByText('Data')).toBeInTheDocument();
        expect(screen.getByText('Supplier Address')).toBeInTheDocument();
        expect(screen.getByText('Supplier Name')).toBeInTheDocument();
        expect(screen.getByRole('button', {name: 'Submit'})).toBeInTheDocument();
    });

    it('should call onSubmit function when clicking on submit button', async () => {
        render(<OffersSupplierNew />);

        userEvent.type(screen.getByRole('textbox', {name: 'Supplier Address'}), '0x1234567890123456789012345678901234567890');
        userEvent.type(screen.getByRole('textbox', {name: 'Supplier Name'}), 'Michael Scott');
        userEvent.click(screen.getByRole('button', {name: 'Submit'}));

        await waitFor(() => {
            expect(mockedSaveSupplier).toHaveBeenCalledTimes(1);
            expect(navigate).toHaveBeenCalledTimes(1);
            expect(navigate).toHaveBeenCalledWith(paths.OFFERS);
        });
    });

    it('should navigate to \'Offers\' when clicking on \'Delete Offer Supplier\' button', async () => {
        render(<OffersSupplierNew />);

        userEvent.click(screen.getByRole('button', {name: 'delete Delete Offer Supplier'}));

        await waitFor(() => {
            expect(navigate).toHaveBeenCalledTimes(1);
            expect(navigate).toHaveBeenCalledWith(paths.OFFERS);
        });
    });
});