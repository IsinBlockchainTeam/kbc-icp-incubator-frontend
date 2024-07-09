import React, { createContext, type ReactNode } from 'react';
import { useSiweIdentity } from './SiweIdentityProvider';
import { ICPIdentityDriver, ICPOrganizationDriver, ICPStorageDriver } from '@blockchain-lib/common';
import { ICPFileDriver } from '@kbc-lib/coffee-trading-management-lib';
import { Typography } from 'antd';
import { useICPDrivers } from '@/providers/hooks/useICPDrivers';

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
    if (!context) {
        throw new Error('useICP must be used within an ICPProvider.');
    }
    return context;
};
export function ICPProvider({ children }: { children: ReactNode }) {
    const { identity } = useSiweIdentity();

    if (!identity) {
        return <Typography.Text>Siwe identity not initialized</Typography.Text>;
    }

    const {
        icpOrganizationDriver,
        icpStorageDriver,
        icpFileDriver,
        icpIdentityDriver,
        getNameByDID
    } = useICPDrivers()!;

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
