import { act, renderHook } from '@testing-library/react';
import { useSiweIdentity } from '@/providers/auth/SiweIdentityProvider';
import { checkAndGetEnvironmentVariable } from '@/utils/env';
import { useCallHandler } from '@/providers/errors/CallHandlerProvider';
import { BusinessRelationProvider, useBusinessRelation } from '../BusinessRelationProvider';
import { BusinessRelation, BusinessRelationService } from '@kbc-lib/coffee-trading-management-lib';
import { useOrganization } from '../OrganizationProvider';

jest.mock('@kbc-lib/coffee-trading-management-lib');
jest.mock('@/providers/auth/SiweIdentityProvider');
jest.mock('@/providers/errors/CallHandlerProvider');
jest.mock('@/utils/env');
jest.mock('../OrganizationProvider');

describe('BusinessRelationProvider', () => {
    const businessRelationServiceMethods = {
        getBusinessRelations: jest.fn(),
        createBusinessRelation: jest.fn()
    };
    const handleICPCall = jest.fn();
    const loadOrganizationData = jest.fn();

    const businessRelations = [
        { ethAddressA: '0xaddress1', ethAddressB: '0xaddress2' } as BusinessRelation,
        { ethAddressA: '0xaddress2', ethAddressB: '0xaddress3' } as BusinessRelation
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.spyOn(console, 'log').mockImplementation(jest.fn());

        (useSiweIdentity as jest.Mock).mockReturnValue({ identity: 'identity' });
        (checkAndGetEnvironmentVariable as jest.Mock).mockReturnValue('canisterId');
        (useCallHandler as jest.Mock).mockReturnValue({ handleICPCall });
        (useOrganization as jest.Mock).mockReturnValue({ loadData: loadOrganizationData });

        businessRelationServiceMethods.getBusinessRelations.mockResolvedValue(businessRelations);
        (BusinessRelationService as jest.Mock).mockImplementation(() => ({ ...businessRelationServiceMethods }));

        handleICPCall.mockImplementation(async (callback) => {
            await callback();
        });
    });

    it('should throw error if hook is used outside the provider', async () => {
        expect(() => renderHook(() => useBusinessRelation())).toThrow();
    });

    it('should render error message if identity is not initialized', async () => {
        (useSiweIdentity as jest.Mock).mockReturnValue({ identity: null });

        renderHook(() => useBusinessRelation(), {
            wrapper: BusinessRelationProvider
        });
    });

    it('should load data', async () => {
        const { result } = renderHook(() => useBusinessRelation(), {
            wrapper: BusinessRelationProvider
        });
        await act(async () => {
            await result.current.loadData();
        });

        expect(handleICPCall).toHaveBeenCalledTimes(1);
        expect(businessRelationServiceMethods.getBusinessRelations).toHaveBeenCalledTimes(1);
        expect(result.current.dataLoaded).toBe(true);
    });

    it('should retrieve business relations', async () => {
        const { result } = renderHook(() => useBusinessRelation(), {
            wrapper: BusinessRelationProvider
        });
        await act(async () => {
            await result.current.loadData();
        });

        expect(handleICPCall).toHaveBeenCalledTimes(1);
        expect(businessRelationServiceMethods.getBusinessRelations).toHaveBeenCalledTimes(1);
        expect(result.current.businessRelations).toBeDefined();
        expect(result.current.businessRelations).toHaveLength(2);
        expect(result.current.businessRelations).toEqual(businessRelations);
    });

    it('should get business relation', async () => {
        const { result } = renderHook(() => useBusinessRelation(), {
            wrapper: BusinessRelationProvider
        });
        await act(async () => {
            await result.current.loadData();
        });

        const relation = result.current.getBusinessRelation('0xaddress2');
        expect(relation).toEqual(businessRelations[0]);
    });

    it('should throw error when business relation is not found', async () => {
        const { result } = renderHook(() => useBusinessRelation(), {
            wrapper: BusinessRelationProvider
        });
        await act(async () => {
            await result.current.loadData();
        });

        await expect(async () => {
            result.current.getBusinessRelation('0xnonexistent');
        }).rejects.toThrow('Business relation not found');
    });

    it('should disclose information', async () => {
        const { result } = renderHook(() => useBusinessRelation(), {
            wrapper: BusinessRelationProvider
        });

        await act(async () => {
            await result.current.discloseInformation('0xaddress1');
        });

        expect(handleICPCall).toHaveBeenCalledTimes(2);
        expect(businessRelationServiceMethods.createBusinessRelation).toHaveBeenCalledWith('0xaddress1');
        expect(loadOrganizationData).toHaveBeenCalledTimes(1);
    });
});
