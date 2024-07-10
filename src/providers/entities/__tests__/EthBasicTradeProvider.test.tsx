import { act, renderHook, waitFor } from '@testing-library/react';
import {
    BasicTradeRequest,
    EthBasicTradeProvider,
    useEthBasicTrade
} from '../EthBasicTradeProvider';
import {
    BasicTrade,
    BasicTradeService,
    DocumentInfo,
    DocumentType,
    ICPFileDriver,
    Line,
    LineRequest,
    Material,
    ProductCategory,
    TradeManagerService,
    TradeType
} from '@kbc-lib/coffee-trading-management-lib';
import { useDispatch, useSelector } from 'react-redux';
import { useSigner } from '@/providers/SignerProvider';
import { Wallet } from 'ethers';
import { openNotification } from '@/utils/notification';
import { RawTrade, useEthRawTrade } from '@/providers/entities/EthRawTradeProvider';
import { UserInfoState } from '@/redux/reducers/userInfoSlice';
import { getICPCanisterURL } from '@/utils/icp';
import { useEthMaterial } from '@/providers/entities/EthMaterialProvider';
import { DocumentRequest } from '@/providers/entities/EthDocumentProvider';
import { useICP } from '@/providers/ICPProvider';

jest.mock('@kbc-lib/coffee-trading-management-lib');
jest.mock('@/providers/SignerProvider');
jest.mock('@/providers/entities/EthRawTradeProvider');
jest.mock('react-redux');
jest.mock('@/utils/notification');
jest.mock('@/utils/icp');
jest.mock('@/providers/entities/EthMaterialProvider');
jest.mock('@/providers/ICPProvider');

describe('EthBasicTradeProvider', () => {
    const signer = { address: '0x123' } as Wallet;
    const dispatch = jest.fn();
    const getTrade = jest.fn();
    const getDocumentsByType = jest.fn();
    const addDocument = jest.fn();
    const addLine = jest.fn();
    const setName = jest.fn();
    const updateLine = jest.fn();
    const registerBasicTrade = jest.fn();
    const waitForTransactions = jest.fn();
    const rawTrades = [{ address: '0x123', type: TradeType.BASIC } as RawTrade];
    const userInfo = { organizationId: '1' } as UserInfoState;
    const basicTrade = {
        tradeId: 1,
        externalUrl: 'externalUrl',
        lines: [
            {
                productCategory: { id: 1 } as ProductCategory,
                unit: 'unit',
                quantity: 1,
                material: {} as Material
            } as Line
        ]
    } as BasicTrade;
    const productCategories = [{ id: 1 } as ProductCategory];
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(jest.fn());

        (BasicTradeService as jest.Mock).mockImplementation(() => ({
            getTrade,
            getDocumentsByType,
            addDocument,
            addLine,
            setName,
            updateLine
        }));
        (TradeManagerService as jest.Mock).mockImplementation(() => ({
            registerBasicTrade
        }));
        (useDispatch as jest.Mock).mockReturnValue(dispatch);
        (useSelector as jest.Mock).mockReturnValue(userInfo);
        (useSigner as jest.Mock).mockReturnValue({ signer, waitForTransactions });
        (useEthRawTrade as jest.Mock).mockReturnValue({ rawTrades });
        getDocumentsByType.mockResolvedValue([]);
        (getICPCanisterURL as jest.Mock).mockReturnValue('icpCanisterUrl');
        (useEthMaterial as jest.Mock).mockReturnValue({
            productCategories
        });
        (useICP as jest.Mock).mockReturnValue({
            fileDriver: {} as ICPFileDriver
        });
    });

    it('should throw error if hook is used outside the provider', async () => {
        expect(() => renderHook(() => useEthBasicTrade())).toThrow();
    });

    it('should load basic trades on initial render', async () => {
        getTrade.mockResolvedValue(basicTrade);
        const { result } = renderHook(() => useEthBasicTrade(), {
            wrapper: EthBasicTradeProvider
        });
        await waitFor(() => {
            expect(result.current.basicTrades).toHaveLength(1);
        });

        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(BasicTradeService).toHaveBeenCalledTimes(1);
        expect(result.current.basicTrades).toHaveLength(1);
        expect(openNotification).not.toHaveBeenCalled();
    });

    it('should handle load failure on initial render', async () => {
        getTrade.mockRejectedValue(new Error('Test error'));
        const { result } = renderHook(() => useEthBasicTrade(), {
            wrapper: EthBasicTradeProvider
        });
        await waitFor(() => {
            expect(openNotification).toHaveBeenCalled();
        });

        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(BasicTradeService).toHaveBeenCalledTimes(1);
        expect(result.current.basicTrades).toHaveLength(0);
        expect(openNotification).toHaveBeenCalled();
    });

    it('should save basic trade', async () => {
        const basicTradeRequest = {
            supplier: 'supplier',
            customer: 'customer',
            commissioner: 'commissioner',
            name: 'basicTrade',
            lines: [{} as LineRequest]
        } as BasicTradeRequest;
        const documentRequests = [
            {
                filename: 'filenameTest',
                documentType: DocumentType.DELIVERY_NOTE,
                content: { type: 'testFile' } as Blob
            } as DocumentRequest
        ];
        getTrade.mockResolvedValue(basicTrade);
        registerBasicTrade.mockResolvedValue(['', '0x123', 'txHash']);
        const { result } = renderHook(() => useEthBasicTrade(), {
            wrapper: EthBasicTradeProvider
        });
        await waitFor(() => {
            expect(result.current.basicTrades).toHaveLength(1);
        });
        jest.clearAllMocks();
        await act(async () => {
            await result.current.saveBasicTrade(basicTradeRequest, documentRequests);
        });

        expect(dispatch).toHaveBeenCalledTimes(4);
        expect(registerBasicTrade).toHaveBeenCalledTimes(1);
        expect(registerBasicTrade).toHaveBeenCalledWith(
            basicTradeRequest.supplier,
            basicTradeRequest.customer,
            basicTradeRequest.commissioner,
            basicTradeRequest.name,
            expect.any(Object),
            {
                prefix: 'icpCanisterUrl',
                organizationId: 1
            },
            [0]
        );
        expect(waitForTransactions).toHaveBeenCalledTimes(1);
        expect(addDocument).toHaveBeenCalledTimes(1);
        expect(addDocument).toHaveBeenCalledWith(
            DocumentType.DELIVERY_NOTE,
            expect.any(Uint8Array),
            'externalUrl',
            {
                name: 'filenameTest',
                type: 'testFile'
            },
            [0]
        );
        expect(getTrade).toHaveBeenCalled();
        expect(openNotification).toHaveBeenCalled();
    });
    it('should handle save basic trade failure', async () => {
        const basicTradeRequest = {
            supplier: 'supplier',
            customer: 'customer',
            commissioner: 'commissioner',
            name: 'basicTrade',
            lines: [{} as LineRequest]
        } as BasicTradeRequest;
        const documentRequests = [
            {
                filename: 'filenameTest',
                documentType: DocumentType.DELIVERY_NOTE,
                content: { type: 'testFile' } as Blob
            } as DocumentRequest
        ];
        getTrade.mockResolvedValue(basicTrade);
        registerBasicTrade.mockRejectedValue(new Error('Test error'));
        const { result } = renderHook(() => useEthBasicTrade(), {
            wrapper: EthBasicTradeProvider
        });
        await waitFor(() => {
            expect(result.current.basicTrades).toHaveLength(1);
        });
        jest.clearAllMocks();
        await act(async () => {
            await result.current.saveBasicTrade(basicTradeRequest, documentRequests);
        });

        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(registerBasicTrade).toHaveBeenCalledTimes(1);
        expect(waitForTransactions).not.toHaveBeenCalled();
        expect(addDocument).not.toHaveBeenCalled();
        expect(openNotification).toHaveBeenCalled();
    });
    it('should update basic trade', async () => {
        const basicTradeRequest = {
            supplier: 'supplier',
            customer: 'customer',
            commissioner: 'commissioner',
            name: 'basicTrade',
            lines: [
                {
                    productCategoryId: 1,
                    unit: 'newUnit',
                    quantity: 2
                } as LineRequest
            ]
        } as BasicTradeRequest;
        getTrade.mockResolvedValue(basicTrade);
        const { result } = renderHook(() => useEthBasicTrade(), {
            wrapper: EthBasicTradeProvider
        });
        await waitFor(() => {
            expect(result.current.basicTrades).toHaveLength(1);
        });
        jest.clearAllMocks();
        await act(async () => {
            await result.current.updateBasicTrade(1, basicTradeRequest);
        });

        expect(dispatch).toHaveBeenCalledTimes(4);
        expect(setName).toHaveBeenCalledTimes(1);
        expect(setName).toHaveBeenCalledWith(basicTradeRequest.name);
        expect(updateLine).toHaveBeenCalledTimes(1);
        expect(updateLine).toHaveBeenCalledWith(
            new Line(
                basicTrade.lines[0].id,
                basicTrade.lines[0].material,
                productCategories[0],
                basicTradeRequest.lines[0].quantity,
                basicTradeRequest.lines[0].unit
            )
        );
        expect(getTrade).toHaveBeenCalled();
        expect(openNotification).toHaveBeenCalled();
    });
    it('should handle update basic trade failure', async () => {
        const basicTradeRequest = {
            supplier: 'supplier',
            customer: 'customer',
            commissioner: 'commissioner',
            name: 'basicTrade',
            lines: [
                {
                    productCategoryId: 1,
                    unit: 'newUnit',
                    quantity: 2
                } as LineRequest
            ]
        } as BasicTradeRequest;
        getTrade.mockResolvedValue(basicTrade);
        setName.mockRejectedValue(new Error('Test error'));
        const { result } = renderHook(() => useEthBasicTrade(), {
            wrapper: EthBasicTradeProvider
        });
        await waitFor(() => {
            expect(result.current.basicTrades).toHaveLength(1);
        });
        jest.clearAllMocks();
        await act(async () => {
            await result.current.updateBasicTrade(1, basicTradeRequest);
        });

        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(setName).toHaveBeenCalledTimes(1);
        expect(setName).toHaveBeenCalledWith(basicTradeRequest.name);
        expect(updateLine).not.toHaveBeenCalled();
        expect(openNotification).toHaveBeenCalled();
    });
    it('should retrieve basic trade documents', async () => {
        const documentInfo = { id: 1 } as DocumentInfo;
        getDocumentsByType.mockResolvedValue([documentInfo]);
        getTrade.mockResolvedValue(basicTrade);
        const { result } = renderHook(() => useEthBasicTrade(), {
            wrapper: EthBasicTradeProvider
        });
        await waitFor(() => {
            expect(result.current.basicTrades).toHaveLength(1);
        });
        jest.clearAllMocks();
        const resp = result.current.getBasicTradeDocuments(1);

        expect(resp).toHaveLength(1);
        expect(resp).toEqual([documentInfo]);
    });
});
