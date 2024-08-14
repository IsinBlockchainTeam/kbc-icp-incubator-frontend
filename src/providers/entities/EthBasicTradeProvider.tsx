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
import { useParams } from 'react-router-dom';

export type BasicTradeRequest = {
    supplier: string;
    customer: string;
    commissioner: string;
    lines: LineRequest[];
    name: string;
};
export type EthBasicTradeContextState = {
    detailedBasicTrade: DetailedBasicTrade | null;
    saveBasicTrade: (basicTradeRequest: BasicTradeRequest) => Promise<void>;
    updateBasicTrade: (basicTradeRequest: BasicTradeRequest) => Promise<void>;
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
    const { id } = useParams();
    const { signer, waitForTransactions } = useSigner();
    const { rawTrades, loadData: loadRawTrades } = useEthRawTrade();
    const { productCategories } = useEthMaterial();
    const dispatch = useDispatch();
    const [detailedBasicTrade, setDetailedBasicTrade] = useState<DetailedBasicTrade | null>(null);
    const { fileDriver } = useICP();
    const userInfo = useSelector((state: RootState) => state.userInfo);
    const organizationId = parseInt(userInfo.companyClaims.organizationId);

    const rawTrade = useMemo(
        () =>
            rawTrades.find(
                (t) => id !== undefined && t.id === Number(id) && t.type == TradeType.BASIC
            ),
        [rawTrades, id]
    );
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

    const basicTradeService = useMemo(() => {
        if (!rawTrade) return undefined;
        return getBasicTradeService(rawTrade.address);
    }, [signer, rawTrade]);

    // Update basic trades if raw trades change
    useEffect(() => {
        if (rawTrade) loadData();
    }, [rawTrade]);

    const loadData = async () => {
        if (!basicTradeService) return;
        try {
            dispatch(addLoadingMessage(BASIC_TRADE_MESSAGE.RETRIEVE.LOADING));
            const detailedBasicTrade = {
                trade: await basicTradeService.getTrade(),
                service: basicTradeService,
                documents: await basicTradeService.getDocumentsByType(DocumentType.DELIVERY_NOTE)
            };
            setDetailedBasicTrade(detailedBasicTrade);
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
            await loadRawTrades();
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

    const updateBasicTrade = async (basicTradeRequest: BasicTradeRequest) => {
        if (!basicTradeService) return Promise.reject('Basic trade service not initialized');
        if (!detailedBasicTrade) return Promise.reject('Trade not found');
        try {
            dispatch(addLoadingMessage(BASIC_TRADE_MESSAGE.UPDATE.LOADING));

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
            await loadData();
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

    return (
        <EthBasicTradeContext.Provider
            value={{ detailedBasicTrade, saveBasicTrade, updateBasicTrade }}>
            {props.children}
        </EthBasicTradeContext.Provider>
    );
}
