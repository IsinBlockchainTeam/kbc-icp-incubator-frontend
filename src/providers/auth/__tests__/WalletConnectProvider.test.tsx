import { useWalletConnect, WalletConnectProvider } from '@/providers/auth/WalletConnectProvider';
import { act, render, renderHook, screen } from '@testing-library/react';
import { createEthereumProvider } from '@/utils/walletConnect';
import EthereumProvider from '@walletconnect/ethereum-provider';
import React from 'react';

jest.mock('@walletconnect/ethereum-provider', () => jest.fn());
jest.mock('@/utils/walletConnect');

describe('WalletConnectProvider', () => {
    const mockDisconnect = jest.fn();
    const mockEthereumProvider = { disconnect: mockDisconnect } as unknown as EthereumProvider;
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        (createEthereumProvider as jest.Mock).mockReturnValue(mockEthereumProvider);
    });
    it('should throw error if hook is used outside the provider', () => {
        expect(() => renderHook(() => useWalletConnect())).toThrow();
    });
    it('renders children', () => {
        render(
            <WalletConnectProvider>
                <div data-testid="child-component"></div>
            </WalletConnectProvider>
        );

        expect(screen.getByTestId('child-component')).toBeInTheDocument();
        expect(createEthereumProvider).toHaveBeenCalled();
    });
    it('should return a provider', async () => {
        const { result } = await act(async () =>
            renderHook(() => useWalletConnect(), {
                wrapper: WalletConnectProvider
            })
        );
        expect(result.current.provider).toBe(mockEthereumProvider);
        expect(createEthereumProvider).toHaveBeenCalledTimes(1);
    });
    it('should disconnect', async () => {
        const { result } = await act(async () =>
            renderHook(() => useWalletConnect(), {
                wrapper: WalletConnectProvider
            })
        );
        expect(createEthereumProvider).toHaveBeenCalledTimes(1);
        await act(async () => {
            await result.current.disconnect();
        });

        expect(createEthereumProvider).toHaveBeenCalledTimes(2);
        expect(mockDisconnect).toHaveBeenCalled();
    });
});
