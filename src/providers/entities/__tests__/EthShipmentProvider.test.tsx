import { renderHook, waitFor } from '@testing-library/react';
import { useEthOrderTrade } from '../EthOrderTradeProvider';
import {
    DocumentType,
    ICPFileDriver,
    Line,
    Material,
    NegotiationStatus,
    OrderTrade,
    ProductCategory,
    RoleProof,
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
jest.mock('@/providers/entities/ICPOrganizationProvider');
jest.mock('react-router-dom');

describe('EthShipmentProvider', () => {
    const signer = { _address: '0x123' } as JsonRpcSigner;
    const dispatch = jest.fn();

    const getShipmentAddress = jest.fn();
    const getOrderTradeService = jest.fn();

    const addDocument = jest.fn();
    const getShipment = jest.fn();
    const getPhase = jest.fn();
    const getDocumentId = jest.fn();
    const getDocumentInfo = jest.fn();
    const getPhaseDocuments = jest.fn();
    const setDetails = jest.fn();
    const approveSample = jest.fn();
    const rejectSample = jest.fn();
    const approveDetails = jest.fn();
    const rejectDetails = jest.fn();
    const depositFunds = jest.fn();
    const getDocument = jest.fn();
    const approveDocument = jest.fn();
    const rejectDocument = jest.fn();
    const approveQuality = jest.fn();
    const rejectQuality = jest.fn();

    const tokenApprove = jest.fn();

    const loadEscrowDetails = jest.fn();
    const loadTokenDetails = jest.fn();

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
            getDocumentId,
            getDocumentInfo,
            getPhaseDocuments,
            setDetails,
            approveSample,
            rejectSample,
            approveDetails,
            rejectDetails,
            depositFunds,
            getDocument,
            approveDocument,
            rejectDocument,
            approveQuality,
            rejectQuality
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
        (useSelector as jest.Mock).mockImplementation((fn) => fn({ userInfo }));
        (getICPCanisterURL as jest.Mock).mockReturnValue('icpCanisterUrl');
        (useEthEscrow as jest.Mock).mockReturnValue({
            loadEscrowDetails,
            loadTokenDetails
        });
        (useParams as jest.Mock).mockReturnValue({ id: '1' });
        getShipment.mockResolvedValue(shipment);
        getPhase.mockResolvedValue(ShipmentPhase.PHASE_1);
        getDocumentId.mockResolvedValue(1);
        getDocumentInfo.mockResolvedValue({ id: 1, type: DocumentType.INSURANCE_CERTIFICATE });
        getPhaseDocuments.mockResolvedValue([
            {
                documentType: DocumentType.INSURANCE_CERTIFICATE,
                required: true
            }
        ]);
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
        jest.spyOn(console, 'error').mockImplementation();
        jest.spyOn(console, 'log').mockImplementation();
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
                documents: new Map(
                    Array.from({ length: 19 }, (_, i) => [
                        i,
                        { id: 1, type: DocumentType.INSURANCE_CERTIFICATE }
                    ])
                ),
                phase: ShipmentPhase.PHASE_1,
                phaseDocuments: new Map(
                    Array.from({ length: 7 }, (_, i) => [
                        i,
                        [{ documentType: DocumentType.INSURANCE_CERTIFICATE, required: true }]
                    ])
                ),
                orderId: 1
            };

            await waitFor(() => {
                expect(result.current.detailedShipment).not.toBeNull();
                expect(result.current.detailedShipment).toEqual(detailedShipment);
            });

            expect(dispatch).toHaveBeenCalledTimes(2);
            expect(ShipmentService).toHaveBeenCalledTimes(1);
            expect(getShipment).toHaveBeenCalledTimes(1);
            expect(getPhase).toHaveBeenCalledTimes(1);
            expect(getDocumentId).toHaveBeenCalledTimes(19);
            expect(getDocumentInfo).toHaveBeenCalledTimes(19);
            expect(getPhaseDocuments).toHaveBeenCalledTimes(7);
            expect(openNotification).not.toHaveBeenCalled();
        });
    });

    describe('setDetails', () => {
        it('should set shipment details', async () => {
            const { result } = renderHook(() => useEthShipment(), {
                wrapper: EthShipmentProvider
            });
            await waitFor(() => {
                expect(result.current.detailedShipment).not.toBeNull();
            });

            const details = {
                shipmentNumber: 1,
                expirationDate: dayjs().add(2, 'day').toDate(),
                fixingDate: dayjs().add(3, 'day').toDate(),
                targetExchange: 'USD',
                differentialApplied: 0,
                price: 100,
                quantity: 10,
                containersNumber: 1000,
                netWeight: 1100,
                grossWeight: 100
            };
            await result.current.setDetails(
                details.shipmentNumber,
                details.expirationDate,
                details.fixingDate,
                details.targetExchange,
                details.differentialApplied,
                details.price,
                details.quantity,
                details.containersNumber,
                details.netWeight,
                details.grossWeight
            );
            expect(dispatch).toHaveBeenCalledTimes(6);
            expect(setDetails).toHaveBeenCalledTimes(1);
            expect(setDetails).toHaveBeenNthCalledWith(
                1,
                roleProof,
                details.shipmentNumber,
                details.expirationDate,
                details.fixingDate,
                details.targetExchange,
                details.differentialApplied,
                details.price,
                details.quantity,
                details.containersNumber,
                details.netWeight,
                details.grossWeight
            );
            expect(getShipment).toHaveBeenCalledTimes(2);
            expect(openNotification).toHaveBeenCalledTimes(1);
        });
        it('should handle a failure when setting shipment details', async () => {
            const { result } = renderHook(() => useEthShipment(), {
                wrapper: EthShipmentProvider
            });
            setDetails.mockRejectedValueOnce(new Error('error'));
            await waitFor(() => {
                expect(result.current.detailedShipment).not.toBeNull();
            });

            const details = {
                shipmentNumber: 1,
                expirationDate: dayjs().add(2, 'day').toDate(),
                fixingDate: dayjs().add(3, 'day').toDate(),
                targetExchange: 'USD',
                differentialApplied: 0,
                price: 100,
                quantity: 10,
                containersNumber: 1000,
                netWeight: 1100,
                grossWeight: 100
            };
            await result.current.setDetails(
                details.shipmentNumber,
                details.expirationDate,
                details.fixingDate,
                details.targetExchange,
                details.differentialApplied,
                details.price,
                details.quantity,
                details.containersNumber,
                details.netWeight,
                details.grossWeight
            );

            expect(dispatch).toHaveBeenCalledTimes(4);
            expect(setDetails).toHaveBeenCalledTimes(1);
            expect(openNotification).toHaveBeenCalledTimes(1);
        });
    });

    describe('approveSample', () => {
        it('should approve a sample', async () => {
            const { result } = renderHook(() => useEthShipment(), {
                wrapper: EthShipmentProvider
            });
            await waitFor(() => {
                expect(result.current.detailedShipment).not.toBeNull();
            });

            await result.current.approveSample();

            expect(dispatch).toHaveBeenCalledTimes(6);
            expect(approveSample).toHaveBeenCalledTimes(1);
            expect(approveSample).toHaveBeenCalledWith(roleProof);
            expect(getShipment).toHaveBeenCalledTimes(2);
            expect(openNotification).toHaveBeenCalledTimes(1);
        });
        it('should handle a failure when approving a sample', async () => {
            const { result } = renderHook(() => useEthShipment(), {
                wrapper: EthShipmentProvider
            });
            approveSample.mockRejectedValueOnce(new Error('error'));
            await waitFor(() => {
                expect(result.current.detailedShipment).not.toBeNull();
            });

            await result.current.approveSample();

            expect(dispatch).toHaveBeenCalledTimes(4);
            expect(approveSample).toHaveBeenCalledTimes(1);
            expect(openNotification).toHaveBeenCalledTimes(1);
        });
    });

    describe('rejectSample', () => {
        it('should reject a sample', async () => {
            const { result } = renderHook(() => useEthShipment(), {
                wrapper: EthShipmentProvider
            });
            await waitFor(() => {
                expect(result.current.detailedShipment).not.toBeNull();
            });

            await result.current.rejectSample();

            expect(dispatch).toHaveBeenCalledTimes(6);
            expect(rejectSample).toHaveBeenCalledTimes(1);
            expect(rejectSample).toHaveBeenCalledWith(roleProof);
            expect(getShipment).toHaveBeenCalledTimes(2);
            expect(openNotification).toHaveBeenCalledTimes(1);
        });
        it('should handle a failure when rejecting a sample', async () => {
            const { result } = renderHook(() => useEthShipment(), {
                wrapper: EthShipmentProvider
            });
            approveSample.mockRejectedValueOnce(new Error('error'));
            await waitFor(() => {
                expect(result.current.detailedShipment).not.toBeNull();
            });

            await result.current.rejectSample();

            expect(dispatch).toHaveBeenCalledTimes(6);
            expect(rejectSample).toHaveBeenCalledTimes(1);
            expect(openNotification).toHaveBeenCalledTimes(1);
        });
    });

    describe('approveDetails', () => {
        it('should approve details', async () => {
            const { result } = renderHook(() => useEthShipment(), {
                wrapper: EthShipmentProvider
            });
            await waitFor(() => {
                expect(result.current.detailedShipment).not.toBeNull();
            });

            await result.current.approveDetails();

            expect(dispatch).toHaveBeenCalledTimes(6);
            expect(approveDetails).toHaveBeenCalledTimes(1);
            expect(approveDetails).toHaveBeenCalledWith(roleProof);
            expect(getShipment).toHaveBeenCalledTimes(2);
            expect(openNotification).toHaveBeenCalledTimes(1);
        });
        it('should handle a failure when approving details', async () => {
            const { result } = renderHook(() => useEthShipment(), {
                wrapper: EthShipmentProvider
            });
            approveDetails.mockRejectedValueOnce(new Error('error'));
            await waitFor(() => {
                expect(result.current.detailedShipment).not.toBeNull();
            });

            await result.current.approveDetails();

            expect(dispatch).toHaveBeenCalledTimes(4);
            expect(approveDetails).toHaveBeenCalledTimes(1);
            expect(openNotification).toHaveBeenCalledTimes(1);
        });
    });

    describe('rejectDetails', () => {
        it('should reject details', async () => {
            const { result } = renderHook(() => useEthShipment(), {
                wrapper: EthShipmentProvider
            });
            await waitFor(() => {
                expect(result.current.detailedShipment).not.toBeNull();
            });

            await result.current.rejectDetails();

            expect(dispatch).toHaveBeenCalledTimes(6);
            expect(rejectDetails).toHaveBeenCalledTimes(1);
            expect(rejectDetails).toHaveBeenCalledWith(roleProof);
            expect(getShipment).toHaveBeenCalledTimes(2);
            expect(openNotification).toHaveBeenCalledTimes(1);
        });
        it('should handle a failure when rejecting details', async () => {
            const { result } = renderHook(() => useEthShipment(), {
                wrapper: EthShipmentProvider
            });
            rejectSample.mockRejectedValueOnce(new Error('error'));
            await waitFor(() => {
                expect(result.current.detailedShipment).not.toBeNull();
            });

            await result.current.rejectSample();

            expect(dispatch).toHaveBeenCalledTimes(4);
            expect(rejectSample).toHaveBeenCalledTimes(1);
            expect(openNotification).toHaveBeenCalledTimes(1);
        });
    });

    describe('approveQuality', () => {
        it('should approve quality', async () => {
            const { result } = renderHook(() => useEthShipment(), {
                wrapper: EthShipmentProvider
            });
            await waitFor(() => {
                expect(result.current.detailedShipment).not.toBeNull();
            });

            await result.current.approveQuality();
            expect(dispatch).toHaveBeenCalledTimes(6);
            expect(approveQuality).toHaveBeenCalledTimes(1);
            expect(getShipment).toHaveBeenCalledTimes(2);
            expect(openNotification).toHaveBeenCalledTimes(1);
        });
        it('should handle a failure when approving quality', async () => {
            const { result } = renderHook(() => useEthShipment(), {
                wrapper: EthShipmentProvider
            });
            approveQuality.mockRejectedValueOnce(new Error('error'));
            await waitFor(() => {
                expect(result.current.detailedShipment).not.toBeNull();
            });

            await result.current.approveQuality();
            expect(dispatch).toHaveBeenCalledTimes(4);
            expect(approveQuality).toHaveBeenCalledTimes(1);
            expect(openNotification).toHaveBeenCalledTimes(1);
        });
    });

    describe('rejectQuality', () => {
        it('should reject quality', async () => {
            const { result } = renderHook(() => useEthShipment(), {
                wrapper: EthShipmentProvider
            });
            await waitFor(() => {
                expect(result.current.detailedShipment).not.toBeNull();
            });

            await result.current.rejectQuality();
            expect(dispatch).toHaveBeenCalledTimes(6);
            expect(rejectQuality).toHaveBeenCalledTimes(1);
            expect(getShipment).toHaveBeenCalledTimes(2);
            expect(openNotification).toHaveBeenCalledTimes(1);
        });
        it('should handle a failure when rejecting quality', async () => {
            const { result } = renderHook(() => useEthShipment(), {
                wrapper: EthShipmentProvider
            });
            rejectQuality.mockRejectedValueOnce(new Error('error'));
            await waitFor(() => {
                expect(result.current.detailedShipment).not.toBeNull();
            });

            await result.current.rejectQuality();
            expect(dispatch).toHaveBeenCalledTimes(4);
            expect(rejectQuality).toHaveBeenCalledTimes(1);
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
            expect(depositFunds).toHaveBeenCalledWith(roleProof, 2000);
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
            expect(getDocument).toHaveBeenCalledWith(roleProof, 1);
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
                roleProof,
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
            expect(approveDocument).toHaveBeenCalledWith(roleProof, 1);
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
            expect(rejectDocument).toHaveBeenCalledWith(roleProof, 1);
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

    describe('getShipmentService', () => {
        it('should get the shipment service', async () => {
            const { result } = renderHook(() => useEthShipment(), {
                wrapper: EthShipmentProvider
            });
            await waitFor(() => {
                expect(result.current.detailedShipment).not.toBeNull();
            });

            await result.current.getShipmentService('0x123');
            expect(ShipmentService).toHaveBeenCalledTimes(2);
        });
    });
});
