import {
    DocumentDriver,
    TradeDriver,
    TradeManagerDriver,
    TradeManagerService,
    TradeService,
    TradeType
} from '@kbc-lib/coffee-trading-management-lib';
import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { contractAddresses } from '@/constants/evm';
import { useSigner } from '@/providers/SignerProvider';
import { useICP } from '@/providers/ICPProvider';
import { addLoadingMessage, removeLoadingMessage } from '@/redux/reducers/loadingSlice';
import { RAW_TRADE_MESSAGE } from '@/constants/message';
import { useDispatch } from 'react-redux';
import { NotificationType, openNotification } from '@/utils/notification';
import { NOTIFICATION_DURATION } from '@/constants/notification';

export type RawTrade = {
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
                    contractAddresses.TRADE(),
                    contractAddresses.MATERIAL(),
                    contractAddresses.PRODUCT_CATEGORY()
                ),
                icpFileDriver: fileDriver
            }),
        [signer]
    );
    const documentDriver = useMemo(
        () => new DocumentDriver(signer, contractAddresses.DOCUMENT()),
        [signer]
    );

    const loadDetailedTrades = async () => {
        try {
            dispatch(addLoadingMessage(RAW_TRADE_MESSAGE.RETRIEVE.LOADING));
            const tradeIds = [
                ...(await tradeManagerService.getTradeIdsOfSupplier(signer.address)),
                ...(await tradeManagerService.getTradeIdsOfCommissioner(signer.address))
            ];
            const tradeAddresses: string[] = [];
            await Promise.allSettled(
                tradeIds.map(async (id) =>
                    tradeAddresses.push(await tradeManagerService.getTrade(id))
                )
            );
            const rawTrades: RawTrade[] = [];
            await Promise.allSettled(
                tradeAddresses.map(async (address) => {
                    const tradeService = new TradeService(
                        new TradeDriver(signer, address),
                        documentDriver,
                        fileDriver
                    );
                    const type = await tradeService.getTradeType();
                    rawTrades.push({ address, type });
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
