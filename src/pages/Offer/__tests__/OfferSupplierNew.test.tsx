import { useNavigate } from 'react-router-dom';
import OfferSupplierNew from '../OfferSupplierNew';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { paths } from '@/constants/paths';
import { useSigner } from '@/providers/SignerProvider';
import { credentials } from '@/constants/ssi';
import { useSelector } from 'react-redux';
import { GenericForm } from '@/components/GenericForm/GenericForm';
import { useEthOffer } from '@/providers/entities/EthOfferProvider';
import { Wallet } from 'ethers';
import { UserInfoState } from '@/redux/reducers/userInfoSlice';

jest.mock('react-router-dom');
jest.mock('@/providers/SignerProvider');
jest.mock('@/components/GenericForm/GenericForm');
jest.mock('@/providers/entities/EthOfferProvider');
jest.mock('react-redux');

describe('Offers Supplier New', () => {
    const signer = { _address: '0x123' } as JsonRpcSigner;
    const userInfo = {
        legalName: 'Legal Name',
        role: credentials.ROLE_EXPORTER
    } as UserInfoState;
    const saveSupplier = jest.fn();
    const navigate = jest.fn();

    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.clearAllMocks();

        (useNavigate as jest.Mock).mockReturnValue(navigate);
        (useEthOffer as jest.Mock).mockReturnValue({
            saveSupplier
        });
        (useSigner as jest.Mock).mockReturnValue({ signer });
        (useSelector as jest.Mock).mockReturnValue(userInfo);
    });

    it('should render correctly', async () => {
        render(<OfferSupplierNew />);
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
        const userInfo = {
            legalName: 'Legal Name',
            role: credentials.ROLE_IMPORTER
        } as UserInfoState;
        (useSelector as jest.Mock).mockReturnValue(userInfo);
        render(<OfferSupplierNew />);
        expect(GenericForm).not.toHaveBeenCalled();
    });

    it('should call onSubmit function when clicking on submit button', async () => {
        render(<OfferSupplierNew />);

        const values = {};
        await (GenericForm as jest.Mock).mock.calls[0][0].onSubmit(values);

        expect(saveSupplier).toHaveBeenCalledTimes(1);
        expect(saveSupplier).toHaveBeenCalledWith('0x123', 'Legal Name');
        expect(navigate).toHaveBeenCalledTimes(1);
        expect(navigate).toHaveBeenCalledWith(paths.OFFERS);
    });

    it("should navigate to 'Offers' when clicking on 'Delete Offer Supplier' button", async () => {
        render(<OfferSupplierNew />);

        act(() =>
            userEvent.click(screen.getByRole('button', { name: 'delete Delete Offer Supplier' }))
        );

        expect(navigate).toHaveBeenCalledTimes(1);
        expect(navigate).toHaveBeenCalledWith(paths.OFFERS);
    });
});
