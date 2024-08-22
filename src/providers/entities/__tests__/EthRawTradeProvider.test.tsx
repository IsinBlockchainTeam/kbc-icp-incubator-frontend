import { renderHook, act } from '@testing-library/react';
import { EthRawTradeProvider, RawTrade, useEthRawTrade } from '../EthRawTradeProvider';
import {
    ICPFileDriver,
    TradeManagerService,
    TradeService,
    TradeType
} from '@kbc-lib/coffee-trading-management-lib';
import { useDispatch, useSelector } from 'react-redux';
import { useSigner } from '@/providers/SignerProvider';
import { openNotification } from '@/utils/notification';
import { useICP } from '@/providers/ICPProvider';
import { JsonRpcSigner } from '@ethersproject/providers';

jest.mock('@kbc-lib/coffee-trading-management-lib');
jest.mock('@/providers/SignerProvider');
jest.mock('react-redux');
jest.mock('@/utils/notification');
jest.mock('@/providers/ICPProvider');

describe('EthRawTradeProvider', () => {
    const signer = { _address: '0x123' } as JsonRpcSigner;
    const dispatch = jest.fn();
    const getTrade = jest.fn();
    const getTradeIdsOfSupplier = jest.fn();
    const getTradeIdsOfCommissioner = jest.fn();
    const getTradeType = jest.fn();
    const tradeIds = [1];
    const tradeAddress = '0x123';
    const tradeType = TradeType.BASIC;
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(jest.fn());

        (TradeManagerService as jest.Mock).mockImplementation(() => ({
            getTradeIdsOfSupplier,
            getTradeIdsOfCommissioner,
            getTrade
        }));
        (TradeService as jest.Mock).mockImplementation(() => ({
            getTradeType
        }));
        (useDispatch as jest.Mock).mockReturnValue(dispatch);
        (useSigner as jest.Mock).mockReturnValue({ signer });
        getTradeIdsOfSupplier.mockResolvedValue(tradeIds);
        getTradeIdsOfCommissioner.mockResolvedValue([]);
        getTrade.mockResolvedValue(tradeAddress);
        getTradeType.mockResolvedValue(tradeType);
        (useICP as jest.Mock).mockReturnValue({
            fileDriver: {} as ICPFileDriver
        });
        (useSelector as jest.Mock).mockReturnValue({
            signedProof: 'signedProof',
            delegator: 'delegator'
        });
    });

    it('should throw error if hook is used outside the provider', async () => {
        expect(() => renderHook(() => useEthRawTrade())).toThrow();
    });

    it('should load raw trades', async () => {
        const { result } = renderHook(() => useEthRawTrade(), {
            wrapper: EthRawTradeProvider
        });
        await act(async () => {
            await result.current.loadData();
        });

        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(getTradeIdsOfSupplier).toHaveBeenCalled();
        expect(getTradeIdsOfCommissioner).toHaveBeenCalled();
        expect(getTrade).toHaveBeenCalled();
        expect(getTradeType).toHaveBeenCalled();
        expect(result.current.dataLoaded).toBe(true);
        expect(result.current.rawTrades).toEqual([
            { address: tradeAddress, id: 1, type: tradeType } as RawTrade
        ]);
    });

    it('should handle load failure', async () => {
        getTradeIdsOfSupplier.mockRejectedValue(new Error('Test error'));
        const { result } = renderHook(() => useEthRawTrade(), {
            wrapper: EthRawTradeProvider
        });
        await act(async () => {
            await result.current.loadData();
        });

        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(getTradeIdsOfSupplier).toHaveBeenCalled();
        expect(getTrade).not.toHaveBeenCalled();
        expect(openNotification).toHaveBeenCalled();
        expect(result.current.dataLoaded).toBe(true);
        expect(result.current.rawTrades).toEqual([]);
    });
});
