import { Organization } from '@kbc-lib/coffee-trading-management-lib';
import React, { createContext, useContext } from 'react';
import { useOrganization } from '@/providers/entities/icp/OrganizationProvider';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

export type SessionContextState = {
    getLoggedOrganization: () => Organization;
};
export const SessionContext = createContext<SessionContextState>({} as SessionContextState);
export const useSession = (): SessionContextState => {
    const context = useContext(SessionContext);
    if (!context || Object.keys(context).length === 0) {
        throw new Error('useSessionProvider must be used within an SessionProvider.');
    }
    return context;
};
export function SessionProvider({ children }: { children: React.ReactNode }) {
    const { getOrganization } = useOrganization();
    const userInfo = useSelector((state: RootState) => state.userInfo);

    const getLoggedOrganization = () => {
        return getOrganization(userInfo.roleProof.delegator);
    };

    return (
        <SessionContext.Provider
            value={{
                getLoggedOrganization
            }}>
            {children}
        </SessionContext.Provider>
    );
}
