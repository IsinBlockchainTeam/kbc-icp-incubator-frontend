import {
    AssetOperationDriver,
    AssetOperationService,
    GraphService,
    TradeManagerDriver,
    TradeManagerService,
    GraphData as LibGraphData
} from '@kbc-lib/coffee-trading-management-lib';
import { createContext, ReactNode, useContext, useMemo } from 'react';
import { useSigner } from '@/providers/SignerProvider';
import { useDispatch } from 'react-redux';
import { contractAddresses } from '@/constants/evm';
import { addLoadingMessage, removeLoadingMessage } from '@/redux/reducers/loadingSlice';
import { GRAPH_MESSAGE } from '@/constants/message';
import { NotificationType, openNotification } from '@/utils/notification';
import { NOTIFICATION_DURATION } from '@/constants/notification';
import { useICP } from '@/providers/ICPProvider';

export type EthGraphContextState = {
    dataLoaded: boolean;
    loadData: () => Promise<void>;
    computeGraph: (materialId: number) => Promise<LibGraphData | null>;
};
export const EthGraphContext = createContext<EthGraphContextState>({} as EthGraphContextState);
export const useEthGraph = (): EthGraphContextState => {
    const context = useContext(EthGraphContext);
    if (!context || Object.keys(context).length === 0) {
        throw new Error('useEthGraph must be used within an EthGraphProvider.');
    }
    return context;
};
export function EthGraphProvider(props: { children: ReactNode }) {
    const dataLoaded = true;
    const { fileDriver } = useICP();
    const { signer } = useSigner();
    const dispatch = useDispatch();

    const graphService = useMemo(
        () =>
            new GraphService(
                signer,
                new TradeManagerService({
                    tradeManagerDriver: new TradeManagerDriver(
                        signer,
                        contractAddresses.TRADE(),
                        contractAddresses.MATERIAL(),
                        contractAddresses.PRODUCT_CATEGORY()
                    ),
                    icpFileDriver: fileDriver
                }),
                new AssetOperationService(
                    new AssetOperationDriver(
                        signer,
                        contractAddresses.ASSET_OPERATION(),
                        contractAddresses.MATERIAL(),
                        contractAddresses.PRODUCT_CATEGORY()
                    )
                )
            ),
        [signer]
    );

    const computeGraph = async (materialId: number) => {
        try {
            dispatch(addLoadingMessage(GRAPH_MESSAGE.COMPUTE.LOADING));
            const result = await graphService.computeGraph(materialId, true);
            return result;
        } catch (e) {
            openNotification(
                'Error',
                GRAPH_MESSAGE.COMPUTE.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(GRAPH_MESSAGE.COMPUTE.LOADING));
        }
        return null;
    };

    const loadData = async () => {};

    return (
        <EthGraphContext.Provider value={{ dataLoaded, computeGraph, loadData }}>
            {props.children}
        </EthGraphContext.Provider>
    );
}
