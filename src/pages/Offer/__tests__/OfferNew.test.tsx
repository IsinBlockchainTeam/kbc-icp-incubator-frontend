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
import { useEthMaterial } from '@/providers/entities/EthMaterialProvider';
import { useICPName } from '@/providers/entities/ICPNameProvider';
import { useEthOffer } from '@/providers/entities/EthOfferProvider';
import { UserInfoState } from '@/redux/reducers/userInfoSlice';
import { JsonRpcSigner } from '@ethersproject/providers';

jest.mock('react-router-dom');
jest.mock('@/providers/SignerProvider');
jest.mock('@/components/GenericForm/GenericForm');
jest.mock('@/providers/entities/EthMaterialProvider');
jest.mock('@/providers/entities/EthOfferProvider');
jest.mock('@/providers/entities/ICPNameProvider');
jest.mock('react-redux');

describe('Offers New', () => {
    const signer = { _address: '0x123' } as JsonRpcSigner;
    const userInfo = {
        companyClaims: {
            role: credentials.ROLE_EXPORTER
        }
    } as UserInfoState;
    const getName = jest.fn();
    const saveOffer = jest.fn();
    const navigate = jest.fn();

    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.clearAllMocks();

        (useNavigate as jest.Mock).mockReturnValue(navigate);
        getName.mockReturnValue('Supplier Name');
        (useICPName as jest.Mock).mockReturnValue({
            getName
        });
        (useEthMaterial as jest.Mock).mockReturnValue({
            productCategories: [
                new ProductCategory(1, 'Product Category 1', 1, ''),
                new ProductCategory(2, 'Product Category 2', 2, '')
            ]
        });
        (useEthOffer as jest.Mock).mockReturnValue({
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
        expect(saveOffer).toHaveBeenCalledWith('0x123', 1);
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
