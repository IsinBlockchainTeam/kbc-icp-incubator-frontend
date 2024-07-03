import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import {
    BasicTrade,
    BasicTradeDriver,
    BasicTradeService,
    DocumentDriver,
    DocumentInfo,
    DocumentType,
    TradeType
} from '@kbc-lib/coffee-trading-management-lib';
import { useEthTrade } from '@/providers/entities/EthTradeProvider';
import { contractAddresses } from '@/constants/evm';
import { useSigner } from '@/providers/SignerProvider';
import { ICPContext } from '@/providers/ICPProvider';
import { addLoadingMessage, removeLoadingMessage } from '@/redux/reducers/loadingSlice';
import { TRADE_MESSAGE } from '@/constants/message';
import { NotificationType, openNotification } from '@/utils/notification';
import { NOTIFICATION_DURATION } from '@/constants/notification';
import { useDispatch } from 'react-redux';

export type EthBasicTradeContextState = {
    basicTrades: BasicTrade[];
};
export const EthBasicTradeContext = createContext<EthBasicTradeContextState>(
    {} as EthBasicTradeContextState
);
export const useEthBasicTrade = (): EthBasicTradeContextState => {
    const context = useContext(EthBasicTradeContext);
    if (!context) {
        throw new Error('useEthBasicTrade must be used within an EthBasicTradeProvider.');
    }
    return context;
};
type DetailedBasicTrade = {
    trade: BasicTrade;
    service: BasicTradeService;
    documents: DocumentInfo[];
};
export function EthBasicTradeProvider(props: { children: ReactNode }) {
    const { signer } = useSigner();
    const { rawTrades } = useEthTrade();
    const dispatch = useDispatch();
    const [detailedBasicTrades, setDetailedBasicTrades] = useState<DetailedBasicTrade[]>([]);

    const { fileDriver } = useContext(ICPContext);
    const documentDriver = useMemo(
        () => new DocumentDriver(signer, contractAddresses.DOCUMENT()),
        [signer]
    );

    // Update basic trades if raw trades change
    useEffect(() => {
        loadDetailedTrades();
    }, [rawTrades]);

    const loadDetailedTrades = async () => {
        try {
            dispatch(addLoadingMessage(TRADE_MESSAGE.RETRIEVE.LOADING));
            const detailedBasicTrades: DetailedBasicTrade[] = [];
            await Promise.all(
                rawTrades
                    .filter((rT) => rT.type === TradeType.BASIC)
                    .map(async (rT) => {
                        const concreteService = getBasicTradeService(rT.address);
                        detailedBasicTrades.push({
                            trade: (await concreteService.getTrade()) as BasicTrade,
                            service: concreteService,
                            documents: await concreteService.getDocumentsByType(
                                DocumentType.DELIVERY_NOTE
                            )
                        });
                        return;
                    })
            );
            setDetailedBasicTrades(detailedBasicTrades);
        } catch (e) {
            console.error(e);
            openNotification(
                'Error',
                TRADE_MESSAGE.RETRIEVE.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(TRADE_MESSAGE.RETRIEVE.LOADING));
        }
    };

    const getBasicTradeService = (address: string) =>
        new BasicTradeService(
            new BasicTradeDriver(
                signer,
                address,
                contractAddresses.MATERIAL(),
                contractAddresses.PRODUCT_CATEGORY()
            ),
            documentDriver,
            fileDriver
        );

    const basicTrades = detailedBasicTrades.map((detailedTrade) => detailedTrade.trade);

    return (
        <EthBasicTradeContext.Provider value={{ basicTrades }}>
            {props.children}
        </EthBasicTradeContext.Provider>
    );
}
