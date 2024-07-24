import React from 'react';
import { render, renderHook, screen } from '@testing-library/react';
import { useSelector } from 'react-redux';
import { SignerProvider, SignerContext, useSigner } from '../SignerProvider';
import { ethers, Wallet } from 'ethers';

jest.mock('react-redux');
jest.mock('ethers');

describe('SignerProvider', () => {
    const userInfo = {
        isLogged: true,
        privateKey: '0x123'
    };
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
    });
    it('should throw error if hook is used outside the provider', async () => {
        expect(() => renderHook(() => useSigner())).toThrow();
    });
    it('renders children when user is logged in', () => {
        (useSelector as jest.Mock).mockReturnValue(userInfo);
        render(
            <SignerProvider>
                <div data-testid="child-component"></div>
            </SignerProvider>
        );

        expect(screen.getByTestId('child-component')).toBeInTheDocument();
        expect(Wallet).toHaveBeenCalled();
    });

    it('renders error message when user is not logged in', () => {
        (useSelector as jest.Mock).mockReturnValue({ isLogged: false });
        render(
            <SignerProvider>
                <div data-testid="child-component"></div>
            </SignerProvider>
        );

        expect(screen.queryByText('User is not logged in')).toBeInTheDocument();
        expect(screen.queryByTestId('child-component')).not.toBeInTheDocument();
    });

    it('provides signer via context when user is logged in', () => {
        (useSelector as jest.Mock).mockReturnValue(userInfo);
        const TestComponent = () => {
            const context = React.useContext(SignerContext);
            expect(context).toHaveProperty('signer');
            expect(context.signer).toBeInstanceOf(ethers.Wallet);
            return null;
        };

        render(
            <SignerProvider>
                <TestComponent />
            </SignerProvider>
        );
    });
    it('provides waitForTransaction via context when user is logged in', () => {
        (useSelector as jest.Mock).mockReturnValue(userInfo);
        const waitForTransaction = jest.fn();
        (Wallet as unknown as jest.Mock).mockReturnValue({ provider: { waitForTransaction } });
        const TestComponent = () => {
            const context = useSigner();
            context.waitForTransactions('0x123', 1);
            expect(waitForTransaction).toHaveBeenCalled();
            expect(waitForTransaction).toHaveBeenCalledWith('0x123', 1);
            return null;
        };

        render(
            <SignerProvider>
                <TestComponent />
            </SignerProvider>
        );
    });
});
