import React, { createContext, type ReactNode, useMemo } from 'react';
import { useSiweIdentity } from './SiweIdentityProvider';
import { ICPIdentityDriver, ICPOrganizationDriver, ICPStorageDriver } from '@blockchain-lib/common';
import { ICPFileDriver, URL_SEGMENT_INDEXES } from '@kbc-lib/coffee-trading-management-lib';
import { Typography } from 'antd';
import { checkAndGetEnvironmentVariable } from '@/utils/env';
import { ICP } from '@/constants/icp';
import { request } from '@/utils/request';
import { requestPath } from '@/constants/url';

export type ICPContextState = {
    organizationDriver: ICPOrganizationDriver;
    storageDriver: ICPStorageDriver;
    fileDriver: ICPFileDriver;
    identityDriver: ICPIdentityDriver;
    getNameByDID: (did: string) => Promise<string>;
};
export const ICPContext = createContext<ICPContextState>({} as ICPContextState);
export const useICP = (): ICPContextState => {
    const context = React.useContext(ICPContext);
    if (!context || Object.keys(context).length === 0) {
        throw new Error('useICP must be used within an ICPProvider.');
    }
    return context;
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
    const icpOrganizationDriver = useMemo(
        () => new ICPOrganizationDriver(identity, driverCanisterIds.organization),
        [identity]
    );
    const icpStorageDriver = useMemo(
        () => new ICPStorageDriver(identity, driverCanisterIds.storage),
        [identity]
    );
    const icpFileDriver = useMemo(() => new ICPFileDriver(icpStorageDriver), [icpStorageDriver]);
    const icpIdentityDriver = useMemo(() => new ICPIdentityDriver(identity), [identity]);

    const getNameByDID = async (did: string): Promise<string> => {
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
            console.log('Error getting service URL');
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
            verifiablePresentation =
                await icpOrganizationDriver.getVerifiablePresentation(organizationId);
        } catch (e) {
            console.log('Error getting verifiable presentation');
            return 'Unknown';
        }
        return verifiablePresentation.legalName;
    };

    return (
        <ICPContext.Provider
            value={{
                organizationDriver: icpOrganizationDriver,
                storageDriver: icpStorageDriver,
                fileDriver: icpFileDriver,
                identityDriver: icpIdentityDriver,
                getNameByDID
            }}>
            {children}
        </ICPContext.Provider>
    );
}
