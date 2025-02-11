import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { useSiweIdentity } from '@/providers/auth/SiweIdentityProvider';
import { checkAndGetEnvironmentVariable } from '@/utils/env';
import { useCallHandler } from '@/providers/errors/CallHandlerProvider';
import { Typography } from 'antd';
import { OrganizationProvider, useOrganization } from '../OrganizationProvider';
import { Organization, OrganizationParams, OrganizationService } from '@kbc-lib/coffee-trading-management-lib';

jest.mock('@kbc-lib/coffee-trading-management-lib');
jest.mock('@/providers/auth/SiweIdentityProvider');
jest.mock('@/providers/auth/SignerProvider');
jest.mock('@/providers/errors/CallHandlerProvider');
jest.mock('@/providers/storage/IcpStorageProvider');
jest.mock('@/utils/env');
jest.mock('antd', () => {
    const originalModule = jest.requireActual('antd');
    return {
        ...originalModule,
        Typography: {
            ...originalModule.Typography,
            Text: jest.fn((props) => <span {...props} />)
        }
    };
});
describe('OrganizationProvider', () => {
    const organizationServiceMethods = {
        getOrganizations: jest.fn(),
        createOrganization: jest.fn(),
        updateOrganization: jest.fn(),
        inviteOrganization: jest.fn()
    };
    const handleICPCall = jest.fn();

    const organizations = new Map<string, Organization>([
        ['0xaddress1', { ethAddress: '0xaddress1' } as Organization],
        ['0xaddress2', { ethAddress: '0xaddress2' } as Organization]
    ]);
    const organizationParams = { legalName: 'legalName', industrialSector: 'industrialSector' } as OrganizationParams;
    const invitedOrganization = { email: 'email', name: 'name' };
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.spyOn(console, 'log').mockImplementation(jest.fn());

        (useSiweIdentity as jest.Mock).mockReturnValue({ identity: 'identity' });
        (checkAndGetEnvironmentVariable as jest.Mock).mockReturnValue('canisterId');
        (useCallHandler as jest.Mock).mockReturnValue({ handleICPCall });

        organizationServiceMethods.getOrganizations.mockResolvedValue(organizations);
        (OrganizationService as jest.Mock).mockImplementation(() => ({ ...organizationServiceMethods }));

        handleICPCall.mockImplementation(async (callback) => {
            await callback();
        });
    });

    it('should throw error if hook is used outside the provider', async () => {
        expect(() => renderHook(() => useOrganization())).toThrow();
    });

    it('should render error message if identity is not initialized', async () => {
        (useSiweIdentity as jest.Mock).mockReturnValue({ identity: null });
        const mockTypographyText = Typography.Text as unknown as jest.Mock;
        renderHook(() => useOrganization(), {
            wrapper: OrganizationProvider
        });
        expect(mockTypographyText).toHaveBeenCalledTimes(1);
        expect(mockTypographyText).toHaveBeenCalledWith(
            expect.objectContaining({
                children: 'Siwe identity not initialized'
            }),
            {}
        );
    });

    it('should load data', async () => {
        const { result } = renderHook(() => useOrganization(), {
            wrapper: OrganizationProvider
        });
        await act(async () => {
            await result.current.loadData();
        });

        expect(handleICPCall).toHaveBeenCalledTimes(1);
        expect(organizationServiceMethods.getOrganizations).toHaveBeenCalledTimes(1);

        expect(result.current.dataLoaded).toBe(true);
        expect(result.current.organizations).toEqual(organizations);
    });

    it('should get organization', async () => {
        const { result } = renderHook(() => useOrganization(), {
            wrapper: OrganizationProvider
        });
        await act(async () => {
            await result.current.loadData();
        });
        jest.clearAllMocks();
        const organization = result.current.getOrganization('0xaddress1');
        expect(organization).toEqual(organizations.get('0xaddress1'));
    });

    it('should get organization - Organization not found', async () => {
        const { result } = renderHook(() => useOrganization(), {
            wrapper: OrganizationProvider
        });
        await expect(async () => {
            await result.current.getOrganization('0xaddress1');
        }).rejects.toThrowError('Organization not found');
    });

    it('should save organization', async () => {
        const { result } = renderHook(() => useOrganization(), {
            wrapper: OrganizationProvider
        });
        await act(async () => {
            await result.current.storeOrganization(organizationParams);
        });

        expect(handleICPCall).toHaveBeenCalledTimes(2);
        expect(organizationServiceMethods.createOrganization).toHaveBeenCalledTimes(1);
        expect(organizationServiceMethods.createOrganization).toHaveBeenCalledWith(organizationParams);
        expect(organizationServiceMethods.getOrganizations).toHaveBeenCalledTimes(1);
    });

    it('should update organization', async () => {
        const { result } = renderHook(() => useOrganization(), {
            wrapper: OrganizationProvider
        });
        await act(async () => {
            await result.current.updateOrganization('0xaddress1', organizationParams);
        });

        expect(handleICPCall).toHaveBeenCalledTimes(2);
        expect(organizationServiceMethods.updateOrganization).toHaveBeenCalledTimes(1);
        expect(organizationServiceMethods.updateOrganization).toHaveBeenCalledWith('0xaddress1', organizationParams);
        expect(organizationServiceMethods.getOrganizations).toHaveBeenCalledTimes(1);
    });

    it('should invite organization', async () => {
        const { result } = renderHook(() => useOrganization(), {
            wrapper: OrganizationProvider
        });
        await act(async () => {
            await result.current.inviteOrganization(invitedOrganization.email, invitedOrganization.name);
        });

        expect(handleICPCall).toHaveBeenCalledTimes(1);
        expect(organizationServiceMethods.inviteOrganization).toHaveBeenCalledTimes(1);
        expect(organizationServiceMethods.inviteOrganization).toHaveBeenCalledWith(invitedOrganization.email, invitedOrganization.name);
    });
});
