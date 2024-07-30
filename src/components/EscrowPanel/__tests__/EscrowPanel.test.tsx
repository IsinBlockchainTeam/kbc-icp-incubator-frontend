import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EscrowStatus } from '@kbc-lib/coffee-trading-management-lib';
import { useEthEscrow } from '@/providers/entities/EthEscrowProvider';
import { WithdrawModal } from '@/components/EscrowPanel/WithdrawModal';
import { DepositModal } from '@/components/EscrowPanel/DepositModal';
import { EscrowPanel } from '@/components/EscrowPanel/EscrowPanel';
import React from 'react';

jest.mock('@/providers/entities/EthEscrowProvider');
jest.mock('@/components/EscrowPanel/DepositModal');
jest.mock('@/components/EscrowPanel/WithdrawModal');

describe('EscrowPanel', () => {
    const escrowDetails = {
        state: EscrowStatus.ACTIVE,
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
    });

    it('should render correctly', async () => {
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

    it.each([
        [
            EscrowStatus.ACTIVE,
            'Funds have been securely deposited and are held in the escrow account. The funds will remain locked in ' +
                'the escrow until all terms are met and verified.'
        ],
        [
            EscrowStatus.REFUNDING,
            'The conditions of the agreement were not met, and the process of returning the funds to the original ' +
                'sender has been initiated.'
        ],
        [
            EscrowStatus.WITHDRAWING,
            'The agreed-upon conditions have been met, and the process of releasing the funds to the ' +
                'recipient has begun.'
        ]
    ])('should render the correct description - %s', async (escrowStatus, text) => {
        (useEthEscrow as jest.Mock).mockReturnValue({
            escrowDetails: {
                ...escrowDetails,
                state: escrowStatus
            },
            tokenDetails
        });
        render(<EscrowPanel />);

        expect(screen.getByRole('escrow-card')).toHaveTextContent(text);
    });

    it('should open and close deposit modal', async () => {
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
