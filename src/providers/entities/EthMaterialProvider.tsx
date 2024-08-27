import {
    Material,
    MaterialDriver,
    MaterialService,
    ProductCategory,
    ProductCategoryDriver,
    ProductCategoryService
} from '@kbc-lib/coffee-trading-management-lib';
import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { CONTRACT_ADDRESSES } from '@/constants/evm';
import { useSigner } from '@/providers/SignerProvider';
import { addLoadingMessage, removeLoadingMessage } from '@/redux/reducers/loadingSlice';
import { NotificationType, openNotification } from '@/utils/notification';
import { useDispatch, useSelector } from 'react-redux';
import { NOTIFICATION_DURATION } from '@/constants/notification';
import { MATERIAL_MESSAGE, PRODUCT_CATEGORY_MESSAGE } from '@/constants/message';
import { RootState } from '@/redux/store';

export type EthMaterialContextState = {
    dataLoaded: boolean;
    materials: Material[];
    productCategories: ProductCategory[];
    loadData: () => Promise<void>;
    saveMaterial: (productCategoryId: number) => Promise<void>;
    saveProductCategory: (name: string, quality: number, description: string) => Promise<void>;
};
export const EthMaterialContext = createContext<EthMaterialContextState>(
    {} as EthMaterialContextState
);
export const useEthMaterial = (): EthMaterialContextState => {
    const context = useContext(EthMaterialContext);
    if (!context || Object.keys(context).length === 0) {
        throw new Error('useEthMaterial must be used within an MaterialProvider.');
    }
    return context;
};
export function EthMaterialProvider(props: { children: ReactNode }) {
    const [dataLoaded, setDataLoaded] = useState<boolean>(false);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);

    const { signer } = useSigner();
    const dispatch = useDispatch();
    const roleProof = useSelector((state: RootState) => state.userInfo.roleProof);

    const productCategoryService = useMemo(
        () =>
            new ProductCategoryService(
                new ProductCategoryDriver(signer, CONTRACT_ADDRESSES.PRODUCT_CATEGORY())
            ),
        [signer]
    );
    const materialService = useMemo(
        () =>
            new MaterialService(
                new MaterialDriver(
                    signer,
                    CONTRACT_ADDRESSES.MATERIAL(),
                    CONTRACT_ADDRESSES.PRODUCT_CATEGORY()
                )
            ),
        [signer]
    );

    const loadProductCategories = async () => {
        try {
            dispatch(addLoadingMessage(PRODUCT_CATEGORY_MESSAGE.RETRIEVE.LOADING));
            const productCategories = await productCategoryService.getProductCategories(roleProof);
            setProductCategories(productCategories);
        } catch (e: any) {
            console.log('Error while loading product categories', e);
            openNotification(
                'Error',
                PRODUCT_CATEGORY_MESSAGE.RETRIEVE.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(PRODUCT_CATEGORY_MESSAGE.RETRIEVE.LOADING));
        }
    };

    const loadMaterials = async () => {
        try {
            dispatch(addLoadingMessage(MATERIAL_MESSAGE.RETRIEVE.LOADING));
            const materials = await materialService.getMaterials(roleProof);
            setMaterials(materials);
        } catch (e: any) {
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

    const loadData = async () => {
        await Promise.all([loadProductCategories(), loadMaterials()]);
        setDataLoaded(true);
    };

    const saveMaterial = async (productCategoryId: number) => {
        try {
            dispatch(addLoadingMessage(MATERIAL_MESSAGE.SAVE.LOADING));
            await materialService.registerMaterial(roleProof, productCategoryId);
            openNotification(
                'Success',
                MATERIAL_MESSAGE.SAVE.OK,
                NotificationType.SUCCESS,
                NOTIFICATION_DURATION
            );
            await loadMaterials();
        } catch (e: any) {
            openNotification(
                'Error',
                MATERIAL_MESSAGE.SAVE.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(MATERIAL_MESSAGE.SAVE.LOADING));
        }
    };
    const saveProductCategory = async (name: string, quality: number, description: string) => {
        try {
            dispatch(addLoadingMessage(PRODUCT_CATEGORY_MESSAGE.SAVE.LOADING));
            await productCategoryService.registerProductCategory(
                roleProof,
                name,
                quality,
                description
            );
            openNotification(
                'Success',
                PRODUCT_CATEGORY_MESSAGE.SAVE.OK,
                NotificationType.SUCCESS,
                NOTIFICATION_DURATION
            );
            await loadProductCategories();
        } catch (e: any) {
            console.log('Error while saving product category', e);
            openNotification(
                'Error',
                PRODUCT_CATEGORY_MESSAGE.SAVE.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(PRODUCT_CATEGORY_MESSAGE.SAVE.LOADING));
        }
    };

    return (
        <EthMaterialContext.Provider
            value={{
                dataLoaded,
                materials,
                productCategories,
                loadData,
                saveMaterial,
                saveProductCategory
            }}>
            {props.children}
        </EthMaterialContext.Provider>
    );
}
