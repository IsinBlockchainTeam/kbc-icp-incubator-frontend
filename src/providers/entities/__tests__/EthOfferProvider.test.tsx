import { renderHook, act } from '@testing-library/react';
import { EthOfferProvider, useEthOffer } from '../EthOfferProvider';
import { Offer, OfferService } from '@kbc-lib/coffee-trading-management-lib';
import { useDispatch } from 'react-redux';
import { useSigner } from '@/providers/SignerProvider';
import { Wallet } from 'ethers';
import { openNotification } from '@/utils/notification';

jest.mock('@kbc-lib/coffee-trading-management-lib');
jest.mock('@/providers/SignerProvider');
jest.mock('react-redux');
jest.mock('@/utils/notification');

describe('EthOfferProvider', () => {
    const signer = { address: '0x123' } as Wallet;
    const dispatch = jest.fn();
    const getAllOffers = jest.fn();
    const registerOffer = jest.fn();
    const registerSupplier = jest.fn();
    const offers = [{ id: 1 } as Offer];
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(jest.fn());

        (OfferService as jest.Mock).mockImplementation(() => ({
            getAllOffers,
            registerOffer,
            registerSupplier
        }));
        (useDispatch as jest.Mock).mockReturnValue(dispatch);
        (useSigner as jest.Mock).mockReturnValue({ signer });
        getAllOffers.mockResolvedValue(offers);
    });

    it('should throw error if hook is used outside the provider', async () => {
        expect(() => renderHook(() => useEthOffer())).toThrow();
    });

    it('should load asset operations', async () => {
        const { result } = renderHook(() => useEthOffer(), {
            wrapper: EthOfferProvider
        });
        await act(async () => {
            await result.current.loadData();
        });

        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(getAllOffers).toHaveBeenCalled();
        expect(result.current.dataLoaded).toBe(true);
        expect(result.current.offers).toEqual(offers);
    });

    it('should handle load failure', async () => {
        getAllOffers.mockRejectedValue(new Error('Test error'));
        const { result } = renderHook(() => useEthOffer(), {
            wrapper: EthOfferProvider
        });
        await act(async () => {
            await result.current.loadData();
        });

        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(getAllOffers).toHaveBeenCalled();
        expect(openNotification).toHaveBeenCalled();
        expect(result.current.dataLoaded).toBe(true);
        expect(result.current.offers).toEqual([]);
    });

    it('should save offer', async () => {
        const { result } = renderHook(() => useEthOffer(), {
            wrapper: EthOfferProvider
        });
        await act(async () => {
            await result.current.saveOffer('0x123', 1);
        });

        expect(dispatch).toHaveBeenCalledTimes(4);
        expect(registerOffer).toHaveBeenCalled();
        expect(registerOffer).toHaveBeenCalledWith('0x123', 1);
        expect(getAllOffers).toHaveBeenCalled();
        expect(result.current.dataLoaded).toBe(true);
    });
    it('should handle save offer failure', async () => {
        registerOffer.mockRejectedValue(new Error('Test error'));
        const { result } = renderHook(() => useEthOffer(), {
            wrapper: EthOfferProvider
        });
        await act(async () => {
            await result.current.saveOffer('0x123', 1);
        });

        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(registerOffer).toHaveBeenCalled();
        expect(getAllOffers).not.toHaveBeenCalled();
        expect(openNotification).toHaveBeenCalled();
        expect(result.current.dataLoaded).toBe(false);
    });
    it('should save supplier', async () => {
        const { result } = renderHook(() => useEthOffer(), {
            wrapper: EthOfferProvider
        });
        await act(async () => {
            await result.current.saveSupplier('0x123', 'name');
        });

        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(registerSupplier).toHaveBeenCalled();
        expect(registerSupplier).toHaveBeenCalledWith('0x123', 'name');
    });
    it('should handle save supplier failure', async () => {
        registerSupplier.mockRejectedValue(new Error('Test error'));
        const { result } = renderHook(() => useEthOffer(), {
            wrapper: EthOfferProvider
        });
        await act(async () => {
            await result.current.saveSupplier('0x123', 'name');
        });

        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(registerSupplier).toHaveBeenCalled();
        expect(openNotification).toHaveBeenCalled();
    });
});
