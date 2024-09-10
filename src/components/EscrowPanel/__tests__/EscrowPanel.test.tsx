import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useEthEscrow } from '@/providers/entities/EthEscrowProvider';
import { WithdrawModal } from '@/components/EscrowPanel/WithdrawModal';
import { DepositModal } from '@/components/EscrowPanel/DepositModal';
import { EscrowPanel } from '@/components/EscrowPanel/EscrowPanel';
import React from 'react';
import { useEthShipment } from '@/providers/entities/EthShipmentProvider';
import { useSelector } from 'react-redux';
import { credentials } from '@/constants/ssi';
import { FundsStatus } from '@kbc-lib/coffee-trading-management-lib';

jest.mock('react-redux');
jest.mock('@/providers/entities/EthShipmentProvider');
jest.mock('@/providers/entities/EthEscrowProvider');
jest.mock('@/components/EscrowPanel/DepositModal');
jest.mock('@/components/EscrowPanel/WithdrawModal');

describe('EscrowPanel', () => {
    const escrowDetails = {
        depositedAmount: 100,
        totalDepositedAmount: 200
    };
    const tokenDetails = {
        symbol: 'SYM',
        balance: 100
    };
    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.clearAllMocks();

        (useEthEscrow as jest.Mock).mockReturnValue({
            escrowDetails,
            tokenDetails
        });
        (useSelector as jest.Mock).mockReturnValue({
            companyClaims: { role: credentials.ROLE_IMPORTER }
        });
    });
    it('should render default message if detailedShipment is not available', () => {
        (useEthShipment as jest.Mock).mockReturnValue({ detailedShipment: null });

        const { getByText } = render(<EscrowPanel />);

        expect(getByText('Shipment not created')).toBeInTheDocument();
    });

    it('should render correctly', async () => {
        (useEthShipment as jest.Mock).mockReturnValue({
            detailedShipment: { shipment: { fundsStatus: FundsStatus.NOT_LOCKED } }
        });
        render(<EscrowPanel />);

        expect(screen.getByText('KBC Escrow')).toBeInTheDocument();
        expect(WithdrawModal).toHaveBeenCalled();
        expect(DepositModal).toHaveBeenCalled();
        expect(WithdrawModal).toHaveBeenCalledWith(
            {
                isOpen: false,
                onClose: expect.any(Function)
            },
            {}
        );
        expect(DepositModal).toHaveBeenCalledWith(
            {
                isOpen: false,
                onClose: expect.any(Function)
            },
            {}
        );
    });

    it('should open and close deposit modal', async () => {
        (useEthShipment as jest.Mock).mockReturnValue({
            detailedShipment: { shipment: { fundsStatus: FundsStatus.NOT_LOCKED } }
        });
        render(<EscrowPanel />);

        act(() => {
            userEvent.click(screen.getByText('Deposit'));
        });

        expect(DepositModal).toHaveBeenCalledWith(
            {
                isOpen: true,
                onClose: expect.any(Function)
            },
            {}
        );

        (DepositModal as jest.Mock).mock.calls[0][0].onClose();
        expect(DepositModal).toHaveBeenCalledWith(
            {
                isOpen: false,
                onClose: expect.any(Function)
            },
            {}
        );
    });
    it('should open and close withdraw modal', async () => {
        (useEthShipment as jest.Mock).mockReturnValue({
            detailedShipment: { shipment: { fundsStatus: FundsStatus.NOT_LOCKED } }
        });
        render(<EscrowPanel />);

        act(() => {
            userEvent.click(screen.getByText('Withdraw'));
        });

        expect(WithdrawModal).toHaveBeenCalledWith(
            {
                isOpen: true,
                onClose: expect.any(Function)
            },
            {}
        );

        (WithdrawModal as jest.Mock).mock.calls[0][0].onClose();
        expect(WithdrawModal).toHaveBeenCalledWith(
            {
                isOpen: false,
                onClose: expect.any(Function)
            },
            {}
        );
    });
});
