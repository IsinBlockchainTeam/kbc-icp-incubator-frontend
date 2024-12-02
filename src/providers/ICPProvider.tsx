import React, { createContext, type ReactNode, useMemo } from 'react';
import { useSiweIdentity } from './SiweIdentityProvider';
import { FileDriver, IdentityDriver, StorageDriver } from '@kbc-lib/coffee-trading-management-lib';
import { Typography } from 'antd';
import { checkAndGetEnvironmentVariable } from '@/utils/env';
import { ICP } from '@/constants/icp';

export type ICPContextState = {
    storageDriver: StorageDriver;
    fileDriver: FileDriver;
    identityDriver: IdentityDriver;
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
    const icpStorageDriver = useMemo(() => new StorageDriver(identity, driverCanisterIds.storage), [identity]);
    const icpFileDriver = useMemo(() => new FileDriver(icpStorageDriver), [icpStorageDriver]);
    const icpIdentityDriver = useMemo(() => new IdentityDriver(identity), [identity]);

    return (
        <ICPContext.Provider
            value={{
                storageDriver: icpStorageDriver,
                fileDriver: icpFileDriver,
                identityDriver: icpIdentityDriver
            }}>
            {children}
        </ICPContext.Provider>
    );
}
