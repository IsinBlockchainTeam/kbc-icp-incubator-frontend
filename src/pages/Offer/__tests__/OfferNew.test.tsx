import { useNavigate } from 'react-router-dom';
import OfferNew from '../OfferNew';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { paths } from '@/constants/paths';
import { credentials } from '@/constants/ssi';
import { useSelector } from 'react-redux';
import { useSigner } from '@/providers/SignerProvider';
import { GenericForm } from '@/components/GenericForm/GenericForm';
import { ProductCategory } from '@kbc-lib/coffee-trading-management-lib';
import { UserInfoState } from '@/redux/reducers/userInfoSlice';
import { JsonRpcSigner } from '@ethersproject/providers';
import { useOrganization } from '@/providers/icp/OrganizationProvider';
import { useProductCategory } from '@/providers/icp/ProductCategoryProvider';
import { useOffer } from '@/providers/icp/OfferProvider';

jest.mock('react-router-dom');
jest.mock('@/providers/SignerProvider');
jest.mock('@/components/GenericForm/GenericForm');
jest.mock('@/providers/icp/ProductCategoryProvider');
jest.mock('@/providers/icp/OfferProvider');
jest.mock('@/providers/icp/OrganizationProvider');
jest.mock('react-redux');

describe('Offers New', () => {
    const signer = { _address: '0x123' } as JsonRpcSigner;
    const userInfo = {
        companyClaims: {
            role: credentials.ROLE_EXPORTER
        }
    } as UserInfoState;
    const getOrganization = jest.fn();
    const saveOffer = jest.fn();
    const navigate = jest.fn();

    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.clearAllMocks();

        (useNavigate as jest.Mock).mockReturnValue(navigate);
        getOrganization.mockReturnValue({ legalName: 'Supplier Name' });
        (useOrganization as jest.Mock).mockReturnValue({
            getOrganization
        });
        (useProductCategory as jest.Mock).mockReturnValue({
            productCategories: [
                new ProductCategory(1, 'Product Category 1', 1, ''),
                new ProductCategory(2, 'Product Category 2', 2, '')
            ]
        });
        (useOffer as jest.Mock).mockReturnValue({
            saveOffer
        });
        (useSigner as jest.Mock).mockReturnValue({ signer });
        (useSelector as jest.Mock).mockReturnValue(userInfo);
    });

    it('should render correctly', async () => {
        render(<OfferNew />);
        expect(GenericForm).toHaveBeenCalledTimes(1);

        expect(screen.getByText('New Offer')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'delete Delete Offer' })).toBeInTheDocument();
        expect(GenericForm).toHaveBeenCalled();
        expect(GenericForm).toHaveBeenCalledWith(
            {
                elements: expect.any(Array),
                confirmText: 'Are you sure you want to create this offer?',
                submittable: true,
                onSubmit: expect.any(Function)
            },
            {}
        );
        expect((GenericForm as jest.Mock).mock.calls[0][0].elements).toHaveLength(3);
    });

    it('should call onSubmit function when clicking on submit button', async () => {
        render(<OfferNew />);

        const values = {
            'product-category-id': 1
        };
        await (GenericForm as jest.Mock).mock.calls[0][0].onSubmit(values);

        expect(saveOffer).toHaveBeenCalledTimes(1);
        expect(saveOffer).toHaveBeenCalledWith(1);
        expect(navigate).toHaveBeenCalledTimes(1);
        expect(navigate).toHaveBeenCalledWith(paths.OFFERS);
    });

    it("should navigate to 'Offers' when clicking on 'Delete Offer' button", async () => {
        render(<OfferNew />);

        act(() => userEvent.click(screen.getByRole('button', { name: 'delete Delete Offer' })));

        expect(navigate).toHaveBeenCalledTimes(1);
        expect(navigate).toHaveBeenCalledWith(paths.OFFERS);
    });
    it("should navigate to 'Home' if user is an importer", async () => {
        const userInfo = {
            companyClaims: {
                role: credentials.ROLE_IMPORTER
            }
        };
        (useSelector as jest.Mock).mockReturnValue(userInfo);

        render(<OfferNew />);
        expect(GenericForm).not.toHaveBeenCalled();
    });
});
