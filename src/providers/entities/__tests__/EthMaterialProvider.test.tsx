import { renderHook, act } from '@testing-library/react';
import { EthMaterialProvider, useEthMaterial } from '../EthMaterialProvider';
import {
    Material,
    MaterialService,
    ProductCategory,
    ProductCategoryService
} from '@kbc-lib/coffee-trading-management-lib';
import { useDispatch } from 'react-redux';
import { useSigner } from '@/providers/SignerProvider';
import { Wallet } from 'ethers';
import { openNotification } from '@/utils/notification';

jest.mock('@kbc-lib/coffee-trading-management-lib');
jest.mock('@/providers/SignerProvider');
jest.mock('react-redux');
jest.mock('@/utils/notification');

describe('EthMaterialProvider', () => {
    const signer = { address: '0x123' } as Wallet;
    const dispatch = jest.fn();
    const getProductCategories = jest.fn();
    const getMaterials = jest.fn();
    const registerMaterial = jest.fn();
    const registerProductCategory = jest.fn();
    const productCategories = [{ id: 1 } as ProductCategory];
    const materials = [{ id: 1 } as Material];
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(jest.fn());

        (ProductCategoryService as jest.Mock).mockImplementation(() => ({
            getProductCategories,
            registerProductCategory
        }));
        (MaterialService as jest.Mock).mockImplementation(() => ({
            getMaterials,
            registerMaterial
        }));
        (useDispatch as jest.Mock).mockReturnValue(dispatch);
        (useSigner as jest.Mock).mockReturnValue({ signer });
        getProductCategories.mockResolvedValue(productCategories);
        getMaterials.mockResolvedValue(materials);
    });

    it('should throw error if hook is used outside the provider', async () => {
        expect(() => renderHook(() => useEthMaterial())).toThrow();
    });

    it('should load product categories and materials', async () => {
        const { result } = renderHook(() => useEthMaterial(), {
            wrapper: EthMaterialProvider
        });
        await act(async () => {
            await result.current.loadData();
        });

        expect(dispatch).toHaveBeenCalledTimes(4);
        expect(getProductCategories).toHaveBeenCalled();
        expect(getMaterials).toHaveBeenCalled();
        expect(result.current.dataLoaded).toBe(true);
        expect(result.current.materials).toEqual(materials);
        expect(result.current.productCategories).toEqual(productCategories);
    });

    it('should handle load failure on initial render', async () => {
        getProductCategories.mockRejectedValue(new Error('Test error'));
        getMaterials.mockRejectedValue(new Error('Test error'));
        const { result } = renderHook(() => useEthMaterial(), {
            wrapper: EthMaterialProvider
        });
        await act(async () => {
            await result.current.loadData();
        });

        expect(dispatch).toHaveBeenCalledTimes(4);
        expect(getProductCategories).toHaveBeenCalled();
        expect(getMaterials).toHaveBeenCalled();
        expect(openNotification).toHaveBeenCalledTimes(2);
        expect(result.current.dataLoaded).toBe(true);
        expect(result.current.materials).toEqual([]);
        expect(result.current.productCategories).toEqual([]);
    });

    it('should save material', async () => {
        const { result } = renderHook(() => useEthMaterial(), {
            wrapper: EthMaterialProvider
        });
        await act(async () => {
            await result.current.saveMaterial(1);
        });

        expect(dispatch).toHaveBeenCalledTimes(4);
        expect(registerMaterial).toHaveBeenCalled();
        expect(getMaterials).toHaveBeenCalled();
        expect(openNotification).toHaveBeenCalledTimes(1);
        expect(result.current.materials).toEqual(materials);
    });
    it('should handle save material failure', async () => {
        registerMaterial.mockRejectedValue(new Error('Test error'));
        const { result } = renderHook(() => useEthMaterial(), {
            wrapper: EthMaterialProvider
        });
        await act(async () => {
            await result.current.saveMaterial(1);
        });

        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(registerMaterial).toHaveBeenCalled();
        expect(openNotification).toHaveBeenCalledTimes(1);
        expect(getMaterials).not.toHaveBeenCalled();
    });
    it('should save product category', async () => {
        const { result } = renderHook(() => useEthMaterial(), {
            wrapper: EthMaterialProvider
        });
        await act(async () => {
            await result.current.saveProductCategory('productCategory', 1, 'description');
        });

        expect(dispatch).toHaveBeenCalledTimes(4);
        expect(registerProductCategory).toHaveBeenCalled();
        expect(getProductCategories).toHaveBeenCalled();
        expect(openNotification).toHaveBeenCalledTimes(1);
        expect(result.current.productCategories).toEqual(productCategories);
    });
    it('should handle save product category failure', async () => {
        registerProductCategory.mockRejectedValue(new Error('Test error'));
        const { result } = renderHook(() => useEthMaterial(), {
            wrapper: EthMaterialProvider
        });
        await act(async () => {
            await result.current.saveProductCategory('productCategory', 1, 'description');
        });

        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(registerProductCategory).toHaveBeenCalled();
        expect(openNotification).toHaveBeenCalledTimes(1);
        expect(getProductCategories).not.toHaveBeenCalled();
    });
});
