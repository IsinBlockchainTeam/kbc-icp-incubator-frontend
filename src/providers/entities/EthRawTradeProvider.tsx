import {
    DocumentDriver,
    TradeDriver,
    TradeManagerDriver,
    TradeManagerService,
    TradeService,
    TradeType
} from '@kbc-lib/coffee-trading-management-lib';
import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { CONTRACT_ADDRESSES } from '@/constants/evm';
import { useSigner } from '@/providers/SignerProvider';
import { useICP } from '@/providers/ICPProvider';
import { addLoadingMessage, removeLoadingMessage } from '@/redux/reducers/loadingSlice';
import { RAW_TRADE_MESSAGE } from '@/constants/message';
import { useDispatch } from 'react-redux';
import { NotificationType, openNotification } from '@/utils/notification';
import { NOTIFICATION_DURATION } from '@/constants/notification';

export type RawTrade = {
    id: number;
    address: string;
    type: TradeType;
};
export type EthRawTradeContextState = {
    dataLoaded: boolean;
    rawTrades: RawTrade[];
    loadData: () => Promise<void>;
};
export const EthRawTradeContext = createContext<EthRawTradeContextState>(
    {} as EthRawTradeContextState
);
export const useEthRawTrade = (): EthRawTradeContextState => {
    const context = useContext(EthRawTradeContext);
    if (!context || Object.keys(context).length === 0) {
        throw new Error('useEthRawTrade must be used within an EthRawTradeProvider.');
    }
    return context;
};
export function EthRawTradeProvider(props: { children: ReactNode }) {
    const [dataLoaded, setDataLoaded] = useState<boolean>(false);
    const [rawTrades, setRawTrades] = useState<RawTrade[]>([]);
    const { signer } = useSigner();
    const { fileDriver } = useICP();
    const dispatch = useDispatch();

    const tradeManagerService = useMemo(
        () =>
            new TradeManagerService({
                tradeManagerDriver: new TradeManagerDriver(
                    signer,
                    CONTRACT_ADDRESSES.TRADE(),
                    CONTRACT_ADDRESSES.MATERIAL(),
                    CONTRACT_ADDRESSES.PRODUCT_CATEGORY()
                ),
                icpFileDriver: fileDriver
            }),
        [signer]
    );
    const documentDriver = useMemo(
        () => new DocumentDriver(signer, CONTRACT_ADDRESSES.DOCUMENT()),
        [signer]
    );

    const loadDetailedTrades = async () => {
        try {
            dispatch(addLoadingMessage(RAW_TRADE_MESSAGE.RETRIEVE.LOADING));
            const tradeIds = [
                ...(await tradeManagerService.getTradeIdsOfSupplier(signer._address)),
                ...(await tradeManagerService.getTradeIdsOfCommissioner(signer._address))
            ];
            const rawTrades: RawTrade[] = [];
            await Promise.allSettled(
                tradeIds.map(async (id) => {
                    const address = await tradeManagerService.getTrade(id);
                    const tradeService = new TradeService(
                        new TradeDriver(signer, address),
                        documentDriver,
                        fileDriver
                    );
                    const type = await tradeService.getTradeType();
                    rawTrades.push({ id, address, type });
                })
            );
            setRawTrades(rawTrades);
        } catch (e) {
            openNotification(
                'Error',
                RAW_TRADE_MESSAGE.RETRIEVE.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(RAW_TRADE_MESSAGE.RETRIEVE.LOADING));
        }
    };

    const loadData = async () => {
        await loadDetailedTrades();
        setDataLoaded(true);
    };

    return (
        <EthRawTradeContext.Provider
            value={{
                dataLoaded,
                rawTrades,
                loadData
            }}>
            {props.children}
        </EthRawTradeContext.Provider>
    );
}
