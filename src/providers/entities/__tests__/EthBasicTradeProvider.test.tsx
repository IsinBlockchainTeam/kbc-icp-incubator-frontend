
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
import { openNotification } from '@/utils/notification';
import { RawTrade, useEthRawTrade } from '@/providers/entities/EthRawTradeProvider';
import { UserInfoState } from '@/redux/reducers/userInfoSlice';
import { getICPCanisterURL } from '@/utils/icp';
import { useEthMaterial } from '@/providers/entities/EthMaterialProvider';
import { useICP } from '@/providers/ICPProvider';
import { JsonRpcSigner } from '@ethersproject/providers';
import { useParams } from 'react-router-dom';

jest.mock('@kbc-lib/coffee-trading-management-lib');
jest.mock('@/providers/SignerProvider');
jest.mock('@/providers/entities/EthRawTradeProvider');
jest.mock('react-redux');
jest.mock('@/utils/notification');
jest.mock('@/utils/icp');
jest.mock('@/providers/entities/EthMaterialProvider');
jest.mock('@/providers/ICPProvider');
jest.mock('react-router-dom');

describe('EthBasicTradeProvider', () => {
    const signer = { _address: '0x123' } as JsonRpcSigner;
    const dispatch = jest.fn();
    const getTrade = jest.fn();
    const getDocumentsByType = jest.fn();
    const addLine = jest.fn();
    const setName = jest.fn();
    const updateLine = jest.fn();
    const registerBasicTrade = jest.fn();
    const waitForTransactions = jest.fn();
    const MockedBasicTradeService = {
        getTrade,
        getDocumentsByType,
        addLine,
        setName,
        updateLine
    };

    const documentInfo = { id: 1 } as DocumentInfo;
    const rawTrades = [{ id: 1, address: '0x123', type: TradeType.BASIC } as RawTrade];
    const userInfo = { companyClaims: { organizationId: '1' } } as UserInfoState;
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

        (BasicTradeService as jest.Mock).mockImplementation(() => MockedBasicTradeService);
        (TradeManagerService as jest.Mock).mockImplementation(() => ({
            registerBasicTrade
        }));
        (useDispatch as jest.Mock).mockReturnValue(dispatch);
        (useSelector as jest.Mock).mockReturnValue(userInfo);
        (useSigner as jest.Mock).mockReturnValue({ signer, waitForTransactions });
        (useEthRawTrade as jest.Mock).mockReturnValue({ rawTrades });
        getDocumentsByType.mockResolvedValue([documentInfo]);
        (getICPCanisterURL as jest.Mock).mockReturnValue('icpCanisterUrl');
        (useEthMaterial as jest.Mock).mockReturnValue({
            productCategories
        });
        (useICP as jest.Mock).mockReturnValue({
            fileDriver: {} as ICPFileDriver
        });
        (useParams as jest.Mock).mockReturnValue({ id: '1' });
    });

    it('should throw error if hook is used outside the provider', async () => {
        expect(() => renderHook(() => useEthBasicTrade())).toThrow();
    });

    it('should load detailed trade on initial render', async () => {
        getTrade.mockResolvedValue(basicTrade);
        const { result } = renderHook(() => useEthBasicTrade(), {
            wrapper: EthBasicTradeProvider
        });
        const detailedBasicTrade = {
            trade: basicTrade,
            service: MockedBasicTradeService,
            documents: [documentInfo]
        };
        await waitFor(() => {
            expect(result.current.detailedBasicTrade).toEqual(detailedBasicTrade);
        });

        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(BasicTradeService).toHaveBeenCalledTimes(1);
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
        expect(result.current.detailedBasicTrade).toEqual(null);
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
        getTrade.mockResolvedValue(basicTrade);
        registerBasicTrade.mockResolvedValue(['', '0x123', 'txHash']);
        const { result } = renderHook(() => useEthBasicTrade(), {
            wrapper: EthBasicTradeProvider
        });
        await waitFor(() => {
            expect(result.current.detailedBasicTrade).toBeNull();
        });
        jest.clearAllMocks();
        await act(async () => {
            await result.current.saveBasicTrade(basicTradeRequest);
        });

        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(getICPCanisterURL).toHaveBeenCalledTimes(1);
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
        getTrade.mockResolvedValue(basicTrade);
        registerBasicTrade.mockRejectedValue(new Error('Test error'));
        const { result } = renderHook(() => useEthBasicTrade(), {
            wrapper: EthBasicTradeProvider
        });
        await waitFor(() => {
            expect(result.current.detailedBasicTrade).toBeNull();
        });
        jest.clearAllMocks();
        await act(async () => {
            await result.current.saveBasicTrade(basicTradeRequest);
        });

        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(registerBasicTrade).toHaveBeenCalledTimes(1);
        expect(waitForTransactions).not.toHaveBeenCalled();
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
            expect(result.current.detailedBasicTrade).not.toBeNull();
        });
        jest.clearAllMocks();
        await act(async () => {
            await result.current.updateBasicTrade(basicTradeRequest);
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
            expect(result.current.detailedBasicTrade).not.toBeNull();
        });
        jest.clearAllMocks();
        await act(async () => {
            await result.current.updateBasicTrade(basicTradeRequest);
        });

        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(setName).toHaveBeenCalledTimes(1);
        expect(setName).toHaveBeenCalledWith(basicTradeRequest.name);
        expect(updateLine).not.toHaveBeenCalled();
        expect(openNotification).toHaveBeenCalled();
    });
});
