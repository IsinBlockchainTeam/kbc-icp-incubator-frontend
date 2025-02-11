import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { useSiweIdentity } from '@/providers/auth/SiweIdentityProvider';
import { checkAndGetEnvironmentVariable } from '@/utils/env';
import { useCallHandler } from '@/providers/errors/CallHandlerProvider';
import { Typography } from 'antd';
import { OfferProvider, useOffer } from '../OfferProvider';
import { ICPOfferService, Material, Offer } from '@kbc-lib/coffee-trading-management-lib';

jest.mock('@kbc-lib/coffee-trading-management-lib');
jest.mock('@/providers/auth/SiweIdentityProvider');
jest.mock('@/providers/auth/SignerProvider');
jest.mock('@/providers/errors/CallHandlerProvider');
jest.mock('@/providers/storage/IcpStorageProvider');
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
describe('OfferProvider', () => {
    const offerServiceMethods = { getOffers: jest.fn(), createOffer: jest.fn(), deleteOffer: jest.fn() };
    const handleICPCall = jest.fn();

    const offers = [
        { id: 1, owner: 'owner1', material: {} as Material },
        { id: 2, owner: 'owner2', material: {} as Material }
    ] as Offer[];

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.spyOn(console, 'log').mockImplementation(jest.fn());

        (useSiweIdentity as jest.Mock).mockReturnValue({ identity: 'identity' });
        (checkAndGetEnvironmentVariable as jest.Mock).mockReturnValue('canisterId');
        (useCallHandler as jest.Mock).mockReturnValue({ handleICPCall });

        offerServiceMethods.getOffers.mockResolvedValue(offers);
        (ICPOfferService as jest.Mock).mockImplementation(() => ({ ...offerServiceMethods }));
    });

    it('should throw error if hook is used outside the provider', async () => {
        expect(() => renderHook(() => useOffer())).toThrow();
    });

    it('should render error message if identity is not initialized', async () => {
        (useSiweIdentity as jest.Mock).mockReturnValue({ identity: null });
        const mockTypographyText = Typography.Text as unknown as jest.Mock;
        renderHook(() => useOffer(), {
            wrapper: OfferProvider
        });
        expect(mockTypographyText).toHaveBeenCalledTimes(1);
        expect(mockTypographyText).toHaveBeenCalledWith(
            expect.objectContaining({
                children: 'Siwe identity not initialized'
            }),
            {}
        );
    });

    it('should load data', async () => {
        handleICPCall.mockImplementation(async (callback) => {
            await callback();
        });
        const { result } = renderHook(() => useOffer(), {
            wrapper: OfferProvider
        });
        await act(async () => {
            await result.current.loadData();
        });

        expect(handleICPCall).toHaveBeenCalledTimes(1);
        expect(offerServiceMethods.getOffers).toHaveBeenCalledTimes(1);

        expect(result.current.dataLoaded).toBe(true);
        expect(result.current.offers).toEqual(offers);
    });

    it('should save offer', async () => {
        handleICPCall.mockImplementation(async (callback) => {
            await callback();
        });
        const { result } = renderHook(() => useOffer(), {
            wrapper: OfferProvider
        });
        await act(async () => {
            await result.current.saveOffer(1);
        });

        expect(handleICPCall).toHaveBeenCalledTimes(2);
        expect(offerServiceMethods.createOffer).toHaveBeenCalledTimes(1);
        expect(offerServiceMethods.createOffer).toHaveBeenCalledWith(1);
        expect(offerServiceMethods.getOffers).toHaveBeenCalledTimes(1);

        expect(result.current.offers).toEqual(offers);
    });

    it('should delete offer', async () => {
        handleICPCall.mockImplementation(async (callback) => {
            await callback();
        });
        const { result } = renderHook(() => useOffer(), {
            wrapper: OfferProvider
        });
        await act(async () => {
            await result.current.deleteOffer(1);
        });

        expect(handleICPCall).toHaveBeenCalledTimes(2);
        expect(offerServiceMethods.deleteOffer).toHaveBeenCalledTimes(1);
        expect(offerServiceMethods.getOffers).toHaveBeenCalledTimes(1);

        expect(result.current.offers).toEqual(offers);
    });
});
