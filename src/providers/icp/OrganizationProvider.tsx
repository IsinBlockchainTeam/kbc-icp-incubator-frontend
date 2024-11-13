import React, { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { useSiweIdentity } from '@/providers/SiweIdentityProvider';
import { checkAndGetEnvironmentVariable } from '@/utils/env';
import { ICP } from '@/constants/icp';
import { Typography } from 'antd';
import {
    Organization,
    OrganizationDriver,
    OrganizationParams,
    OrganizationService
} from '@kbc-lib/coffee-trading-management-lib';
import { ORGANIZATION_MESSAGE, OrganizationMessage } from '@/constants/message';
import { NotificationType, openNotification } from '@/utils/notification';
import { NOTIFICATION_DURATION } from '@/constants/notification';
import { useCallHandler } from '@/providers/icp/CallHandlerProvider';

export type OrganizationContextState = {
    dataLoaded: boolean;
    organizations: Map<string, Organization>;
    getOrganization: (ethAddress: string) => Organization;
    storeOrganization: (params: OrganizationParams) => Promise<void>;
    updateOrganization: (ethAddress: string, params: OrganizationParams) => Promise<void>;
    loadData: () => Promise<void>;
};

export const OrganizationContext = createContext<OrganizationContextState>(
    {} as OrganizationContextState
);

export const useOrganization = (): OrganizationContextState => {
    const context = useContext(OrganizationContext);
    if (!context || Object.keys(context).length === 0) {
        throw new Error('useOrganizationContext must be used within an OrganizationProvider.');
    }
    return context;
};

export function OrganizationProvider(props: { children: ReactNode }) {
    const { identity } = useSiweIdentity();
    const entityManagerCanisterId = checkAndGetEnvironmentVariable(ICP.CANISTER_ID_ENTITY_MANAGER);
    const [dataLoaded, setDataLoaded] = useState<boolean>(false);
    const [organizations, setOrganizations] = useState<Map<string, Organization>>(
        new Map<string, Organization>()
    );
    const { handleICPCall } = useCallHandler();

    if (!identity) {
        return <Typography.Text>Siwe identity not initialized</Typography.Text>;
    }

    const organizationService = useMemo(
        () => new OrganizationService(new OrganizationDriver(identity, entityManagerCanisterId)),
        [identity]
    );

    const loadOrganizations = async () => {
        await handleICPCall(async () => {
            const organizations = await organizationService.getOrganizations();
            const organizationsMap = new Map<string, Organization>();

            console.log('Organizations:', organizations);

            organizations.forEach((organization) => {
                organizationsMap.set(organization.ethAddress.toLowerCase(), organization);
            });

            setOrganizations(organizationsMap);
        }, ORGANIZATION_MESSAGE.RETRIEVE.LOADING);
    };

    const loadData = async () => {
        setDataLoaded(false);
        await loadOrganizations();
        setDataLoaded(true);
    };

    const getOrganization = (ethAddress: string): Organization => {
        const organization = organizations.get(ethAddress.toLowerCase());

        if (!organization) {
            // openNotification(
            //     'Error',
            //     ORGANIZATION_MESSAGE.RETRIEVE.NOT_FOUND,
            //     NotificationType.ERROR,
            //     NOTIFICATION_DURATION
            // );

            throw new Error('Organization not found');
        }

        return organization;
    };

    const writeTransaction = async (
        transaction: () => Promise<Organization>,
        message: OrganizationMessage
    ) => {
        await handleICPCall(async () => {
            await transaction();
            await loadData();
            openNotification(
                'Success',
                message.OK,
                NotificationType.SUCCESS,
                NOTIFICATION_DURATION
            );
        }, message.LOADING);
    };

    const storeOrganization = async (params: OrganizationParams) => {
        await writeTransaction(
            () => organizationService.createOrganization(params),
            ORGANIZATION_MESSAGE.SAVE
        );
    };

    const updateOrganization = async (ethAddress: string, params: OrganizationParams) => {
        await writeTransaction(
            () => organizationService.updateOrganization(ethAddress, params),
            ORGANIZATION_MESSAGE.UPDATE
        );
    };

    return (
        <OrganizationContext.Provider
            value={{
                dataLoaded,
                organizations,
                getOrganization,
                storeOrganization,
                updateOrganization,
                loadData
            }}>
            {props.children}
        </OrganizationContext.Provider>
    );
}
