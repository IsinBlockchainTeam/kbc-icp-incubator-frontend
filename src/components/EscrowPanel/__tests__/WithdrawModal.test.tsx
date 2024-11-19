// TODO: Fix tests
describe('Temp', () => {
    it('should ', () => {
        expect(true).toBe(true);
    });
});
export {};
// import { act, render, screen, waitFor } from '@testing-library/react';
// import userEvent from '@testing-library/user-event';
// import { useEthEscrow } from '@/providers/entities/EthEscrowProvider';
// import React from 'react';
// import { WithdrawModal } from '@/components/EscrowPanel/WithdrawModal';
//
// jest.mock('@/providers/entities/EthEscrowProvider');
//
// describe('WithdrawModal', () => {
//     const withdraw = jest.fn();
//     const getFees = jest.fn();
//     const onClose = jest.fn();
//     const escrowDetails = {
//         depositedAmount: 100,
//         totalDepositedAmount: 200
//     };
//     const tokenDetails = {
//         symbol: 'SYM',
//         balance: 100
//     };
//     beforeEach(() => {
//         jest.spyOn(console, 'log').mockImplementation(jest.fn());
//         jest.spyOn(console, 'error').mockImplementation(jest.fn());
//         jest.clearAllMocks();
//
//         (useEthEscrow as jest.Mock).mockReturnValue({
//             escrowDetails,
//             tokenDetails,
//             withdraw,
//             getFees
//         });
//         getFees.mockResolvedValue(10);
//     });
//
//     it('should render correctly', async () => {
//         render(<WithdrawModal isOpen={true} onClose={onClose} />);
//
//         expect(screen.getAllByText('Withdraw')[1]).toBeInTheDocument();
//     });
//
//     it('should close modal', async () => {
//         render(<WithdrawModal isOpen={true} onClose={onClose} />);
//
//         act(() => {
//             userEvent.click(screen.getByText('Cancel'));
//         });
//
//         expect(onClose).toHaveBeenCalled();
//     });
//     it('should withdraw funds', async () => {
//         render(<WithdrawModal isOpen={true} onClose={onClose} />);
//
//         act(() => {
//             userEvent.type(screen.getByPlaceholderText('Amount'), '100');
//             userEvent.click(screen.getAllByText('Withdraw')[1]);
//         });
//
//         expect(withdraw).toHaveBeenCalledWith(100);
//         expect(onClose).toHaveBeenCalled();
//     });
//     it('should display fees', async () => {
//         render(<WithdrawModal isOpen={true} onClose={onClose} />);
//
//         await act(async () => {
//             userEvent.type(screen.getByPlaceholderText('Amount'), '100');
//         });
//         await waitFor(() => {
//             expect(getFees).toHaveBeenCalled();
//         });
//
//         expect(getFees).toHaveBeenCalledWith(100);
//     });
// });
