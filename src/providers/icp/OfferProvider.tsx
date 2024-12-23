import React, { createContext, ReactNode, useMemo, useState } from 'react';
import { ICPOfferDriver, ICPOfferService, Offer } from '@isinblockchainteam/kbc-icp-incubator-library';
import { useSiweIdentity } from '@/providers/SiweIdentityProvider';
import { checkAndGetEnvironmentVariable } from '@/utils/env';
import { ICP } from '@/constants/icp';
import { Typography } from 'antd';
import { OFFER_MESSAGE, PRODUCT_CATEGORY_MESSAGE } from '@/constants/message';
import { NotificationType, openNotification } from '@/utils/notification';
import { NOTIFICATION_DURATION } from '@/constants/notification';
import { useCallHandler } from '@/providers/icp/CallHandlerProvider';

export type OfferContextState = {
    dataLoaded: boolean;
    offers: Offer[];
    loadData: () => Promise<void>;
    saveOffer: (productCategoryId: number) => Promise<void>;
};
export const OfferContext = createContext<OfferContextState>({} as OfferContextState);
export const useOffer = (): OfferContextState => {
    const context = React.useContext(OfferContext);
    if (!context || Object.keys(context).length === 0) {
        throw new Error('useOffer must be used within an OfferProvider.');
    }
    return context;
};
export function OfferProvider(props: { children: ReactNode }) {
    const { identity } = useSiweIdentity();
    const entityManagerCanisterId = checkAndGetEnvironmentVariable(ICP.CANISTER_ID_ENTITY_MANAGER);
    const [dataLoaded, setDataLoaded] = useState<boolean>(false);
    const [offers, setOffers] = useState<Offer[]>([]);
    const { handleICPCall } = useCallHandler();

    if (!identity) {
        return <Typography.Text>Siwe identity not initialized</Typography.Text>;
    }

    const offerService = useMemo(
        () => new ICPOfferService(new ICPOfferDriver(identity, entityManagerCanisterId)),
        [identity]
    );

    const loadData = async () => {
        await loadOffers();
        setDataLoaded(true);
    };

    const loadOffers = async () => {
        await handleICPCall(async () => {
            const offers = await offerService.getOffers();
            setOffers(offers);
        }, OFFER_MESSAGE.RETRIEVE.LOADING);
    };

    const saveOffer = async (productCategoryId: number) => {
        await handleICPCall(async () => {
            await offerService.createOffer(productCategoryId);
            openNotification(
                'Success',
                PRODUCT_CATEGORY_MESSAGE.SAVE.OK,
                NotificationType.SUCCESS,
                NOTIFICATION_DURATION
            );
            await loadOffers();
        }, OFFER_MESSAGE.SAVE.LOADING);
    };

    return (
        <OfferContext.Provider
            value={{
                dataLoaded,
                offers,
                loadData,
                saveOffer
            }}>
            {props.children}
        </OfferContext.Provider>
    );
}
