import { renderHook, waitFor } from '@testing-library/react';
import { useEthOrderTrade } from '../EthOrderTradeProvider';
import {
    DocumentType,
    ICPFileDriver,
    Line,
    Material,
    NegotiationStatus,
    OrderTrade,
    OrderTradeService,
    ProductCategory,
    Shipment,
    ShipmentDocumentType,
    ShipmentEvaluationStatus,
    ShipmentPhase,
    ShipmentService,
    TokenService,
    TradeType
} from '@kbc-lib/coffee-trading-management-lib';
import { useDispatch, useSelector } from 'react-redux';
import { useSigner } from '@/providers/SignerProvider';
import { openNotification } from '@/utils/notification';
import { RawTrade, useEthRawTrade } from '@/providers/entities/EthRawTradeProvider';
import { UserInfoState } from '@/redux/reducers/userInfoSlice';
import { getICPCanisterURL } from '@/utils/icp';
import { useICP } from '@/providers/ICPProvider';
import { JsonRpcSigner } from '@ethersproject/providers';
import { EthShipmentProvider, useEthShipment } from '@/providers/entities/EthShipmentProvider';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { useEthEscrow } from '@/providers/entities/EthEscrowProvider';

jest.mock('@kbc-lib/coffee-trading-management-lib');
jest.mock('@/providers/SignerProvider');
jest.mock('@/providers/entities/EthRawTradeProvider');
jest.mock('react-redux');
jest.mock('@/utils/notification');
jest.mock('@/utils/icp');
jest.mock('@/utils/file', () => ({
    ...jest.requireActual('@/utils/file'),
    getMimeType: jest.fn().mockReturnValue('application/pdf')
}));

jest.mock('@/providers/entities/EthEscrowProvider');
jest.mock('@/providers/ICPProvider');
jest.mock('@/providers/entities/EthOrderTradeProvider');
jest.mock('@/providers/entities/ICPNameProvider');
jest.mock('react-router-dom');

describe('EthShipmentProvider', () => {
    const signer = { _address: '0x123' } as JsonRpcSigner;
    const dispatch = jest.fn();

    const getShipmentAddress = jest.fn();
    const getOrderTradeService = jest.fn();

    const addDocument = jest.fn();
    const getShipment = jest.fn();
    const getPhase = jest.fn();
    const getDocumentInfo = jest.fn();
    const updateShipment = jest.fn();
    const approveShipment = jest.fn();
    const depositFunds = jest.fn();
    const getDocument = jest.fn();
    const approveDocument = jest.fn();
    const rejectDocument = jest.fn();
    const confirmShipment = jest.fn();
    const startShipmentArbitration = jest.fn();

    const tokenApprove = jest.fn();

    const loadEscrowDetails = jest.fn();
    const loadTokenDetails = jest.fn();

    const rawTrades = [{ id: 1, address: '0x123', type: TradeType.ORDER } as RawTrade];
    const userInfo = { companyClaims: { organizationId: '1' } } as UserInfoState;
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
    const shipment = {
        approved: false,
        expirationDate: dayjs().add(1, 'day').toDate(),
        quantity: 100,
        weight: 300,
        price: 1000,
        evaluationStatus: ShipmentEvaluationStatus.NOT_EVALUATED,
        documentsIds: [1]
    } as unknown as Shipment;
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(jest.fn());

        (ShipmentService as jest.Mock).mockImplementation(() => ({
            addDocument,
            getShipment,
            getPhase,
            getDocumentInfo,
            updateShipment,
            approveShipment,
            depositFunds,
            getDocument,
            approveDocument,
            rejectDocument,
            confirmShipment,
            startShipmentArbitration
        }));
        (TokenService as jest.Mock).mockImplementation(() => ({
            approve: tokenApprove
        }));
        (useSigner as jest.Mock).mockReturnValue({ signer });
        (useEthRawTrade as jest.Mock).mockReturnValue({ rawTrades });
        (useEthOrderTrade as jest.Mock).mockReturnValue({
            detailedOrderTrade: {
                trade: orderTrade,
                service: jest.fn(),
                negotiationStatus: NegotiationStatus.CONFIRMED,
                shipmentAddress: '0x123',
                escrowAddress: '0x456'
            },
            getOrderTradeService
        });
        (useDispatch as jest.Mock).mockReturnValue(dispatch);
        (useICP as jest.Mock).mockReturnValue({
            fileDriver: {} as ICPFileDriver
        });
        (useSelector as jest.Mock).mockReturnValue(userInfo);
        (getICPCanisterURL as jest.Mock).mockReturnValue('icpCanisterUrl');
        (useEthEscrow as jest.Mock).mockReturnValue({
            loadEscrowDetails,
            loadTokenDetails
        });
        (useParams as jest.Mock).mockReturnValue({ id: '1' });
        getShipment.mockResolvedValue(shipment);
        getPhase.mockResolvedValue(ShipmentPhase.APPROVAL);
        getDocumentInfo.mockResolvedValue({ id: 1, type: DocumentType.INSURANCE_CERTIFICATE });
        getDocument.mockResolvedValue({
            id: 2,
            fileName: 'file.pdf',
            documentType: ShipmentDocumentType.BOOKING_CONFIRMATION,
            fileContent: new Uint8Array()
        });
        getShipmentAddress.mockResolvedValue('0x123');
        getOrderTradeService.mockReturnValue({ getShipmentAddress });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should throw error if hook is used outside the provider', async () => {
        expect(() => renderHook(() => useEthShipment())).toThrow();
    });

    describe('detailed shipment', () => {
        it('should load detailed shipment on initial render', async () => {
            const { result } = renderHook(() => useEthShipment(), {
                wrapper: EthShipmentProvider
            });
            const detailedShipment = {
                shipment,
                documents: [{ id: 1, type: DocumentType.INSURANCE_CERTIFICATE }],
                phase: ShipmentPhase.APPROVAL
            };

            await waitFor(() => {
                expect(result.current.detailedShipment).not.toBeNull();
                expect(result.current.detailedShipment).toEqual(detailedShipment);
            });

            expect(dispatch).toHaveBeenCalledTimes(2);
            expect(ShipmentService).toHaveBeenCalledTimes(1);
            expect(getShipment).toHaveBeenCalledTimes(1);
            expect(getPhase).toHaveBeenCalledTimes(1);
            expect(getDocumentInfo).toHaveBeenCalledTimes(1);
            expect(openNotification).not.toHaveBeenCalled();
        });
    });

    describe('updateShipment', () => {
        it('should update a shipment', async () => {
            const { result } = renderHook(() => useEthShipment(), {
                wrapper: EthShipmentProvider
            });
            await waitFor(() => {
                expect(result.current.detailedShipment).not.toBeNull();
            });

            const updatedExpirationDate = dayjs().add(2, 'day').toDate();
            await result.current.updateShipment(updatedExpirationDate, 200, 400, 2000);
            expect(dispatch).toHaveBeenCalledTimes(6);
            expect(updateShipment).toHaveBeenCalledTimes(1);
            expect(updateShipment).toHaveBeenNthCalledWith(
                1,
                updatedExpirationDate,
                200,
                400,
                2000
            );
            expect(getShipment).toHaveBeenCalledTimes(2);
            expect(openNotification).toHaveBeenCalledTimes(1);
        });
        it('should handle a failure when updating a shipment', async () => {
            const { result } = renderHook(() => useEthShipment(), {
                wrapper: EthShipmentProvider
            });
            updateShipment.mockRejectedValueOnce(new Error('error'));
            await waitFor(() => {
                expect(result.current.detailedShipment).not.toBeNull();
            });

            await result.current.updateShipment(dayjs().add(2, 'day').toDate(), 200, 400, 2000);

            expect(dispatch).toHaveBeenCalledTimes(4);
            expect(updateShipment).toHaveBeenCalledTimes(1);
            expect(openNotification).toHaveBeenCalledTimes(1);
        });
    });

    describe('approveShipment', () => {
        it('should approve a shipment', async () => {
            const { result } = renderHook(() => useEthShipment(), {
                wrapper: EthShipmentProvider
            });
            await waitFor(() => {
                expect(result.current.detailedShipment).not.toBeNull();
            });

            await result.current.approveShipment();

            expect(dispatch).toHaveBeenCalledTimes(6);
            expect(approveShipment).toHaveBeenCalledTimes(1);
            expect(getShipment).toHaveBeenCalledTimes(2);
            expect(openNotification).toHaveBeenCalledTimes(1);
        });

        it('should handle a failure when approving a shipment', async () => {
            const { result } = renderHook(() => useEthShipment(), {
                wrapper: EthShipmentProvider
            });
            approveShipment.mockRejectedValueOnce(new Error('error'));
            await waitFor(() => {
                expect(result.current.detailedShipment).not.toBeNull();
            });

            await result.current.approveShipment();

            expect(dispatch).toHaveBeenCalledTimes(4);
            expect(approveShipment).toHaveBeenCalledTimes(1);
            expect(openNotification).toHaveBeenCalledTimes(1);
        });
    });

    describe('depositFunds', () => {
        it('should deposit funds', async () => {
            const { result } = renderHook(() => useEthShipment(), {
                wrapper: EthShipmentProvider
            });
            await waitFor(() => {
                expect(result.current.detailedShipment).not.toBeNull();
            });

            await result.current.depositFunds(2000);

            expect(dispatch).toHaveBeenCalledTimes(6);
            expect(tokenApprove).toHaveBeenCalledTimes(1);
            expect(tokenApprove).toHaveBeenCalledWith('0x456', 2000);
            expect(depositFunds).toHaveBeenCalledTimes(1);
            expect(depositFunds).toHaveBeenCalledWith(2000);
            expect(loadEscrowDetails).toHaveBeenCalledTimes(1);
            expect(loadTokenDetails).toHaveBeenCalledTimes(1);
            expect(getShipment).toHaveBeenCalledTimes(2);
            expect(openNotification).toHaveBeenCalledTimes(1);
        });
        it('should handle a failure when depositing funds', async () => {
            const { result } = renderHook(() => useEthShipment(), {
                wrapper: EthShipmentProvider
            });
            depositFunds.mockRejectedValueOnce(new Error('error'));
            await waitFor(() => {
                expect(result.current.detailedShipment).not.toBeNull();
            });

            await result.current.depositFunds(2000);

            expect(dispatch).toHaveBeenCalledTimes(4);
            expect(tokenApprove).toHaveBeenCalledTimes(1);
            expect(depositFunds).toHaveBeenCalledTimes(1);
            expect(openNotification).toHaveBeenCalledTimes(1);
        });
    });

    describe('getDocument', () => {
        it('should get a document', async () => {
            const { result } = renderHook(() => useEthShipment(), {
                wrapper: EthShipmentProvider
            });
            await waitFor(() => {
                expect(result.current.detailedShipment).not.toBeNull();
            });

            await result.current.getDocument(1);

            expect(dispatch).toHaveBeenCalledTimes(4);
            expect(getDocument).toHaveBeenCalledTimes(1);
            expect(getDocument).toHaveBeenCalledWith(1);
        });
        it('should handle a failure when getting a document', async () => {
            const { result } = renderHook(() => useEthShipment(), {
                wrapper: EthShipmentProvider
            });
            getDocument.mockRejectedValueOnce(new Error('error'));
            await waitFor(() => {
                expect(result.current.detailedShipment).not.toBeNull();
            });

            await expect(result.current.getDocument(1)).rejects.toThrowError(
                'Error while retrieving document'
            );

            expect(dispatch).toHaveBeenCalledTimes(4);
            expect(getDocument).toHaveBeenCalledTimes(1);
            expect(openNotification).toHaveBeenCalledTimes(1);
        });
    });

    describe('addDocument', () => {
        it('should add a document', async () => {
            const { result } = renderHook(() => useEthShipment(), {
                wrapper: EthShipmentProvider
            });
            await waitFor(() => {
                expect(result.current.detailedShipment).not.toBeNull();
            });

            await result.current.addDocument(
                ShipmentDocumentType.BOOKING_CONFIRMATION,
                'refId',
                'file.pdf',
                new Blob([], { type: 'application/pdf' })
            );

            expect(dispatch).toHaveBeenCalledTimes(6);
            expect(addDocument).toHaveBeenCalledTimes(1);
            expect(addDocument).toHaveBeenCalledWith(
                ShipmentDocumentType.BOOKING_CONFIRMATION,
                'refId',
                new Uint8Array(
                    await new Response(new Blob([], { type: 'application/pdf' })).arrayBuffer()
                ),
                {
                    name: 'file.pdf',
                    type: 'application/pdf'
                },
                [0]
            );
            expect(getShipment).toHaveBeenCalledTimes(2);
            expect(openNotification).toHaveBeenCalledTimes(1);
        });
        it('should handle a failure when adding a document ', async () => {
            const { result } = renderHook(() => useEthShipment(), {
                wrapper: EthShipmentProvider
            });
            addDocument.mockRejectedValueOnce(new Error('error'));
            await waitFor(() => {
                expect(result.current.detailedShipment).not.toBeNull();
            });

            await result.current.addDocument(
                ShipmentDocumentType.BOOKING_CONFIRMATION,
                'refId',
                'file.pdf',
                new Blob([], { type: 'application/pdf' })
            );

            expect(dispatch).toHaveBeenCalledTimes(4);
            expect(addDocument).toHaveBeenCalledTimes(1);
            expect(openNotification).toHaveBeenCalledTimes(1);
        });
    });

    describe('approveDocument', () => {
        it('should approve a document', async () => {
            const { result } = renderHook(() => useEthShipment(), {
                wrapper: EthShipmentProvider
            });
            await waitFor(() => {
                expect(result.current.detailedShipment).not.toBeNull();
            });

            await result.current.approveDocument(1);
            expect(dispatch).toHaveBeenCalledTimes(6);
            expect(approveDocument).toHaveBeenCalledTimes(1);
            expect(approveDocument).toHaveBeenCalledWith(1);
            expect(getShipment).toHaveBeenCalledTimes(2);
            expect(openNotification).toHaveBeenCalledTimes(1);
        });

        it('should handle a failure when approving a document', async () => {
            const { result } = renderHook(() => useEthShipment(), {
                wrapper: EthShipmentProvider
            });
            approveDocument.mockRejectedValueOnce(new Error('error'));
            await waitFor(() => {
                expect(result.current.detailedShipment).not.toBeNull();
            });

            await result.current.approveDocument(1);
            expect(dispatch).toHaveBeenCalledTimes(4);
            expect(approveDocument).toHaveBeenCalledTimes(1);
            expect(openNotification).toHaveBeenCalledTimes(1);
        });
    });

    describe('rejectDocument', () => {
        it('should reject a document', async () => {
            const { result } = renderHook(() => useEthShipment(), {
                wrapper: EthShipmentProvider
            });
            await waitFor(() => {
                expect(result.current.detailedShipment).not.toBeNull();
            });

            await result.current.rejectDocument(1);
            expect(dispatch).toHaveBeenCalledTimes(6);
            expect(rejectDocument).toHaveBeenCalledTimes(1);
            expect(rejectDocument).toHaveBeenCalledWith(1);
            expect(getShipment).toHaveBeenCalledTimes(2);
            expect(openNotification).toHaveBeenCalledTimes(1);
        });

        it('should handle a failure when rejecting a document', async () => {
            const { result } = renderHook(() => useEthShipment(), {
                wrapper: EthShipmentProvider
            });
            rejectDocument.mockRejectedValueOnce(new Error('error'));
            await waitFor(() => {
                expect(result.current.detailedShipment).not.toBeNull();
            });

            await result.current.rejectDocument(1);
            expect(dispatch).toHaveBeenCalledTimes(4);
            expect(rejectDocument).toHaveBeenCalledTimes(1);
            expect(openNotification).toHaveBeenCalledTimes(1);
        });
    });

    describe('confirmShipment', () => {
        it('should confirm a shipment', async () => {
            const { result } = renderHook(() => useEthShipment(), {
                wrapper: EthShipmentProvider
            });
            await waitFor(() => {
                expect(result.current.detailedShipment).not.toBeNull();
            });

            await result.current.confirmShipment();
            expect(dispatch).toHaveBeenCalledTimes(6);
            expect(confirmShipment).toHaveBeenCalledTimes(1);
            expect(getShipment).toHaveBeenCalledTimes(2);
            expect(openNotification).toHaveBeenCalledTimes(1);
        });

        it('should handle a failure when confirming a shipment', async () => {
            const { result } = renderHook(() => useEthShipment(), {
                wrapper: EthShipmentProvider
            });
            confirmShipment.mockRejectedValueOnce(new Error('error'));
            await waitFor(() => {
                expect(result.current.detailedShipment).not.toBeNull();
            });

            await result.current.confirmShipment();
            expect(dispatch).toHaveBeenCalledTimes(4);
            expect(confirmShipment).toHaveBeenCalledTimes(1);
            expect(openNotification).toHaveBeenCalledTimes(1);
        });
    });

    describe('startShipmentArbitration', () => {
        it('should start a shipment arbitration', async () => {
            const { result } = renderHook(() => useEthShipment(), {
                wrapper: EthShipmentProvider
            });
            await waitFor(() => {
                expect(result.current.detailedShipment).not.toBeNull();
            });

            await result.current.startShipmentArbitration();
            expect(dispatch).toHaveBeenCalledTimes(6);
            expect(startShipmentArbitration).toHaveBeenCalledTimes(1);
            expect(getShipment).toHaveBeenCalledTimes(2);
            expect(openNotification).toHaveBeenCalledTimes(1);
        });

        it('should handle a failure when starting a shipment arbitration', async () => {
            const { result } = renderHook(() => useEthShipment(), {
                wrapper: EthShipmentProvider
            });
            startShipmentArbitration.mockRejectedValueOnce(new Error('error'));
            await waitFor(() => {
                expect(result.current.detailedShipment).not.toBeNull();
            });

            await result.current.startShipmentArbitration();
            expect(dispatch).toHaveBeenCalledTimes(4);
            expect(startShipmentArbitration).toHaveBeenCalledTimes(1);
            expect(openNotification).toHaveBeenCalledTimes(1);
        });
    });

    describe('getShipmentPhaseAsync', () => {
        it('should get the shipment phase', async () => {
            const { result } = renderHook(() => useEthShipment(), {
                wrapper: EthShipmentProvider
            });
            await waitFor(() => {
                expect(result.current.detailedShipment).not.toBeNull();
            });

            await result.current.getShipmentPhaseAsync(1);
            expect(getOrderTradeService).toHaveBeenCalledTimes(1);
            expect(getShipmentAddress).toHaveBeenCalledTimes(1);
            expect(getPhase).toHaveBeenCalledTimes(2);
        });

        it('should handle a failure when getting the shipment phase - shipment address not found', async () => {
            const { result } = renderHook(() => useEthShipment(), {
                wrapper: EthShipmentProvider
            });
            getShipmentAddress.mockResolvedValue(undefined);
            await waitFor(() => {
                expect(result.current.detailedShipment).not.toBeNull();
            });

            await expect(result.current.getShipmentPhaseAsync(1)).rejects.toThrowError(
                'Shipment address not found'
            );
            expect(getOrderTradeService).toHaveBeenCalledTimes(1);
            expect(getShipmentAddress).toHaveBeenCalledTimes(1);
            expect(getPhase).toHaveBeenCalledTimes(1);
        });
    });
});
