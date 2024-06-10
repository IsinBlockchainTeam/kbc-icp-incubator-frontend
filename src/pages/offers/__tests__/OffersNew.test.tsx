import { useNavigate } from 'react-router-dom';
import { EthOfferService } from '../../../api/services/EthOfferService';
import OffersNew from '../OffersNew';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { paths } from '../../../constants';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn()
}));
jest.mock('../../../api/services/EthOfferService');
jest.mock('../../../api/strategies/offer/BlockchainOfferStrategy');

describe('Offers New', () => {
    const navigate = jest.fn();
    const mockedSaveOffer = jest.fn();

    beforeEach(() => {
        (useNavigate as jest.Mock).mockReturnValue(navigate);
        (EthOfferService as jest.Mock).mockImplementation(() => ({
            saveOffer: mockedSaveOffer
        }));
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.clearAllMocks();
    });

    it('should render correctly', () => {
        render(<OffersNew />);

        expect(screen.getByText('New Offer')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'delete Delete Offer' })).toBeInTheDocument();
        expect(screen.getByText('Data')).toBeInTheDocument();
        expect(screen.getByText('Offeror Company Address')).toBeInTheDocument();
        expect(screen.getByText('Product Category ID')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    });

    it('should call onSubmit function when clicking on submit button', async () => {
        render(<OffersNew />);

        userEvent.type(
            screen.getByRole('textbox', { name: 'Offeror Company Address' }),
            '0x1234567890123456789012345678901234567890'
        );
        userEvent.type(screen.getByRole('textbox', { name: 'Product Category ID' }), '1');
        userEvent.click(screen.getByRole('button', { name: 'Submit' }));

        await waitFor(() => {
            expect(mockedSaveOffer).toHaveBeenCalledTimes(1);
            expect(navigate).toHaveBeenCalledTimes(1);
            expect(navigate).toHaveBeenCalledWith(paths.OFFERS);
        });
    });

    it("should navigate to 'Offers' when clicking on 'Delete Offer' button", async () => {
        render(<OffersNew />);

        userEvent.click(screen.getByRole('button', { name: 'delete Delete Offer' }));

        await waitFor(() => {
            expect(navigate).toHaveBeenCalledTimes(1);
            expect(navigate).toHaveBeenCalledWith(paths.OFFERS);
        });
    });
});
