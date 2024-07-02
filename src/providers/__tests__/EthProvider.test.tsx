import React, { useContext } from 'react';
import { render, screen } from '@testing-library/react';
import { EthProvider, EthContext } from '../EthProvider';
import { SignerContext } from '../SignerProvider';
import { Wallet } from 'ethers';

jest.mock('@/providers/hooks/useEthServices', () => ({
    useEthServices: () => ({
        ethAssetOperationService: {},
        ethDocumentService: {},
        ethProcessTypeService: {},
        ethUnitService: {},
        ethFiatService: {},
        ethGraphService: {},
        ethMaterialService: {},
        ethOfferService: {},
        ethPartnerService: {},
        ethTradeService: {}
    })
}));

describe('EthProvider', () => {
    const signer = Wallet.createRandom();
    it('renders children when signer is present', () => {
        render(
            <SignerContext.Provider value={{ signer }}>
                <EthProvider>
                    <div data-testid="child-component"></div>
                </EthProvider>
            </SignerContext.Provider>
        );

        expect(screen.getByTestId('child-component')).toBeInTheDocument();
    });

    it('provides eth services via context when signer is present', () => {
        const TestComponent = () => {
            const context = useContext(EthContext);
            expect(context).toHaveProperty('ethAssetOperationService');
            expect(context).toHaveProperty('ethDocumentService');
            expect(context).toHaveProperty('ethGraphService');
            expect(context).toHaveProperty('ethOfferService');
            expect(context).toHaveProperty('ethPartnerService');
            expect(context).toHaveProperty('ethTradeService');
            return null;
        };

        render(
            <SignerContext.Provider value={{ signer }}>
                <EthProvider>
                    <TestComponent />
                </EthProvider>
            </SignerContext.Provider>
        );
    });
});
