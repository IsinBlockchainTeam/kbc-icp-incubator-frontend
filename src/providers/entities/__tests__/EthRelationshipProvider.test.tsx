import { renderHook, act } from '@testing-library/react';
import { EthRelationshipProvider, useEthRelationship } from '../EthRelationshipProvider';
import { Relationship, RelationshipService } from '@kbc-lib/coffee-trading-management-lib';
import { useDispatch } from 'react-redux';
import { useSigner } from '@/providers/SignerProvider';
import { Wallet } from 'ethers';
import { openNotification } from '@/utils/notification';

jest.mock('@kbc-lib/coffee-trading-management-lib');
jest.mock('@/providers/SignerProvider');
jest.mock('react-redux');
jest.mock('@/utils/notification');

describe('EthRelationshipProvider', () => {
    const signer = { _address: '0x123' } as JsonRpcSigner;
    const dispatch = jest.fn();
    const getRelationshipIdsByCompany = jest.fn();
    const getRelationshipInfo = jest.fn();
    const relationshipIds = [1];
    const relationship = { id: 1 } as Relationship;
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(jest.fn());

        (RelationshipService as jest.Mock).mockImplementation(() => ({
            getRelationshipIdsByCompany,
            getRelationshipInfo
        }));
        (useDispatch as jest.Mock).mockReturnValue(dispatch);
        (useSigner as jest.Mock).mockReturnValue({ signer });
        getRelationshipIdsByCompany.mockResolvedValue(relationshipIds);
        getRelationshipInfo.mockResolvedValue(relationship);
    });

    it('should throw error if hook is used outside the provider', async () => {
        expect(() => renderHook(() => useEthRelationship())).toThrow();
    });

    it('should load relationship', async () => {
        const { result } = renderHook(() => useEthRelationship(), {
            wrapper: EthRelationshipProvider
        });
        await act(async () => {
            await result.current.loadData();
        });

        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(getRelationshipIdsByCompany).toHaveBeenCalled();
        expect(getRelationshipInfo).toHaveBeenCalled();
        expect(result.current.dataLoaded).toBe(true);
        expect(result.current.relationships).toEqual([relationship]);
    });

    it('should handle load failure on initial render', async () => {
        getRelationshipIdsByCompany.mockRejectedValue(new Error('Test error'));
        const { result } = renderHook(() => useEthRelationship(), {
            wrapper: EthRelationshipProvider
        });
        await act(async () => {
            await result.current.loadData();
        });

        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(getRelationshipIdsByCompany).toHaveBeenCalled();
        expect(getRelationshipInfo).not.toHaveBeenCalled();
        expect(openNotification).toHaveBeenCalled();
        expect(result.current.dataLoaded).toBe(true);
        expect(result.current.relationships).toEqual([]);
    });
});
