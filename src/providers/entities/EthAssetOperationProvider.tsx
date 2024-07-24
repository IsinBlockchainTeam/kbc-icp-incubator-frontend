import {
    AssetOperation,
    AssetOperationDriver,
    AssetOperationService
} from '@kbc-lib/coffee-trading-management-lib';
import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { useSigner } from '@/providers/SignerProvider';
import { useDispatch } from 'react-redux';
import { CONTRACT_ADDRESSES } from '@/constants/evm';
import { addLoadingMessage, removeLoadingMessage } from '@/redux/reducers/loadingSlice';
import { ASSET_OPERATION_MESSAGE } from '@/constants/message';
import { NotificationType, openNotification } from '@/utils/notification';
import { NOTIFICATION_DURATION } from '@/constants/notification';

export type AssetOperationRequest = {
    name: string;
    inputMaterialIds: number[];
    outputMaterialId: number;
    latitude: string;
    longitude: string;
    processTypes: string[];
};
export type EthAssetOperationContextState = {
    dataLoaded: boolean;
    assetOperations: AssetOperation[];
    loadData: () => Promise<void>;
    saveAssetOperation: (assetOperationRequest: AssetOperationRequest) => Promise<void>;
};
export const EthAssetOperationContext = createContext<EthAssetOperationContextState>(
    {} as EthAssetOperationContextState
);
export const useEthAssetOperation = (): EthAssetOperationContextState => {
    const context = useContext(EthAssetOperationContext);
    if (!context || Object.keys(context).length === 0) {
        throw new Error('useEthAssetOperation must be used within an EthAssetOperationProvider.');
    }
    return context;
};
export function EthAssetOperationProvider(props: { children: ReactNode }) {
    const [dataLoaded, setDataLoaded] = useState<boolean>(false);
    const [assetOperations, setAssetOperations] = useState<AssetOperation[]>([]);

    const { signer } = useSigner();
    const dispatch = useDispatch();

    const assetOperationService = useMemo(
        () =>
            new AssetOperationService(
                new AssetOperationDriver(
                    signer,
                    CONTRACT_ADDRESSES.ASSET_OPERATION(),
                    CONTRACT_ADDRESSES.MATERIAL(),
                    CONTRACT_ADDRESSES.PRODUCT_CATEGORY()
                )
            ),
        [signer]
    );

    const loadAssetOperations = async () => {
        try {
            dispatch(addLoadingMessage(ASSET_OPERATION_MESSAGE.RETRIEVE.LOADING));
            const assetOperations = await assetOperationService.getAssetOperationsOfCreator(
                signer._address
            );
            setAssetOperations(assetOperations);
        } catch (e) {
            openNotification(
                'Error',
                ASSET_OPERATION_MESSAGE.RETRIEVE.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(ASSET_OPERATION_MESSAGE.RETRIEVE.LOADING));
        }
    };

    const loadData = async () => {
        await loadAssetOperations();
        setDataLoaded(true);
    };

    const saveAssetOperation = async (assetOperationRequest: AssetOperationRequest) => {
        try {
            dispatch(addLoadingMessage(ASSET_OPERATION_MESSAGE.SAVE.LOADING));
            await assetOperationService.registerAssetOperation(
                assetOperationRequest.name,
                assetOperationRequest.inputMaterialIds,
                assetOperationRequest.outputMaterialId,
                assetOperationRequest.latitude,
                assetOperationRequest.longitude,
                assetOperationRequest.processTypes
            );
            openNotification(
                'Success',
                ASSET_OPERATION_MESSAGE.SAVE.OK,
                NotificationType.SUCCESS,
                NOTIFICATION_DURATION
            );
            await loadData();
        } catch (e: any) {
            openNotification(
                'Error',
                ASSET_OPERATION_MESSAGE.SAVE.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(ASSET_OPERATION_MESSAGE.SAVE.LOADING));
        }
    };

    return (
        <EthAssetOperationContext.Provider
            value={{ dataLoaded, assetOperations, loadData, saveAssetOperation }}>
            {props.children}
        </EthAssetOperationContext.Provider>
    );
}
