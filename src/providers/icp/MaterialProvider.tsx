import React, { createContext, ReactNode, useMemo, useState } from 'react';
import {
    ICPMaterialDriver,
    ICPMaterialService,
    Material
} from '@kbc-lib/coffee-trading-management-lib';
import { useSiweIdentity } from '@/providers/SiweIdentityProvider';
import { Typography } from 'antd';
import { checkAndGetEnvironmentVariable } from '@/utils/env';
import { ICP } from '@/constants/icp';
import { addLoadingMessage, removeLoadingMessage } from '@/redux/reducers/loadingSlice';
import { MATERIAL_MESSAGE, PRODUCT_CATEGORY_MESSAGE } from '@/constants/message';
import { NotificationType, openNotification } from '@/utils/notification';
import { NOTIFICATION_DURATION } from '@/constants/notification';
import { useDispatch } from 'react-redux';

export type MaterialContextState = {
    dataLoaded: boolean;
    materials: Material[];
    loadData: () => Promise<void>;
    saveMaterial: (productCategoryId: number) => Promise<void>;
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
    const [dataLoaded, setDataLoaded] = useState<boolean>(false);
    const [materials, setMaterials] = useState<Material[]>([]);
    const dispatch = useDispatch();

    if (!identity) {
        return <Typography.Text>Siwe identity not initialized</Typography.Text>;
    }

    const productCategoryService = useMemo(
        () => new ICPMaterialService(new ICPMaterialDriver(identity, entityManagerCanisterId)),
        [identity]
    );

    const loadData = async () => {
        await loadMaterials();
        setDataLoaded(true);
    };

    const loadMaterials = async () => {
        try {
            dispatch(addLoadingMessage(MATERIAL_MESSAGE.RETRIEVE.LOADING));
            const materials = await productCategoryService.getMaterials();
            setMaterials(materials);
        } catch (e: any) {
            console.log('Error while loading product categories', e);
            openNotification(
                'Error',
                MATERIAL_MESSAGE.RETRIEVE.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(MATERIAL_MESSAGE.RETRIEVE.LOADING));
        }
    };

    const saveMaterial = async (productCategoryId: number) => {
        try {
            dispatch(addLoadingMessage(MATERIAL_MESSAGE.SAVE.LOADING));
            await productCategoryService.createMaterial(productCategoryId);
            openNotification(
                'Success',
                PRODUCT_CATEGORY_MESSAGE.SAVE.OK,
                NotificationType.SUCCESS,
                NOTIFICATION_DURATION
            );
            await loadMaterials();
        } catch (e: any) {
            console.log('Error while saving product category', e);
            openNotification(
                'Error',
                PRODUCT_CATEGORY_MESSAGE.SAVE.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(MATERIAL_MESSAGE.SAVE.LOADING));
        }
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
