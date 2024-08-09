import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import {
    BasicTrade,
    BasicTradeDriver,
    BasicTradeMetadata,
    BasicTradeService,
    DocumentDriver,
    DocumentInfo,
    DocumentType,
    Line,
    LineRequest,
    TradeManagerDriver,
    TradeManagerService,
    TradeType,
    URLStructure
} from '@kbc-lib/coffee-trading-management-lib';
import { useEthRawTrade } from '@/providers/entities/EthRawTradeProvider';
import { CONTRACT_ADDRESSES } from '@/constants/evm';
import { useSigner } from '@/providers/SignerProvider';
import { useICP } from '@/providers/ICPProvider';
import { addLoadingMessage, removeLoadingMessage } from '@/redux/reducers/loadingSlice';
import { BASIC_TRADE_MESSAGE } from '@/constants/message';
import { NotificationType, openNotification } from '@/utils/notification';
import { NOTIFICATION_DURATION } from '@/constants/notification';
import { useDispatch, useSelector } from 'react-redux';
import { getICPCanisterURL } from '@/utils/icp';
import { ICP } from '@/constants/icp';
import { useEthMaterial } from '@/providers/entities/EthMaterialProvider';
import { RootState } from '@/redux/store';

export type BasicTradeRequest = {
    supplier: string;
    customer: string;
    commissioner: string;
    lines: LineRequest[];
    name: string;
};
export type EthBasicTradeContextState = {
    basicTrades: BasicTrade[];
    saveBasicTrade: (basicTradeRequest: BasicTradeRequest) => Promise<void>;
    updateBasicTrade: (tradeId: number, basicTradeRequest: BasicTradeRequest) => Promise<void>;
    getBasicTradeDocuments: (tradeId: number) => DocumentInfo[];
};
export const EthBasicTradeContext = createContext<EthBasicTradeContextState>(
    {} as EthBasicTradeContextState
);
export const useEthBasicTrade = (): EthBasicTradeContextState => {
    const context = useContext(EthBasicTradeContext);
    if (!context || Object.keys(context).length === 0) {
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
    const { signer, waitForTransactions } = useSigner();
    const { rawTrades } = useEthRawTrade();
    const { productCategories } = useEthMaterial();
    const dispatch = useDispatch();
    const [detailedBasicTrades, setDetailedBasicTrades] = useState<DetailedBasicTrade[]>([]);
    const { fileDriver } = useICP();
    const userInfo = useSelector((state: RootState) => state.userInfo);
    const organizationId = parseInt(userInfo.organizationId);

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

    // Update basic trades if raw trades change
    useEffect(() => {
        loadDetailedTrades();
    }, [rawTrades]);

    const loadDetailedTrades = async () => {
        try {
            dispatch(addLoadingMessage(BASIC_TRADE_MESSAGE.RETRIEVE.LOADING));
            const detailedBasicTrades: DetailedBasicTrade[] = [];
            await Promise.allSettled(
                rawTrades
                    .filter((rT) => rT.type === TradeType.BASIC)
                    .map(async (rT) => {
                        const concreteService = getBasicTradeService(rT.address);
                        detailedBasicTrades.push({
                            trade: await concreteService.getTrade(),
                            service: concreteService,
                            documents: await concreteService.getDocumentsByType(
                                DocumentType.DELIVERY_NOTE
                            )
                        });
                    })
            );
            setDetailedBasicTrades(detailedBasicTrades);
        } catch (e) {
            openNotification(
                'Error',
                BASIC_TRADE_MESSAGE.RETRIEVE.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(BASIC_TRADE_MESSAGE.RETRIEVE.LOADING));
        }
    };

    const getBasicTradeService = (address: string) =>
        new BasicTradeService(
            new BasicTradeDriver(
                signer,
                address,
                CONTRACT_ADDRESSES.MATERIAL(),
                CONTRACT_ADDRESSES.PRODUCT_CATEGORY()
            ),
            documentDriver,
            fileDriver
        );

    const saveBasicTrade = async (basicTradeRequest: BasicTradeRequest) => {
        try {
            dispatch(addLoadingMessage(BASIC_TRADE_MESSAGE.SAVE.LOADING));
            // TODO: remove this harcoded value
            const delegatedOrganizationIds: number[] = organizationId === 0 ? [1] : [0];
            const urlStructure: URLStructure = {
                prefix: getICPCanisterURL(ICP.CANISTER_ID_ORGANIZATION),
                organizationId
            };
            const metadata: BasicTradeMetadata = {
                issueDate: new Date()
            };
            const [, newTradeAddress, transactionHash] =
                await tradeManagerService.registerBasicTrade(
                    basicTradeRequest.supplier,
                    basicTradeRequest.customer,
                    basicTradeRequest.commissioner,
                    basicTradeRequest.name,
                    metadata,
                    urlStructure,
                    delegatedOrganizationIds
                );
            await waitForTransactions(
                transactionHash,
                Number(process.env.REACT_APP_BC_CONFIRMATION_NUMBER || 0)
            );
            const basicTradeService = getBasicTradeService(newTradeAddress);
            for (const line of basicTradeRequest.lines) {
                await basicTradeService.addLine(line);
            }
            await loadDetailedTrades();
            openNotification(
                'Success',
                BASIC_TRADE_MESSAGE.SAVE.OK,
                NotificationType.SUCCESS,
                NOTIFICATION_DURATION
            );
        } catch (e: any) {
            openNotification(
                'Error',
                BASIC_TRADE_MESSAGE.SAVE.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(BASIC_TRADE_MESSAGE.SAVE.LOADING));
        }
    };

    const updateBasicTrade = async (tradeId: number, basicTradeRequest: BasicTradeRequest) => {
        try {
            dispatch(addLoadingMessage(BASIC_TRADE_MESSAGE.UPDATE.LOADING));
            const detailedBasicTrade = detailedBasicTrades.find((t) => t.trade.tradeId === tradeId);
            if (!detailedBasicTrade) return Promise.reject('Trade not found');
            const oldTrade = detailedBasicTrade.trade;
            const basicTradeService = detailedBasicTrade.service;

            if (oldTrade.name !== basicTradeRequest.name)
                await basicTradeService.setName(basicTradeRequest.name);

            // update one single line because at this time we manage only one line per trade
            const oldLine = oldTrade.lines[0];
            const newLine = basicTradeRequest.lines[0];
            if (!oldLine || !newLine) return;

            // Note assigned material is ignored as it is not changeable in the UI
            if (
                oldLine.productCategory.id !== newLine.productCategoryId ||
                oldLine.unit !== newLine.unit ||
                oldLine.quantity !== newLine.quantity
            ) {
                const productCategory = productCategories.find(
                    (pc) => pc.id === newLine.productCategoryId
                );
                if (!productCategory) return Promise.reject('Product category not found');
                await basicTradeService.updateLine(
                    new Line(
                        oldLine.id,
                        oldLine.material,
                        productCategory,
                        newLine.quantity,
                        newLine.unit
                    )
                );
            }
            await loadDetailedTrades();
            openNotification(
                'Success',
                BASIC_TRADE_MESSAGE.UPDATE.OK,
                NotificationType.SUCCESS,
                NOTIFICATION_DURATION
            );
        } catch (e: any) {
            openNotification(
                'Error',
                BASIC_TRADE_MESSAGE.UPDATE.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(BASIC_TRADE_MESSAGE.UPDATE.LOADING));
        }
    };

    const basicTrades = detailedBasicTrades.map((detailedTrade) => detailedTrade.trade);
    const getBasicTradeDocuments = (tradeId: number) =>
        detailedBasicTrades.find((t) => t.trade.tradeId === tradeId)?.documents || [];

    return (
        <EthBasicTradeContext.Provider
            value={{ basicTrades, saveBasicTrade, updateBasicTrade, getBasicTradeDocuments }}>
            {props.children}
        </EthBasicTradeContext.Provider>
    );
}
