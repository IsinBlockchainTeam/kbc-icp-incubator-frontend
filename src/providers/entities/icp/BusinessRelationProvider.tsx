import { ICP } from '@/constants/icp';
import { BUSINESS_RELATION_MESSAGE } from '@/constants/message';
import { useSiweIdentity } from '@/providers/auth/SiweIdentityProvider';
import { useCallHandler } from '@/providers/errors/CallHandlerProvider';
import { checkAndGetEnvironmentVariable } from '@/utils/env';
import { BusinessRelation, BusinessRelationDriver, BusinessRelationService } from '@kbc-lib/coffee-trading-management-lib';
import { Typography } from 'antd';
import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { useOrganization } from './OrganizationProvider';

export type BusinessRelationProviderContextState = {
    dataLoaded: boolean;
    businessRelations: BusinessRelation[];
    getBusinessRelation: (ethAddress: string) => BusinessRelation;
    discloseInformation: (ethAddress: string) => Promise<void>;
    loadData: () => Promise<void>;
};

export const BusinessRelationProviderContext = createContext<BusinessRelationProviderContextState>({} as BusinessRelationProviderContextState);

export const useBusinessRelation = (): BusinessRelationProviderContextState => {
    const context = useContext(BusinessRelationProviderContext);
    if (!context || Object.keys(context).length === 0) {
        throw new Error('useBusinessRelation must be used within an BusinessRelationProvider.');
    }
    return context;
};

export const BusinessRelationProvider = (props: { children: ReactNode }) => {
    const { identity } = useSiweIdentity();
    const entityManagerCanisterId = checkAndGetEnvironmentVariable(ICP.CANISTER_ID_ENTITY_MANAGER);
    const { loadData } = useOrganization();
    const { handleICPCall } = useCallHandler();
    const [dataLoaded, setDataLoaded] = useState<boolean>(false);
    const [businessRelations, setBusinessRelations] = useState<BusinessRelation[]>([]);

    if (!identity) {
        return <Typography.Text>Siwe identity not initialized</Typography.Text>;
    }

    const businessRelationService = useMemo(
        () => new BusinessRelationService(new BusinessRelationDriver(identity, entityManagerCanisterId)),
        [identity]
    );

    const loadBusinessRelations = async () => {
        await handleICPCall(async () => {
            const businessRelations = await businessRelationService.getBusinessRelations();
            setBusinessRelations(businessRelations);
        }, BUSINESS_RELATION_MESSAGE.RETRIEVE.LOADING);
    };

    const loadBusinessRelationsWrapped = async () => {
        setDataLoaded(false);
        await loadBusinessRelations();
        setDataLoaded(true);
    };

    const discloseInformation = async (ethAddress: string) => {
        await handleICPCall(async () => {
            await businessRelationService.createBusinessRelation(ethAddress);
        }, BUSINESS_RELATION_MESSAGE.SAVE.LOADING);

        await loadBusinessRelations();

        await loadData();
    };

    const getBusinessRelation = (ethAddress: string) => {
        const businessRelation = businessRelations.filter(
            (businessRelation) => businessRelation.ethAddressB.toLowerCase() === ethAddress.toLowerCase()
        )[0];

        if (!businessRelation) {
            throw new Error('Business relation not found');
        }

        return businessRelation;
    };

    return (
        <BusinessRelationProviderContext.Provider
            value={{
                dataLoaded,
                businessRelations,
                discloseInformation,
                getBusinessRelation,
                loadData: loadBusinessRelationsWrapped
            }}>
            {props.children}
        </BusinessRelationProviderContext.Provider>
    );
};
