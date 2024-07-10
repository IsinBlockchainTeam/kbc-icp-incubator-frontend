import { renderHook, act } from '@testing-library/react';
import {
    AssetOperationRequest,
    EthAssetOperationProvider,
    useEthAssetOperation
} from '../EthAssetOperationProvider';
import { AssetOperation, AssetOperationService } from '@kbc-lib/coffee-trading-management-lib';
import { useDispatch } from 'react-redux';
import { useSigner } from '@/providers/SignerProvider';
import { Wallet } from 'ethers';
import { openNotification } from '@/utils/notification';

jest.mock('@kbc-lib/coffee-trading-management-lib');
jest.mock('@/providers/SignerProvider');
jest.mock('react-redux');
jest.mock('@/utils/notification');

describe('EthAssetOperationProvider', () => {
    const signer = { address: '0x123' } as Wallet;
    const dispatch = jest.fn();
    const getAssetOperationsOfCreator = jest.fn();
    const registerAssetOperation = jest.fn();
    const assetOperations = [{ id: 1 } as AssetOperation];
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(jest.fn());

        (AssetOperationService as jest.Mock).mockImplementation(() => ({
            getAssetOperationsOfCreator,
            registerAssetOperation
        }));
        (useDispatch as jest.Mock).mockReturnValue(dispatch);
        (useSigner as jest.Mock).mockReturnValue({ signer });
    });

    it('should throw error if hook is used outside the provider', async () => {
        expect(() => renderHook(() => useEthAssetOperation())).toThrow();
    });

    it('should load asset operations on initial render', async () => {
        getAssetOperationsOfCreator.mockResolvedValue(assetOperations);
        const { result } = renderHook(() => useEthAssetOperation(), {
            wrapper: EthAssetOperationProvider
        });
        await act(async () => {
            await result.current.loadData();
        });

        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(getAssetOperationsOfCreator).toHaveBeenCalled();
        expect(result.current.dataLoaded).toBe(true);
        expect(result.current.assetOperations).toEqual(assetOperations);
    });

    it('should handle load failure on initial render', async () => {
        getAssetOperationsOfCreator.mockRejectedValue(new Error('Test error'));
        const { result } = renderHook(() => useEthAssetOperation(), {
            wrapper: EthAssetOperationProvider
        });
        await act(async () => {
            await result.current.loadData();
        });

        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(getAssetOperationsOfCreator).toHaveBeenCalled();
        expect(openNotification).toHaveBeenCalled();
        expect(result.current.dataLoaded).toBe(true);
        expect(result.current.assetOperations).toEqual([]);
    });

    it('should saves asset operation', async () => {
        const assetOperationRequest = { name: 'test' } as AssetOperationRequest;
        getAssetOperationsOfCreator.mockResolvedValue(assetOperations);
        const { result } = renderHook(() => useEthAssetOperation(), {
            wrapper: EthAssetOperationProvider
        });
        await act(async () => {
            await result.current.saveAssetOperation(assetOperationRequest);
        });

        expect(dispatch).toHaveBeenCalledTimes(4);
        expect(registerAssetOperation).toHaveBeenCalled();
        expect(getAssetOperationsOfCreator).toHaveBeenCalled();
        expect(result.current.dataLoaded).toBe(true);
        expect(result.current.assetOperations).toEqual(assetOperations);
    });
    it('should handle save failure', async () => {
        const assetOperationRequest = { name: 'test' } as AssetOperationRequest;
        getAssetOperationsOfCreator.mockResolvedValue(assetOperations);
        registerAssetOperation.mockRejectedValue(new Error('Test error'));
        const { result } = renderHook(() => useEthAssetOperation(), {
            wrapper: EthAssetOperationProvider
        });
        await act(async () => {
            await result.current.saveAssetOperation(assetOperationRequest);
        });

        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(registerAssetOperation).toHaveBeenCalled();
        expect(openNotification).toHaveBeenCalled();
        expect(result.current.dataLoaded).toBe(false);
        expect(result.current.assetOperations).toEqual([]);
    });
});
