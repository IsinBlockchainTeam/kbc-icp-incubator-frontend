import React from 'react';
import { render, renderHook, screen } from '@testing-library/react';
import { SignerProvider, SignerContext, useSigner } from '../SignerProvider';
import { ethers } from 'ethers';
import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers5/react';
import { JsonRpcSigner } from '@ethersproject/providers';

jest.mock('ethers');
jest.mock('@web3modal/ethers5/react');
jest.mock('@ethersproject/providers');

describe('SignerProvider', () => {
    const mockGetSigner = jest.fn();
    const mockSigner = { provider: { waitForTransaction: jest.fn() } } as unknown as JsonRpcSigner;
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        (useWeb3ModalAccount as jest.Mock).mockReturnValue({ address: '0x123' });
        (useWeb3ModalProvider as jest.Mock).mockReturnValue({
            walletProvider: {} as ethers.providers.ExternalProvider
        });
        (ethers.providers.Web3Provider as unknown as jest.Mock).mockImplementation(() => ({
            getSigner: mockGetSigner
        }));
        mockGetSigner.mockReturnValue(mockSigner);
    });
    it('should throw error if hook is used outside the provider', async () => {
        expect(() => renderHook(() => useSigner())).toThrow();
    });
    it('renders children when user is logged in', () => {
        render(
            <SignerProvider>
                <div data-testid="child-component"></div>
            </SignerProvider>
        );

        expect(screen.getByTestId('child-component')).toBeInTheDocument();
        expect(ethers.providers.Web3Provider).toHaveBeenCalled();
        expect(mockGetSigner).toHaveBeenCalled();
    });

    it('renders error message when signer is null', () => {
        (useWeb3ModalAccount as jest.Mock).mockReturnValue({ address: null });
        render(
            <SignerProvider>
                <div data-testid="child-component"></div>
            </SignerProvider>
        );

        expect(screen.queryByText('User is not logged in')).toBeInTheDocument();
        expect(screen.queryByTestId('child-component')).not.toBeInTheDocument();
    });

    it('provides signer via context when user is logged in', () => {
        const TestComponent = () => {
            const context = React.useContext(SignerContext);
            expect(context).toHaveProperty('signer');
            expect(mockGetSigner).toHaveBeenCalled();
            expect(context.signer).toBe(mockSigner);
            return null;
        };

        render(
            <SignerProvider>
                <TestComponent />
            </SignerProvider>
        );
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
