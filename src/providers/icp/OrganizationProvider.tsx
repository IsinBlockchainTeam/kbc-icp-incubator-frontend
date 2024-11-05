import React, { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { useSiweIdentity } from '@/providers/SiweIdentityProvider';
import { checkAndGetEnvironmentVariable } from '@/utils/env';
import { ICP } from '@/constants/icp';
import { useDispatch } from 'react-redux';
import { Typography } from 'antd';
import {
    Organization,
    OrganizationDriver,
    OrganizationParams,
    OrganizationService
} from '@kbc-lib/coffee-trading-management-lib';
import { ORGANIZATION_MESSAGE, OrganizationMessage } from '@/constants/message';
import { addLoadingMessage, removeLoadingMessage } from '@/redux/reducers/loadingSlice';
import { NotificationType, openNotification } from '@/utils/notification';
import { NOTIFICATION_DURATION } from '@/constants/notification';

export type OrganizationContextState = {
    dataLoaded: boolean;
    organizations: Map<string, Organization>;
    getOrganization: (ethAddress: string) => Organization | undefined;
    storeOrganization: (params: OrganizationParams) => Promise<void>;
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
    const dispatch = useDispatch();

    if (!identity) {
        return <Typography.Text>Siwe identity not initialized</Typography.Text>;
    }

    const organizationService = useMemo(
        () => new OrganizationService(new OrganizationDriver(identity, entityManagerCanisterId)),
        [identity]
    );

    const loadOrganizations = async () => {
        try {
            dispatch(addLoadingMessage(ORGANIZATION_MESSAGE.RETRIEVE.LOADING));
            const organizations = await organizationService.getOrganizations();
            console.log('Organizations', organizations);

            const organizationsMap = new Map<string, Organization>();

            organizations.forEach((organization) => {
                organizationsMap.set(organization.ethAddress.toLowerCase(), organization);
            });

            setOrganizations(organizationsMap);
        } catch (e: unknown) {
            console.log('Error while loading organizations', e);
            openNotification(
                'Error',
                ORGANIZATION_MESSAGE.RETRIEVE.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(ORGANIZATION_MESSAGE.RETRIEVE.LOADING));
        }
    };

    const loadData = async () => {
        setDataLoaded(false);
        await loadOrganizations();
        setDataLoaded(true);
    };

    const getOrganization = (ethAddress: string): Organization | undefined => {
        return organizations.get(ethAddress.toLowerCase());
    };

    const writeTransaction = async (
        transaction: () => Promise<Organization>,
        message: OrganizationMessage
    ) => {
        try {
            dispatch(addLoadingMessage(message.LOADING));
            await transaction();
            await loadOrganizations();
            openNotification(
                'Success',
                message.OK,
                NotificationType.SUCCESS,
                NOTIFICATION_DURATION
            );
        } catch (e) {
            console.log('Error writing transaction', e);
            openNotification('Error', message.ERROR, NotificationType.ERROR, NOTIFICATION_DURATION);
        } finally {
            dispatch(removeLoadingMessage(message.LOADING));
        }
    };

    const storeOrganization = async (params: OrganizationParams) => {
        await writeTransaction(
            () => organizationService.createOrganization(params),
            ORGANIZATION_MESSAGE.SAVE
        );
    };

    return (
        <OrganizationContext.Provider
            value={{
                dataLoaded,
                organizations,
                getOrganization,
                storeOrganization,
                loadData
            }}>
            {props.children}
        </OrganizationContext.Provider>
    );
}
