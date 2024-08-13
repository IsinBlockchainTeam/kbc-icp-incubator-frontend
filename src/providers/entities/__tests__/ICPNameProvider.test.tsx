import { renderHook, act } from '@testing-library/react';
import { ICPOrganizationProvider, useICPOrganization } from '../ICPOrganizationProvider';
import { useDispatch } from 'react-redux';
import { useSigner } from '@/providers/SignerProvider';
import { request } from '@/utils/request';
import { ICP } from '@/constants/icp';
import { useICP } from '@/providers/ICPProvider';
import { JsonRpcSigner } from '@ethersproject/providers';

jest.mock('@kbc-lib/coffee-trading-management-lib');
jest.mock('@/providers/SignerProvider');
jest.mock('@/providers/ICPProvider');
jest.mock('react-redux');
jest.mock('@/utils/notification');
jest.mock('@/utils/request');

describe('ICPOrganizationProvider', () => {
    const signer = { _address: '0x123' } as JsonRpcSigner;
    const dispatch = jest.fn();
    const getVerifiablePresentation = jest.fn();
    const verifiablePresentation = {
        legalName: 'Test Company'
    };
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(jest.fn());

        (useDispatch as jest.Mock).mockReturnValue(dispatch);
        (useSigner as jest.Mock).mockReturnValue({ signer });
        (useICP as jest.Mock).mockReturnValue({
            organizationDriver: {
                getVerifiablePresentation
            }
        });
        (request as jest.Mock).mockResolvedValue({
            didDocument: { service: [{ serviceEndpoint: `//${ICP.CANISTER_ID_ORGANIZATION}//0` }] }
        });
        getVerifiablePresentation.mockResolvedValue(verifiablePresentation);
    });

    it('should throw error if hook is used outside the provider', async () => {
        expect(() => renderHook(() => useICPOrganization())).toThrow();
    });

    // TODO: uncomment after mocked values have been removed
    // it('should load names', async () => {
    //     const { result } = renderHook(() => useICPOrganization(), {
    //         wrapper: ICPOrganizationProvider
    //     });
    //     await act(async () => {
    //         await result.current.loadData();
    //     });
    //
    //     expect(dispatch).toHaveBeenCalledTimes(2);
    //     expect(request).toHaveBeenCalled();
    //     expect(getVerifiablePresentation).toHaveBeenCalled();
    //     expect(result.current.dataLoaded).toBe(true);
    //     expect(
    //         result.current.getCompany('0xa1f48005f183780092E0E277B282dC1934AE3308').legalName
    //     ).toEqual(verifiablePresentation.legalName);
    // });
    //
    // it('should handle load failure - request fails', async () => {
    //     (request as jest.Mock).mockRejectedValue(new Error('Test error'));
    //     const { result } = renderHook(() => useICPOrganization(), {
    //         wrapper: ICPOrganizationProvider
    //     });
    //     await act(async () => {
    //         await result.current.loadData();
    //     });
    //
    //     expect(dispatch).toHaveBeenCalledTimes(2);
    //     expect(request).toHaveBeenCalled();
    //     expect(result.current.dataLoaded).toBe(true);
    //     expect(
    //         result.current.getCompany('0xa1f48005f183780092E0E277B282dC1934AE3308').legalName
    //     ).toEqual('Unknown');
    // });
    //
    // it('should handle load failure - canisterId not found', async () => {
    //     (request as jest.Mock).mockResolvedValue({
    //         didDocument: { service: [{ serviceEndpoint: `//unknown//0` }] }
    //     });
    //     const { result } = renderHook(() => useICPOrganization(), {
    //         wrapper: ICPOrganizationProvider
    //     });
    //     await act(async () => {
    //         await result.current.loadData();
    //     });
    //
    //     expect(dispatch).toHaveBeenCalledTimes(2);
    //     expect(request).toHaveBeenCalled();
    //     expect(result.current.dataLoaded).toBe(true);
    //     expect(
    //         result.current.getCompany('0xa1f48005f183780092E0E277B282dC1934AE3308').legalName
    //     ).toEqual('Unknown');
    // });
    // it('should handle load failure - getVerifiablePresentation fails', async () => {
    //     getVerifiablePresentation.mockRejectedValue(new Error('Test error'));
    //     const { result } = renderHook(() => useICPOrganization(), {
    //         wrapper: ICPOrganizationProvider
    //     });
    //     await act(async () => {
    //         await result.current.loadData();
    //     });
    //
    //     expect(dispatch).toHaveBeenCalledTimes(2);
    //     expect(request).toHaveBeenCalled();
    //     expect(result.current.dataLoaded).toBe(true);
    //     expect(
    //         result.current.getCompany('0xa1f48005f183780092E0E277B282dC1934AE3308').legalName
    //     ).toEqual('Unknown');
    // });
});
