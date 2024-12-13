import { JsonRpcSigner } from '@ethersproject/providers';
import {
    Order,
    OrderStatus,
    ShipmentService,
    TokenService,
    FileDriver,
    Shipment,
    ShipmentPhase,
    ShipmentPhaseDocument,
    DocumentType
} from '@kbc-lib/coffee-trading-management-lib';
import { useSigner } from '@/providers/SignerProvider';
import { useDispatch, useSelector } from 'react-redux';
import { useSiweIdentity } from '@/providers/SiweIdentityProvider';
import { checkAndGetEnvironmentVariable } from '@/utils/env';
import { useOrder } from '@/providers/icp/OrderProvider';
import { useEthDownPayment } from '@/providers/entities/EthDownPaymentProvider';
import { useICP } from '@/providers/ICPProvider';
import { UserInfoState } from '@/redux/reducers/userInfoSlice';
import { useCallHandler } from '@/providers/icp/CallHandlerProvider';
import { act, renderHook, waitFor } from '@testing-library/react';
import { ShipmentProvider, useShipment } from '@/providers/icp/ShipmentProvider';
import { openNotification } from '@/utils/notification';
import { Typography } from 'antd';

jest.mock('@kbc-lib/coffee-trading-management-lib');
jest.mock('@/providers/SignerProvider');
jest.mock('@/providers/icp/OrderProvider');
jest.mock('@/providers/entities/EthDownPaymentProvider');
jest.mock('@/providers/ICPProvider');
jest.mock('@/providers/SiweIdentityProvider');
jest.mock('@/utils/env');
jest.mock('antd', () => {
    const originalModule = jest.requireActual('antd');
    return {
        ...originalModule,
        Typography: {
            ...originalModule.Typography,
            Text: jest.fn((props) => <span {...props} />)
        }
    };
});
jest.mock('@/redux/reducers/loadingSlice');
jest.mock('@/utils/notification');
jest.mock('react-redux');
jest.mock('@/utils/file');
jest.mock('@/providers/icp/CallHandlerProvider');

describe('ShipmentProvider', () => {
    const signer = { _address: '0x123' } as JsonRpcSigner;
    const dispatch = jest.fn();
    const userInfo = { companyClaims: { organizationId: '1' } } as UserInfoState;

    const mockShipmentService = {
        getShipments: jest.fn(),
        getShipment: jest.fn(),
        getShipmentPhase: jest.fn(),
        getDocumentsByType: jest.fn(),
        setShipmentDetails: jest.fn(),
        approveSample: jest.fn(),
        rejectSample: jest.fn(),
        approveShipmentDetails: jest.fn(),
        rejectShipmentDetails: jest.fn(),
        approveQuality: jest.fn(),
        rejectQuality: jest.fn(),
        determineDownPaymentAddress: jest.fn(),
        depositFunds: jest.fn(),
        lockFunds: jest.fn(),
        unlockFunds: jest.fn(),
        retrieveDocument: jest.fn(),
        getDocuments: jest.fn(),
        getDocument: jest.fn(),
        addDocument: jest.fn(),
        updateDocument: jest.fn(),
        approveDocument: jest.fn(),
        rejectDocument: jest.fn(),
        getPhaseDocuments: jest.fn(),
        getPhase1Documents: jest.fn(),
        getPhase1RequiredDocuments: jest.fn(),
        getPhase2Documents: jest.fn(),
        getPhase2RequiredDocuments: jest.fn(),
        getPhase3Documents: jest.fn(),
        getPhase3RequiredDocuments: jest.fn(),
        getPhase4Documents: jest.fn(),
        getPhase4RequiredDocuments: jest.fn(),
        getPhase5Documents: jest.fn(),
        getPhase5RequiredDocuments: jest.fn()
    };

    const mockTokenService = {
        approve: jest.fn()
    };

    const mockUseEthDownPayment = {
        loadDownPaymentDetails: jest.fn(),
        loadTokenDetails: jest.fn()
    };

    const mockOrder = {
        id: 1,
        supplier: 'supplier',
        customer: 'customer',
        commissioner: 'commissioner',
        signatures: ['signature'],
        status: OrderStatus.PENDING,
        paymentDeadline: new Date(1),
        documentDeliveryDeadline: new Date(1),
        shippingDeadline: new Date(1),
        deliveryDeadline: new Date(1),
        arbiter: 'arbiter',
        incoterms: 'incoterms',
        shipper: 'shipper',
        shippingPort: 'shippingPort',
        deliveryPort: 'deliveryPort',
        lines: [],
        token: 'token',
        agreedAmount: 1,
        shipment: {
            id: 1
        } as Shipment
    } as unknown as Order;
    const mockOrderService = {
        getOrder: jest.fn()
    };

    const mockUseCallHandler = {
        handleICPCall: jest.fn()
    };

    const mockEmptyDocumentMap = new Map<ShipmentPhase, ShipmentPhaseDocument[]>([
        [ShipmentPhase.PHASE_1, []],
        [ShipmentPhase.PHASE_2, []],
        [ShipmentPhase.PHASE_3, []],
        [ShipmentPhase.PHASE_4, []],
        [ShipmentPhase.PHASE_5, []],
        [ShipmentPhase.CONFIRMED, []],
        [ShipmentPhase.ARBITRATION, []]
    ]);

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        (ShipmentService as jest.Mock).mockImplementation(() => mockShipmentService);
        (TokenService as jest.Mock).mockImplementation(() => mockTokenService);
        (useSigner as jest.Mock).mockReturnValue({ signer });
        (useDispatch as jest.Mock).mockReturnValue(dispatch);
        (useSiweIdentity as jest.Mock).mockReturnValue({ identity: 'identity' });
        (checkAndGetEnvironmentVariable as jest.Mock).mockReturnValue('ENTITY_MANAGER_CANISTER_ID');
        (useOrder as jest.Mock).mockReturnValue({
            order: mockOrder,
            orderService: mockOrderService
        });
        (useEthDownPayment as jest.Mock).mockReturnValue(mockUseEthDownPayment);
        (useICP as jest.Mock).mockReturnValue({
            fileDriver: {} as FileDriver
        });
        (useSelector as jest.Mock).mockImplementation((fn) => fn({ userInfo }));
        (useCallHandler as jest.Mock).mockReturnValue(mockUseCallHandler);
    });

    const renderShipment = async (shipment: Shipment | null = null) => {
        const mockShipment = shipment ? shipment : ({ id: 1 } as Shipment);
        mockShipmentService.getShipment.mockReturnValue(mockShipment);
        const mockPhase = ShipmentPhase.PHASE_1;
        mockShipmentService.getShipmentPhase.mockReturnValue(mockPhase);
        mockShipmentService.getPhaseDocuments.mockReturnValue([]);
        const { result } = renderHook(() => useShipment(), {
            wrapper: ShipmentProvider
        });

        expect(mockUseCallHandler.handleICPCall).toHaveBeenCalled();
        const mockHandleICPCall = mockUseCallHandler.handleICPCall.mock.calls[0][0];
        await act(async () => {
            await mockHandleICPCall();
        });

        await waitFor(() => {
            expect(result.current.detailedShipment).toEqual({
                shipment: mockShipment,
                phase: mockPhase,
                orderId: mockOrder.id,
                phaseDocuments: mockEmptyDocumentMap
            });
        });

        expect(mockShipmentService.getShipment).toHaveBeenCalled();
        return result;
    };

    it('should throw error if hook is used outside the provider', async () => {
        expect(() => renderHook(() => useShipment())).toThrow();
    });

    it('should render error message if identity is not initialized', async () => {
        (useSiweIdentity as jest.Mock).mockReturnValue({ identity: null });
        const mockTypographyText = Typography.Text as unknown as jest.Mock;
        renderHook(() => useShipment(), {
            wrapper: ShipmentProvider
        });
        expect(mockTypographyText).toHaveBeenCalledTimes(1);
        expect(mockTypographyText).toHaveBeenCalledWith(
            expect.objectContaining({
                children: 'Siwe identity not initialized'
            }),
            {}
        );
    });

    it('should load shipment', async () => {
        await renderShipment();
    });

    it('should set shipment details', async () => {
        const result = await renderShipment();
        expect(mockUseCallHandler.handleICPCall).toHaveBeenCalledTimes(1);
        await act(async () => {
            await result.current.setDetails(1, new Date(1), new Date(1), 'targetExchange', 10, 10, 10, 10, 10, 10);
        });
        expect(mockUseCallHandler.handleICPCall).toHaveBeenCalledTimes(2);
        const mockHandleICPCall = mockUseCallHandler.handleICPCall.mock.calls[1][0];
        await act(async () => {
            await mockHandleICPCall();
        });
        expect(mockShipmentService.setShipmentDetails).toHaveBeenCalledTimes(1);
        expect(openNotification).toHaveBeenCalledTimes(1);
    });

    it('should approve sample', async () => {
        const result = await renderShipment();
        expect(mockUseCallHandler.handleICPCall).toHaveBeenCalledTimes(1);
        await act(async () => {
            await result.current.approveSample();
        });
        expect(mockUseCallHandler.handleICPCall).toHaveBeenCalledTimes(2);
        const mockHandleICPCall = mockUseCallHandler.handleICPCall.mock.calls[1][0];
        await act(async () => {
            await mockHandleICPCall();
        });
        expect(mockShipmentService.approveSample).toHaveBeenCalledTimes(1);
        expect(openNotification).toHaveBeenCalledTimes(1);
    });

    describe('depositFunds', () => {
        it('should deposit funds when down payment address is set', async () => {
            const result = await renderShipment({
                id: 1,
                downPaymentAddress: 'downPaymentAddress'
            } as Shipment);
            expect(mockUseCallHandler.handleICPCall).toHaveBeenCalledTimes(1);
            await act(async () => {
                await result.current.depositFunds(10);
            });
            expect(mockUseCallHandler.handleICPCall).toHaveBeenCalledTimes(2);
            const mockHandleICPCall = mockUseCallHandler.handleICPCall.mock.calls[1][0];
            await act(async () => {
                await mockHandleICPCall();
            });
            expect(mockShipmentService.depositFunds).toHaveBeenCalledTimes(1);
            expect(mockUseEthDownPayment.loadDownPaymentDetails).toHaveBeenCalledTimes(1);
            expect(mockUseEthDownPayment.loadTokenDetails).toHaveBeenCalledTimes(1);
            expect(openNotification).toHaveBeenCalledTimes(1);
        });

        it('should throw error if down payment address is not set', async () => {
            const result = await renderShipment({
                id: 1
            } as Shipment);
            expect(mockUseCallHandler.handleICPCall).toHaveBeenCalledTimes(1);
            await expect(async () => {
                await result.current.depositFunds(10);
            }).rejects.toThrowError('Down payment address not determined');
            expect(mockShipmentService.depositFunds).not.toHaveBeenCalled();
        });
    });

    describe('getDocument', () => {
        it('should get document', async () => {
            mockShipmentService.getDocument.mockReturnValue({
                fileName: 'fileName',
                documentType: DocumentType.BILL_OF_LADING
            });
            const result = await renderShipment();
            expect(mockUseCallHandler.handleICPCall).toHaveBeenCalledTimes(1);
            await act(async () => {
                await result.current.getDocument(1);
            });
            expect(mockShipmentService.getDocument).toHaveBeenCalledTimes(1);
        });

        it('should handle errrors', async () => {
            mockShipmentService.getDocument.mockRejectedValue(new Error('error'));
            const result = await renderShipment();
            expect(mockUseCallHandler.handleICPCall).toHaveBeenCalledTimes(1);
            await expect(async () => await result.current.getDocument(1)).rejects.toThrowError('Error while retrieving document');
        });
    });

    it('should add document', async () => {
        const result = await renderShipment();
        expect(mockUseCallHandler.handleICPCall).toHaveBeenCalledTimes(1);
        await act(async () => {
            await result.current.addDocument(DocumentType.BILL_OF_LADING, 'documentReferenceId', 'fileName', new Blob());
        });
        expect(mockUseCallHandler.handleICPCall).toHaveBeenCalledTimes(2);
        const mockHandleICPCall = mockUseCallHandler.handleICPCall.mock.calls[1][0];
        await act(async () => {
            await mockHandleICPCall();
        });
        expect(mockShipmentService.addDocument).toHaveBeenCalledTimes(1);
        expect(openNotification).toHaveBeenCalledTimes(1);
    });

    it('should get shipment phase asynchronously', async () => {
        mockOrderService.getOrder.mockResolvedValue(mockOrder);
        mockShipmentService.getShipmentPhase.mockReturnValue(ShipmentPhase.PHASE_1);
        const result = await renderShipment();
        const phase = await result.current.getShipmentPhaseAsync(1);
        expect(phase).toEqual(ShipmentPhase.PHASE_1);
    });

    it.each([
        { serviceFnName: 'approveSample', mockedFnName: 'approveSample' },
        { serviceFnName: 'rejectSample', mockedFnName: 'rejectSample' },
        { serviceFnName: 'approveDetails', mockedFnName: 'approveShipmentDetails' },
        { serviceFnName: 'rejectDetails', mockedFnName: 'rejectShipmentDetails' },
        { serviceFnName: 'approveQuality', mockedFnName: 'approveQuality' },
        { serviceFnName: 'rejectQuality', mockedFnName: 'rejectQuality' },
        { serviceFnName: 'determineDownPaymentAddress', mockedFnName: 'determineDownPaymentAddress' },
        { serviceFnName: 'lockFunds', mockedFnName: 'lockFunds' },
        { serviceFnName: 'unlockFunds', mockedFnName: 'unlockFunds' },
        { serviceFnName: 'approveDocument', mockedFnName: 'approveDocument' },
        { serviceFnName: 'rejectDocument', mockedFnName: 'rejectDocument' }
    ])('should call function $serviceFnName', async ({ serviceFnName, mockedFnName }) => {
        const result = await renderShipment();
        expect(mockUseCallHandler.handleICPCall).toHaveBeenCalledTimes(1);
        await act(async () => {
            // @ts-ignore
            await result.current[serviceFnName]();
        });
        expect(mockUseCallHandler.handleICPCall).toHaveBeenCalledTimes(2);
        const mockHandleICPCall = mockUseCallHandler.handleICPCall.mock.calls[1][0];
        await act(async () => {
            await mockHandleICPCall();
        });
        expect(mockShipmentService[mockedFnName as keyof typeof mockShipmentService]).toHaveBeenCalledTimes(1);
        expect(openNotification).toHaveBeenCalledTimes(1);
    });
});
