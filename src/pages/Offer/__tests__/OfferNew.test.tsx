import { useNavigate } from 'react-router-dom';
import OfferNew from '../OfferNew';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { paths } from '@/constants/paths';
import { credentials } from '@/constants/ssi';
import { useSelector } from 'react-redux';
import { useSigner } from '@/providers/auth/SignerProvider';
import { GenericForm } from '@/components/GenericForm/GenericForm';
import { Material, ProductCategory } from '@kbc-lib/coffee-trading-management-lib';
import { UserInfoState } from '@/redux/reducers/userInfoSlice';
import { JsonRpcSigner } from '@ethersproject/providers';
import { useOffer } from '@/providers/entities/icp/OfferProvider';
import { useSession } from '@/providers/auth/SessionProvider';
import { useMaterial } from '@/providers/entities/icp/MaterialProvider';

jest.mock('react-router-dom');
jest.mock('@/providers/auth/SignerProvider');
jest.mock('@/providers/auth/SessionProvider');
jest.mock('@/components/GenericForm/GenericForm');
jest.mock('@/providers/entities/icp/MaterialProvider');
jest.mock('@/providers/entities/icp/OfferProvider');
jest.mock('react-redux');

describe('Offers New', () => {
    const signer = { _address: '0x123' } as JsonRpcSigner;
    const userInfo = {
        companyClaims: {
            role: credentials.ROLE_EXPORTER
        }
    } as UserInfoState;
    const mockGetLoggedOrganization = jest.fn();
    const saveOffer = jest.fn();
    const navigate = jest.fn();

    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.clearAllMocks();

        (useNavigate as jest.Mock).mockReturnValue(navigate);
        mockGetLoggedOrganization.mockReturnValue({ legalName: 'Supplier Name' });
        (useSession as jest.Mock).mockReturnValue({
            getLoggedOrganization: mockGetLoggedOrganization
        });
        (useMaterial as jest.Mock).mockReturnValue({
            materials: [
                new Material(1, 'owner1', 'Material1', new ProductCategory(1, 'Product Category 1'), 'typology', '85', '20%', false),
                new Material(2, 'owner2', 'Material2', new ProductCategory(2, 'Product Category 2'), 'typology2', '90', '15%', true)
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
        expect((GenericForm as jest.Mock).mock.calls[0][0].elements).toHaveLength(4);
    });

    it('should call onSubmit function when clicking on submit button', async () => {
        render(<OfferNew />);

        const values = {
            'material-id': 1
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
