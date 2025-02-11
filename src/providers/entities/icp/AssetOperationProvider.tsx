import { AssetOperation, AssetOperationParams } from '@kbc-lib/coffee-trading-management-lib';
import React, { createContext, useMemo, useState } from 'react';
import { useSiweIdentity } from '@/providers/auth/SiweIdentityProvider';
import { Typography } from 'antd';
import { checkAndGetEnvironmentVariable } from '@/utils/env';
import { ICP } from '@/constants/icp';
import { useParams } from 'react-router-dom';
import { ICPAssetOperationDriver, ICPAssetOperationService } from '@kbc-lib/coffee-trading-management-lib';
import { useCallHandler } from '@/providers/errors/CallHandlerProvider';
import { ASSET_OPERATION_MESSAGE, AssetOperationMessage } from '@/constants/message';

export type AssetOperationContextState = {
    dataLoaded: boolean;
    loadData: () => Promise<void>;
    assetOperations: AssetOperation[];
    assetOperation: AssetOperation | null;
    createAssetOperation: (params: AssetOperationParams) => Promise<void>;
    updateAssetOperation: (params: AssetOperationParams) => Promise<void>;
    deleteAssetOperationById: (id: number) => Promise<void>;
};

export const AssetOperationContext = createContext<AssetOperationContextState>({} as AssetOperationContextState);
export const useAssetOperation = (): AssetOperationContextState => {
    const context = React.useContext(AssetOperationContext);
    if (!context || Object.keys(context).length === 0) {
        throw new Error('useAssetOperation must be used within an AssetOperationProvider.');
    }
    return context;
};

export type AssetOperationRequest = AssetOperationParams;

export function AssetOperationProvider({ children }: { children: React.ReactNode }) {
    const { identity } = useSiweIdentity();
    const entityManagerCanisterId = checkAndGetEnvironmentVariable(ICP.CANISTER_ID_ENTITY_MANAGER);
    const { id } = useParams();
    const [dataLoaded, setDataLoaded] = useState<boolean>(false);
    const [assetOperations, setAssetOperations] = React.useState<AssetOperation[]>([]);

    const { handleICPCall } = useCallHandler();

    if (!identity) {
        return <Typography.Text>Siwe identity not initialized</Typography.Text>;
    }

    const assetOperationService = useMemo(
        () => new ICPAssetOperationService(new ICPAssetOperationDriver(identity, entityManagerCanisterId)),
        [identity]
    );

    const writeTransaction = async (transaction: () => Promise<AssetOperation>, message: AssetOperationMessage) => {
        await handleICPCall(async () => {
            await transaction();
            await loadAssetOperations();
        }, message.LOADING);
    };

    const loadAssetOperations = async () => {
        if (!assetOperationService) return;
        await handleICPCall(async () => {
            const resp = await assetOperationService.getAllAssetOperations();
            setAssetOperations(resp);
        }, ASSET_OPERATION_MESSAGE.RETRIEVE.LOADING);
    };
    const assetOperation = useMemo(() => assetOperations.find((assetOperation) => assetOperation.id === Number(id)) || null, [assetOperations, id]);

    const loadData = async () => {
        await loadAssetOperations();
        setDataLoaded(true);
    };

    const create = async (params: AssetOperationParams) => {
        if (!assetOperationService) throw new Error('AssetOperation service not initialized');
        await writeTransaction(() => assetOperationService.createAssetOperation(params), ASSET_OPERATION_MESSAGE.SAVE);
    };

    const update = async (params: AssetOperationParams) => {
        if (!assetOperationService) throw new Error('AssetOperation service not initialized');
        if (!assetOperation) throw new Error('AssetOperation not found');
        await writeTransaction(() => assetOperationService.updateAssetOperation(assetOperation.id, params), ASSET_OPERATION_MESSAGE.UPDATE);
    };

    const deleteById = async (id: number) => {
        if (!assetOperationService) throw new Error('AssetOperation service not initialized');
        await writeTransaction(() => assetOperationService.deleteAssetOperation(id), ASSET_OPERATION_MESSAGE.DELETE);
    };

    return (
        <AssetOperationContext.Provider
            value={{
                dataLoaded,
                loadData,
                assetOperations,
                assetOperation,
                createAssetOperation: create,
                updateAssetOperation: update,
                deleteAssetOperationById: deleteById
            }}>
            {children}
        </AssetOperationContext.Provider>
    );
}
