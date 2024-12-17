import { act, renderHook, waitFor } from '@testing-library/react';
import { useDispatch } from 'react-redux';
import { useSigner } from '@/providers/auth/SignerProvider';
import { openNotification } from '@/utils/notification';
import { EthDownPaymentProvider, useEthDownPayment } from '@/providers/entities/evm/EthDownPaymentProvider';
import { DownPaymentService, TokenService } from '@kbc-lib/coffee-trading-management-lib';
import { CONTRACT_ADDRESSES } from '@/constants/evm';
import { JsonRpcSigner } from '@ethersproject/providers';
import { useOrder } from '@/providers/entities/icp/OrderProvider';

jest.mock('@kbc-lib/coffee-trading-management-lib');
jest.mock('@/providers/auth/SignerProvider');
jest.mock('react-redux');
jest.mock('@/utils/notification');
jest.mock('@/constants/evm');
jest.mock('@/providers/entities/icp/OrderProvider');

describe('EthDownPaymentProvider', () => {
    const signer = { _address: '0x123' } as JsonRpcSigner;
    const dispatch = jest.fn();
    const getDepositedAmount = jest.fn();
    const getTotalDepositedAmount = jest.fn();
    const getLockedAmount = jest.fn();
    const getWithdrawableAmount = jest.fn();
    const getBalance = jest.fn();
    const getBaseFee = jest.fn();
    const getPercentageFee = jest.fn();
    const deposit = jest.fn();
    const withdraw = jest.fn();
    const getFees = jest.fn();
    const balanceOf = jest.fn();
    const getSymbol = jest.fn();
    const approve = jest.fn();
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(jest.fn());

        (DownPaymentService as jest.Mock).mockImplementation(() => ({
            getDepositedAmount,
            getTotalDepositedAmount,
            getLockedAmount,
            getWithdrawableAmount,
            getBalance,
            getBaseFee,
            getPercentageFee,
            deposit,
            withdraw,
            getFees
        }));
        (TokenService as jest.Mock).mockImplementation(() => ({
            balanceOf,
            getSymbol,
            approve
        }));
        (CONTRACT_ADDRESSES.TOKEN as jest.Mock).mockReturnValue('0x456');
        (useDispatch as jest.Mock).mockReturnValue(dispatch);
        (useSigner as jest.Mock).mockReturnValue({ signer });
        (useOrder as jest.Mock).mockReturnValue({
            order: { shipment: { downPaymentAddress: '0x123' } }
        });
    });

    it('should throw error if hook is used outside the provider', async () => {
        expect(() => renderHook(() => useEthDownPayment())).toThrow();
    });

    it('should load down payment details', async () => {
        getDepositedAmount.mockResolvedValue(100);
        getTotalDepositedAmount.mockResolvedValue(200);
        getLockedAmount.mockResolvedValue(10);
        getWithdrawableAmount.mockResolvedValue(50);
        getBaseFee.mockResolvedValue(10);
        getPercentageFee.mockResolvedValue(5);
        balanceOf.mockResolvedValue(100);
        getSymbol.mockResolvedValue('ETH');
        const { result } = renderHook(() => useEthDownPayment(), {
            wrapper: EthDownPaymentProvider
        });
        await waitFor(() => {
            expect(dispatch).toHaveBeenCalledTimes(4);
        });

        expect(dispatch).toHaveBeenCalledTimes(4);
        expect(getDepositedAmount).toHaveBeenCalledTimes(1);
        expect(getTotalDepositedAmount).toHaveBeenCalledTimes(1);
        expect(getLockedAmount).toHaveBeenCalledTimes(1);
        expect(getWithdrawableAmount).toHaveBeenCalledTimes(1);
        expect(getBalance).toHaveBeenCalledTimes(1);
        expect(getBaseFee).toHaveBeenCalledTimes(1);
        expect(getPercentageFee).toHaveBeenCalledTimes(1);
        expect(balanceOf).toHaveBeenCalledTimes(1);
        expect(getSymbol).toHaveBeenCalledTimes(1);
        expect(result.current.downPaymentDetails.depositedAmount).toEqual(100);
        expect(result.current.downPaymentDetails.totalDepositedAmount).toEqual(200);
        expect(result.current.downPaymentDetails.lockedAmount).toEqual(10);
        expect(result.current.downPaymentDetails.withdrawableAmount).toEqual(50);
        expect(result.current.downPaymentDetails.baseFee).toEqual(10);
        expect(result.current.downPaymentDetails.percentageFee).toEqual(5);
        expect(result.current.tokenDetails.balance).toEqual(100);
        expect(result.current.tokenDetails.symbol).toEqual('ETH');
    });

    it('should handle load failure - down payment', async () => {
        getDepositedAmount.mockRejectedValue(new Error('Test error'));
        const { result } = renderHook(() => useEthDownPayment(), {
            wrapper: EthDownPaymentProvider
        });
        await waitFor(() => {
            expect(dispatch).toHaveBeenCalledTimes(4);
        });
        expect(dispatch).toHaveBeenCalledTimes(4);
        expect(openNotification).toHaveBeenCalledTimes(1);
        expect(result.current.downPaymentDetails.depositedAmount).toEqual(0);
    });

    it('should handle load failure - token', async () => {
        balanceOf.mockRejectedValue(new Error('Test error'));
        const { result } = renderHook(() => useEthDownPayment(), {
            wrapper: EthDownPaymentProvider
        });
        await waitFor(() => {
            expect(dispatch).toHaveBeenCalledTimes(4);
        });
        expect(dispatch).toHaveBeenCalledTimes(4);
        expect(balanceOf).toHaveBeenCalledTimes(1);
        expect(openNotification).toHaveBeenCalledTimes(1);
        expect(result.current.tokenDetails.balance).toEqual(0);
    });

    it('should withdraw funds', async () => {
        const { result } = renderHook(() => useEthDownPayment(), {
            wrapper: EthDownPaymentProvider
        });
        await waitFor(() => {
            expect(dispatch).toHaveBeenCalledTimes(4);
        });
        jest.clearAllMocks();
        await act(async () => {
            await result.current.withdraw(10);
        });

        expect(dispatch).toHaveBeenCalledTimes(6);
        expect(withdraw).toHaveBeenCalledTimes(1);
        expect(withdraw).toHaveBeenCalledWith(10);
        expect(openNotification).toHaveBeenCalledTimes(1);
    });
    it('should handle withdraw funds failure', async () => {
        withdraw.mockRejectedValue(new Error('Test error'));
        const { result } = renderHook(() => useEthDownPayment(), {
            wrapper: EthDownPaymentProvider
        });
        await waitFor(() => {
            expect(dispatch).toHaveBeenCalledTimes(4);
        });
        jest.clearAllMocks();
        await act(async () => {
            await result.current.withdraw(10);
        });

        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(withdraw).toHaveBeenCalled();
        expect(openNotification).toHaveBeenCalledTimes(1);
    });
    it('should retrieve fees', async () => {
        const { result } = renderHook(() => useEthDownPayment(), {
            wrapper: EthDownPaymentProvider
        });
        await act(async () => {
            await result.current.getFees(10);
        });

        expect(getFees).toHaveBeenCalledTimes(1);
        expect(getFees).toHaveBeenCalledWith(10);
    });
    it('should handle fees retrieval failure', async () => {
        getFees.mockRejectedValue(new Error('Test error'));
        const { result } = renderHook(() => useEthDownPayment(), {
            wrapper: EthDownPaymentProvider
        });
        await act(async () => {
            await result.current.getFees(10);
        });

        expect(getFees).toHaveBeenCalled();
        expect(openNotification).toHaveBeenCalledTimes(1);
    });
});
