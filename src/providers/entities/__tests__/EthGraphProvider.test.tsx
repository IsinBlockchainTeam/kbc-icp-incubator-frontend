import { renderHook, act } from '@testing-library/react';
import { EthGraphProvider, useEthGraph } from '../EthGraphProvider';
import { GraphService, ICPFileDriver, RoleProof } from '@kbc-lib/coffee-trading-management-lib';
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

describe('EthGraphProvider', () => {
    const signer = { _address: '0x123' } as JsonRpcSigner;
    const dispatch = jest.fn();
    const computeGraph = jest.fn();
    const roleProof: RoleProof = {
        signedProof: 'signedProof',
        delegator: 'delegator'
    };
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(jest.fn());

        (GraphService as jest.Mock).mockImplementation(() => ({
            computeGraph
        }));
        (useDispatch as jest.Mock).mockReturnValue(dispatch);
        (useSigner as jest.Mock).mockReturnValue({ signer });
        (useICP as jest.Mock).mockReturnValue({
            fileDriver: {} as ICPFileDriver
        });
        (useSelector as jest.Mock).mockReturnValue(roleProof);
    });

    it('should throw error if hook is used outside the provider', async () => {
        expect(() => renderHook(() => useEthGraph())).toThrow();
    });

    it('should compute the graph', async () => {
        const { result } = renderHook(() => useEthGraph(), {
            wrapper: EthGraphProvider
        });
        await result.current.computeGraph(1);

        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(computeGraph).toHaveBeenCalledWith(roleProof, 1, true);
    });

    it('should handle compute graph failure', async () => {
        computeGraph.mockRejectedValue(new Error('Test error'));
        const { result } = renderHook(() => useEthGraph(), {
            wrapper: EthGraphProvider
        });
        await result.current.computeGraph(1);

        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(computeGraph).toHaveBeenCalledWith(roleProof, 1, true);
        expect(openNotification).toHaveBeenCalled();
    });

    it('should do nothing on load', async () => {
        const { result } = renderHook(() => useEthGraph(), {
            wrapper: EthGraphProvider
        });
        await act(async () => {
            await result.current.loadData();
        });

        expect(dispatch).not.toHaveBeenCalled();
    });
});
