import React, { createContext, type ReactNode, useMemo } from 'react';
import { useSiweIdentity } from './SiweIdentityProvider';
import { ICPIdentityDriver, ICPStorageDriver } from '@isinblockchainteam/kbc-icp-incubator-common';
import { ICPFileDriver, URL_SEGMENT_INDEXES } from '@isinblockchainteam/kbc-icp-incubator-library';
import { Typography } from 'antd';
import { checkAndGetEnvironmentVariable } from '@/utils/env';
import { ICP } from '@/constants/icp';
import { request } from '@/utils/request';
import { requestPath } from '@/constants/url';

export type ICPContextState = {
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
    const icpStorageDriver = useMemo(
        () => new ICPStorageDriver(identity, driverCanisterIds.storage),
        [identity]
    );
    const icpFileDriver = useMemo(() => new ICPFileDriver(icpStorageDriver), [icpStorageDriver]);
    const icpIdentityDriver = useMemo(() => new ICPIdentityDriver(identity), [identity]);

    const getNameByDID = async (did: string): Promise<string> => {
        return 'unknown';
    };

    return (
        <ICPContext.Provider
            value={{
                storageDriver: icpStorageDriver,
                fileDriver: icpFileDriver,
                identityDriver: icpIdentityDriver,
                getNameByDID
            }}>
            {children}
        </ICPContext.Provider>
    );
}
