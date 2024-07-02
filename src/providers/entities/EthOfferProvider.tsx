import { Offer, OfferDriver, OfferService } from '@kbc-lib/coffee-trading-management-lib';
import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { useSigner } from '@/providers/SignerProvider';
import { useDispatch } from 'react-redux';
import { contractAddresses } from '@/constants/evm';
import { addLoadingMessage, removeLoadingMessage } from '@/redux/reducers/loadingSlice';
import { OFFER_MESSAGE, SUPPLIER_MESSAGE } from '@/constants/message';
import { NotificationType, openNotification } from '@/utils/notification';
import { NOTIFICATION_DURATION } from '@/constants/notification';

export type EthOfferContextState = {
    dataLoaded: boolean;
    offers: Offer[];
    loadData: () => Promise<void>;
    saveOffer: (offerorAddress: string, productCategoryId: number) => Promise<void>;
    saveSupplier: (supplier: string, name: string) => Promise<void>;
};
export const EthOfferContext = createContext<EthOfferContextState>({} as EthOfferContextState);
export const useEthOffer = (): EthOfferContextState => {
    const context = useContext(EthOfferContext);
    if (!context) {
        throw new Error('useEthOffer must be used within an EthOfferProvider.');
    }
    return context;
};
export function EthOfferProvider(props: { children: ReactNode }) {
    const [dataLoaded, setDataLoaded] = useState<boolean>(false);
    const [offers, setOffers] = useState<Offer[]>([]);

    const { signer } = useSigner();
    const dispatch = useDispatch();

    const offerService = useMemo(
        () =>
            new OfferService(
                new OfferDriver(
                    signer,
                    contractAddresses.OFFER(),
                    contractAddresses.PRODUCT_CATEGORY()
                )
            ),
        [signer]
    );

    const loadOffers = async () => {
        try {
            dispatch(addLoadingMessage(OFFER_MESSAGE.RETRIEVE.LOADING));
            const offers = await offerService.getAllOffers();
            setOffers(offers);
        } catch (e) {
            openNotification(
                'Error',
                OFFER_MESSAGE.RETRIEVE.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(OFFER_MESSAGE.RETRIEVE.LOADING));
        }
    };

    const loadData = async () => {
        await loadOffers();
        setDataLoaded(true);
    };

    const saveOffer = async (offerorAddress: string, productCategoryId: number) => {
        try {
            dispatch(addLoadingMessage(OFFER_MESSAGE.SAVE.LOADING));
            await offerService.registerOffer(offerorAddress, productCategoryId);
            openNotification(
                'Success',
                OFFER_MESSAGE.SAVE.OK,
                NotificationType.SUCCESS,
                NOTIFICATION_DURATION
            );
            await loadOffers();
        } catch (e: any) {
            openNotification(
                'Error',
                OFFER_MESSAGE.SAVE.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(OFFER_MESSAGE.SAVE.LOADING));
        }
    };

    const saveSupplier = async (supplier: string, name: string) => {
        try {
            dispatch(addLoadingMessage(SUPPLIER_MESSAGE.SAVE.LOADING));
            await offerService.registerSupplier(supplier, name);
            openNotification(
                'Success',
                SUPPLIER_MESSAGE.SAVE.OK,
                NotificationType.SUCCESS,
                NOTIFICATION_DURATION
            );
        } catch (e: any) {
            openNotification(
                'Error',
                SUPPLIER_MESSAGE.SAVE.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(SUPPLIER_MESSAGE.SAVE.LOADING));
        }
    };

    return (
        <EthOfferContext.Provider value={{ dataLoaded, offers, loadData, saveOffer, saveSupplier }}>
            {props.children}
        </EthOfferContext.Provider>
    );
}
