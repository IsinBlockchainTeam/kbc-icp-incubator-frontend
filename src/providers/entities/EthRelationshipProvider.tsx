import {
    Relationship,
    RelationshipDriver,
    RelationshipService
} from '@kbc-lib/coffee-trading-management-lib';
import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { useSigner } from '@/providers/SignerProvider';
import { useDispatch } from 'react-redux';
import { CONTRACT_ADDRESSES } from '@/constants/evm';
import { addLoadingMessage, removeLoadingMessage } from '@/redux/reducers/loadingSlice';
import { OFFER_MESSAGE } from '@/constants/message';
import { NotificationType, openNotification } from '@/utils/notification';
import { NOTIFICATION_DURATION } from '@/constants/notification';

export type EthRelationshipContextState = {
    dataLoaded: boolean;
    relationships: Relationship[];
    loadData: () => Promise<void>;
};
export const EthRelationshipContext = createContext<EthRelationshipContextState>(
    {} as EthRelationshipContextState
);
export const useEthRelationship = (): EthRelationshipContextState => {
    const context = useContext(EthRelationshipContext);
    if (!context || Object.keys(context).length === 0) {
        throw new Error('useEthRelationship must be used within an EthRelationshipProvider.');
    }
    return context;
};
export function EthRelationshipProvider(props: { children: ReactNode }) {
    const [dataLoaded, setDataLoaded] = useState<boolean>(false);
    const [relationships, setRelationships] = useState<Relationship[]>([]);

    const { signer } = useSigner();
    const dispatch = useDispatch();

    const relationshipService = useMemo(
        () =>
            new RelationshipService(
                new RelationshipDriver(signer, CONTRACT_ADDRESSES.RELATIONSHIP())
            ),
        [signer]
    );

    const loadRelationships = async () => {
        try {
            dispatch(addLoadingMessage(OFFER_MESSAGE.RETRIEVE.LOADING));
            const relationshipIds = await relationshipService.getRelationshipIdsByCompany(
                signer._address
            );
            const relationships: Relationship[] = [];
            await Promise.allSettled(
                relationshipIds.map(async (id) =>
                    relationships.push(await relationshipService.getRelationshipInfo(id))
                )
            );
            setRelationships(relationships);
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
        await loadRelationships();
        setDataLoaded(true);
    };

    return (
        <EthRelationshipContext.Provider value={{ dataLoaded, relationships, loadData }}>
            {props.children}
        </EthRelationshipContext.Provider>
    );
}
