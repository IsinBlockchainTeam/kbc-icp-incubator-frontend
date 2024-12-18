import { act, renderHook } from '@testing-library/react';
import { ICPProductCategoryService, ProductCategory } from '@kbc-lib/coffee-trading-management-lib';
import { useSiweIdentity } from '@/providers/auth/SiweIdentityProvider';
import { checkAndGetEnvironmentVariable } from '@/utils/env';
import { useCallHandler } from '@/providers/errors/CallHandlerProvider';
import { Typography } from 'antd';
import { NotificationType, openNotification } from '@/utils/notification';
import { PRODUCT_CATEGORY_MESSAGE } from '@/constants/message';
import { NOTIFICATION_DURATION } from '@/constants/notification';
import { ProductCategoryProvider, useProductCategory } from '@/providers/entities/icp/ProductCategoryProvider';

jest.mock('@kbc-lib/coffee-trading-management-lib');
jest.mock('@/utils/notification');
jest.mock('@/providers/auth/SiweIdentityProvider');
jest.mock('@/providers/errors/CallHandlerProvider');
jest.mock('@/utils/env');
jest.mock('antd', () => {
    const originalModule = jest.requireActual('antd');
    return {
        ...originalModule,
        Typography: {
            ...originalModule.Typography,
            Text: jest.fn((props) => <span {...props} />)
        }
    };
});
describe('ProductCategoryProvider', () => {
    const getProductCategories = jest.fn();
    const createProductCategory = jest.fn();
    const handleICPCall = jest.fn();
    const productCategories = [{ id: 1 } as ProductCategory];
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.spyOn(console, 'log').mockImplementation(jest.fn());

        (useSiweIdentity as jest.Mock).mockReturnValue({ identity: 'identity' });
        (checkAndGetEnvironmentVariable as jest.Mock).mockReturnValue('canisterId');
        (useCallHandler as jest.Mock).mockReturnValue({ handleICPCall });
        (ICPProductCategoryService as jest.Mock).mockImplementation(() => ({
            getProductCategories,
            createProductCategory
        }));
        getProductCategories.mockResolvedValue(productCategories);
    });

    it('should throw error if hook is used outside the provider', async () => {
        expect(() => renderHook(() => useProductCategory())).toThrow();
    });

    it('should render error message if identity is not initialized', async () => {
        (useSiweIdentity as jest.Mock).mockReturnValue({ identity: null });
        const mockTypographyText = Typography.Text as unknown as jest.Mock;
        renderHook(() => useProductCategory(), {
            wrapper: ProductCategoryProvider
        });
        expect(mockTypographyText).toHaveBeenCalledTimes(1);
        expect(mockTypographyText).toHaveBeenCalledWith(
            expect.objectContaining({
                children: 'Siwe identity not initialized'
            }),
            {}
        );
    });

    it('should load product categories', async () => {
        handleICPCall.mockImplementation(async (callback) => {
            await callback();
        });
        const { result } = renderHook(() => useProductCategory(), {
            wrapper: ProductCategoryProvider
        });
        await act(async () => {
            await result.current.loadData();
        });

        expect(handleICPCall).toHaveBeenCalledTimes(1);
        expect(getProductCategories).toHaveBeenCalledTimes(1);
        expect(result.current.dataLoaded).toBe(true);
        expect(result.current.productCategories).toEqual(productCategories);
    });

    it('should save product category', async () => {
        handleICPCall.mockImplementation(async (callback) => {
            await callback();
        });
        const { result } = renderHook(() => useProductCategory(), {
            wrapper: ProductCategoryProvider
        });
        await act(async () => {
            await result.current.saveProductCategory('test');
        });

        expect(handleICPCall).toHaveBeenCalledTimes(2);
        expect(createProductCategory).toHaveBeenCalledTimes(1);
        expect(createProductCategory).toHaveBeenCalledWith('test');
        expect(openNotification).toHaveBeenCalledTimes(1);
        expect(openNotification).toHaveBeenCalledWith('Success', PRODUCT_CATEGORY_MESSAGE.SAVE.OK, NotificationType.SUCCESS, NOTIFICATION_DURATION);
        expect(getProductCategories).toHaveBeenCalledTimes(1);
        expect(result.current.dataLoaded).toBe(true);
        expect(result.current.productCategories).toEqual(productCategories);
    });
});
