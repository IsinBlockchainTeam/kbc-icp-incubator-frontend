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
    ShipmentService,
    TokenDriver,
    TokenService
} from '@kbc-lib/coffee-trading-management-lib';
import { useParams } from 'react-router-dom';
import { NotificationType, openNotification } from '@/utils/notification';
import { NOTIFICATION_DURATION } from '@/constants/notification';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from '@/constants/evm';
import { useICP } from '@/providers/ICPProvider';
import { RootState } from '@/redux/store';
import { ICPResourceSpec } from '@blockchain-lib/common';
import { getMimeType } from '@/utils/file';
import { useEthEscrow } from '@/providers/entities/EthEscrowProvider';

export type EthShipmentContextState = {
    detailedShipment: DetailedShipment | null;
    updateShipment: (
        expirationDate: Date,
        quantity: number,
        weight: number,
        price: number
    ) => Promise<void>;
    approveShipment: () => Promise<void>;
    depositFunds: (amount: number) => Promise<void>;
    getDocument: (documentId: number) => Promise<ShipmentCompleteDocument>;
    addDocument: (
        documentType: ShipmentDocumentType,
        fileName: string,
        fileContent: Blob
    ) => Promise<void>;
    approveDocument: (documentId: number) => Promise<void>;
    rejectDocument: (documentId: number) => Promise<void>;
    confirmShipment: () => Promise<void>;
    startShipmentArbitration: () => Promise<void>;
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
type DetailedShipment = {
    shipment: Shipment;
    documents: ShipmentDocumentInfo[];
    phase: ShipmentPhase;
};
export const ShipmentDocumentRules: {
    [key in ShipmentDocumentType]: { name: string; isExporterUploader: boolean };
} = {
    [ShipmentDocumentType.INSURANCE_CERTIFICATE]: {
        name: 'Insurance Certificate',
        isExporterUploader: false
    },
    [ShipmentDocumentType.BOOKING_CONFIRMATION]: {
        name: 'Booking Confirmation',
        isExporterUploader: false
    },
    [ShipmentDocumentType.SHIPPING_NOTE]: {
        name: 'Shipping Note',
        isExporterUploader: true
    },
    [ShipmentDocumentType.WEIGHT_CERTIFICATE]: {
        name: 'Weight Certificate',
        isExporterUploader: true
    },
    [ShipmentDocumentType.BILL_OF_LADING]: {
        name: 'Bill of Lading',
        isExporterUploader: true
    },
    [ShipmentDocumentType.PHYTOSANITARY_CERTIFICATE]: {
        name: 'Phytosanitary Certificate',
        isExporterUploader: true
    },
    [ShipmentDocumentType.SINGLE_EXPORT_DECLARATION]: {
        name: 'Single Export Declaration',
        isExporterUploader: true
    },
    [ShipmentDocumentType.OTHER]: {
        name: 'Other',
        isExporterUploader: true
    }
};
export function EthShipmentProvider(props: { children: ReactNode }) {
    const { id } = useParams();
    const { signer } = useSigner();
    const { orderTrades, getShipmentAddress, getEscrowAddress } = useEthOrderTrade();
    const { loadEscrowDetails, loadTokenDetails } = useEthEscrow();
    const { fileDriver } = useICP();
    const userInfo = useSelector((state: RootState) => state.userInfo);
    const [detailedShipment, setDetailedShipment] = useState<DetailedShipment | null>(null);
    const dispatch = useDispatch();

    const orderTrade = useMemo(
        () => orderTrades.find((t) => t.tradeId === parseInt(id || '')),
        [orderTrades, id]
    );
    const tokenService = useMemo(
        () => new TokenService(new TokenDriver(signer, CONTRACT_ADDRESSES.TOKEN())),
        [signer]
    );

    const shipmentAddress = orderTrade ? getShipmentAddress(orderTrade.tradeId) : undefined;
    const escrowAddress = orderTrade ? getEscrowAddress(orderTrade.tradeId) : undefined;

    const shipmentManagerService = useMemo(() => {
        if (!shipmentAddress || shipmentAddress == ethers.constants.AddressZero) return undefined;
        return new ShipmentService(
            new ShipmentDriver(signer, shipmentAddress),
            new DocumentDriver(signer, CONTRACT_ADDRESSES.DOCUMENT()),
            fileDriver
        );
    }, [signer, shipmentAddress]);

    // Update shipments when order trades change
    useEffect(() => {
        if (orderTrade) loadData();
    }, [orderTrade]);

    const loadData = async () => {
        if (!shipmentManagerService) return;
        try {
            dispatch(addLoadingMessage(SHIPMENT_MESSAGE.RETRIEVE.LOADING));
            const shipment = await shipmentManagerService.getShipment();
            const phase = await shipmentManagerService.getPhase();
            const documents: ShipmentDocumentInfo[] = [];
            await Promise.allSettled(
                shipment.documentsIds.map(async (documentId) => {
                    documents.push(await shipmentManagerService.getDocumentInfo(documentId));
                })
            );
            setDetailedShipment({
                shipment,
                documents,
                phase
            });
        } catch (e) {
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

    const updateShipment = async (
        expirationDate: Date,
        quantity: number,
        weight: number,
        price: number
    ) => {
        if (!shipmentManagerService) throw new Error('ShipmentManager service not initialized');
        try {
            dispatch(addLoadingMessage(SHIPMENT_MESSAGE.SAVE.LOADING));
            await shipmentManagerService.updateShipment(expirationDate, quantity, weight, price);
            await loadData();
            openNotification(
                'Success',
                SHIPMENT_MESSAGE.SAVE.OK,
                NotificationType.SUCCESS,
                NOTIFICATION_DURATION
            );
        } catch (e) {
            console.error(e);
            openNotification(
                'Error',
                SHIPMENT_MESSAGE.SAVE.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(SHIPMENT_MESSAGE.SAVE.LOADING));
        }
    };

    const approveShipment = async () => {
        if (!shipmentManagerService) throw new Error('ShipmentManager service not initialized');
        try {
            dispatch(addLoadingMessage(SHIPMENT_MESSAGE.APPROVE.LOADING));
            await shipmentManagerService.approveShipment();
            await loadData();
            openNotification(
                'Success',
                SHIPMENT_MESSAGE.APPROVE.OK,
                NotificationType.SUCCESS,
                NOTIFICATION_DURATION
            );
        } catch (e) {
            console.error(e);
            openNotification(
                'Error',
                SHIPMENT_MESSAGE.APPROVE.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(SHIPMENT_MESSAGE.APPROVE.LOADING));
        }
    };

    const depositFunds = async (amount: number) => {
        if (!shipmentManagerService) throw new Error('ShipmentManager service not initialized');
        if (!escrowAddress) throw new Error('Escrow address not found');
        try {
            dispatch(addLoadingMessage(SHIPMENT_MESSAGE.DEPOSIT.LOADING));
            await tokenService.approve(escrowAddress, amount);
            await shipmentManagerService.depositFunds(amount);
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
        if (!shipmentManagerService) throw new Error('ShipmentManager service not initialized');
        try {
            dispatch(addLoadingMessage(SHIPMENT_MESSAGE.GET_DOCUMENT.LOADING));
            const document = await shipmentManagerService.getDocument(documentId);
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
        fileName: string,
        fileContent: Blob
    ) => {
        if (!shipmentManagerService) throw new Error('ShipmentManager service not initialized');
        try {
            dispatch(addLoadingMessage(SHIPMENT_MESSAGE.ADD_DOCUMENT.LOADING));
            // TODO: remove this harcoded value
            const delegatedOrganizationIds: number[] =
                parseInt(userInfo.organizationId) === 0 ? [1] : [0];
            const resourceSpec: ICPResourceSpec = {
                name: fileName,
                type: fileContent.type
            };
            await shipmentManagerService.addDocument(
                documentType,
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
        if (!shipmentManagerService) throw new Error('ShipmentManager service not initialized');
        try {
            dispatch(addLoadingMessage(SHIPMENT_MESSAGE.APPROVE_DOCUMENT.LOADING));
            await shipmentManagerService.approveDocument(documentId);
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
        if (!shipmentManagerService) throw new Error('ShipmentManager service not initialized');
        try {
            dispatch(addLoadingMessage(SHIPMENT_MESSAGE.REJECT_DOCUMENT.LOADING));
            await shipmentManagerService.rejectDocument(documentId);
            await loadData();
            openNotification(
                'Success',
                SHIPMENT_MESSAGE.REJECT_DOCUMENT.OK,
                NotificationType.SUCCESS,
                NOTIFICATION_DURATION
            );
        } catch (e) {
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

    const confirmShipment = async () => {
        if (!shipmentManagerService) throw new Error('ShipmentManager service not initialized');
        try {
            dispatch(addLoadingMessage(SHIPMENT_MESSAGE.CONFIRM.LOADING));
            await shipmentManagerService.confirmShipment();
            await loadData();
            openNotification(
                'Success',
                SHIPMENT_MESSAGE.CONFIRM.OK,
                NotificationType.SUCCESS,
                NOTIFICATION_DURATION
            );
        } catch (e) {
            openNotification(
                'Error',
                SHIPMENT_MESSAGE.CONFIRM.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(SHIPMENT_MESSAGE.CONFIRM.LOADING));
        }
    };

    const startShipmentArbitration = async () => {
        if (!shipmentManagerService) throw new Error('ShipmentManager service not initialized');
        try {
            dispatch(addLoadingMessage(SHIPMENT_MESSAGE.START_ARBITRATION.LOADING));
            await shipmentManagerService.startShipmentArbitration();
            await loadData();
            openNotification(
                'Success',
                SHIPMENT_MESSAGE.START_ARBITRATION.OK,
                NotificationType.SUCCESS,
                NOTIFICATION_DURATION
            );
        } catch (e) {
            openNotification(
                'Error',
                SHIPMENT_MESSAGE.START_ARBITRATION.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(SHIPMENT_MESSAGE.START_ARBITRATION.LOADING));
        }
    };

    return (
        <EthShipmentContext.Provider
            value={{
                detailedShipment,
                updateShipment,
                approveShipment,
                depositFunds,
                getDocument,
                addDocument,
                approveDocument,
                rejectDocument,
                confirmShipment,
                startShipmentArbitration
            }}>
            {props.children}
        </EthShipmentContext.Provider>
    );
}
