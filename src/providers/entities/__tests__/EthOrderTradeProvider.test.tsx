import { act, renderHook, waitFor } from '@testing-library/react';
import {
    EthOrderTradeProvider,
    OrderTradeRequest,
    useEthOrderTrade
} from '../EthOrderTradeProvider';
import {
    ICPFileDriver,
    Line,
    LineRequest,
    Material,
    NegotiationStatus,
    OrderLinePrice,
    OrderLineRequest,
    OrderTrade,
    OrderTradeService,
    ProductCategory,
    RoleProof,
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
import { useICPOrganization } from '@/providers/entities/ICPOrganizationProvider';
import { requestPath } from '@/constants/url';
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
jest.mock('@/providers/entities/ICPOrganizationProvider');
jest.mock('react-router-dom');

describe('EthOrderTradeProvider', () => {
    const signer = { _address: '0x123' } as JsonRpcSigner;
    const dispatch = jest.fn();
    const getTrade = jest.fn();
    const getCompleteTrade = jest.fn();
    const getEscrowAddress = jest.fn();
    const getShipmentAddress = jest.fn();
    const getWhoSigned = jest.fn();
    const createShipment = jest.fn();
    const addLine = jest.fn();
    const updatePaymentDeadline = jest.fn();
    const updateDocumentDeliveryDeadline = jest.fn();
    const updateArbiter = jest.fn();
    const updateShippingDeadline = jest.fn();
    const updateDeliveryDeadline = jest.fn();
    const updateAgreedAmount = jest.fn();
    const updateTokenAddress = jest.fn();
    const updateLine = jest.fn();
    const getNegotiationStatus = jest.fn();
    const confirmOrder = jest.fn();
    const registerOrderTrade = jest.fn();
    const waitForTransactions = jest.fn();
    const getCompany = jest.fn();
    const MockedOrderTradeService = {
        getTrade,
        getCompleteTrade,
        getEscrowAddress,
        getShipmentAddress,
        getWhoSigned,
        createShipment,
        addLine,
        getNegotiationStatus,
        updatePaymentDeadline,
        updateDocumentDeliveryDeadline,
        updateArbiter,
        updateShippingDeadline,
        updateDeliveryDeadline,
        updateAgreedAmount,
        updateTokenAddress,
        updateLine,
        confirmOrder
    };

    const rawTrades = [{ id: 1, address: '0x123', type: TradeType.ORDER } as RawTrade];
    const roleProof: RoleProof = { delegator: 'delegator', signedProof: 'signedProof' };
    const userInfo = { companyClaims: { organizationId: '1' }, roleProof } as UserInfoState;
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
        supplier: '0x456',
        escrow: '0x789'
    } as unknown as OrderTrade;
    const productCategories = [{ id: 1 } as ProductCategory];

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(jest.fn());

        (OrderTradeService as jest.Mock).mockImplementation(() => MockedOrderTradeService);
        (TradeManagerService as jest.Mock).mockImplementation(() => ({
            registerOrderTrade
        }));
        (useSigner as jest.Mock).mockReturnValue({ signer, waitForTransactions });
        (useEthRawTrade as jest.Mock).mockReturnValue({ rawTrades });
        (useICPOrganization as jest.Mock).mockReturnValue({
            getCompany
        });
        (useDispatch as jest.Mock).mockReturnValue(dispatch);
        (useICP as jest.Mock).mockReturnValue({
            fileDriver: {} as ICPFileDriver
        });
        (useSelector as jest.Mock).mockImplementation((fn) => fn({ userInfo }));
        (getICPCanisterURL as jest.Mock).mockReturnValue('icpCanisterUrl');
        (useEthMaterial as jest.Mock).mockReturnValue({
            productCategories
        });
        (useParams as jest.Mock).mockReturnValue({ id: '' });

        getTrade.mockResolvedValue(orderTrade);
        getCompleteTrade.mockResolvedValue(orderTrade);
        getWhoSigned.mockResolvedValue([]);
        getShipmentAddress.mockResolvedValue('0xshipment');
        getNegotiationStatus.mockResolvedValue(orderTrade.negotiationStatus);
        getEscrowAddress.mockResolvedValue('0xescrow');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should throw error if hook is used outside the provider', async () => {
        expect(() => renderHook(() => useEthOrderTrade())).toThrow();
    });

    describe('detailed order trade', () => {
        beforeEach(() => {
            (useParams as jest.Mock).mockReturnValue({ id: '1' });
        });

        it('should render correctly', async () => {
            const { result } = renderHook(() => useEthOrderTrade(), {
                wrapper: EthOrderTradeProvider
            });
            await waitFor(() => {
                expect(result.current.detailedOrderTrade).toBeNull();
            });

            expect(dispatch).toHaveBeenCalledTimes(2);
            expect(OrderTradeService).toHaveBeenCalledTimes(1);
            expect(getCompleteTrade).toHaveBeenCalledTimes(1);
            expect(getNegotiationStatus).toHaveBeenCalledTimes(1);
            expect(getShipmentAddress).toHaveBeenCalledTimes(1);
            expect(getEscrowAddress).toHaveBeenCalledTimes(1);
            expect(openNotification).not.toHaveBeenCalled();
        });

        it('should load detailed order trade on initial render', async () => {
            let result: any;
            await act(
                async () =>
                    ({ result } = renderHook(() => useEthOrderTrade(), {
                        wrapper: EthOrderTradeProvider
                    }))
            );
            const detailedOrderTrade = {
                trade: orderTrade,
                service: MockedOrderTradeService,
                negotiationStatus: NegotiationStatus.PENDING,
                shipmentAddress: '0xshipment',
                escrowAddress: '0xescrow'
            };
            // await waitFor(() => {
            //     expect(result.result.current.detailedOrderTrade).not.toBeNull();
            // });

            expect(result.current.detailedOrderTrade).toEqual(detailedOrderTrade);
            expect(dispatch).toHaveBeenCalledTimes(2);
            expect(OrderTradeService).toHaveBeenCalledTimes(1);
            expect(getCompleteTrade).toHaveBeenCalledTimes(1);
            expect(getNegotiationStatus).toHaveBeenCalledTimes(1);
            expect(getShipmentAddress).toHaveBeenCalledTimes(1);
            expect(getEscrowAddress).toHaveBeenCalledTimes(1);
            expect(openNotification).not.toHaveBeenCalled();
        });
    });

    describe('saveOrderTrade', () => {
        it('should save order trade', async () => {
            const { result } = renderHook(() => useEthOrderTrade(), {
                wrapper: EthOrderTradeProvider
            });
            await waitFor(() => {
                expect(result.current.detailedOrderTrade).toBeNull();
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
                lines: [{} as LineRequest]
            } as OrderTradeRequest;
            registerOrderTrade.mockResolvedValue([1, 2, 3]);

            await result.current.saveOrderTrade(orderTradeRequest);

            expect(dispatch).toHaveBeenCalledTimes(2);
            expect(registerOrderTrade).toHaveBeenCalledTimes(1);
            expect(registerOrderTrade).toHaveBeenCalledWith(
                roleProof,
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
            expect(OrderTradeService).toHaveBeenCalledTimes(1);
            expect(addLine).toHaveBeenCalledTimes(1);
            expect(addLine).toHaveBeenCalledWith(roleProof, orderTradeRequest.lines[0]);
            expect(openNotification).toHaveBeenCalled();
        });
        it('should handle save order trade failure', async () => {
            const { result } = renderHook(() => useEthOrderTrade(), {
                wrapper: EthOrderTradeProvider
            });
            await waitFor(() => {
                expect(result.current.detailedOrderTrade).toBeNull();
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
                lines: [{} as LineRequest]
            } as OrderTradeRequest;
            registerOrderTrade.mockRejectedValue(new Error('error'));

            jest.clearAllMocks();
            await result.current.saveOrderTrade(orderTradeRequest);

            expect(dispatch).toHaveBeenCalledTimes(2);
            expect(registerOrderTrade).toHaveBeenCalledTimes(1);
            expect(openNotification).toHaveBeenCalled();
        });
    });

    describe('updateOrderTrade', () => {
        beforeEach(() => {
            (useParams as jest.Mock).mockReturnValue({ id: '1' });
        });

        it('should update order trade', async () => {
            const { result } = renderHook(() => useEthOrderTrade(), {
                wrapper: EthOrderTradeProvider
            });
            await waitFor(() => {
                expect(result.current.detailedOrderTrade).not.toBeNull();
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

            await result.current.updateOrderTrade(orderTradeRequest);

            expect(dispatch).toHaveBeenCalledTimes(6);
            expect(updatePaymentDeadline).toHaveBeenCalledWith(
                roleProof,
                orderTradeRequest.paymentDeadline
            );
            expect(updateDocumentDeliveryDeadline).toHaveBeenCalledWith(
                roleProof,
                orderTradeRequest.documentDeliveryDeadline
            );
            expect(updateArbiter).toHaveBeenCalledWith(roleProof, orderTradeRequest.arbiter);
            expect(updateShippingDeadline).toHaveBeenCalledWith(
                roleProof,
                orderTradeRequest.shippingDeadline
            );
            expect(updateDeliveryDeadline).toHaveBeenCalledWith(
                roleProof,
                orderTradeRequest.deliveryDeadline
            );
            expect(updateAgreedAmount).toHaveBeenCalledWith(
                roleProof,
                orderTradeRequest.agreedAmount
            );
            expect(updateTokenAddress).toHaveBeenCalledWith(
                roleProof,
                orderTradeRequest.tokenAddress
            );
            expect(updateLine).toHaveBeenCalledTimes(1);
            expect(getCompleteTrade).toHaveBeenCalledTimes(2);
            expect(openNotification).toHaveBeenCalled();
        });
        it('should handle update order trade failure', async () => {
            const { result } = renderHook(() => useEthOrderTrade(), {
                wrapper: EthOrderTradeProvider
            });
            await waitFor(() => {
                expect(result.current.detailedOrderTrade).not.toBeNull();
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

            jest.clearAllMocks();
            await result.current.updateOrderTrade(orderTradeRequest);

            expect(dispatch).toHaveBeenCalledTimes(2);
            expect(updatePaymentDeadline).toHaveBeenCalledWith(
                roleProof,
                orderTradeRequest.paymentDeadline
            );
            expect(updateDocumentDeliveryDeadline).not.toHaveBeenCalled();
            expect(openNotification).toHaveBeenCalled();
        });
    });

    describe('confirmNegotiation', () => {
        beforeEach(() => {
            (useParams as jest.Mock).mockReturnValue({ id: '1' });
        });

        it('should confirm order trade negotiation', async () => {
            const { result } = renderHook(() => useEthOrderTrade(), {
                wrapper: EthOrderTradeProvider
            });
            await waitFor(() => {
                expect(result.current.detailedOrderTrade).not.toBeNull();
            });

            await result.current.confirmNegotiation();

            expect(dispatch).toHaveBeenCalledTimes(6);
            expect(confirmOrder).toHaveBeenCalledTimes(1);
            expect(confirmOrder).toHaveBeenCalledWith(roleProof);
            expect(openNotification).toHaveBeenCalled();
        });
        it('should handle confirm order trade negotiation failure', async () => {
            confirmOrder.mockRejectedValue(new Error('error'));
            const { result } = renderHook(() => useEthOrderTrade(), {
                wrapper: EthOrderTradeProvider
            });
            await waitFor(() => {
                expect(result.current.detailedOrderTrade).not.toBeNull();
            });

            await result.current.confirmNegotiation();

            expect(dispatch).toHaveBeenCalledTimes(4);
            expect(confirmOrder).toHaveBeenCalled();
            expect(openNotification).toHaveBeenCalled();
        });
    });

    describe('notifyExpiration', () => {
        beforeEach(() => {
            (useParams as jest.Mock).mockReturnValue({ id: '1' });
        });

        it('should notify order expiration', async () => {
            const fetchBackup = global.fetch;
            getCompany.mockReturnValue({ legalName: 'recipientCompanyName' });
            const mockedFetch = jest.fn().mockResolvedValueOnce({ ok: true });
            global.fetch = mockedFetch;
            const { result } = renderHook(() => useEthOrderTrade(), {
                wrapper: EthOrderTradeProvider
            });
            await waitFor(() => {
                expect(result.current.detailedOrderTrade).not.toBeNull();
            });

            await result.current.notifyExpiration('email', 'message');

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
                        senderCompanyName: userInfo.companyClaims.legalName,
                        senderEmailAddress: userInfo.companyClaims.email,
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
            getCompany.mockReturnValue({ legalName: 'recipientCompanyName' });
            const mockedFetch = jest.fn().mockRejectedValue(new Error('error'));
            global.fetch = mockedFetch;
            const { result } = renderHook(() => useEthOrderTrade(), {
                wrapper: EthOrderTradeProvider
            });
            await waitFor(() => {
                expect(result.current.detailedOrderTrade).not.toBeNull();
            });

            jest.clearAllMocks();
            await result.current.notifyExpiration('email', 'message');

            expect(dispatch).toHaveBeenCalledTimes(2);
            expect(mockedFetch).toHaveBeenCalled();
            expect(openNotification).toHaveBeenCalled();
            global.fetch = fetchBackup;
        });
        it('should reject if order is not found', async () => {
            const { result } = renderHook(() => useEthOrderTrade(), {
                wrapper: EthOrderTradeProvider
            });

            await expect(result.current.notifyExpiration('email', 'message')).rejects.toThrowError(
                'Trade not found'
            );
        });
    });

    describe('getNegotiationStatusAsync', () => {
        it('should return negotiation status', async () => {
            const { result } = renderHook(() => useEthOrderTrade(), {
                wrapper: EthOrderTradeProvider
            });

            await result.current.getNegotiationStatusAsync(1);
            expect(OrderTradeService).toHaveBeenCalledTimes(1);
            expect(getNegotiationStatus).toHaveBeenCalled();
        });

        it('should handle get negotiation status failure - order not found', async () => {
            const { result } = renderHook(() => useEthOrderTrade(), {
                wrapper: EthOrderTradeProvider
            });
            await expect(result.current.getNegotiationStatusAsync(-1)).rejects.toThrowError(
                'Trade not found'
            );
        });
    });

    describe('getSupplierAsync', () => {
        it('should return the order supplier', async () => {
            const { result } = renderHook(() => useEthOrderTrade(), {
                wrapper: EthOrderTradeProvider
            });

            await result.current.getSupplierAsync(1);
            expect(OrderTradeService).toHaveBeenCalledTimes(1);
            expect(getCompleteTrade).toHaveBeenCalled();
            expect(getCompleteTrade).toHaveBeenCalledWith(roleProof);
        });

        it('should handle get order supplier failure - order not found', async () => {
            const { result } = renderHook(() => useEthOrderTrade(), {
                wrapper: EthOrderTradeProvider
            });
            await expect(result.current.getSupplierAsync(-1)).rejects.toThrowError(
                'Trade not found'
            );
        });
    });

    describe('getCustomerAsync', () => {
        it('should return the order customer', async () => {
            const { result } = renderHook(() => useEthOrderTrade(), {
                wrapper: EthOrderTradeProvider
            });

            await result.current.getCustomerAsync(1);
            expect(OrderTradeService).toHaveBeenCalledTimes(1);
            expect(getCompleteTrade).toHaveBeenCalled();
            expect(getCompleteTrade).toHaveBeenCalledWith(roleProof);
        });

        it('should handle get order customer failure - order not found', async () => {
            const { result } = renderHook(() => useEthOrderTrade(), {
                wrapper: EthOrderTradeProvider
            });
            await expect(result.current.getCustomerAsync(-1)).rejects.toThrowError(
                'Trade not found'
            );
        });
    });

    describe('getDetailedTradesAsync', () => {
        it('should return a list of detailed trades', async () => {
            const rawTrades = [
                { id: 1, address: '0x123', type: TradeType.ORDER },
                { id: 2, address: '0x456', type: TradeType.ORDER }
            ] as RawTrade[];
            (useEthRawTrade as jest.Mock).mockReturnValue({ rawTrades });
            const { result } = renderHook(() => useEthOrderTrade(), {
                wrapper: EthOrderTradeProvider
            });
            expect(result.current.detailedOrderTrade).toBeNull();

            await result.current.getDetailedTradesAsync();
            expect(OrderTradeService).toHaveBeenCalledTimes(rawTrades.length);
            expect(getCompleteTrade).toHaveBeenCalledTimes(rawTrades.length);
            expect(getNegotiationStatus).toHaveBeenCalledTimes(rawTrades.length);
            expect(getShipmentAddress).toHaveBeenCalledTimes(rawTrades.length);
            expect(getEscrowAddress).toHaveBeenCalledTimes(rawTrades.length);
        });
    });
});
