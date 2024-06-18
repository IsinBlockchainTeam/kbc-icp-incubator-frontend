import React, { ReactNode } from 'react';
import { useEthServices } from '../useEthServices';
import { renderHook } from '@testing-library/react';
import { ethers, Wallet } from 'ethers';
import configureStore from 'redux-mock-store';
import { SignerContext } from '@/providers/SignerProvider';
import { ICPContext, ICPContextState } from '@/providers/ICPProvider';
import { Provider } from 'react-redux';
import {
    EthAssetOperationService,
    EthDocumentService,
    EthEnumerableTypeService,
    EthGraphService,
    EthMaterialService,
    EthOfferService,
    EthPartnerService,
    EthTradeService
} from '@/api/services';
import {
    AssetOperationService,
    BasicTradeDriver,
    BasicTradeService,
    DocumentDriver,
    DocumentService,
    GraphService,
    MaterialService,
    OfferService,
    OrderTradeDriver,
    OrderTradeService,
    ProductCategoryService,
    RelationshipService,
    TradeDriver,
    TradeManagerService,
    TradeService
} from '@kbc-lib/coffee-trading-management-lib';
import { EnumerableTypeService } from '@blockchain-lib/common';
import { TransactionReceipt } from '@ethersproject/abstract-provider/src.ts';

jest.mock('@/providers/SignerProvider');

jest.mock('@/providers/ICPProvider');

jest.mock('@/api/services');

jest.mock('@kbc-lib/coffee-trading-management-lib');

jest.mock('@blockchain-lib/common');

const mockStore = configureStore([]);

describe('useEthServices', () => {
    const signer = Wallet.createRandom().connect(new ethers.providers.JsonRpcProvider());
    const store = mockStore({
        userInfo: {
            organizationId: '1'
        }
    });
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('returns eth services when signer and fileDriver are present', () => {
        const wrapper = ({ children }: { children: ReactNode }) => (
            <Provider store={store}>
                <SignerContext.Provider value={{ signer }}>
                    <ICPContext.Provider value={{ fileDriver: {} } as ICPContextState}>
                        {children}
                    </ICPContext.Provider>
                </SignerContext.Provider>
            </Provider>
        );

        const { result } = renderHook(() => useEthServices(), { wrapper });

        expect(result.current).toHaveProperty('ethAssetOperationService');
        expect(result.current).toHaveProperty('ethDocumentService');
        expect(result.current).toHaveProperty('ethProcessTypeService');
        expect(result.current).toHaveProperty('ethUnitService');
        expect(result.current).toHaveProperty('ethFiatService');
        expect(result.current).toHaveProperty('ethGraphService');
        expect(result.current).toHaveProperty('ethMaterialService');
        expect(result.current).toHaveProperty('ethOfferService');
        expect(result.current).toHaveProperty('ethPartnerService');
        expect(result.current).toHaveProperty('ethTradeService');
    });
    it('return ethAssetOperationService correctly', () => {
        const wrapper = ({ children }: { children: ReactNode }) => (
            <Provider store={store}>
                <SignerContext.Provider value={{ signer }}>
                    <ICPContext.Provider value={{ fileDriver: {} } as ICPContextState}>
                        {children}
                    </ICPContext.Provider>
                </SignerContext.Provider>
            </Provider>
        );

        const { result } = renderHook(() => useEthServices(), { wrapper });

        expect(result.current.ethAssetOperationService).toBeInstanceOf(EthAssetOperationService);
        expect(EthAssetOperationService).toHaveBeenCalledWith(
            signer.address,
            expect.any(AssetOperationService),
            expect.any(MaterialService)
        );
    });
    it('return ethDocumentService correctly', () => {
        const wrapper = ({ children }: { children: ReactNode }) => (
            <Provider store={store}>
                <SignerContext.Provider value={{ signer }}>
                    <ICPContext.Provider value={{ fileDriver: {} } as ICPContextState}>
                        {children}
                    </ICPContext.Provider>
                </SignerContext.Provider>
            </Provider>
        );

        const { result } = renderHook(() => useEthServices(), { wrapper });

        expect(result.current.ethDocumentService).toBeInstanceOf(EthDocumentService);
        expect(EthDocumentService).toHaveBeenCalledWith(
            expect.any(DocumentService),
            expect.any(TradeManagerService),
            expect.any(Function)
        );

        const response = (EthDocumentService as jest.Mock).mock.calls[0][2]('address');
        expect(response).toBeInstanceOf(TradeService);
        expect(TradeService).toHaveBeenCalledWith(
            expect.any(TradeDriver),
            expect.any(DocumentDriver),
            {}
        );
    });
    it('return ethProcessTypeService correctly', () => {
        const wrapper = ({ children }: { children: ReactNode }) => (
            <Provider store={store}>
                <SignerContext.Provider value={{ signer }}>
                    <ICPContext.Provider value={{ fileDriver: {} } as ICPContextState}>
                        {children}
                    </ICPContext.Provider>
                </SignerContext.Provider>
            </Provider>
        );

        const { result } = renderHook(() => useEthServices(), { wrapper });

        expect(result.current.ethProcessTypeService).toBeInstanceOf(EthEnumerableTypeService);
        expect(EthEnumerableTypeService).toHaveBeenNthCalledWith(
            1,
            expect.any(EnumerableTypeService)
        );
    });
    it('return ethUnitService correctly', () => {
        const wrapper = ({ children }: { children: ReactNode }) => (
            <Provider store={store}>
                <SignerContext.Provider value={{ signer }}>
                    <ICPContext.Provider value={{ fileDriver: {} } as ICPContextState}>
                        {children}
                    </ICPContext.Provider>
                </SignerContext.Provider>
            </Provider>
        );

        const { result } = renderHook(() => useEthServices(), { wrapper });

        expect(result.current.ethUnitService).toBeInstanceOf(EthEnumerableTypeService);
        expect(EthEnumerableTypeService).toHaveBeenNthCalledWith(
            2,
            expect.any(EnumerableTypeService)
        );
    });
    it('return ethFiatService correctly', () => {
        const wrapper = ({ children }: { children: ReactNode }) => (
            <Provider store={store}>
                <SignerContext.Provider value={{ signer }}>
                    <ICPContext.Provider value={{ fileDriver: {} } as ICPContextState}>
                        {children}
                    </ICPContext.Provider>
                </SignerContext.Provider>
            </Provider>
        );

        const { result } = renderHook(() => useEthServices(), { wrapper });

        expect(result.current.ethFiatService).toBeInstanceOf(EthEnumerableTypeService);
        expect(EthEnumerableTypeService).toHaveBeenNthCalledWith(
            3,
            expect.any(EnumerableTypeService)
        );
    });
    it('return ethGraphService correctly', () => {
        const wrapper = ({ children }: { children: ReactNode }) => (
            <Provider store={store}>
                <SignerContext.Provider value={{ signer }}>
                    <ICPContext.Provider value={{ fileDriver: {} } as ICPContextState}>
                        {children}
                    </ICPContext.Provider>
                </SignerContext.Provider>
            </Provider>
        );

        const { result } = renderHook(() => useEthServices(), { wrapper });

        expect(result.current.ethGraphService).toBeInstanceOf(EthGraphService);
        expect(EthGraphService).toHaveBeenCalledWith(expect.any(GraphService));
    });
    it('return ethMaterialService correctly', () => {
        const wrapper = ({ children }: { children: ReactNode }) => (
            <Provider store={store}>
                <SignerContext.Provider value={{ signer }}>
                    <ICPContext.Provider value={{ fileDriver: {} } as ICPContextState}>
                        {children}
                    </ICPContext.Provider>
                </SignerContext.Provider>
            </Provider>
        );

        const { result } = renderHook(() => useEthServices(), { wrapper });

        expect(result.current.ethMaterialService).toBeInstanceOf(EthMaterialService);
        expect(EthMaterialService).toHaveBeenCalledWith(
            signer.address,
            expect.any(ProductCategoryService),
            expect.any(MaterialService)
        );
    });
    it('return ethOfferService correctly', () => {
        const wrapper = ({ children }: { children: ReactNode }) => (
            <Provider store={store}>
                <SignerContext.Provider value={{ signer }}>
                    <ICPContext.Provider value={{ fileDriver: {} } as ICPContextState}>
                        {children}
                    </ICPContext.Provider>
                </SignerContext.Provider>
            </Provider>
        );

        const { result } = renderHook(() => useEthServices(), { wrapper });

        expect(result.current.ethOfferService).toBeInstanceOf(EthOfferService);
        expect(EthOfferService).toHaveBeenCalledWith(expect.any(OfferService));
    });
    it('return ethPartnerService correctly', () => {
        const wrapper = ({ children }: { children: ReactNode }) => (
            <Provider store={store}>
                <SignerContext.Provider value={{ signer }}>
                    <ICPContext.Provider value={{ fileDriver: {} } as ICPContextState}>
                        {children}
                    </ICPContext.Provider>
                </SignerContext.Provider>
            </Provider>
        );

        const { result } = renderHook(() => useEthServices(), { wrapper });

        expect(result.current.ethPartnerService).toBeInstanceOf(EthPartnerService);
        expect(EthPartnerService).toHaveBeenCalledWith(
            signer.address,
            expect.any(RelationshipService)
        );
    });
    it('return ethTradeService correctly', async () => {
        const wrapper = ({ children }: { children: ReactNode }) => (
            <Provider store={store}>
                <SignerContext.Provider value={{ signer }}>
                    <ICPContext.Provider
                        value={
                            {
                                fileDriver: {},
                                getNameByDID: (_) => Promise.resolve('')
                            } as ICPContextState
                        }>
                        {children}
                    </ICPContext.Provider>
                </SignerContext.Provider>
            </Provider>
        );

        const { result } = renderHook(() => useEthServices(), { wrapper });

        expect(result.current.ethTradeService).toBeInstanceOf(EthTradeService);
        expect(EthTradeService).toHaveBeenCalledWith(
            signer.address,
            1,
            expect.any(EthMaterialService),
            expect.any(TradeManagerService),
            expect.any(EthDocumentService),
            expect.any(Function),
            expect.any(Function),
            expect.any(Function),
            expect.any(Function),
            expect.any(Function)
        );

        let response = (EthTradeService as jest.Mock).mock.calls[0][5]('address');
        expect(response).toBeInstanceOf(TradeService);
        expect(TradeService).toHaveBeenCalledWith(
            expect.any(TradeDriver),
            expect.any(DocumentDriver),
            {}
        );
        response = (EthTradeService as jest.Mock).mock.calls[0][6]('address');
        expect(response).toBeInstanceOf(BasicTradeService);
        expect(BasicTradeService).toHaveBeenCalledWith(
            expect.any(BasicTradeDriver),
            expect.any(DocumentDriver),
            {}
        );
        response = (EthTradeService as jest.Mock).mock.calls[0][7]('address');
        expect(response).toBeInstanceOf(OrderTradeService);
        expect(OrderTradeService).toHaveBeenCalledWith(
            expect.any(OrderTradeDriver),
            expect.any(DocumentDriver),
            {}
        );
        jest.spyOn(signer.provider, 'waitForTransaction').mockResolvedValue(
            {} as TransactionReceipt
        );
        await (EthTradeService as jest.Mock).mock.calls[0][8]('hash', 1);
        expect(signer.provider.waitForTransaction).toHaveBeenCalledWith('hash', 1);
    });
});
