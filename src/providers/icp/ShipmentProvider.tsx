import {
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
import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { useSigner } from '@/providers/SignerProvider';
import { useOrder } from '@/providers/icp/OrderProvider';
import { useEthEscrow } from '@/providers/entities/EthEscrowProvider';
import { useICP } from '@/providers/ICPProvider';
import { useSiweIdentity } from '@/providers/SiweIdentityProvider';
import { checkAndGetEnvironmentVariable } from '@/utils/env';
import { ICP } from '@/constants/icp';
import { Typography } from 'antd';
import { CONTRACT_ADDRESSES } from '@/constants/evm';
import { addLoadingMessage, removeLoadingMessage } from '@/redux/reducers/loadingSlice';
import { SHIPMENT_MESSAGE } from '@/constants/message';
import { NotificationType, openNotification } from '@/utils/notification';
import { NOTIFICATION_DURATION } from '@/constants/notification';
import { useDispatch } from 'react-redux';
import { getProof } from '@/providers/icp/tempProof';

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
    depositFunds: (amount: number) => Promise<void>;
    lockFunds: () => Promise<void>;
    unlockFunds: () => Promise<void>;
    getDocument(documentId: number): Promise<ShipmentCompleteDocument>;
    addDocument: (
        documentType: ShipmentDocumentType,
        documentReferenceId: string,
        fileName: string,
        fileContent: Blob
    ) => Promise<void>;
    approveDocument: (documentId: number) => Promise<void>;
    rejectDocument: (documentId: number) => Promise<void>;
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
    documentType: ShipmentDocumentType;
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
    const { order } = useOrder();
    const { loadEscrowDetails, loadTokenDetails } = useEthEscrow();
    const { fileDriver } = useICP();
    const dispatch = useDispatch();

    const [dataLoaded, setDataLoaded] = useState<boolean>(false);
    const [detailShipment, setDetailShipment] = useState<DetailedShipment | null>(null);

    if (!identity) {
        return <Typography.Text>Siwe identity not initialized</Typography.Text>;
    }

    const tokenService = useMemo(
        () => new TokenService(new TokenDriver(signer, CONTRACT_ADDRESSES.TOKEN())),
        [signer]
    );

    const shipmentService = useMemo(() => {
        if (!order) return undefined;

        // TODO: remove this hardcoded value
        const externalUrl = `https://${checkAndGetEnvironmentVariable(ICP.CANISTER_ID_STORAGE)}.localhost:4943/organization/0/transactions/${order.id}`;
        return new ShipmentService(
            new ShipmentDriver(identity, entityManagerCanisterId),
            fileDriver,
            externalUrl
        );
    }, [identity, order]);

    // Update shipments when order trades change
    useEffect(() => {
        if (order) loadData();
    }, [order]);

    const loadData = async () => {
        if (!shipmentService || !order) return;

        try {
            dispatch(addLoadingMessage(SHIPMENT_MESSAGE.RETRIEVE.LOADING));
            const roleProof = await getProof(await signer.getAddress());
            const shipment = await shipmentService.getShipment(roleProof, order.shipmentId);
            const phase = await shipmentService.getShipmentPhase(roleProof, order.shipmentId);
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
    ): Promise<void> => {
        if (!detailShipment) throw new Error('Shipment not initialized');
        if (!shipmentService) throw new Error('ShipmentManager service not initialized');
        try {
            dispatch(addLoadingMessage(SHIPMENT_MESSAGE.SAVE_DETAILS.LOADING));
            const roleProof = await getProof(await signer.getAddress());
            await shipmentService.setShipmentDetails(
                roleProof,
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

    const approveSample = async () => {};

    const rejectSample = async () => {};

    const approveDetails = async () => {};

    const rejectDetails = async () => {};

    const approveQuality = async () => {};

    const rejectQuality = async () => {};

    const depositFunds = async (amount: number) => {};

    const lockFunds = async () => {};

    const unlockFunds = async () => {};

    const getDocument = async (documentId: number): Promise<ShipmentCompleteDocument> => {
        return {} as ShipmentCompleteDocument;
    };

    const addDocument = async (
        documentType: ShipmentDocumentType,
        documentReferenceId: string,
        fileName: string,
        fileContent: Blob
    ) => {};

    const approveDocument = async (documentId: number) => {};

    const rejectDocument = async (documentId: number) => {};

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
                depositFunds,
                lockFunds,
                unlockFunds,
                getDocument,
                addDocument,
                approveDocument,
                rejectDocument
            }}>
            {props.children}
        </ShipmentContext.Provider>
    );
}
