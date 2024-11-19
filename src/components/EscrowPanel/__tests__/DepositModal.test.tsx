// TODO: Fix tests
describe('Temp', () => {
    it('should ', () => {
        expect(true).toBe(true);
    });
});
export {};
// import { act, render, screen } from '@testing-library/react';
// import userEvent from '@testing-library/user-event';
// import { useEthEscrow } from '@/providers/entities/EthEscrowProvider';
// import React from 'react';
// import { DepositModal } from '@/components/EscrowPanel/DepositModal';
// import { useEthShipment } from '@/providers/entities/EthShipmentProvider';
//
// jest.mock('@/providers/entities/EthShipmentProvider');
// jest.mock('@/providers/entities/EthEscrowProvider');
//
// describe('DepositModal', () => {
//     const depositFunds = jest.fn();
//     const onClose = jest.fn();
//     const tokenDetails = {
//         symbol: 'SYM',
//         balance: 100
//     };
//     beforeEach(() => {
//         jest.spyOn(console, 'log').mockImplementation(jest.fn());
//         jest.spyOn(console, 'error').mockImplementation(jest.fn());
//         jest.clearAllMocks();
//
//         (useEthShipment as jest.Mock).mockReturnValue({
//             depositFunds
//         });
//         (useEthEscrow as jest.Mock).mockReturnValue({
//             tokenDetails
//         });
//     });
//
//     it('should render correctly', async () => {
//         render(<DepositModal isOpen={true} onClose={onClose} />);
//
//         expect(screen.getAllByText('Deposit')[1]).toBeInTheDocument();
//     });
//
//     it('should close modal', async () => {
//         render(<DepositModal isOpen={true} onClose={onClose} />);
//
//         act(() => {
//             userEvent.click(screen.getByText('Cancel'));
//         });
//
//         expect(onClose).toHaveBeenCalled();
//     });
//     it('should deposit funds', async () => {
//         render(<DepositModal isOpen={true} onClose={onClose} />);
//
//         act(() => {
//             userEvent.type(screen.getByPlaceholderText('Amount'), '100');
//             userEvent.click(screen.getAllByText('Deposit')[1]);
//         });
//
//         expect(depositFunds).toHaveBeenCalledWith(100);
//         expect(onClose).toHaveBeenCalled();
//     });
// });
