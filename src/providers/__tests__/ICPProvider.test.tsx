import React from 'react';
import { render, renderHook, screen } from '@testing-library/react';
import { ICPProvider, ICPContext, useICP } from '../ICPProvider';
import { useSiweIdentity } from '../SiweIdentityProvider';
import { checkAndGetEnvironmentVariable } from '@/utils/env';
import { FileDriver, IdentityDriver, StorageDriver } from '@kbc-lib/coffee-trading-management-lib';

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
jest.mock('@kbc-lib/coffee-trading-management-lib', () => ({
    FileDriver: jest.fn(),
    URL_SEGMENT_INDEXES: {
        CANISTER_ID: 0,
        ORGANIZATION_ID: 1
    },
    IdentityDriver: jest.fn(),
    StorageDriver: jest.fn()
}));

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
            expect(context).toHaveProperty('storageDriver');
            expect(context).toHaveProperty('fileDriver');
            expect(context).toHaveProperty('identityDriver');
            return null;
        };

        render(
            <ICPProvider>
                <TestComponent />
            </ICPProvider>
        );
    });

    it('should create icpStorageDriver correctly', () => {
        const mockIdentity = { id: 'test-id' };
        (useSiweIdentity as jest.Mock).mockReturnValue({ identity: mockIdentity });
        (checkAndGetEnvironmentVariable as jest.Mock).mockReturnValue('mock-canister-id');

        const { result } = renderHook(() => useICP(), {
            wrapper: ICPProvider
        });

        expect(StorageDriver).toHaveBeenCalledWith(mockIdentity, 'mock-canister-id');
        expect(result.current.storageDriver).toBeInstanceOf(StorageDriver);
    });
    it('should create icpFileDriver correctly', () => {
        const mockIdentity = { id: 'test-id' };
        (useSiweIdentity as jest.Mock).mockReturnValue({ identity: mockIdentity });
        (checkAndGetEnvironmentVariable as jest.Mock).mockReturnValue('mock-canister-id');

        const { result } = renderHook(() => useICP(), {
            wrapper: ICPProvider
        });

        expect(FileDriver).toHaveBeenCalledWith(result.current.storageDriver);
        expect(result.current.fileDriver).toBeInstanceOf(FileDriver);
    });
    it('should create icpIdentityDriver correctly', () => {
        const mockIdentity = { id: 'test-id' };
        (useSiweIdentity as jest.Mock).mockReturnValue({ identity: mockIdentity });
        (checkAndGetEnvironmentVariable as jest.Mock).mockReturnValue('mock-canister-id');

        const { result } = renderHook(() => useICP(), {
            wrapper: ICPProvider
        });

        expect(IdentityDriver).toHaveBeenCalledWith(mockIdentity);
        expect(result.current.identityDriver).toBeInstanceOf(IdentityDriver);
    });
});
