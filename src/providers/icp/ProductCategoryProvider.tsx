import React, { createContext, ReactNode, useMemo, useState } from 'react';
import {
    ICPProductCategoryDriver,
    ICPProductCategoryService,
    ProductCategory
} from '@isinblockchainteam/kbc-icp-incubator-library';
import { useSiweIdentity } from '@/providers/SiweIdentityProvider';
import { Typography } from 'antd';
import { checkAndGetEnvironmentVariable } from '@/utils/env';
import { ICP } from '@/constants/icp';
import { PRODUCT_CATEGORY_MESSAGE } from '@/constants/message';
import { NotificationType, openNotification } from '@/utils/notification';
import { NOTIFICATION_DURATION } from '@/constants/notification';
import { useCallHandler } from '@/providers/icp/CallHandlerProvider';

export type ProductCategoryContextState = {
    dataLoaded: boolean;
    productCategories: ProductCategory[];
    loadData: () => Promise<void>;
    saveProductCategory: (name: string, quality: number, description: string) => Promise<void>;
};
export const ProductCategoryContext = createContext<ProductCategoryContextState>(
    {} as ProductCategoryContextState
);
export const useProductCategory = (): ProductCategoryContextState => {
    const context = React.useContext(ProductCategoryContext);
    if (!context || Object.keys(context).length === 0) {
        throw new Error('useProductCategory must be used within an ProductCategoryProvider.');
    }
    return context;
};
export function ProductCategoryProvider(props: { children: ReactNode }) {
    const { identity } = useSiweIdentity();
    const entityManagerCanisterId = checkAndGetEnvironmentVariable(ICP.CANISTER_ID_ENTITY_MANAGER);
    const [dataLoaded, setDataLoaded] = useState<boolean>(false);
    const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
    const { handleICPCall } = useCallHandler();

    if (!identity) {
        return <Typography.Text>Siwe identity not initialized</Typography.Text>;
    }

    const productCategoryService = useMemo(
        () =>
            new ICPProductCategoryService(
                new ICPProductCategoryDriver(identity, entityManagerCanisterId)
            ),
        [identity]
    );

    const loadData = async () => {
        await loadProductCategories();
        setDataLoaded(true);
    };

    const loadProductCategories = async () => {
        await handleICPCall(async () => {
            const productCategories = await productCategoryService.getProductCategories();
            setProductCategories(productCategories);
        }, PRODUCT_CATEGORY_MESSAGE.RETRIEVE.LOADING);
    };

    const saveProductCategory = async (name: string, quality: number, description: string) => {
        await handleICPCall(async () => {
            await productCategoryService.createProductCategory(name, quality, description);
            openNotification(
                'Success',
                PRODUCT_CATEGORY_MESSAGE.SAVE.OK,
                NotificationType.SUCCESS,
                NOTIFICATION_DURATION
            );
            await loadProductCategories();
        }, PRODUCT_CATEGORY_MESSAGE.SAVE.LOADING);
    };

    return (
        <ProductCategoryContext.Provider
            value={{
                dataLoaded,
                productCategories,
                loadData,
                saveProductCategory
            }}>
            {props.children}
        </ProductCategoryContext.Provider>
    );
}
