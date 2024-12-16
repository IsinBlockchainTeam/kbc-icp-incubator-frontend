import { act, render, screen } from '@testing-library/react';
import Offers from '../Offers';
import userEvent from '@testing-library/user-event';
import { paths } from '@/constants/paths';
import { Offer, ProductCategory } from '@kbc-lib/coffee-trading-management-lib';
import { useSelector } from 'react-redux';
import { credentials } from '@/constants/ssi';
import { useNavigate } from 'react-router-dom';
import { useOffer } from '@/providers/entities/icp/OfferProvider';
import { useOrganization } from '@/providers/entities/icp/OrganizationProvider';
import { UserInfoState } from '@/redux/reducers/userInfoSlice';

jest.mock('react-router-dom');
jest.mock('@/utils/notification');
jest.mock('@/providers/entities/icp/OfferProvider');
jest.mock('@/providers/entities/icp/OrganizationProvider');
jest.mock('react-redux');

describe('Offers', () => {
    const userInfo = {
        companyClaims: {
            role: credentials.ROLE_EXPORTER
        }
    } as UserInfoState;
    const getOrganization = jest.fn();
    const navigate = jest.fn();

    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.clearAllMocks();

        getOrganization.mockReturnValue({ legalName: 'Supplier Name' });
        (useOrganization as jest.Mock).mockReturnValue({
            getOrganization
        });
        (useOffer as jest.Mock).mockReturnValue({
            offers: [
                new Offer(1, 'Owner 1', new ProductCategory(1, 'Product Category 1', 1, '')),
                new Offer(2, 'Owner 2', new ProductCategory(2, 'Product Category 2', 2, ''))
            ]
        });
        (useSelector as jest.Mock).mockReturnValue(userInfo);
        (useNavigate as jest.Mock).mockReturnValue(navigate);
    });

    it('should render correctly', async () => {
        render(<Offers />);

        expect(screen.getByText('Product Category 1')).toBeInTheDocument();
        expect(screen.getByText('Product Category 2')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'plus New Offer' })).toBeInTheDocument();
    });

    it("should call navigator functions when clicking on 'New' buttons", async () => {
        render(<Offers />);

        act(() => {
            userEvent.click(screen.getByRole('button', { name: 'plus New Offer' }));
        });
        expect(navigate).toHaveBeenCalledTimes(1);
        expect(navigate).toHaveBeenCalledWith(paths.OFFERS_NEW);
    });

    it("should call navigator functions when clicking on 'Start a negotiation' buttons", async () => {
        (useSelector as jest.Mock).mockReturnValue({
            companyClaims: {
                role: credentials.ROLE_IMPORTER
            }
        });

        render(<Offers />);

        act(() => {
            userEvent.click(screen.getAllByRole('start-negotiation')[0]);
        });
        expect(navigate).toHaveBeenCalledTimes(1);
        expect(navigate).toHaveBeenCalledWith(paths.TRADE_NEW, {
            state: { productCategoryId: 1, supplierAddress: 'Owner 1' }
        });
    });

    it('should call sorter function correctly when clicking on a table header', async () => {
        render(<Offers />);

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
        render(<Offers />);

        let tableRows = screen.getAllByRole('row');
        expect(tableRows).toHaveLength(3);

        userEvent.type(screen.getByPlaceholderText('Search by product category'), 'Product Category 1');
        act(() => {
            userEvent.click(screen.getByLabelText('search'));
        });

        tableRows = screen.getAllByRole('row');
        expect(tableRows).toHaveLength(2);
        expect(tableRows[1]).toHaveTextContent('1Supplier NameProduct Category 1');
    });
});
