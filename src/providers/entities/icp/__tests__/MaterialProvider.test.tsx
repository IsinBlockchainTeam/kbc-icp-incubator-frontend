import { act, renderHook } from '@testing-library/react';
import { ICPMaterialService, Material } from '@kbc-lib/coffee-trading-management-lib';
import { MaterialProvider, useMaterial } from '@/providers/entities/icp/MaterialProvider';
import { useSiweIdentity } from '@/providers/auth/SiweIdentityProvider';
import { checkAndGetEnvironmentVariable } from '@/utils/env';
import { useCallHandler } from '@/providers/errors/CallHandlerProvider';
import { Typography } from 'antd';
import { NotificationType, openNotification } from '@/utils/notification';
import { MATERIAL_MESSAGE } from '@/constants/message';
import { NOTIFICATION_DURATION } from '@/constants/notification';

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
describe('MaterialProvider', () => {
    const getMaterials = jest.fn();
    const createMaterial = jest.fn();
    const handleICPCall = jest.fn();
    const materials = [{ id: 1 } as Material];
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.spyOn(console, 'log').mockImplementation(jest.fn());

        (useSiweIdentity as jest.Mock).mockReturnValue({ identity: 'identity' });
        (checkAndGetEnvironmentVariable as jest.Mock).mockReturnValue('canisterId');
        (useCallHandler as jest.Mock).mockReturnValue({ handleICPCall });
        (ICPMaterialService as jest.Mock).mockImplementation(() => ({
            getMaterials,
            createMaterial
        }));
        getMaterials.mockResolvedValue(materials);
    });

    it('should throw error if hook is used outside the provider', async () => {
        expect(() => renderHook(() => useMaterial())).toThrow();
    });

    it('should render error message if identity is not initialized', async () => {
        (useSiweIdentity as jest.Mock).mockReturnValue({ identity: null });
        const mockTypographyText = Typography.Text as unknown as jest.Mock;
        renderHook(() => useMaterial(), {
            wrapper: MaterialProvider
        });
        expect(mockTypographyText).toHaveBeenCalledTimes(1);
        expect(mockTypographyText).toHaveBeenCalledWith(
            expect.objectContaining({
                children: 'Siwe identity not initialized'
            }),
            {}
        );
    });

    it('should load materials', async () => {
        handleICPCall.mockImplementation(async (callback) => {
            await callback();
        });
        const { result } = renderHook(() => useMaterial(), {
            wrapper: MaterialProvider
        });
        await act(async () => {
            await result.current.loadData();
        });

        expect(handleICPCall).toHaveBeenCalledTimes(1);
        expect(getMaterials).toHaveBeenCalledTimes(1);
        expect(result.current.dataLoaded).toBe(true);
        expect(result.current.materials).toEqual(materials);
    });

    it('should save material', async () => {
        const saveMaterialParams = {
            name: 'name',
            productCategoryId: 1,
            typology: 'typology',
            quality: 'quality',
            moisture: 'moisture',
            isInput: true
        };
        handleICPCall.mockImplementation(async (callback) => {
            await callback();
        });
        const { result } = renderHook(() => useMaterial(), {
            wrapper: MaterialProvider
        });
        await act(async () => {
            await result.current.saveMaterial(
                saveMaterialParams.name,
                saveMaterialParams.productCategoryId,
                saveMaterialParams.typology,
                saveMaterialParams.quality,
                saveMaterialParams.moisture,
                saveMaterialParams.isInput
            );
        });

        expect(handleICPCall).toHaveBeenCalledTimes(2);
        expect(createMaterial).toHaveBeenCalledTimes(1);
        expect(createMaterial).toHaveBeenCalledWith(
            saveMaterialParams.name,
            saveMaterialParams.productCategoryId,
            saveMaterialParams.typology,
            saveMaterialParams.quality,
            saveMaterialParams.moisture,
            saveMaterialParams.isInput
        );
        expect(openNotification).toHaveBeenCalledTimes(1);
        expect(openNotification).toHaveBeenCalledWith('Success', MATERIAL_MESSAGE.SAVE.OK, NotificationType.SUCCESS, NOTIFICATION_DURATION);
        expect(getMaterials).toHaveBeenCalledTimes(1);
        expect(result.current.dataLoaded).toBe(true);
        expect(result.current.materials).toEqual(materials);
    });
});
