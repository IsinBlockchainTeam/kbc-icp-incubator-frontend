import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { useSigner } from '@/providers/SignerProvider';
import { useEthOrderTrade } from '@/providers/entities/EthOrderTradeProvider';
import { useDispatch, useSelector } from 'react-redux';
import { SHIPMENT_MESSAGE } from '@/constants/message';
import { addLoadingMessage, removeLoadingMessage } from '@/redux/reducers/loadingSlice';
import {
    DocumentDriver,
    Shipment,
    ShipmentDocumentInfo,
    ShipmentDocumentType,
    ShipmentDriver,
    ShipmentPhase,
    ShipmentPhaseDocument,
    ShipmentService,
    TokenDriver,
    TokenService
} from '@kbc-lib/coffee-trading-management-lib';
import { NotificationType, openNotification } from '@/utils/notification';
import { NOTIFICATION_DURATION } from '@/constants/notification';
import { CONTRACT_ADDRESSES } from '@/constants/evm';
import { useICP } from '@/providers/ICPProvider';
import { RootState } from '@/redux/store';
import { ICPResourceSpec } from '@blockchain-lib/common';
import { getMimeType } from '@/utils/file';
import { useEthEscrow } from '@/providers/entities/EthEscrowProvider';
import { useEthRawTrade } from '@/providers/entities/EthRawTradeProvider';

export type EthShipmentContextState = {
    detailedShipment: DetailedShipment | null;
    setDetails: (
        shipmentNumber: number,
        expirationDate: Date,
        fixingDate: Date,
        targetExchange: string,
        differentialApplied: number,
        price: number,
        quantity: number,
        containersNumber: number,
        netWeight: number,
        grossWeight: number
    ) => Promise<void>;
    approveSample: () => Promise<void>;
    rejectSample: () => Promise<void>;
    approveDetails: () => Promise<void>;
    rejectDetails: () => Promise<void>;
    approveQuality: () => Promise<void>;
    rejectQuality: () => Promise<void>;
    depositFunds: (amount: number) => Promise<void>;
    getDocument: (documentId: number) => Promise<ShipmentCompleteDocument>;
    addDocument: (
        documentType: ShipmentDocumentType,
        documentReferenceId: string,
        fileName: string,
        fileContent: Blob
    ) => Promise<void>;
    approveDocument: (documentId: number) => Promise<void>;
    rejectDocument: (documentId: number) => Promise<void>;
    // Call these functions only if the order is not already loaded
    getShipmentPhaseAsync: (orderId: number) => Promise<ShipmentPhase>;
    getShipmentService: (address: string) => ShipmentService;
};
export const EthShipmentContext = createContext<EthShipmentContextState>(
    {} as EthShipmentContextState
);
export const useEthShipment = (): EthShipmentContextState => {
    const context = useContext(EthShipmentContext);
    if (!context || Object.keys(context).length === 0) {
        throw new Error('useEthShipment must be used within an EthShipmentProvider.');
    }
    return context;
};
type ShipmentCompleteDocument = {
    contentType: string;
    content: Blob;
    fileName: string;
    documentType: ShipmentDocumentType;
};
export type DetailedShipment = {
    shipment: Shipment;
    documents: Map<ShipmentDocumentType, ShipmentDocumentInfo>;
    phase: ShipmentPhase;
    phaseDocuments: Map<ShipmentPhase, ShipmentPhaseDocument[]>;
    orderId: number;
};
export function EthShipmentProvider(props: { children: ReactNode }) {
    const { signer } = useSigner();
    const { rawTrades } = useEthRawTrade();
    const { detailedOrderTrade, getOrderTradeService } = useEthOrderTrade();
    const { loadEscrowDetails, loadTokenDetails } = useEthEscrow();
    const { fileDriver } = useICP();
    const userInfo = useSelector((state: RootState) => state.userInfo);
    const [detailedShipment, setDetailedShipment] = useState<DetailedShipment | null>(null);
    const dispatch = useDispatch();

    const roleProof = useSelector((state: RootState) => state.userInfo.roleProof);

    const tokenService = useMemo(
        () => new TokenService(new TokenDriver(signer, CONTRACT_ADDRESSES.TOKEN())),
        [signer]
    );

    const getShipmentService = (address: string) => {
        return new ShipmentService(
            new ShipmentDriver(signer, address),
            new DocumentDriver(signer, CONTRACT_ADDRESSES.DOCUMENT()),
            fileDriver
        );
    };

    const shipmentService = useMemo(() => {
        if (!detailedOrderTrade || !detailedOrderTrade.shipmentAddress) return undefined;
        return getShipmentService(detailedOrderTrade.shipmentAddress);
    }, [signer, detailedOrderTrade]);

    // Update shipments when order trades change
    useEffect(() => {
        if (detailedOrderTrade) loadData();
    }, [detailedOrderTrade]);

    const loadData = async () => {
        if (!shipmentService) return;

        try {
            dispatch(addLoadingMessage(SHIPMENT_MESSAGE.RETRIEVE.LOADING));
            const shipment = await shipmentService.getShipment(roleProof);
            const phase = await shipmentService.getPhase(roleProof);
            const documents = new Map<ShipmentDocumentType, ShipmentDocumentInfo>();
            const phaseDocuments = new Map<ShipmentPhase, ShipmentPhaseDocument[]>();
            await Promise.allSettled(
                Object.keys(ShipmentDocumentType)
                    .filter((key) => isNaN(parseInt(key)))
                    .map(async (key) => {
                        const documentType =
                            ShipmentDocumentType[key as keyof typeof ShipmentDocumentType];
                        const documentId = await shipmentService.getDocumentId(
                            roleProof,
                            documentType
                        );
                        const document = await shipmentService.getDocumentInfo(
                            roleProof,
                            documentId
                        );
                        if (document) documents.set(documentType, document);
                    })
            );
            await Promise.allSettled(
                Object.keys(ShipmentPhase)
                    .filter((key) => isNaN(parseInt(key)))
                    .map(async (key) => {
                        const phase = ShipmentPhase[key as keyof typeof ShipmentPhase];
                        const documents = await shipmentService.getPhaseDocuments(phase);
                        phaseDocuments.set(phase, documents);
                    })
            );

            setDetailedShipment({
                shipment,
                documents,
                phase,
                phaseDocuments,
                orderId: detailedOrderTrade!.trade.tradeId
            });
        } catch (e) {
            console.error(e);
            openNotification(
                'Error',
                SHIPMENT_MESSAGE.RETRIEVE.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(SHIPMENT_MESSAGE.RETRIEVE.LOADING));
        }
    };

    const setDetails = async (
        shipmentNumber: number,
        expirationDate: Date,
        fixingDate: Date,
        targetExchange: string,
        differentialApplied: number,
        price: number,
        quantity: number,
        containersNumber: number,
        netWeight: number,
        grossWeight: number
    ) => {
        if (!shipmentService) throw new Error('ShipmentManager service not initialized');
        try {
            dispatch(addLoadingMessage(SHIPMENT_MESSAGE.SAVE_DETAILS.LOADING));
            await shipmentService.setDetails(
                roleProof,
                shipmentNumber,
                expirationDate,
                fixingDate,
                targetExchange,
                differentialApplied,
                price,
                quantity,
                containersNumber,
                netWeight,
                grossWeight
            );
            await loadData();
            openNotification(
                'Success',
                SHIPMENT_MESSAGE.SAVE_DETAILS.OK,
                NotificationType.SUCCESS,
                NOTIFICATION_DURATION
            );
        } catch (e) {
            console.error(e);
            openNotification(
                'Error',
                SHIPMENT_MESSAGE.SAVE_DETAILS.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(SHIPMENT_MESSAGE.SAVE_DETAILS.LOADING));
        }
    };

    const approveSample = async () => {
        if (!shipmentService) throw new Error('ShipmentManager service not initialized');
        try {
            dispatch(addLoadingMessage(SHIPMENT_MESSAGE.APPROVE_SAMPLE.LOADING));
            await shipmentService.approveSample(roleProof);
            await loadData();
            openNotification(
                'Success',
                SHIPMENT_MESSAGE.APPROVE_SAMPLE.OK,
                NotificationType.SUCCESS,
                NOTIFICATION_DURATION
            );
        } catch (e) {
            console.error(e);
            openNotification(
                'Error',
                SHIPMENT_MESSAGE.APPROVE_SAMPLE.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(SHIPMENT_MESSAGE.APPROVE_SAMPLE.LOADING));
        }
    };

    const rejectSample = async () => {
        if (!shipmentService) throw new Error('ShipmentManager service not initialized');
        try {
            dispatch(addLoadingMessage(SHIPMENT_MESSAGE.REJECT_SAMPLE.LOADING));
            await shipmentService.rejectSample(roleProof);
            await loadData();
            openNotification(
                'Success',
                SHIPMENT_MESSAGE.REJECT_SAMPLE.OK,
                NotificationType.SUCCESS,
                NOTIFICATION_DURATION
            );
        } catch (e) {
            console.error(e);
            openNotification(
                'Error',
                SHIPMENT_MESSAGE.REJECT_SAMPLE.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(SHIPMENT_MESSAGE.REJECT_SAMPLE.LOADING));
        }
    };

    const approveDetails = async () => {
        if (!shipmentService) throw new Error('ShipmentManager service not initialized');
        try {
            dispatch(addLoadingMessage(SHIPMENT_MESSAGE.APPROVE_DETAILS.LOADING));
            await shipmentService.approveDetails(roleProof);
            await loadData();
            openNotification(
                'Success',
                SHIPMENT_MESSAGE.APPROVE_DETAILS.OK,
                NotificationType.SUCCESS,
                NOTIFICATION_DURATION
            );
        } catch (e) {
            console.error(e);
            openNotification(
                'Error',
                SHIPMENT_MESSAGE.APPROVE_DETAILS.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(SHIPMENT_MESSAGE.APPROVE_DETAILS.LOADING));
        }
    };

    const rejectDetails = async () => {
        if (!shipmentService) throw new Error('ShipmentManager service not initialized');
        try {
            dispatch(addLoadingMessage(SHIPMENT_MESSAGE.REJECT_DETAILS.LOADING));
            await shipmentService.rejectDetails(roleProof);
            await loadData();
            openNotification(
                'Success',
                SHIPMENT_MESSAGE.REJECT_DETAILS.OK,
                NotificationType.SUCCESS,
                NOTIFICATION_DURATION
            );
        } catch (e) {
            console.error(e);
            openNotification(
                'Error',
                SHIPMENT_MESSAGE.REJECT_DETAILS.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(SHIPMENT_MESSAGE.REJECT_DETAILS.LOADING));
        }
    };

    const approveQuality = async () => {
        if (!shipmentService) throw new Error('ShipmentManager service not initialized');
        try {
            dispatch(addLoadingMessage(SHIPMENT_MESSAGE.APPROVE_QUALITY.LOADING));
            await shipmentService.approveQuality(roleProof);
            await loadData();
            openNotification(
                'Success',
                SHIPMENT_MESSAGE.APPROVE_QUALITY.OK,
                NotificationType.SUCCESS,
                NOTIFICATION_DURATION
            );
        } catch (e) {
            console.error(e);
            openNotification(
                'Error',
                SHIPMENT_MESSAGE.APPROVE_QUALITY.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(SHIPMENT_MESSAGE.APPROVE_QUALITY.LOADING));
        }
    };

    const rejectQuality = async () => {
        if (!shipmentService) throw new Error('ShipmentManager service not initialized');
        try {
            dispatch(addLoadingMessage(SHIPMENT_MESSAGE.REJECT_QUALITY.LOADING));
            await shipmentService.rejectQuality(roleProof);
            await loadData();
            openNotification(
                'Success',
                SHIPMENT_MESSAGE.REJECT_QUALITY.OK,
                NotificationType.SUCCESS,
                NOTIFICATION_DURATION
            );
        } catch (e) {
            console.error(e);
            openNotification(
                'Error',
                SHIPMENT_MESSAGE.REJECT_QUALITY.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(SHIPMENT_MESSAGE.REJECT_QUALITY.LOADING));
        }
    };

    const depositFunds = async (amount: number) => {
        if (!shipmentService) throw new Error('ShipmentManager service not initialized');
        if (!detailedOrderTrade) throw new Error('Order trade not found');
        if (!detailedOrderTrade.escrowAddress) throw new Error('Escrow address not defined');
        try {
            dispatch(addLoadingMessage(SHIPMENT_MESSAGE.DEPOSIT.LOADING));
            await tokenService.approve(detailedOrderTrade.escrowAddress, amount);
            await shipmentService.depositFunds(roleProof, amount);
            await loadEscrowDetails();
            await loadTokenDetails();
            await loadData();
            openNotification(
                'Success',
                SHIPMENT_MESSAGE.DEPOSIT.OK,
                NotificationType.SUCCESS,
                NOTIFICATION_DURATION
            );
        } catch (e) {
            openNotification(
                'Error',
                SHIPMENT_MESSAGE.DEPOSIT.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(SHIPMENT_MESSAGE.DEPOSIT.LOADING));
        }
    };

    const getDocument = async (documentId: number) => {
        if (!shipmentService) throw new Error('ShipmentManager service not initialized');
        try {
            dispatch(addLoadingMessage(SHIPMENT_MESSAGE.GET_DOCUMENT.LOADING));
            const document = await shipmentService.getDocument(roleProof, documentId);
            const blob = new Blob([document!.fileContent], {
                type: getMimeType(document.fileName)
            });
            return {
                contentType: blob.type,
                content: blob,
                fileName: document.fileName,
                documentType: document.documentType
            };
        } catch (e) {
            console.log(e);
            openNotification(
                'Error',
                SHIPMENT_MESSAGE.GET_DOCUMENT.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
            throw new Error('Error while retrieving document');
        } finally {
            dispatch(removeLoadingMessage(SHIPMENT_MESSAGE.GET_DOCUMENT.LOADING));
        }
    };

    const addDocument = async (
        documentType: ShipmentDocumentType,
        documentReferenceId: string,
        fileName: string,
        fileContent: Blob
    ) => {
        if (!shipmentService) throw new Error('ShipmentManager service not initialized');
        try {
            dispatch(addLoadingMessage(SHIPMENT_MESSAGE.ADD_DOCUMENT.LOADING));
            // TODO: remove this harcoded value
            const delegatedOrganizationIds: number[] =
                parseInt(userInfo.companyClaims.organizationId) === 0 ? [1] : [0];
            const resourceSpec: ICPResourceSpec = {
                name: fileName,
                type: fileContent.type
            };
            await shipmentService.addDocument(
                roleProof,
                documentType,
                documentReferenceId,
                new Uint8Array(await new Response(fileContent).arrayBuffer()),
                resourceSpec,
                delegatedOrganizationIds
            );
            await loadData();
            openNotification(
                'Success',
                SHIPMENT_MESSAGE.ADD_DOCUMENT.OK,
                NotificationType.SUCCESS,
                NOTIFICATION_DURATION
            );
        } catch (e) {
            console.error(e);
            openNotification(
                'Error',
                SHIPMENT_MESSAGE.ADD_DOCUMENT.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(SHIPMENT_MESSAGE.ADD_DOCUMENT.LOADING));
        }
    };

    const approveDocument = async (documentId: number) => {
        if (!shipmentService) throw new Error('ShipmentManager service not initialized');
        try {
            dispatch(addLoadingMessage(SHIPMENT_MESSAGE.APPROVE_DOCUMENT.LOADING));
            await shipmentService.approveDocument(roleProof, documentId);
            await loadData();
            openNotification(
                'Success',
                SHIPMENT_MESSAGE.APPROVE_DOCUMENT.OK,
                NotificationType.SUCCESS,
                NOTIFICATION_DURATION
            );
        } catch (e) {
            openNotification(
                'Error',
                SHIPMENT_MESSAGE.APPROVE_DOCUMENT.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(SHIPMENT_MESSAGE.APPROVE_DOCUMENT.LOADING));
        }
    };

    const rejectDocument = async (documentId: number) => {
        if (!shipmentService) throw new Error('ShipmentManager service not initialized');
        try {
            dispatch(addLoadingMessage(SHIPMENT_MESSAGE.REJECT_DOCUMENT.LOADING));
            await shipmentService.rejectDocument(roleProof, documentId);
            await loadData();
            openNotification(
                'Success',
                SHIPMENT_MESSAGE.REJECT_DOCUMENT.OK,
                NotificationType.SUCCESS,
                NOTIFICATION_DURATION
            );
        } catch (e) {
            console.log('error: ', e);
            openNotification(
                'Error',
                SHIPMENT_MESSAGE.REJECT_DOCUMENT.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(SHIPMENT_MESSAGE.REJECT_DOCUMENT.LOADING));
        }
    };

    const getShipmentPhaseAsync = async (orderId: number) => {
        const rawTrade = rawTrades.find((t) => t.id === orderId);
        if (!rawTrade) throw new Error('Trade not found');
        const orderTradeService = getOrderTradeService(rawTrade.address);
        const shipmentAddress = await orderTradeService.getShipmentAddress(roleProof);
        if (!shipmentAddress) throw new Error('Shipment address not found.');
        const service = new ShipmentService(
            new ShipmentDriver(signer, shipmentAddress),
            new DocumentDriver(signer, CONTRACT_ADDRESSES.DOCUMENT()),
            fileDriver
        );
        return service.getPhase(roleProof);
    };

    return (
        <EthShipmentContext.Provider
            value={{
                detailedShipment,
                setDetails,
                approveSample,
                rejectSample,
                approveDetails,
                rejectDetails,
                approveQuality,
                rejectQuality,
                depositFunds,
                getDocument,
                addDocument,
                approveDocument,
                rejectDocument,
                getShipmentPhaseAsync,
                getShipmentService
            }}>
            {props.children}
        </EthShipmentContext.Provider>
    );
}
