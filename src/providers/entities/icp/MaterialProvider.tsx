import React, { createContext, ReactNode, useMemo, useState } from 'react';
import { ICPMaterialDriver, ICPMaterialService, Material } from '@kbc-lib/coffee-trading-management-lib';
import { useSiweIdentity } from '@/providers/auth/SiweIdentityProvider';
import { Typography } from 'antd';
import { checkAndGetEnvironmentVariable } from '@/utils/env';
import { ICP } from '@/constants/icp';
import { MATERIAL_MESSAGE } from '@/constants/message';
import { NotificationType, openNotification } from '@/utils/notification';
import { NOTIFICATION_DURATION } from '@/constants/notification';
import { useCallHandler } from '@/providers/errors/CallHandlerProvider';

export type MaterialContextState = {
    dataLoaded: boolean;
    materials: Material[];
    loadData: () => Promise<void>;
    saveMaterial: (name: string, productCategoryId: number, typology: string, quality: string, moisture: string, isInput: boolean) => Promise<void>;
};
export const MaterialContext = createContext<MaterialContextState>({} as MaterialContextState);
export const useMaterial = (): MaterialContextState => {
    const context = React.useContext(MaterialContext);
    if (!context || Object.keys(context).length === 0) {
        throw new Error('useMaterial must be used within an MaterialProvider.');
    }
    return context;
};
export function MaterialProvider(props: { children: ReactNode }) {
    const { identity } = useSiweIdentity();
    const entityManagerCanisterId = checkAndGetEnvironmentVariable(ICP.CANISTER_ID_ENTITY_MANAGER);
    const { handleICPCall } = useCallHandler();
    const [dataLoaded, setDataLoaded] = useState<boolean>(false);
    const [materials, setMaterials] = useState<Material[]>([]);

    if (!identity) {
        return <Typography.Text>Siwe identity not initialized</Typography.Text>;
    }

    const materialService = useMemo(() => new ICPMaterialService(new ICPMaterialDriver(identity, entityManagerCanisterId)), [identity]);

    const loadData = async () => {
        await loadMaterials();
        setDataLoaded(true);
    };

    const loadMaterials = async () => {
        await handleICPCall(async () => {
            const materials = await materialService.getMaterials();
            setMaterials(materials);
        }, MATERIAL_MESSAGE.RETRIEVE.LOADING);
    };

    const saveMaterial = async (name: string, productCategoryId: number, typology: string, quality: string, moisture: string, isInput: boolean) => {
        await handleICPCall(async () => {
            await materialService.createMaterial(name, productCategoryId, typology, quality, moisture, isInput);
            openNotification('Success', MATERIAL_MESSAGE.SAVE.OK, NotificationType.SUCCESS, NOTIFICATION_DURATION);
            await loadData();
        }, MATERIAL_MESSAGE.SAVE.LOADING);
    };

    return (
        <MaterialContext.Provider
            value={{
                dataLoaded,
                materials,
                loadData,
                saveMaterial
            }}>
            {props.children}
        </MaterialContext.Provider>
    );
}
