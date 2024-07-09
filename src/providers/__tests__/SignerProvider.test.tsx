import React from 'react';
import { render, screen } from '@testing-library/react';
import { useSelector } from 'react-redux';
import { SignerProvider, SignerContext } from '../SignerProvider';
import { ethers, Wallet } from 'ethers';

jest.mock('react-redux', () => ({
    useSelector: jest.fn()
}));

describe('SignerProvider', () => {
    const userInfo = {
        isLogged: true,
        privateKey: Wallet.createRandom().privateKey
    };
    it('renders children when user is logged in', () => {
        (useSelector as jest.Mock).mockReturnValue(userInfo);
        render(
            <SignerProvider>
                <div data-testid="child-component"></div>
            </SignerProvider>
        );

        expect(screen.getByTestId('child-component')).toBeInTheDocument();
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
});
