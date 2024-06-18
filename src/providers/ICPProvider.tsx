import React, { createContext, type ReactNode } from 'react';
import { useSiweIdentity } from './SiweIdentityProvider';
import { ICPIdentityDriver, ICPOrganizationDriver, ICPStorageDriver } from '@blockchain-lib/common';
import { ICPFileDriver, URL_SEGMENT_INDEXES } from '@kbc-lib/coffee-trading-management-lib';
import { Typography } from 'antd';
import { request } from '@/utils/request';

import { checkAndGetEnvironmentVariable } from '@/utils/env';
import { requestPath } from '@/constants/url';
import { ICP } from '@/constants/icp';

type ICPContextState = {
    organizationDriver: ICPOrganizationDriver;
    storageDriver: ICPStorageDriver;
    fileDriver: ICPFileDriver;
    identityDriver: ICPIdentityDriver;
    getNameByDID: (did: string) => Promise<string>;
};
export const ICPContext = createContext<ICPContextState>({} as ICPContextState);

export const getNameByDID = async (
    organizationDriver: ICPOrganizationDriver,
    did: string
): Promise<string> => {
    let serviceUrl;
    try {
        const didDocument = await request(
            `${requestPath.VERIFIER_BACKEND_URL}/identifiers/resolve?did-url=${did}`,
            {
                method: 'GET'
            }
        );

        serviceUrl = didDocument.didDocument.service[0].serviceEndpoint;
    } catch (e) {
        console.log('Error getting service URL', e);
        return 'Unknown';
    }

    const canisterId = serviceUrl.split('/')[URL_SEGMENT_INDEXES.CANISTER_ID].split('.')[0];
    if (canisterId != ICP.CANISTER_ID_ORGANIZATION) {
        console.log('Unknown canister ID');
        return 'Unknown';
    }

    const organizationId = serviceUrl.split('/')[URL_SEGMENT_INDEXES.ORGANIZATION_ID];

    let verifiablePresentation;
    try {
        verifiablePresentation = await organizationDriver.getVerifiablePresentation(organizationId);
    } catch (e) {
        console.log('Error getting verifiable presentation', e);
        return 'Unknown';
    }

    return verifiablePresentation.legalName;
};

export function ICPProvider({ children }: { children: ReactNode }) {
    const { identity } = useSiweIdentity();

    if (!identity) {
        return <Typography.Text>Siwe identity not initialized</Typography.Text>;
    }

    const driverCanisterIds = {
        organization: checkAndGetEnvironmentVariable(ICP.CANISTER_ID_ORGANIZATION),
        storage: checkAndGetEnvironmentVariable(ICP.CANISTER_ID_STORAGE)
    };
    const icpOrganizationDriver = new ICPOrganizationDriver(
        identity,
        driverCanisterIds.organization
    );
    const icpStorageDriver = new ICPStorageDriver(identity, driverCanisterIds.storage);
    const icpFileDriver = new ICPFileDriver(icpStorageDriver);
    const icpIdentityDriver = new ICPIdentityDriver(identity);

    return (
        <ICPContext.Provider
            value={{
                organizationDriver: icpOrganizationDriver,
                storageDriver: icpStorageDriver,
                fileDriver: icpFileDriver,
                identityDriver: icpIdentityDriver,
                getNameByDID: (did: string) => getNameByDID(icpOrganizationDriver, did)
            }}>
            {children}
        </ICPContext.Provider>
    );
}
