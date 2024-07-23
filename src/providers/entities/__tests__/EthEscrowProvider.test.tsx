import { renderHook, act } from '@testing-library/react';
import { useDispatch } from 'react-redux';
import { useSigner } from '@/providers/SignerProvider';
import { Wallet } from 'ethers';
import { openNotification } from '@/utils/notification';
import { EthEscrowProvider, useEthEscrow } from '@/providers/entities/EthEscrowProvider';
import { EscrowService, EscrowStatus, TokenService } from '@kbc-lib/coffee-trading-management-lib';
import { contractAddresses } from '@/constants/evm';

jest.mock('@kbc-lib/coffee-trading-management-lib');
jest.mock('@blockchain-lib/common');
jest.mock('@/providers/SignerProvider');
jest.mock('react-redux');
jest.mock('@/utils/notification');
jest.mock('@/constants/evm');

describe('EthEscrowProvider', () => {
    const signer = { address: '0x123' } as Wallet;
    const dispatch = jest.fn();
    const getState = jest.fn();
    const getDepositedAmount = jest.fn();
    const getTotalDepositedAmount = jest.fn();
    const getWithdrawableAmount = jest.fn();
    const getBaseFee = jest.fn();
    const getPercentageFee = jest.fn();
    const deposit = jest.fn();
    const payerWithdraw = jest.fn();
    const getFees = jest.fn();
    const balanceOf = jest.fn();
    const getSymbol = jest.fn();
    const approve = jest.fn();
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(jest.fn());

        (EscrowService as jest.Mock).mockImplementation(() => ({
            getState,
            getDepositedAmount,
            getTotalDepositedAmount,
            getWithdrawableAmount,
            getBaseFee,
            getPercentageFee,
            deposit,
            payerWithdraw,
            getFees
        }));
        (TokenService as jest.Mock).mockImplementation(() => ({
            balanceOf,
            getSymbol,
            approve
        }));
        (contractAddresses.ESCROW as jest.Mock).mockReturnValue('0x123');
        (contractAddresses.TOKEN as jest.Mock).mockReturnValue('0x456');
        (useDispatch as jest.Mock).mockReturnValue(dispatch);
        (useSigner as jest.Mock).mockReturnValue({ signer });
    });

    it('should throw error if hook is used outside the provider', async () => {
        expect(() => renderHook(() => useEthEscrow())).toThrow();
    });

    it('should load escrow details', async () => {
        getState.mockResolvedValue(EscrowStatus.ACTIVE);
        getDepositedAmount.mockResolvedValue(100);
        getTotalDepositedAmount.mockResolvedValue(200);
        getWithdrawableAmount.mockResolvedValue(50);
        getBaseFee.mockResolvedValue(10);
        getPercentageFee.mockResolvedValue(5);
        balanceOf.mockResolvedValue(100);
        getSymbol.mockResolvedValue('ETH');
        const { result } = renderHook(() => useEthEscrow(), {
            wrapper: EthEscrowProvider
        });
        await act(async () => {
            await result.current.loadData();
        });

        expect(dispatch).toHaveBeenCalledTimes(4);
        expect(getState).toHaveBeenCalledTimes(1);
        expect(getDepositedAmount).toHaveBeenCalledTimes(1);
        expect(getTotalDepositedAmount).toHaveBeenCalledTimes(1);
        expect(getWithdrawableAmount).toHaveBeenCalledTimes(1);
        expect(getBaseFee).toHaveBeenCalledTimes(1);
        expect(getPercentageFee).toHaveBeenCalledTimes(1);
        expect(balanceOf).toHaveBeenCalledTimes(1);
        expect(getSymbol).toHaveBeenCalledTimes(1);
        expect(result.current.dataLoaded).toBe(true);
        expect(result.current.escrowDetails.state).toEqual(EscrowStatus.ACTIVE);
        expect(result.current.escrowDetails.depositedAmount).toEqual(100);
        expect(result.current.escrowDetails.totalDepositedAmount).toEqual(200);
        expect(result.current.escrowDetails.withdrawableAmount).toEqual(50);
        expect(result.current.escrowDetails.baseFee).toEqual(10);
        expect(result.current.escrowDetails.percentageFee).toEqual(5);
        expect(result.current.tokenDetails.balance).toEqual(100);
        expect(result.current.tokenDetails.symbol).toEqual('ETH');
    });

    it('should handle load failure - escrow', async () => {
        getState.mockRejectedValue(new Error('Test error'));
        const { result } = renderHook(() => useEthEscrow(), {
            wrapper: EthEscrowProvider
        });
        await act(async () => {
            await result.current.loadData();
        });

        expect(dispatch).toHaveBeenCalledTimes(4);
        expect(getState).toHaveBeenCalledTimes(1);
        expect(openNotification).toHaveBeenCalledTimes(1);
        expect(result.current.dataLoaded).toBe(true);
        expect(result.current.escrowDetails.state).toEqual(EscrowStatus.ACTIVE);
        expect(result.current.escrowDetails.depositedAmount).toEqual(0);
    });

    it('should handle load failure - token', async () => {
        balanceOf.mockRejectedValue(new Error('Test error'));
        const { result } = renderHook(() => useEthEscrow(), {
            wrapper: EthEscrowProvider
        });
        await act(async () => {
            await result.current.loadData();
        });

        expect(dispatch).toHaveBeenCalledTimes(4);
        expect(balanceOf).toHaveBeenCalledTimes(1);
        expect(openNotification).toHaveBeenCalledTimes(1);
        expect(result.current.dataLoaded).toBe(true);
        expect(result.current.tokenDetails.balance).toEqual(0);
    });

    it('should deposit funds', async () => {
        const { result } = renderHook(() => useEthEscrow(), {
            wrapper: EthEscrowProvider
        });
        await act(async () => {
            await result.current.deposit(10);
        });

        expect(dispatch).toHaveBeenCalledTimes(6);
        expect(approve).toHaveBeenCalledTimes(1);
        expect(approve).toHaveBeenCalledWith('0x123', 10);
        expect(deposit).toHaveBeenCalledTimes(1);
        expect(deposit).toHaveBeenCalledWith(10);
        expect(getState).toHaveBeenCalled();
        expect(openNotification).toHaveBeenCalledTimes(1);
    });
    it('should handle deposit funds failure', async () => {
        approve.mockRejectedValue(new Error('Test error'));
        const { result } = renderHook(() => useEthEscrow(), {
            wrapper: EthEscrowProvider
        });
        await act(async () => {
            await result.current.deposit(10);
        });

        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(approve).toHaveBeenCalled();
        expect(openNotification).toHaveBeenCalledTimes(1);
        expect(getState).not.toHaveBeenCalled();
    });

    it('should withdraw funds', async () => {
        const { result } = renderHook(() => useEthEscrow(), {
            wrapper: EthEscrowProvider
        });
        await act(async () => {
            await result.current.payerWithdraw(10);
        });

        expect(dispatch).toHaveBeenCalledTimes(6);
        expect(payerWithdraw).toHaveBeenCalledTimes(1);
        expect(payerWithdraw).toHaveBeenCalledWith(10);
        expect(getState).toHaveBeenCalled();
        expect(openNotification).toHaveBeenCalledTimes(1);
    });
    it('should handle withdraw funds failure', async () => {
        payerWithdraw.mockRejectedValue(new Error('Test error'));
        const { result } = renderHook(() => useEthEscrow(), {
            wrapper: EthEscrowProvider
        });
        await act(async () => {
            await result.current.payerWithdraw(10);
        });

        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(payerWithdraw).toHaveBeenCalled();
        expect(openNotification).toHaveBeenCalledTimes(1);
        expect(getState).not.toHaveBeenCalled();
    });
    it('should retrieve fees', async () => {
        const { result } = renderHook(() => useEthEscrow(), {
            wrapper: EthEscrowProvider
        });
        await act(async () => {
            await result.current.getFees(10);
        });

        expect(getFees).toHaveBeenCalledTimes(1);
        expect(getFees).toHaveBeenCalledWith(10);
    });
    it('should handle fees retrieval failure', async () => {
        getFees.mockRejectedValue(new Error('Test error'));
        const { result } = renderHook(() => useEthEscrow(), {
            wrapper: EthEscrowProvider
        });
        await act(async () => {
            await result.current.getFees(10);
        });

        expect(getFees).toHaveBeenCalled();
        expect(openNotification).toHaveBeenCalledTimes(1);
    });
});
