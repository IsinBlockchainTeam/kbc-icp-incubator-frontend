import {
    AssetOperationDriver,
    AssetOperationService,
    GraphData as LibGraphData,
    GraphService,
    TradeManagerDriver,
    TradeManagerService
} from '@kbc-lib/coffee-trading-management-lib';
import { createContext, ReactNode, useContext, useMemo } from 'react';
import { useSigner } from '@/providers/SignerProvider';
import { useDispatch, useSelector } from 'react-redux';
import { CONTRACT_ADDRESSES } from '@/constants/evm';
import { addLoadingMessage, removeLoadingMessage } from '@/redux/reducers/loadingSlice';
import { GRAPH_MESSAGE } from '@/constants/message';
import { NotificationType, openNotification } from '@/utils/notification';
import { NOTIFICATION_DURATION } from '@/constants/notification';
import { useICP } from '@/providers/ICPProvider';
import { RootState } from '@/redux/store';

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

    const roleProof = useSelector((state: RootState) => state.userInfo.roleProof);

    const graphService = useMemo(
        () =>
            new GraphService(
                signer,
                new TradeManagerService({
                    tradeManagerDriver: new TradeManagerDriver(
                        signer,
                        CONTRACT_ADDRESSES.TRADE(),
                        CONTRACT_ADDRESSES.MATERIAL(),
                        CONTRACT_ADDRESSES.PRODUCT_CATEGORY()
                    ),
                    icpFileDriver: fileDriver
                }),
                new AssetOperationService(
                    new AssetOperationDriver(
                        signer,
                        CONTRACT_ADDRESSES.ASSET_OPERATION(),
                        CONTRACT_ADDRESSES.MATERIAL(),
                        CONTRACT_ADDRESSES.PRODUCT_CATEGORY()
                    )
                )
            ),
        [signer]
    );

    const computeGraph = async (materialId: number) => {
        try {
            dispatch(addLoadingMessage(GRAPH_MESSAGE.COMPUTE.LOADING));
            return await graphService.computeGraph(roleProof, materialId, true);
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
