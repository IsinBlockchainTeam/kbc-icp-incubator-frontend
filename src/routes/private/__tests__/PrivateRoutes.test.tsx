import React from 'react';
import PrivateRoutes from '@/routes/private/PrivateRoutes';
import { render } from '@testing-library/react';
import AuthenticationGuard from '@/guards/auth/AuthenticationGuard';
import { SignerProvider } from '@/providers/auth/SignerProvider';
import { SiweIdentityProvider } from '@/providers/auth/SiweIdentityProvider';
import { IcpStorageProvider } from '@/providers/storage/IcpStorageProvider';
import { CallHandlerProvider } from '@/providers/errors/CallHandlerProvider';
import { AuthenticationProvider } from '@/providers/auth/AuthenticationProvider';
import EntitiesProviders from '@/providers/entities/EntitiesProviders';
import LoadingLayoutHandler from '@/handlers/layout/LoadingLayoutHandler';
import OrganizationGuard from '@/guards/organization/OrganizationGuard';

jest.mock('@/guards/auth/AuthenticationGuard');
jest.mock('@/providers/auth/SignerProvider');
jest.mock('@/providers/auth/SiweIdentityProvider');
jest.mock('@/providers/storage/IcpStorageProvider');
jest.mock('@/providers/errors/CallHandlerProvider');
jest.mock('@/providers/auth/AuthenticationProvider');
jest.mock('@/providers/entities/EntitiesProviders');
jest.mock('@/handlers/layout/LoadingLayoutHandler');
jest.mock('@/guards/organization/OrganizationGuard');
jest.mock('react-router-dom', () => ({
    Outlet: () => <div data-testid="outlet">Outlet Content</div>
}));

// Mock implementation for each provider/guard
const mockProviderImplementation = (name: string) => {
    return jest.fn().mockImplementation(({ children }) => <div data-testid={name}>{children}</div>);
};

export { };

describe('PrivateRoutes', () => {
    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();

        // Setup mock implementations
        (AuthenticationGuard as jest.Mock).mockImplementation(mockProviderImplementation('authentication-guard'));
        (SignerProvider as jest.Mock).mockImplementation(mockProviderImplementation('signer-provider'));
        (SiweIdentityProvider as jest.Mock).mockImplementation(mockProviderImplementation('siwe-identity-provider'));
        (IcpStorageProvider as jest.Mock).mockImplementation(mockProviderImplementation('icp-storage-provider'));
        (CallHandlerProvider as jest.Mock).mockImplementation(mockProviderImplementation('call-handler-provider'));
        (AuthenticationProvider as jest.Mock).mockImplementation(mockProviderImplementation('authentication-provider'));
        (EntitiesProviders as jest.Mock).mockImplementation(mockProviderImplementation('entities-providers'));
        (LoadingLayoutHandler as jest.Mock).mockImplementation(mockProviderImplementation('loading-layout-handler'));
        (OrganizationGuard as jest.Mock).mockImplementation(mockProviderImplementation('organization-guard'));
    });

    it('should render all providers in the correct order', () => {
        const { getByTestId } = render(<PrivateRoutes />);

        // Verify the presence and nesting of all components
        const authGuard = getByTestId('authentication-guard');
        const signerProvider = getByTestId('signer-provider');
        const siweProvider = getByTestId('siwe-identity-provider');
        const icpStorage = getByTestId('icp-storage-provider');
        const callHandler = getByTestId('call-handler-provider');
        const authProvider = getByTestId('authentication-provider');
        const entitiesProviders = getByTestId('entities-providers');
        const loadingHandler = getByTestId('loading-layout-handler');
        const orgGuard = getByTestId('organization-guard');
        const outlet = getByTestId('outlet');

        // Verify the component hierarchy
        expect(authGuard).toContainElement(signerProvider);
        expect(signerProvider).toContainElement(siweProvider);
        expect(siweProvider).toContainElement(icpStorage);
        expect(icpStorage).toContainElement(callHandler);
        expect(callHandler).toContainElement(authProvider);
        expect(authProvider).toContainElement(entitiesProviders);
        expect(entitiesProviders).toContainElement(loadingHandler);
        expect(loadingHandler).toContainElement(orgGuard);
        expect(orgGuard).toContainElement(outlet);

        expect(getByTestId('outlet')).toBeInTheDocument();
    });
});
