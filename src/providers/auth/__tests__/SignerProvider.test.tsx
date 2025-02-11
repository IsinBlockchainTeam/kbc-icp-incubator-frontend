import React from 'react';
import { act, render, renderHook, screen } from '@testing-library/react';
import { SignerProvider, useSigner } from '../SignerProvider';
import { ethers } from 'ethers';
import { JsonRpcSigner } from '@ethersproject/providers';
import { useWalletConnect } from '@/providers/auth/WalletConnectProvider';
import EthereumProvider from '@walletconnect/ethereum-provider';
import { useDispatch } from 'react-redux';

jest.mock('ethers');
jest.mock('@ethersproject/providers');
jest.mock('@/providers/auth/WalletConnectProvider');
jest.mock('react-redux');

jest.mock('@walletconnect/ethereum-provider', () => jest.fn());

describe('SignerProvider', () => {
    const mockProvider = { signer: 'signer' } as unknown as EthereumProvider;
    const mockAccount = '0x123';
    const mockGetSigner = jest.fn();
    let mockSigner: JsonRpcSigner;
    const dispatch = jest.fn();
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        const mockGetAddress = jest.fn().mockReturnValue(mockAccount);
        (ethers.providers.Web3Provider as unknown as jest.Mock).mockImplementation(() => ({
            getSigner: mockGetSigner
        }));
        mockSigner = {
            provider: { waitForTransaction: jest.fn() },
            getAddress: mockGetAddress
        } as unknown as JsonRpcSigner;
        mockGetSigner.mockReturnValue(mockSigner);
        (useWalletConnect as jest.Mock).mockReturnValue({ provider: mockProvider });
        (useDispatch as jest.Mock).mockReturnValue(dispatch);
    });
    it('should throw error if hook is used outside the provider', async () => {
        expect(() => renderHook(() => useSigner())).toThrow();
    });
    it('renders error message when signer is null', () => {
        (useWalletConnect as jest.Mock).mockReturnValue({ provider: undefined });
        render(
            <SignerProvider>
                <div data-testid="child-component"></div>
            </SignerProvider>
        );

        expect(screen.queryByText('Signer not initialized')).toBeInTheDocument();
        expect(screen.queryByTestId('child-component')).not.toBeInTheDocument();
    });
    it('renders children when user is logged in', async () => {
        await act(async () =>
            render(
                <SignerProvider>
                    <div data-testid="child-component"></div>
                </SignerProvider>
            )
        );

        expect(screen.getByTestId('child-component')).toBeInTheDocument();
        expect(ethers.providers.Web3Provider).toHaveBeenCalled();
        expect(mockGetSigner).toHaveBeenCalled();
    });
    it('provides signer via context when user is logged in', async () => {
        const { result } = await act(async () => renderHook(() => useSigner(), { wrapper: SignerProvider }));
        expect(result.current.signer).toEqual(mockSigner);
        expect(mockGetSigner).toHaveBeenCalled();
    });
    it('provides waitForTransaction via context when user is logged in', () => {
        const TestComponent = () => {
            const context = useSigner();
            context.waitForTransactions('0x123', 1);
            expect(mockSigner.provider.waitForTransaction).toHaveBeenCalled();
            expect(mockSigner.provider.waitForTransaction).toHaveBeenCalledWith('0x123', 1);
            return null;
        };

        render(
            <SignerProvider>
                <TestComponent />
            </SignerProvider>
        );
    });
});
