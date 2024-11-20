import { renderHook, act } from '@testing-library/react';
import { useDispatch } from 'react-redux';
import { useSigner } from '@/providers/SignerProvider';
import { openNotification } from '@/utils/notification';
import {
    EthEnumerableProvider,
    useEthEnumerable
} from '@/providers/entities/EthEnumerableProvider';
import { EnumerableTypeService } from '@isinblockchainteam/kbc-icp-incubator-common';
import { JsonRpcSigner } from '@ethersproject/providers';

jest.mock('@isinblockchainteam/kbc-icp-incubator-library');
jest.mock('@isinblockchainteam/kbc-icp-incubator-common');
jest.mock('@/providers/SignerProvider');
jest.mock('react-redux');
jest.mock('@/utils/notification');

describe('EthEnumerableProvider', () => {
    const signer = { _address: '0x123' } as JsonRpcSigner;
    const dispatch = jest.fn();
    const getTypesList = jest.fn();
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(jest.fn());

        (EnumerableTypeService as jest.Mock).mockImplementation(() => ({
            getTypesList
        }));
        (useDispatch as jest.Mock).mockReturnValue(dispatch);
        (useSigner as jest.Mock).mockReturnValue({ signer });
    });

    it('should throw error if hook is used outside the provider', async () => {
        expect(() => renderHook(() => useEthEnumerable())).toThrow();
    });

    it('should load fiats, process types and units', async () => {
        const enumerableTypes = ['enumerableType'];
        getTypesList.mockResolvedValue(enumerableTypes);
        const { result } = renderHook(() => useEthEnumerable(), {
            wrapper: EthEnumerableProvider
        });
        await act(async () => {
            await result.current.loadData();
        });

        expect(dispatch).toHaveBeenCalledTimes(6);
        expect(getTypesList).toHaveBeenCalledTimes(3);
        expect(result.current.dataLoaded).toBe(true);
        expect(result.current.fiats).toEqual(enumerableTypes);
        expect(result.current.processTypes).toEqual(enumerableTypes);
        expect(result.current.units).toEqual(enumerableTypes);
    });

    it('should handle load failure', async () => {
        getTypesList.mockRejectedValue(new Error('Test error'));
        const { result } = renderHook(() => useEthEnumerable(), {
            wrapper: EthEnumerableProvider
        });
        await act(async () => {
            await result.current.loadData();
        });

        expect(dispatch).toHaveBeenCalledTimes(6);
        expect(getTypesList).toHaveBeenCalledTimes(3);
        expect(openNotification).toHaveBeenCalledTimes(3);
        expect(result.current.dataLoaded).toBe(true);
        expect(result.current.fiats).toEqual([]);
        expect(result.current.processTypes).toEqual([]);
        expect(result.current.units).toEqual([]);
    });
});
