import {useNavigate} from "react-router-dom";
import {render, screen, waitFor} from "@testing-library/react";
import Offers from "../Offers";
import {OfferPresentable} from "../../../api/types/OfferPresentable";
import {EthOfferService} from "../../../api/services/EthOfferService";
import {BlockchainOfferStrategy} from "../../../api/strategies/offer/BlockchainOfferStrategy";
import userEvent from "@testing-library/user-event";
import {paths} from "../../../constants";

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(),
}));
jest.mock('../../../api/services/EthOfferService');
jest.mock('../../../api/strategies/offer/BlockchainOfferStrategy');

describe('Offers', () => {
    const navigate = jest.fn();

    beforeEach(() => {
        (useNavigate as jest.Mock).mockReturnValue(navigate);
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.clearAllMocks();
    });

    it('should render correctly', () => {
        render(<Offers/>);

        expect(screen.getByText('Offers')).toBeInTheDocument();
        expect(screen.getByRole('button', {name: 'plus New Offer Supplier'})).toBeInTheDocument();
        expect(screen.getByRole('button', {name: 'plus New Offer'})).toBeInTheDocument();
    });

    it('should fetch data', async () => {
        const mockedOffers: OfferPresentable[] = [new OfferPresentable(1, 'Owner 1', 'Product Category 1'), new OfferPresentable(2, 'Owner 2', 'Product Category 2')];
        const mockedGetAllOffers = jest.fn().mockResolvedValueOnce(mockedOffers);
        (EthOfferService as jest.Mock).mockImplementation(() => ({
            getAllOffers: mockedGetAllOffers
        }));
        render(<Offers/>);

        await waitFor(() => {
            expect(EthOfferService).toHaveBeenCalledTimes(1);
            expect(BlockchainOfferStrategy).toHaveBeenCalledTimes(1);
            expect(mockedGetAllOffers).toHaveBeenCalledTimes(1);
            expect(screen.getByText('Owner 1')).toBeInTheDocument();
            expect(screen.getByText('Product Category 1')).toBeInTheDocument();
            expect(screen.getByText('Owner 2')).toBeInTheDocument();
            expect(screen.getByText('Product Category 2')).toBeInTheDocument();
        });
    });

    it('should call onChange function when clicking on a table header', async () => {
        render(<Offers/>);

        await waitFor(() => {
            userEvent.click(screen.getByText('Id'));
            expect(console.log).toHaveBeenCalledTimes(1);
        });
    });

    it('should call navigator functions when clicking on \'New\' buttons', async () => {
        render(<Offers/>);

        await waitFor(() => {
            userEvent.click(screen.getByRole('button', {name: 'plus New Offer Supplier'}));
            expect(navigate).toHaveBeenCalledTimes(1);
            expect(navigate).toHaveBeenCalledWith(paths.OFFERS_SUPPLIER_NEW);
        });

        await waitFor(() => {
            userEvent.click(screen.getByRole('button', {name: 'plus New Offer'}));
            expect(navigate).toHaveBeenCalledTimes(2);
            expect(navigate).toHaveBeenCalledWith(paths.OFFERS_NEW);
        });
    });

    it('should call sorter function correctly when clicking on a table header', async () => {
        const mockedOffers: OfferPresentable[] = [new OfferPresentable(1, 'Owner 2', 'Product Category 1'), new OfferPresentable(2, 'Owner 1', 'Product Category 2')];
        const mockedGetAllOffers = jest.fn().mockResolvedValueOnce(mockedOffers);
        (EthOfferService as jest.Mock).mockImplementation(() => ({
            getAllOffers: mockedGetAllOffers
        }));
        render(<Offers/>);

        await waitFor(() => {
            const tableRows = screen.getAllByRole('row');
            expect(tableRows).toHaveLength(3);
            expect(tableRows[1]).toHaveTextContent('1Owner 2Product Category 1');
            expect(tableRows[2]).toHaveTextContent('2Owner 1Product Category 2');
        });

        userEvent.click(screen.getByText('Id'));

        await waitFor(() => {
            const tableRows = screen.getAllByRole('row');
            expect(tableRows).toHaveLength(3);
            expect(tableRows[1]).toHaveTextContent('2Owner 1Product Category 2');
            expect(tableRows[2]).toHaveTextContent('1Owner 2Product Category 1');
        });
    });

    it('should sort also when working with falsy names', async () => {
        const mockedOffers: OfferPresentable[] = [new OfferPresentable(0, undefined, undefined), new OfferPresentable(1, 'Owner 1', 'Product Category 1'), new OfferPresentable(2, undefined, 'Product Category 2')];
        const mockedGetAllOffers = jest.fn().mockResolvedValueOnce(mockedOffers);
        (EthOfferService as jest.Mock).mockImplementation(() => ({
            getAllOffers: mockedGetAllOffers
        }));
        render(<Offers/>);

        userEvent.click(screen.getByText('Company'));

        await waitFor(() => {
            const tableRows = screen.getAllByRole('row');
            expect(tableRows).toHaveLength(4);
            expect(tableRows[1]).toHaveTextContent('1Owner 1Product Category 1');
            expect(tableRows[2]).toHaveTextContent('0');
            expect(tableRows[3]).toHaveTextContent('2Product Category 2');
        });
    });

    it('should sort also when working with falsy product categories', async () => {
        const mockedOffers: OfferPresentable[] = [new OfferPresentable(0, undefined, undefined), new OfferPresentable(1, 'Owner 1', 'Product Category 1'), new OfferPresentable(2, 'Owner 2', undefined)];
        const mockedGetAllOffers = jest.fn().mockResolvedValueOnce(mockedOffers);
        (EthOfferService as jest.Mock).mockImplementation(() => ({
            getAllOffers: mockedGetAllOffers
        }));
        render(<Offers/>);

        userEvent.click(screen.getByText('Product category'));

        await waitFor(() => {
            const tableRows = screen.getAllByRole('row');
            expect(tableRows).toHaveLength(4);
            expect(tableRows[1]).toHaveTextContent('0');
            expect(tableRows[2]).toHaveTextContent('2Owner 2');
            expect(tableRows[3]).toHaveTextContent('1Owner 1Product Category 1');
        });
    });

    it('should filter offers', async () => {
        const mockedOffers: OfferPresentable[] = [new OfferPresentable(1, 'Owner 1', 'Product Category 1'), new OfferPresentable(2, 'Owner 2', 'Product Category 2')];
        const mockedGetAllOffers = jest.fn().mockResolvedValueOnce(mockedOffers);
        (EthOfferService as jest.Mock).mockImplementation(() => ({
            getAllOffers: mockedGetAllOffers
        }));
        render(<Offers/>);

        await waitFor(() => {
            const tableRows = screen.getAllByRole('row');
            expect(tableRows).toHaveLength(3);
        });

        userEvent.type(screen.getByPlaceholderText('Search by product category'), 'Product Category 1');
        userEvent.click(screen.getByLabelText('search'));

        await waitFor(() => {
            const tableRows = screen.getAllByRole('row');
            expect(console.log).toHaveBeenCalledWith('Called')
            expect(tableRows).toHaveLength(2);
            expect(tableRows[1]).toHaveTextContent('1Owner 1Product Category 1');
        });
    });
});
