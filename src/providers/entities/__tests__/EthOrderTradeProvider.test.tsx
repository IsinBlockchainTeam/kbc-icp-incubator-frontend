import { renderHook, waitFor } from '@testing-library/react';
import {
    EthOrderTradeProvider,
    OrderTradeRequest,
    useEthOrderTrade
} from '../EthOrderTradeProvider';
import {
    DocumentStatus,
    DocumentType,
    ICPFileDriver,
    Line,
    LineRequest,
    Material,
    NegotiationStatus,
    OrderLinePrice,
    OrderLineRequest,
    OrderStatus,
    OrderTrade,
    OrderTradeService,
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
import {
    DOCUMENT_DUTY,
    DocumentDetail,
    DocumentRequest,
    useEthDocument
} from '@/providers/entities/EthDocumentProvider';
import { useICP } from '@/providers/ICPProvider';
import { useICPOrganization } from '@/providers/entities/ICPOrganizationProvider';
import { ACTION_MESSAGE } from '@/constants/message';
import { requestPath } from '@/constants/url';
import { JsonRpcSigner } from '@ethersproject/providers';

jest.mock('@kbc-lib/coffee-trading-management-lib');
jest.mock('@/providers/SignerProvider');
jest.mock('@/providers/entities/EthRawTradeProvider');
jest.mock('react-redux');
jest.mock('@/utils/notification');
jest.mock('@/utils/icp');
jest.mock('@/providers/entities/EthMaterialProvider');
jest.mock('@/providers/ICPProvider');
jest.mock('@/providers/entities/EthDocumentProvider');
jest.mock('@/providers/entities/ICPOrganizationProvider');

describe('EthOrderTradeProvider', () => {
    const signer = { _address: '0x123' } as JsonRpcSigner;
    const dispatch = jest.fn();
    const getTrade = jest.fn();
    const getCompleteTrade = jest.fn();
    const getOrderStatus = jest.fn();
    const getWhoSigned = jest.fn();
    const addDocument = jest.fn();
    const addLine = jest.fn();
    const updatePaymentDeadline = jest.fn();
    const updateDocumentDeliveryDeadline = jest.fn();
    const updateArbiter = jest.fn();
    const updateShippingDeadline = jest.fn();
    const updateDeliveryDeadline = jest.fn();
    const updateAgreedAmount = jest.fn();
    const updateTokenAddress = jest.fn();
    const updateLine = jest.fn();
    const confirmOrder = jest.fn();
    const validateDocument = jest.fn();
    const uploadDocument = jest.fn();
    const getDocumentDuty = jest.fn();
    const getDocumentDetailMap = jest.fn();
    const registerOrderTrade = jest.fn();
    const waitForTransactions = jest.fn();
    const getName = jest.fn();
    const rawTrades = [{ address: '0x123', type: TradeType.ORDER } as RawTrade];
    const userInfo = { organizationId: '1' } as UserInfoState;
    const orderTrade = {
        tradeId: 1,
        externalUrl: 'externalUrl',
        lines: [
            {
                productCategory: { id: 1 } as ProductCategory,
                unit: 'unit',
                quantity: 1,
                material: {} as Material
            } as Line
        ],
        negotiationStatus: NegotiationStatus.PENDING,
        commissioner: signer._address,
        supplier: '0x456'
    } as OrderTrade;
    const productCategories = [{ id: 1 } as ProductCategory];
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(jest.fn());

        (OrderTradeService as jest.Mock).mockImplementation(() => ({
            getTrade,
            getCompleteTrade,
            getOrderStatus,
            getWhoSigned,
            addDocument,
            addLine,
            updatePaymentDeadline,
            updateDocumentDeliveryDeadline,
            updateArbiter,
            updateShippingDeadline,
            updateDeliveryDeadline,
            updateAgreedAmount,
            updateTokenAddress,
            updateLine,
            confirmOrder
        }));
        (TradeManagerService as jest.Mock).mockImplementation(() => ({
            registerOrderTrade
        }));
        (useSigner as jest.Mock).mockReturnValue({ signer, waitForTransactions });
        (useEthRawTrade as jest.Mock).mockReturnValue({ rawTrades });
        (useEthDocument as jest.Mock).mockReturnValue({
            validateDocument,
            uploadDocument,
            getDocumentDuty,
            getDocumentDetailMap
        });
        (useICPOrganization as jest.Mock).mockReturnValue({
            getName
        });
        (useDispatch as jest.Mock).mockReturnValue(dispatch);
        (useICP as jest.Mock).mockReturnValue({
            fileDriver: {} as ICPFileDriver
        });
        (useSelector as jest.Mock).mockReturnValue(userInfo);
        (getICPCanisterURL as jest.Mock).mockReturnValue('icpCanisterUrl');
        (useEthMaterial as jest.Mock).mockReturnValue({
            productCategories
        });
        getTrade.mockResolvedValue(orderTrade);
        getCompleteTrade.mockResolvedValue(orderTrade);
        getOrderStatus.mockResolvedValue(OrderStatus.PRODUCTION);
        getWhoSigned.mockResolvedValue([]);
        getDocumentDetailMap.mockResolvedValue(new Map());
    });

    it('should throw error if hook is used outside the provider', async () => {
        expect(() => renderHook(() => useEthOrderTrade())).toThrow();
    });

    describe('orderTrades', () => {
        it('should load order trades on initial render', async () => {
            const { result } = renderHook(() => useEthOrderTrade(), {
                wrapper: EthOrderTradeProvider
            });
            await waitFor(() => {
                expect(result.current.orderTrades).toHaveLength(1);
            });

            expect(result.current.orderTrades).toHaveLength(1);
            expect(result.current.orderTrades[0]).toEqual(orderTrade);

            expect(dispatch).toHaveBeenCalledTimes(2);
            expect(OrderTradeService).toHaveBeenCalledTimes(1);
            expect(getCompleteTrade).toHaveBeenCalledTimes(1);
            expect(getOrderStatus).toHaveBeenCalledTimes(1);
            expect(getWhoSigned).toHaveBeenCalledTimes(1);
            expect(getDocumentDetailMap).toHaveBeenCalledTimes(1);
            expect(openNotification).not.toHaveBeenCalled();
        });
    });

    describe('getActionRequired', () => {
        it('should return the correct required action - not found', async () => {
            const { result } = renderHook(() => useEthOrderTrade(), {
                wrapper: EthOrderTradeProvider
            });
            await waitFor(() => {
                expect(result.current.orderTrades).toHaveLength(1);
            });

            expect(() => result.current.getActionRequired(-1)).toThrowError();
        });
        it('should return the correct required action - SIGNATURE_REQUIRED', async () => {
            const { result } = renderHook(() => useEthOrderTrade(), {
                wrapper: EthOrderTradeProvider
            });
            await waitFor(() => {
                expect(result.current.orderTrades).toHaveLength(1);
            });

            const requiredAction = result.current.getActionRequired(orderTrade.tradeId);
            expect(requiredAction).toEqual(ACTION_MESSAGE.SIGNATURE_REQUIRED);
        });
        it('should return the correct required action - NO_ACTION', async () => {
            getWhoSigned.mockResolvedValue([signer._address]);
            const { result } = renderHook(() => useEthOrderTrade(), {
                wrapper: EthOrderTradeProvider
            });
            await waitFor(() => {
                expect(result.current.orderTrades).toHaveLength(1);
            });

            const requiredAction = result.current.getActionRequired(orderTrade.tradeId);
            expect(requiredAction).toEqual(ACTION_MESSAGE.NO_ACTION);
        });
        it('should return the correct required action - UPLOAD_REQUIRED', async () => {
            getWhoSigned.mockResolvedValue([signer._address]);
            const map = new Map<OrderStatus, Map<DocumentType, DocumentDetail>>();
            const requiredDocuments = new Map<DocumentType, DocumentDetail>();
            requiredDocuments.set(DocumentType.DELIVERY_NOTE, {} as DocumentDetail);
            map.set(OrderStatus.PRODUCTION, requiredDocuments);
            getDocumentDetailMap.mockResolvedValue(map);
            getDocumentDuty.mockReturnValue(DOCUMENT_DUTY.UPLOAD_NEEDED);

            const { result } = renderHook(() => useEthOrderTrade(), {
                wrapper: EthOrderTradeProvider
            });
            await waitFor(() => {
                expect(result.current.orderTrades).toHaveLength(1);
            });

            const requiredAction = result.current.getActionRequired(orderTrade.tradeId);
            expect(requiredAction).toEqual(ACTION_MESSAGE.UPLOAD_REQUIRED);
        });
        it('should return the correct required action - VALIDATION_REQUIRED', async () => {
            getWhoSigned.mockResolvedValue([signer._address]);
            const map = new Map<OrderStatus, Map<DocumentType, DocumentDetail>>();
            const requiredDocuments = new Map<DocumentType, DocumentDetail>();
            requiredDocuments.set(DocumentType.DELIVERY_NOTE, {} as DocumentDetail);
            map.set(OrderStatus.PRODUCTION, requiredDocuments);
            getDocumentDetailMap.mockResolvedValue(map);
            getDocumentDuty.mockReturnValue(DOCUMENT_DUTY.APPROVAL_NEEDED);

            const { result } = renderHook(() => useEthOrderTrade(), {
                wrapper: EthOrderTradeProvider
            });
            await waitFor(() => {
                expect(result.current.orderTrades).toHaveLength(1);
            });

            const requiredAction = result.current.getActionRequired(orderTrade.tradeId);
            expect(requiredAction).toEqual(ACTION_MESSAGE.VALIDATION_REQUIRED);
        });
        it('should return the correct required action - NO_ACTION fallback', async () => {
            getWhoSigned.mockResolvedValue([signer._address]);
            const map = new Map<OrderStatus, Map<DocumentType, DocumentDetail>>();
            const requiredDocuments = new Map<DocumentType, DocumentDetail>();
            requiredDocuments.set(DocumentType.DELIVERY_NOTE, {} as DocumentDetail);
            map.set(OrderStatus.PRODUCTION, requiredDocuments);
            getDocumentDetailMap.mockResolvedValue(map);
            getDocumentDuty.mockReturnValue(DOCUMENT_DUTY.NO_ACTION_NEEDED);

            const { result } = renderHook(() => useEthOrderTrade(), {
                wrapper: EthOrderTradeProvider
            });
            await waitFor(() => {
                expect(result.current.orderTrades).toHaveLength(1);
            });

            const requiredAction = result.current.getActionRequired(orderTrade.tradeId);
            expect(requiredAction).toEqual(ACTION_MESSAGE.NO_ACTION);
        });
    });
    describe('getNegotiationStatus', () => {
        it('should return negotiation status - not found', async () => {
            const { result } = renderHook(() => useEthOrderTrade(), {
                wrapper: EthOrderTradeProvider
            });
            await waitFor(() => {
                expect(result.current.orderTrades).toHaveLength(1);
            });

            expect(() => result.current.getNegotiationStatus(-1)).toThrowError();
        });
        it('should return negotiation status', async () => {
            const { result } = renderHook(() => useEthOrderTrade(), {
                wrapper: EthOrderTradeProvider
            });
            await waitFor(() => {
                expect(result.current.orderTrades).toHaveLength(1);
            });

            expect(result.current.getNegotiationStatus(orderTrade.tradeId)).toEqual(
                orderTrade.negotiationStatus
            );
        });
    });
    describe('getOrderStatus', () => {
        it('should return order status - not found', async () => {
            const { result } = renderHook(() => useEthOrderTrade(), {
                wrapper: EthOrderTradeProvider
            });
            await waitFor(() => {
                expect(result.current.orderTrades).toHaveLength(1);
            });

            expect(() => result.current.getOrderStatus(-1)).toThrowError();
        });
        it('should return order status', async () => {
            getOrderStatus.mockResolvedValue(OrderStatus.PRODUCTION);
            const { result } = renderHook(() => useEthOrderTrade(), {
                wrapper: EthOrderTradeProvider
            });
            await waitFor(() => {
                expect(result.current.orderTrades).toHaveLength(1);
            });

            expect(result.current.getOrderStatus(orderTrade.tradeId)).toEqual(
                OrderStatus.PRODUCTION
            );
        });
    });
    describe('getRequiredDocumentTypes', () => {
        it('should return the required document types - order not found', async () => {
            const { result } = renderHook(() => useEthOrderTrade(), {
                wrapper: EthOrderTradeProvider
            });
            await waitFor(() => {
                expect(result.current.orderTrades).toHaveLength(1);
            });

            expect(() =>
                result.current.getRequiredDocumentTypes(-1, OrderStatus.CONTRACTING)
            ).toThrowError();
        });
        it('should return the required document types - order status not found', async () => {
            const { result } = renderHook(() => useEthOrderTrade(), {
                wrapper: EthOrderTradeProvider
            });
            await waitFor(() => {
                expect(result.current.orderTrades).toHaveLength(1);
            });

            expect(() =>
                result.current.getRequiredDocumentTypes(orderTrade.tradeId, OrderStatus.CONTRACTING)
            ).toThrowError();
        });
        it('should return the required document types', async () => {
            const map = new Map<OrderStatus, Map<DocumentType, DocumentDetail>>();
            const requiredDocuments = new Map<DocumentType, DocumentDetail>();
            requiredDocuments.set(DocumentType.DELIVERY_NOTE, {} as DocumentDetail);
            map.set(OrderStatus.CONTRACTING, requiredDocuments);
            getDocumentDetailMap.mockResolvedValue(map);
            const { result } = renderHook(() => useEthOrderTrade(), {
                wrapper: EthOrderTradeProvider
            });
            await waitFor(() => {
                expect(result.current.orderTrades).toHaveLength(1);
            });

            expect(
                result.current.getRequiredDocumentTypes(orderTrade.tradeId, OrderStatus.CONTRACTING)
            ).toEqual([DocumentType.DELIVERY_NOTE]);
        });
    });
    describe('getDocumentDetail', () => {
        it('should return document detail - order not found', async () => {
            const { result } = renderHook(() => useEthOrderTrade(), {
                wrapper: EthOrderTradeProvider
            });
            await waitFor(() => {
                expect(result.current.orderTrades).toHaveLength(1);
            });

            expect(() =>
                result.current.getDocumentDetail(
                    -1,
                    OrderStatus.CONTRACTING,
                    DocumentType.DELIVERY_NOTE
                )
            ).toThrowError();
        });
        it('should return document detail - order status not found', async () => {
            const { result } = renderHook(() => useEthOrderTrade(), {
                wrapper: EthOrderTradeProvider
            });
            await waitFor(() => {
                expect(result.current.orderTrades).toHaveLength(1);
            });

            expect(() =>
                result.current.getDocumentDetail(
                    orderTrade.tradeId,
                    OrderStatus.CONTRACTING,
                    DocumentType.DELIVERY_NOTE
                )
            ).toThrowError();
        });
        it('should return document detail', async () => {
            const map = new Map<OrderStatus, Map<DocumentType, DocumentDetail>>();
            const requiredDocuments = new Map<DocumentType, DocumentDetail>();
            requiredDocuments.set(DocumentType.DELIVERY_NOTE, {} as DocumentDetail);
            map.set(OrderStatus.CONTRACTING, requiredDocuments);
            getDocumentDetailMap.mockResolvedValue(map);
            const { result } = renderHook(() => useEthOrderTrade(), {
                wrapper: EthOrderTradeProvider
            });
            await waitFor(() => {
                expect(result.current.orderTrades).toHaveLength(1);
            });

            expect(
                result.current.getDocumentDetail(
                    orderTrade.tradeId,
                    OrderStatus.CONTRACTING,
                    DocumentType.DELIVERY_NOTE
                )
            ).toEqual(requiredDocuments.get(DocumentType.DELIVERY_NOTE));
        });
    });
    describe('getDocumentDetail', () => {
        it('should return document detail - order not found', async () => {
            const { result } = renderHook(() => useEthOrderTrade(), {
                wrapper: EthOrderTradeProvider
            });
            await waitFor(() => {
                expect(result.current.orderTrades).toHaveLength(1);
            });

            expect(() =>
                result.current.getDocumentDetail(
                    -1,
                    OrderStatus.CONTRACTING,
                    DocumentType.DELIVERY_NOTE
                )
            ).toThrowError();
        });
        it('should return document detail - order status not found', async () => {
            const { result } = renderHook(() => useEthOrderTrade(), {
                wrapper: EthOrderTradeProvider
            });
            await waitFor(() => {
                expect(result.current.orderTrades).toHaveLength(1);
            });

            expect(() =>
                result.current.getDocumentDetail(
                    orderTrade.tradeId,
                    OrderStatus.CONTRACTING,
                    DocumentType.DELIVERY_NOTE
                )
            ).toThrowError();
        });
        it('should return document detail', async () => {
            const map = new Map<OrderStatus, Map<DocumentType, DocumentDetail>>();
            const requiredDocuments = new Map<DocumentType, DocumentDetail>();
            requiredDocuments.set(DocumentType.DELIVERY_NOTE, {} as DocumentDetail);
            map.set(OrderStatus.CONTRACTING, requiredDocuments);
            getDocumentDetailMap.mockResolvedValue(map);
            const { result } = renderHook(() => useEthOrderTrade(), {
                wrapper: EthOrderTradeProvider
            });
            await waitFor(() => {
                expect(result.current.orderTrades).toHaveLength(1);
            });

            expect(
                result.current.getDocumentDetail(
                    orderTrade.tradeId,
                    OrderStatus.CONTRACTING,
                    DocumentType.DELIVERY_NOTE
                )
            ).toEqual(requiredDocuments.get(DocumentType.DELIVERY_NOTE));
        });
    });
    describe('saveOrderTrade', () => {
        it('should save order trade', async () => {
            const { result } = renderHook(() => useEthOrderTrade(), {
                wrapper: EthOrderTradeProvider
            });
            await waitFor(() => {
                expect(result.current.orderTrades).toHaveLength(1);
            });
            (getICPCanisterURL as jest.Mock).mockReturnValue('icpCanisterUrl');
            const orderTradeRequest = {
                supplier: 'supplier',
                customer: 'customer',
                commissioner: 'commissioner',
                paymentDeadline: 123,
                documentDeliveryDeadline: 123,
                arbiter: 'arbiter',
                shippingDeadline: 123,
                deliveryDeadline: 123,
                agreedAmount: 10,
                tokenAddress: 'token',
                incoterms: 'incoterms',
                shipper: 'shipper',
                shippingPort: 'shippingPort',
                deliveryPort: 'deliveryPort',
                lines: [{} as LineRequest]
            } as OrderTradeRequest;
            const documentRequests = [
                {
                    documentType: DocumentType.PAYMENT_INVOICE,
                    filename: 'filename',
                    content: { type: 'pdf' }
                } as DocumentRequest
            ];
            registerOrderTrade.mockResolvedValue([1, 2, 3]);

            await result.current.saveOrderTrade(orderTradeRequest, documentRequests);

            expect(dispatch).toHaveBeenCalledTimes(6);
            expect(registerOrderTrade).toHaveBeenCalledTimes(1);
            expect(registerOrderTrade).toHaveBeenCalledWith(
                orderTradeRequest.supplier,
                orderTradeRequest.customer,
                orderTradeRequest.commissioner,
                orderTradeRequest.paymentDeadline,
                orderTradeRequest.documentDeliveryDeadline,
                orderTradeRequest.arbiter,
                orderTradeRequest.shippingDeadline,
                orderTradeRequest.deliveryDeadline,
                orderTradeRequest.agreedAmount,
                orderTradeRequest.tokenAddress,
                {
                    incoterms: orderTradeRequest.incoterms,
                    shipper: orderTradeRequest.shipper,
                    shippingPort: orderTradeRequest.shippingPort,
                    deliveryPort: orderTradeRequest.deliveryPort
                },
                {
                    prefix: 'icpCanisterUrl',
                    organizationId: 1
                },
                [0]
            );
            expect(waitForTransactions).toHaveBeenCalledTimes(1);
            expect(OrderTradeService).toHaveBeenCalledTimes(3);
            expect(getTrade).toHaveBeenCalledTimes(1);
            expect(addDocument).toHaveBeenCalledTimes(1);
            expect(addLine).toHaveBeenCalledTimes(1);
            expect(addLine).toHaveBeenCalledWith(orderTradeRequest.lines[0]);
            expect(openNotification).toHaveBeenCalled();
        });
        it('should handle save order trade failure', async () => {
            const { result } = renderHook(() => useEthOrderTrade(), {
                wrapper: EthOrderTradeProvider
            });
            await waitFor(() => {
                expect(result.current.orderTrades).toHaveLength(1);
            });
            (getICPCanisterURL as jest.Mock).mockReturnValue('icpCanisterUrl');
            const orderTradeRequest = {
                supplier: 'supplier',
                customer: 'customer',
                commissioner: 'commissioner',
                paymentDeadline: 123,
                documentDeliveryDeadline: 123,
                arbiter: 'arbiter',
                shippingDeadline: 123,
                deliveryDeadline: 123,
                agreedAmount: 10,
                tokenAddress: 'token',
                incoterms: 'incoterms',
                shipper: 'shipper',
                shippingPort: 'shippingPort',
                deliveryPort: 'deliveryPort',
                lines: [{} as LineRequest]
            } as OrderTradeRequest;
            const documentRequests = [
                {
                    documentType: DocumentType.PAYMENT_INVOICE,
                    filename: 'filename',
                    content: { type: 'pdf' }
                } as DocumentRequest
            ];
            registerOrderTrade.mockRejectedValue(new Error('error'));

            await result.current.saveOrderTrade(orderTradeRequest, documentRequests);

            expect(dispatch).toHaveBeenCalledTimes(4);
            expect(registerOrderTrade).toHaveBeenCalledTimes(1);
            expect(openNotification).toHaveBeenCalled();
        });
    });
    describe('updateOrderTrade', () => {
        it('should update order trade', async () => {
            const { result } = renderHook(() => useEthOrderTrade(), {
                wrapper: EthOrderTradeProvider
            });
            await waitFor(() => {
                expect(result.current.orderTrades).toHaveLength(1);
            });
            const orderTradeRequest = {
                supplier: 'supplier',
                customer: 'customer',
                commissioner: 'commissioner',
                paymentDeadline: 123,
                documentDeliveryDeadline: 123,
                arbiter: 'arbiter',
                shippingDeadline: 123,
                deliveryDeadline: 123,
                agreedAmount: 10,
                tokenAddress: 'token',
                incoterms: 'incoterms',
                shipper: 'shipper',
                shippingPort: 'shippingPort',
                deliveryPort: 'deliveryPort',
                lines: [
                    {
                        productCategoryId: productCategories[0].id,
                        quantity: 10,
                        unit: 1,
                        price: { amount: 1, fiat: 'usd' } as OrderLinePrice
                    } as unknown as OrderLineRequest
                ]
            } as OrderTradeRequest;

            await result.current.updateOrderTrade(orderTrade.tradeId, orderTradeRequest);

            expect(dispatch).toHaveBeenCalledTimes(6);
            expect(updatePaymentDeadline).toHaveBeenCalledWith(orderTradeRequest.paymentDeadline);
            expect(updateDocumentDeliveryDeadline).toHaveBeenCalledWith(
                orderTradeRequest.documentDeliveryDeadline
            );
            expect(updateArbiter).toHaveBeenCalledWith(orderTradeRequest.arbiter);
            expect(updateShippingDeadline).toHaveBeenCalledWith(orderTradeRequest.shippingDeadline);
            expect(updateDeliveryDeadline).toHaveBeenCalledWith(orderTradeRequest.deliveryDeadline);
            expect(updateAgreedAmount).toHaveBeenCalledWith(orderTradeRequest.agreedAmount);
            expect(updateTokenAddress).toHaveBeenCalledWith(orderTradeRequest.tokenAddress);
            expect(updateLine).toHaveBeenCalledTimes(1);
            expect(openNotification).toHaveBeenCalled();
        });
        it('should handle update order trade failure', async () => {
            const { result } = renderHook(() => useEthOrderTrade(), {
                wrapper: EthOrderTradeProvider
            });
            await waitFor(() => {
                expect(result.current.orderTrades).toHaveLength(1);
            });
            const orderTradeRequest = {
                supplier: 'supplier',
                customer: 'customer',
                commissioner: 'commissioner',
                paymentDeadline: 123,
                documentDeliveryDeadline: 123,
                arbiter: 'arbiter',
                shippingDeadline: 123,
                deliveryDeadline: 123,
                agreedAmount: 10,
                tokenAddress: 'token',
                incoterms: 'incoterms',
                shipper: 'shipper',
                shippingPort: 'shippingPort',
                deliveryPort: 'deliveryPort',
                lines: [
                    {
                        productCategoryId: productCategories[0].id,
                        quantity: 10,
                        unit: 1,
                        price: { amount: 1, fiat: 'usd' } as OrderLinePrice
                    } as unknown as OrderLineRequest
                ]
            } as OrderTradeRequest;
            updatePaymentDeadline.mockRejectedValue(new Error('error'));

            await result.current.updateOrderTrade(orderTrade.tradeId, orderTradeRequest);

            expect(dispatch).toHaveBeenCalledTimes(4);
            expect(updatePaymentDeadline).toHaveBeenCalledWith(orderTradeRequest.paymentDeadline);
            expect(updateDocumentDeliveryDeadline).not.toHaveBeenCalled();
            expect(openNotification).toHaveBeenCalled();
        });
    });
    describe('confirmNegotiation', () => {
        it('should confirm order trade negotiation', async () => {
            const { result } = renderHook(() => useEthOrderTrade(), {
                wrapper: EthOrderTradeProvider
            });
            await waitFor(() => {
                expect(result.current.orderTrades).toHaveLength(1);
            });

            await result.current.confirmNegotiation(orderTrade.tradeId);

            expect(dispatch).toHaveBeenCalledTimes(6);
            expect(confirmOrder).toHaveBeenCalled();
            expect(openNotification).toHaveBeenCalled();
        });
        it('should handle confirm order trade negotiation failure', async () => {
            confirmOrder.mockRejectedValue(new Error('error'));
            const { result } = renderHook(() => useEthOrderTrade(), {
                wrapper: EthOrderTradeProvider
            });
            await waitFor(() => {
                expect(result.current.orderTrades).toHaveLength(1);
            });

            await result.current.confirmNegotiation(orderTrade.tradeId);

            expect(dispatch).toHaveBeenCalledTimes(4);
            expect(confirmOrder).toHaveBeenCalled();
            expect(openNotification).toHaveBeenCalled();
        });
        it('should reject if order is not found', async () => {
            const { result } = renderHook(() => useEthOrderTrade(), {
                wrapper: EthOrderTradeProvider
            });
            await waitFor(() => {
                expect(result.current.orderTrades).toHaveLength(1);
            });

            await expect(result.current.confirmNegotiation(-1)).rejects.toMatch('Trade not found');
        });
    });
    describe('validateOrderDocument', () => {
        it('should validate document', async () => {
            const { result } = renderHook(() => useEthOrderTrade(), {
                wrapper: EthOrderTradeProvider
            });
            await waitFor(() => {
                expect(result.current.orderTrades).toHaveLength(1);
            });

            await result.current.validateOrderDocument(
                orderTrade.tradeId,
                1,
                DocumentStatus.NOT_EVALUATED
            );

            expect(validateDocument).toHaveBeenCalled();
            expect(validateDocument).toHaveBeenCalledWith(
                1,
                DocumentStatus.NOT_EVALUATED,
                expect.anything()
            );
        });
        it('should reject if order is not found', async () => {
            const { result } = renderHook(() => useEthOrderTrade(), {
                wrapper: EthOrderTradeProvider
            });
            await waitFor(() => {
                expect(result.current.orderTrades).toHaveLength(1);
            });

            await expect(
                result.current.validateOrderDocument(-1, 1, DocumentStatus.NOT_EVALUATED)
            ).rejects.toMatch('Trade not found');
        });
    });
    describe('uploadOrderDocument', () => {
        it('should upload document', async () => {
            const { result } = renderHook(() => useEthOrderTrade(), {
                wrapper: EthOrderTradeProvider
            });
            await waitFor(() => {
                expect(result.current.orderTrades).toHaveLength(1);
            });

            await result.current.uploadOrderDocument(
                orderTrade.tradeId,
                {} as DocumentRequest,
                'externalUrl'
            );

            expect(uploadDocument).toHaveBeenCalled();
            expect(uploadDocument).toHaveBeenCalledWith(
                {} as DocumentRequest,
                'externalUrl',
                expect.anything()
            );
        });
        it('should reject if order is not found', async () => {
            const { result } = renderHook(() => useEthOrderTrade(), {
                wrapper: EthOrderTradeProvider
            });
            await waitFor(() => {
                expect(result.current.orderTrades).toHaveLength(1);
            });

            await expect(
                result.current.uploadOrderDocument(-1, {} as DocumentRequest, 'externalUrl')
            ).rejects.toMatch('Trade not found');
        });
    });
    describe('notifyExpiration', () => {
        it('should notify order expiration', async () => {
            const fetchBackup = global.fetch;
            getName.mockReturnValue('recipientCompanyName');
            const mockedFetch = jest.fn().mockResolvedValueOnce({ ok: true });
            global.fetch = mockedFetch;
            const { result } = renderHook(() => useEthOrderTrade(), {
                wrapper: EthOrderTradeProvider
            });
            await waitFor(() => {
                expect(result.current.orderTrades).toHaveLength(1);
            });

            await result.current.notifyExpiration(orderTrade.tradeId, 'email', 'message');

            expect(dispatch).toHaveBeenCalledTimes(4);
            expect(mockedFetch).toHaveBeenCalled();
            expect(mockedFetch).toHaveBeenCalledWith(
                `${requestPath.EMAIL_SENDER_URL}/email/deadline-expired`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: 'email',
                        recipientCompanyName: 'recipientCompanyName',
                        senderCompanyName: userInfo.legalName,
                        senderEmailAddress: userInfo.email,
                        message: 'message',
                        transactionUrl: 'http://localhost/'
                    })
                }
            );
            expect(openNotification).toHaveBeenCalled();
            global.fetch = fetchBackup;
        });
        it('should handle notify order expiration failure', async () => {
            const fetchBackup = global.fetch;
            getName.mockReturnValue('recipientCompanyName');
            const mockedFetch = jest.fn().mockRejectedValue(new Error('error'));
            global.fetch = mockedFetch;
            const { result } = renderHook(() => useEthOrderTrade(), {
                wrapper: EthOrderTradeProvider
            });
            await waitFor(() => {
                expect(result.current.orderTrades).toHaveLength(1);
            });

            await result.current.notifyExpiration(orderTrade.tradeId, 'email', 'message');

            expect(dispatch).toHaveBeenCalledTimes(4);
            expect(mockedFetch).toHaveBeenCalled();
            expect(openNotification).toHaveBeenCalled();
            global.fetch = fetchBackup;
        });
        it('should reject if order is not found', async () => {
            const { result } = renderHook(() => useEthOrderTrade(), {
                wrapper: EthOrderTradeProvider
            });
            await waitFor(() => {
                expect(result.current.orderTrades).toHaveLength(1);
            });

            await expect(result.current.notifyExpiration(-1, 'email', 'message')).rejects.toMatch(
                'Trade not found'
            );
        });
    });
});
