import { useICPDrivers } from '../useICPDrivers';
import { renderHook } from '@testing-library/react';
import { useSiweIdentity } from '@/providers/SiweIdentityProvider';
import { request } from '@/utils/request';
import { ICPIdentityDriver, ICPOrganizationDriver, ICPStorageDriver } from '@blockchain-lib/common';
import { checkAndGetEnvironmentVariable } from '@/utils/env';
import { ICPFileDriver } from '@kbc-lib/coffee-trading-management-lib';

jest.mock('@/providers/SiweIdentityProvider', () => ({
    useSiweIdentity: jest.fn()
}));

jest.mock('@/utils/env', () => ({
    checkAndGetEnvironmentVariable: jest.fn()
}));

jest.mock('@/utils/request', () => ({
    request: jest.fn()
}));
jest.mock('@blockchain-lib/common', () => ({
    ICPIdentityDriver: jest.fn(),
    ICPOrganizationDriver: jest.fn(),
    ICPStorageDriver: jest.fn()
}));
jest.mock('@kbc-lib/coffee-trading-management-lib', () => ({
    ICPFileDriver: jest.fn(),
    URL_SEGMENT_INDEXES: {
        CANISTER_ID: 0,
        ORGANIZATION_ID: 1
    }
}));
const mockCanisterIdOrganizationGetter = jest.fn();
jest.mock('@/constants/icp', () => ({
    ICP: {
        get CANISTER_ID_ORGANIZATION() {
            return mockCanisterIdOrganizationGetter();
        }
    }
}));

const mockedDidDocument = {
    didDocument: {
        service: [
            {
                serviceEndpoint: 'mock-canister-id/mock-organization-id'
            }
        ]
    }
};

describe('useICPDrivers', () => {
    it('returns undefined when identity is not present', () => {
        (useSiweIdentity as jest.Mock).mockReturnValue({ identity: null });

        const { result } = renderHook(() => useICPDrivers());

        expect(result.current).toBeUndefined();
    });

    it('returns ICP drivers when identity is present', () => {
        const mockIdentity = { id: 'test-id' };
        (useSiweIdentity as jest.Mock).mockReturnValue({ identity: mockIdentity });
        (checkAndGetEnvironmentVariable as jest.Mock).mockReturnValue('mock-canister-id');
        (request as jest.Mock).mockResolvedValue(mockedDidDocument);

        const { result } = renderHook(() => useICPDrivers());

        expect(result.current).toHaveProperty('icpOrganizationDriver');
        expect(result.current).toHaveProperty('icpStorageDriver');
        expect(result.current).toHaveProperty('icpFileDriver');
        expect(result.current).toHaveProperty('icpIdentityDriver');
        expect(result.current).toHaveProperty('getNameByDID');
    });

    it('should create icpOrganizationDriver correctly', () => {
        const mockIdentity = { id: 'test-id' };
        (useSiweIdentity as jest.Mock).mockReturnValue({ identity: mockIdentity });
        (checkAndGetEnvironmentVariable as jest.Mock).mockReturnValue('mock-canister-id');
        (request as jest.Mock).mockResolvedValue(mockedDidDocument);

        const { result } = renderHook(() => useICPDrivers());

        expect(ICPOrganizationDriver).toHaveBeenCalledWith(mockIdentity, 'mock-canister-id');
        expect(result.current?.icpOrganizationDriver).toBeInstanceOf(ICPOrganizationDriver);
    });
    it('should create icpStorageDriver correctly', () => {
        const mockIdentity = { id: 'test-id' };
        (useSiweIdentity as jest.Mock).mockReturnValue({ identity: mockIdentity });
        (checkAndGetEnvironmentVariable as jest.Mock).mockReturnValue('mock-canister-id');
        (request as jest.Mock).mockResolvedValue(mockedDidDocument);

        const { result } = renderHook(() => useICPDrivers());

        expect(ICPStorageDriver).toHaveBeenCalledWith(mockIdentity, 'mock-canister-id');
        expect(result.current?.icpStorageDriver).toBeInstanceOf(ICPStorageDriver);
    });
    it('should create icpFileDriver correctly', () => {
        const mockIdentity = { id: 'test-id' };
        (useSiweIdentity as jest.Mock).mockReturnValue({ identity: mockIdentity });
        (checkAndGetEnvironmentVariable as jest.Mock).mockReturnValue('mock-canister-id');
        (request as jest.Mock).mockResolvedValue(mockedDidDocument);

        const { result } = renderHook(() => useICPDrivers());

        expect(ICPFileDriver).toHaveBeenCalledWith(result.current?.icpStorageDriver);
        expect(result.current?.icpFileDriver).toBeInstanceOf(ICPFileDriver);
    });
    it('should create icpIdentityDriver correctly', () => {
        const mockIdentity = { id: 'test-id' };
        (useSiweIdentity as jest.Mock).mockReturnValue({ identity: mockIdentity });
        (checkAndGetEnvironmentVariable as jest.Mock).mockReturnValue('mock-canister-id');
        (request as jest.Mock).mockResolvedValue(mockedDidDocument);

        const { result } = renderHook(() => useICPDrivers());

        expect(ICPIdentityDriver).toHaveBeenCalledWith(mockIdentity);
        expect(result.current?.icpIdentityDriver).toBeInstanceOf(ICPIdentityDriver);
    });
    it('should return getNameByDID', () => {
        const mockIdentity = { id: 'test-id' };
        (useSiweIdentity as jest.Mock).mockReturnValue({ identity: mockIdentity });
        (checkAndGetEnvironmentVariable as jest.Mock).mockReturnValue('mock-canister-id');
        (request as jest.Mock).mockResolvedValue(mockedDidDocument);

        const { result } = renderHook(() => useICPDrivers());

        expect(result.current?.getNameByDID).toBeInstanceOf(Function);
    });
    it('should return a name given the did', async () => {
        const mockIdentity = { id: 'test-id' };
        (useSiweIdentity as jest.Mock).mockReturnValue({ identity: mockIdentity });
        (checkAndGetEnvironmentVariable as jest.Mock).mockReturnValue('mock-canister-id');
        (request as jest.Mock).mockResolvedValue(mockedDidDocument);
        (ICPOrganizationDriver as jest.Mock).mockImplementation(() => ({
            getVerifiablePresentation: jest.fn().mockResolvedValue({ legalName: 'mock-name' })
        }));
        mockCanisterIdOrganizationGetter.mockReturnValue('mock-canister-id');

        const { result } = renderHook(() => useICPDrivers());

        expect(await result.current?.getNameByDID('mock-did')).toBe('mock-name');
    });
    it('should return Unknown on request error', async () => {
        const mockIdentity = { id: 'test-id' };
        (useSiweIdentity as jest.Mock).mockReturnValue({ identity: mockIdentity });
        (checkAndGetEnvironmentVariable as jest.Mock).mockReturnValue('mock-canister-id');
        (request as jest.Mock).mockRejectedValue(new Error('error'));

        const { result } = renderHook(() => useICPDrivers());

        expect(await result.current?.getNameByDID('mock-did')).toBe('Unknown');
    });
    it('should return Unknown on non-matching canister id', async () => {
        const mockIdentity = { id: 'test-id' };
        (useSiweIdentity as jest.Mock).mockReturnValue({ identity: mockIdentity });
        (checkAndGetEnvironmentVariable as jest.Mock).mockReturnValue('mock-canister-id');
        (request as jest.Mock).mockResolvedValue(mockedDidDocument);
        (ICPOrganizationDriver as jest.Mock).mockImplementation(() => ({
            getVerifiablePresentation: jest.fn().mockResolvedValue({ legalName: 'mock-name' })
        }));
        mockCanisterIdOrganizationGetter.mockReturnValue('other-mock-canister-id');

        const { result } = renderHook(() => useICPDrivers());

        expect(await result.current?.getNameByDID('mock-did')).toBe('Unknown');
    });
    it('should return Unknown on getVerifiablePresentation error', async () => {
        const mockIdentity = { id: 'test-id' };
        (useSiweIdentity as jest.Mock).mockReturnValue({ identity: mockIdentity });
        (checkAndGetEnvironmentVariable as jest.Mock).mockReturnValue('mock-canister-id');
        (request as jest.Mock).mockResolvedValue(mockedDidDocument);
        (ICPOrganizationDriver as jest.Mock).mockImplementation(() => ({
            getVerifiablePresentation: jest.fn().mockRejectedValue(new Error('error'))
        }));
        mockCanisterIdOrganizationGetter.mockReturnValue('mock-canister-id');

        const { result } = renderHook(() => useICPDrivers());

        expect(await result.current?.getNameByDID('mock-did')).toBe('Unknown');
    });
});
