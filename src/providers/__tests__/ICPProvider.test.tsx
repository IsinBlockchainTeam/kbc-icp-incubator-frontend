import React from 'react';
import { render, renderHook, screen } from '@testing-library/react';
import { ICPProvider, ICPContext, useICP } from '../ICPProvider';
import { useSiweIdentity } from '../SiweIdentityProvider';
import { checkAndGetEnvironmentVariable } from '@/utils/env';
import { request } from '@/utils/request';
import { ICPOrganizationDriver, ICPStorageDriver, ICPIdentityDriver } from '@blockchain-lib/common';
import { ICPFileDriver } from '@kbc-lib/coffee-trading-management-lib';

jest.mock('../SiweIdentityProvider', () => ({
    useSiweIdentity: jest.fn()
}));
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
describe('ICPProvider', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
    });
    it('should throw error if hook is used outside the provider', async () => {
        expect(() => renderHook(() => useICP())).toThrow();
    });
    it('renders children when identity is present', () => {
        const mockIdentity = { id: 'test-id' };

        (useSiweIdentity as jest.Mock).mockReturnValue({ identity: mockIdentity });

        render(
            <ICPProvider>
                <div data-testid="child-component"></div>
            </ICPProvider>
        );

        expect(screen.getByTestId('child-component')).toBeInTheDocument();
    });

    it('renders error message when identity is not present', () => {
        (useSiweIdentity as jest.Mock).mockReturnValue({ identity: null });

        render(
            <ICPProvider>
                <div data-testid="child-component"></div>
            </ICPProvider>
        );

        expect(screen.queryByText('Siwe identity not initialized')).toBeInTheDocument();
        expect(screen.queryByTestId('child-component')).not.toBeInTheDocument();
    });

    it('should provide icp drivers', () => {
        const mockIdentity = { id: 'test-id' };

        (useSiweIdentity as jest.Mock).mockReturnValue({ identity: mockIdentity });

        const TestComponent = () => {
            const context = React.useContext(ICPContext);
            expect(context).toHaveProperty('organizationDriver');
            expect(context).toHaveProperty('storageDriver');
            expect(context).toHaveProperty('fileDriver');
            expect(context).toHaveProperty('identityDriver');
            expect(context).toHaveProperty('getNameByDID');
            return null;
        };

        render(
            <ICPProvider>
                <TestComponent />
            </ICPProvider>
        );
    });
    it('should create icpOrganizationDriver correctly', () => {
        const mockIdentity = { id: 'test-id' };
        (useSiweIdentity as jest.Mock).mockReturnValue({ identity: mockIdentity });
        (checkAndGetEnvironmentVariable as jest.Mock).mockReturnValue('mock-canister-id');
        (request as jest.Mock).mockResolvedValue(mockedDidDocument);

        const { result } = renderHook(() => useICP(), {
            wrapper: ICPProvider
        });

        expect(ICPOrganizationDriver).toHaveBeenCalledWith(mockIdentity, 'mock-canister-id');
        expect(result.current.organizationDriver).toBeInstanceOf(ICPOrganizationDriver);
    });
    it('should create icpStorageDriver correctly', () => {
        const mockIdentity = { id: 'test-id' };
        (useSiweIdentity as jest.Mock).mockReturnValue({ identity: mockIdentity });
        (checkAndGetEnvironmentVariable as jest.Mock).mockReturnValue('mock-canister-id');
        (request as jest.Mock).mockResolvedValue(mockedDidDocument);

        const { result } = renderHook(() => useICP(), {
            wrapper: ICPProvider
        });

        expect(ICPStorageDriver).toHaveBeenCalledWith(mockIdentity, 'mock-canister-id');
        expect(result.current.storageDriver).toBeInstanceOf(ICPStorageDriver);
    });
    it('should create icpFileDriver correctly', () => {
        const mockIdentity = { id: 'test-id' };
        (useSiweIdentity as jest.Mock).mockReturnValue({ identity: mockIdentity });
        (checkAndGetEnvironmentVariable as jest.Mock).mockReturnValue('mock-canister-id');
        (request as jest.Mock).mockResolvedValue(mockedDidDocument);

        const { result } = renderHook(() => useICP(), {
            wrapper: ICPProvider
        });

        expect(ICPFileDriver).toHaveBeenCalledWith(result.current.storageDriver);
        expect(result.current.fileDriver).toBeInstanceOf(ICPFileDriver);
    });
    it('should create icpIdentityDriver correctly', () => {
        const mockIdentity = { id: 'test-id' };
        (useSiweIdentity as jest.Mock).mockReturnValue({ identity: mockIdentity });
        (checkAndGetEnvironmentVariable as jest.Mock).mockReturnValue('mock-canister-id');
        (request as jest.Mock).mockResolvedValue(mockedDidDocument);

        const { result } = renderHook(() => useICP(), {
            wrapper: ICPProvider
        });

        expect(ICPIdentityDriver).toHaveBeenCalledWith(mockIdentity);
        expect(result.current.identityDriver).toBeInstanceOf(ICPIdentityDriver);
    });
    it('should return getNameByDID', () => {
        const mockIdentity = { id: 'test-id' };
        (useSiweIdentity as jest.Mock).mockReturnValue({ identity: mockIdentity });
        (checkAndGetEnvironmentVariable as jest.Mock).mockReturnValue('mock-canister-id');
        (request as jest.Mock).mockResolvedValue(mockedDidDocument);

        const { result } = renderHook(() => useICP(), {
            wrapper: ICPProvider
        });

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

        const { result } = renderHook(() => useICP(), {
            wrapper: ICPProvider
        });

        expect(await result.current?.getNameByDID('mock-did')).toBe('mock-name');
    });
    it('should return Unknown on request error', async () => {
        const mockIdentity = { id: 'test-id' };
        (useSiweIdentity as jest.Mock).mockReturnValue({ identity: mockIdentity });
        (checkAndGetEnvironmentVariable as jest.Mock).mockReturnValue('mock-canister-id');
        (request as jest.Mock).mockRejectedValue(new Error('error'));

        const { result } = renderHook(() => useICP(), {
            wrapper: ICPProvider
        });

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

        const { result } = renderHook(() => useICP(), {
            wrapper: ICPProvider
        });

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

        const { result } = renderHook(() => useICP(), {
            wrapper: ICPProvider
        });

        expect(await result.current?.getNameByDID('mock-did')).toBe('Unknown');
    });
});
