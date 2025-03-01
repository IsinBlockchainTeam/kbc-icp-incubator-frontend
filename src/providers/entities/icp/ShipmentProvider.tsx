import {
    DocumentType,
    ResourceSpec,
    Shipment,
    ShipmentDriver,
    ShipmentPhase,
    ShipmentPhaseDocument,
    ShipmentService,
    TokenDriver,
    TokenService
} from '@kbc-lib/coffee-trading-management-lib';
import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { useSigner } from '@/providers/auth/SignerProvider';
import { useOrder } from '@/providers/entities/icp/OrderProvider';
import { useEthDownPayment } from '@/providers/entities/evm/EthDownPaymentProvider';
import { useICP } from '@/providers/storage/IcpStorageProvider';
import { useSiweIdentity } from '@/providers/auth/SiweIdentityProvider';
import { checkAndGetEnvironmentVariable } from '@/utils/env';
import { ICP } from '@/constants/icp';
import { Typography } from 'antd';
import { addLoadingMessage, removeLoadingMessage } from '@/redux/reducers/loadingSlice';
import { DOWN_PAYMENT_MESSAGE, SHIPMENT_MESSAGE, ShipmentMessage } from '@/constants/message';
import { NotificationType, openNotification } from '@/utils/notification';
import { NOTIFICATION_DURATION } from '@/constants/notification';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { getMimeType } from '@/utils/file';
import { useCallHandler } from '@/providers/errors/CallHandlerProvider';

export type ShipmentContextState = {
    dataLoaded: boolean;
    detailedShipment: DetailedShipment | null;
    loadData: () => Promise<void>;
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
    determineDownPaymentAddress: () => Promise<void>;
    depositFunds: (amount: number) => Promise<void>;
    lockFunds: () => Promise<void>;
    unlockFunds: () => Promise<void>;
    getDocument(documentId: number): Promise<ShipmentCompleteDocument>;
    addDocument: (documentType: DocumentType, documentReferenceId: string, fileName: string, fileContent: Blob) => Promise<void>;
    approveDocument: (documentId: number) => Promise<void>;
    rejectDocument: (documentId: number) => Promise<void>;
    getShipmentPhaseAsync: (orderId: number) => Promise<ShipmentPhase | null>;
};
export const ShipmentContext = createContext<ShipmentContextState>({} as ShipmentContextState);
export const useShipment = (): ShipmentContextState => {
    const context = useContext(ShipmentContext);
    if (!context || Object.keys(context).length === 0) {
        throw new Error('useShipment must be used within an ShipmentProvider.');
    }
    return context;
};
type ShipmentCompleteDocument = {
    contentType: string;
    content: Blob;
    fileName: string;
    documentType: DocumentType;
};
export type DetailedShipment = {
    shipment: Shipment;
    phase: ShipmentPhase;
    phaseDocuments: Map<ShipmentPhase, ShipmentPhaseDocument[]>;
    orderId: number;
};
export function ShipmentProvider(props: { children: ReactNode }) {
    const { identity } = useSiweIdentity();
    const entityManagerCanisterId = checkAndGetEnvironmentVariable(ICP.CANISTER_ID_ENTITY_MANAGER);
    const { signer } = useSigner();
    const { order, orderService } = useOrder();
    const { loadDownPaymentDetails, loadTokenDetails } = useEthDownPayment();
    const { fileDriver } = useICP();
    const dispatch = useDispatch();
    const userInfo = useSelector((state: RootState) => state.userInfo);
    const { handleICPCall } = useCallHandler();

    const [dataLoaded, setDataLoaded] = useState<boolean>(false);
    const [detailShipment, setDetailShipment] = useState<DetailedShipment | null>(null);

    if (!identity) {
        return <Typography.Text>Siwe identity not initialized</Typography.Text>;
    }

    // Update shipments when order trades change
    useEffect(() => {
        if (order) loadData();
    }, [order]);

    const shipmentService = useMemo(() => {
        // TODO: remove this hardcoded value
        const externalUrl = `https://${checkAndGetEnvironmentVariable(ICP.CANISTER_ID_STORAGE)}.localhost:4943/organization/0/transactions/${order?.id}`;
        return new ShipmentService(new ShipmentDriver(identity, entityManagerCanisterId), fileDriver, externalUrl);
    }, [identity, order]);

    const tokenService = useMemo(() => {
        if (!order) return;
        return new TokenService(new TokenDriver(signer, order.token));
    }, [signer, order]);

    const loadData = async () => {
        if (!shipmentService || !order || !order.shipment) return;

        await handleICPCall(async () => {
            // @ts-ignore
            const shipment = await shipmentService.getShipment(order.shipment.id);
            // @ts-ignore
            const phase = await shipmentService.getShipmentPhase(order.shipment.id);
            const phaseDocuments = new Map<ShipmentPhase, ShipmentPhaseDocument[]>();

            await Promise.allSettled(
                Object.keys(ShipmentPhase)
                    .filter((key) => isNaN(parseInt(key)))
                    .map(async (key) => {
                        const phase = ShipmentPhase[key as keyof typeof ShipmentPhase];
                        const documents = await shipmentService.getPhaseDocuments(phase);
                        phaseDocuments.set(phase, documents);
                    })
            );

            setDetailShipment({ shipment, phase, orderId: order.id, phaseDocuments });
        }, SHIPMENT_MESSAGE.RETRIEVE.LOADING);
        setDataLoaded(true);
    };

    const writeTransaction = async (transaction: () => Promise<Shipment>, shipmentMessage: ShipmentMessage) => {
        await handleICPCall(async () => {
            await transaction();
            await loadData();
            openNotification('Success', shipmentMessage.OK, NotificationType.SUCCESS, NOTIFICATION_DURATION);
        }, shipmentMessage.LOADING);
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
    ): Promise<void> => {
        if (!shipmentService) throw new Error(' service not initialized');
        if (!detailShipment) throw new Error('Shipment not initialized');
        await handleICPCall(async () => {
            await shipmentService.setShipmentDetails(
                detailShipment.shipment.id,
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
            openNotification('Success', SHIPMENT_MESSAGE.SAVE_DETAILS.OK, NotificationType.SUCCESS, NOTIFICATION_DURATION);
        }, SHIPMENT_MESSAGE.SAVE_DETAILS.LOADING);
    };

    const approveSample = async () => {
        if (!shipmentService) throw new Error(' service not initialized');
        if (!detailShipment) throw new Error('Shipment not initialized');
        await writeTransaction(async () => shipmentService.approveSample(detailShipment.shipment.id), SHIPMENT_MESSAGE.APPROVE_SAMPLE);
    };

    const rejectSample = async () => {
        if (!shipmentService) throw new Error(' service not initialized');
        if (!detailShipment) throw new Error('Shipment not initialized');
        await writeTransaction(async () => shipmentService.rejectSample(detailShipment.shipment.id), SHIPMENT_MESSAGE.REJECT_SAMPLE);
    };

    const approveDetails = async () => {
        if (!shipmentService) throw new Error(' service not initialized');
        if (!detailShipment) throw new Error('Shipment not initialized');
        await writeTransaction(async () => shipmentService.approveShipmentDetails(detailShipment.shipment.id), SHIPMENT_MESSAGE.APPROVE_DETAILS);
    };

    const rejectDetails = async () => {
        if (!shipmentService) throw new Error(' service not initialized');
        if (!detailShipment) throw new Error('Shipment not initialized');
        await writeTransaction(async () => shipmentService.rejectShipmentDetails(detailShipment.shipment.id), SHIPMENT_MESSAGE.REJECT_DETAILS);
    };

    const approveQuality = async () => {
        if (!shipmentService) throw new Error(' service not initialized');
        if (!detailShipment) throw new Error('Shipment not initialized');
        await writeTransaction(async () => shipmentService.approveQuality(detailShipment.shipment.id), SHIPMENT_MESSAGE.APPROVE_QUALITY);
    };

    const rejectQuality = async () => {
        if (!shipmentService) throw new Error(' service not initialized');
        if (!detailShipment) throw new Error('Shipment not initialized');
        await writeTransaction(async () => shipmentService.rejectQuality(detailShipment.shipment.id), SHIPMENT_MESSAGE.REJECT_QUALITY);
    };

    const determineDownPaymentAddress = async () => {
        if (!shipmentService) throw new Error('ShipmentManager service not initialized');
        if (!detailShipment) throw new Error('Order trade not found');
        await writeTransaction(async () => {
            const shipment = await shipmentService.determineDownPaymentAddress(detailShipment.shipment.id);
            await loadData();
            return shipment;
        }, SHIPMENT_MESSAGE.DETERMINE_DOWN_PAYMENT);
    };

    const depositFunds = async (amount: number) => {
        if (!shipmentService) throw new Error('ShipmentManager service not initialized');
        if (!detailShipment) throw new Error('Order trade not found');
        if (!tokenService) throw new Error('Token service not initialized');
        const downPaymentAddress = detailShipment.shipment.downPaymentAddress;
        if (downPaymentAddress) {
            await writeTransaction(async () => {
                await tokenService.approve(downPaymentAddress, amount);
                const shipment = await shipmentService.depositFunds(detailShipment.shipment.id, amount);
                await loadDownPaymentDetails();
                await loadTokenDetails();
                await loadData();
                return shipment;
            }, DOWN_PAYMENT_MESSAGE.DEPOSIT);
        } else {
            throw new Error('Down payment address not determined');
        }
    };

    const lockFunds = async () => {
        if (!shipmentService) throw new Error('ShipmentManager service not initialized');
        if (!detailShipment) throw new Error('Order trade not found');

        await writeTransaction(async () => shipmentService.lockFunds(detailShipment.shipment.id), DOWN_PAYMENT_MESSAGE.LOCK);
    };

    const unlockFunds = async () => {
        if (!shipmentService) throw new Error('ShipmentManager service not initialized');
        if (!detailShipment) throw new Error('Order trade not found');

        await writeTransaction(async () => shipmentService.unlockFunds(detailShipment.shipment.id), DOWN_PAYMENT_MESSAGE.UNLOCK);
    };

    const getDocument = async (documentId: number): Promise<ShipmentCompleteDocument> => {
        if (!shipmentService) throw new Error(' service not initialized');
        if (!detailShipment) throw new Error('Shipment not initialized');
        // TODO: replace with handleICPCall
        try {
            dispatch(addLoadingMessage(SHIPMENT_MESSAGE.GET_DOCUMENT.LOADING));
            const document = await shipmentService.getDocument(detailShipment.shipment.id, documentId);
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
            console.error('Error while retrieving document:', e);
            openNotification('Error', SHIPMENT_MESSAGE.GET_DOCUMENT.ERROR, NotificationType.ERROR, NOTIFICATION_DURATION);
            throw new Error('Error while retrieving document');
        } finally {
            dispatch(removeLoadingMessage(SHIPMENT_MESSAGE.GET_DOCUMENT.LOADING));
        }
    };

    const addDocument = async (documentType: DocumentType, documentReferenceId: string, fileName: string, fileContent: Blob) => {
        if (!shipmentService) throw new Error('Shipment service not initialized');
        if (!detailShipment) throw new Error('Shipment not initialized');
        await handleICPCall(async () => {
            // TODO: remove this harcoded value
            const delegatedOrganizationIds: number[] = parseInt(userInfo.companyClaims.organizationId) === 0 ? [1] : [0];
            const resourceSpec: ResourceSpec = {
                name: fileName,
                type: fileContent.type
            };
            await shipmentService.addDocument(
                detailShipment.shipment.id,
                documentType,
                documentReferenceId,
                new Uint8Array(await new Response(fileContent).arrayBuffer()),
                resourceSpec,
                delegatedOrganizationIds
            );
            await loadData();
            openNotification('Success', SHIPMENT_MESSAGE.ADD_DOCUMENT.OK, NotificationType.SUCCESS, NOTIFICATION_DURATION);
        }, SHIPMENT_MESSAGE.ADD_DOCUMENT.LOADING);
    };

    const approveDocument = async (documentId: number) => {
        if (!shipmentService) throw new Error(' service not initialized');
        if (!detailShipment) throw new Error('Shipment not initialized');
        await writeTransaction(() => shipmentService.approveDocument(detailShipment.shipment.id, documentId), SHIPMENT_MESSAGE.APPROVE_DOCUMENT);
    };

    const rejectDocument = async (documentId: number) => {
        if (!shipmentService) throw new Error(' service not initialized');
        if (!detailShipment) throw new Error('Shipment not initialized');
        await writeTransaction(() => shipmentService.rejectDocument(detailShipment.shipment.id, documentId), SHIPMENT_MESSAGE.REJECT_DOCUMENT);
    };

    const getShipmentPhaseAsync = async (orderId: number): Promise<ShipmentPhase | null> => {
        const order = await orderService.getOrder(orderId);
        if (!order.shipment) return null;
        return await shipmentService.getShipmentPhase(order.shipment.id);
    };

    return (
        <ShipmentContext.Provider
            value={{
                dataLoaded,
                detailedShipment: detailShipment,
                loadData,
                setDetails,
                approveSample,
                rejectSample,
                approveDetails,
                rejectDetails,
                approveQuality,
                rejectQuality,
                determineDownPaymentAddress: determineDownPaymentAddress,
                depositFunds,
                lockFunds,
                unlockFunds,
                getDocument,
                addDocument,
                approveDocument,
                rejectDocument,
                getShipmentPhaseAsync
            }}>
            {props.children}
        </ShipmentContext.Provider>
    );
}
