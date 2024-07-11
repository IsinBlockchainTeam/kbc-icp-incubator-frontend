import React, { createContext, ReactNode, useContext, useMemo } from 'react';
import {
    DocumentDriver,
    DocumentInfo,
    DocumentService,
    DocumentStatus,
    DocumentType,
    OrderStatus,
    OrderTradeService,
    TradeService,
    TransactionLine
} from '@kbc-lib/coffee-trading-management-lib';
import { useSigner } from '@/providers/SignerProvider';
import { contractAddresses } from '@/constants/evm';
import { useICP } from '@/providers/ICPProvider';
import { addLoadingMessage, removeLoadingMessage } from '@/redux/reducers/loadingSlice';
import { NotificationType, openNotification } from '@/utils/notification';
import { NOTIFICATION_DURATION } from '@/constants/notification';
import { useDispatch, useSelector } from 'react-redux';
import { DOCUMENT_MESSAGE } from '@/constants/message';
import { getMimeType } from '@/utils/file';
import { ICPResourceSpec } from '@blockchain-lib/common';
import { RootState } from '@/redux/store';

const DOCUMENT_TYPES: DocumentType[] = [
    DocumentType.BILL_OF_LADING,
    DocumentType.PAYMENT_INVOICE,
    DocumentType.ORIGIN_SWISS_DECODE,
    DocumentType.WEIGHT_CERTIFICATE,
    DocumentType.FUMIGATION_CERTIFICATE,
    DocumentType.PREFERENTIAL_ENTRY_CERTIFICATE,
    DocumentType.PHYTOSANITARY_CERTIFICATE,
    DocumentType.INSURANCE_CERTIFICATE,
    DocumentType.COMPARISON_SWISS_DECODE
];
export type DocumentRequest = {
    content: Blob;
    filename: string;
    documentType: DocumentType;
};
export enum DOCUMENT_DUTY {
    UPLOAD_NEEDED = 'Upload needed',
    UPLOAD_POSSIBLE = 'Upload possible',
    APPROVAL_NEEDED = 'Approval needed',
    NO_ACTION_NEEDED = 'No action needed'
}
export type DocumentContent = {
    contentType: string;
    content: Blob;
    filename: string;
    date: Date;
    transactionLines?: TransactionLine[];
};
export type DocumentDetail = {
    info: DocumentInfo;
    status: DocumentStatus;
    content: DocumentContent;
};
export type DocumentDetailMap = Map<OrderStatus, Map<DocumentType, DocumentDetail | null>>;
export type EthDocumentContextState = {
    getDocumentDetailMap: (service: OrderTradeService) => Promise<DocumentDetailMap>;
    validateDocument: (
        documentId: number,
        validationStatus: DocumentStatus,
        tradeService: TradeService
    ) => Promise<void>;
    uploadDocument: (
        documentRequest: DocumentRequest,
        externalUrl: string,
        tradeService: TradeService
    ) => Promise<void>;
    getDocumentDuty: (
        uploaderAddress: string,
        approverAddress: string,
        documentDetail: DocumentDetail | null
    ) => DOCUMENT_DUTY;
};
export const EthDocumentContext = createContext<EthDocumentContextState>(
    {} as EthDocumentContextState
);
export const useEthDocument = (): EthDocumentContextState => {
    const context = useContext(EthDocumentContext);
    if (!context) {
        throw new Error('useEthDocument must be used within an EthDocumentProvider.');
    }
    return context;
};
export function EthDocumentProvider(props: { children: ReactNode }) {
    const { signer } = useSigner();
    const { fileDriver } = useICP();
    const dispatch = useDispatch();
    const userInfo = useSelector((state: RootState) => state.userInfo);
    const documentDriver = useMemo(
        () => new DocumentDriver(signer, contractAddresses.DOCUMENT()),
        [signer]
    );
    const documentService = useMemo(
        () => new DocumentService(documentDriver, fileDriver),
        [documentDriver, fileDriver]
    );

    const getDocumentDuty = (
        uploaderAddress: string,
        approverAddress: string,
        documentDetail: DocumentDetail | null
    ) => {
        if (signer.address == uploaderAddress && documentDetail == null)
            return DOCUMENT_DUTY.UPLOAD_NEEDED;
        if (signer.address == uploaderAddress && documentDetail?.status !== DocumentStatus.APPROVED)
            return DOCUMENT_DUTY.UPLOAD_POSSIBLE;
        if (
            signer.address == approverAddress &&
            documentDetail != null &&
            documentDetail.status == DocumentStatus.NOT_EVALUATED
        )
            return DOCUMENT_DUTY.APPROVAL_NEEDED;
        return DOCUMENT_DUTY.NO_ACTION_NEEDED;
    };

    const getDocumentDetailMap = async (service: OrderTradeService) => {
        const documentTypeMap = new Map<DocumentType, DocumentDetail | null>();
        try {
            await Promise.allSettled(
                DOCUMENT_TYPES.map(async (type) => {
                    const documents = await service.getDocumentsByType(type);
                    const info = documents
                        .filter((docInfo) => !docInfo.externalUrl.endsWith('.json'))
                        .pop();
                    if (!info) {
                        documentTypeMap.set(type, null);
                        return;
                    }
                    const status = await service.getDocumentStatus(info.id);
                    const content = await getDocumentContent(info);
                    documentTypeMap.set(type, {
                        info,
                        status,
                        content
                    });
                })
            );
        } catch (e: any) {
            console.error(e);
        }
        const documentDetailMap: DocumentDetailMap = new Map();
        documentDetailMap.set(
            OrderStatus.PRODUCTION,
            new Map<DocumentType, DocumentDetail | null>([
                [
                    DocumentType.PAYMENT_INVOICE,
                    documentTypeMap.get(DocumentType.PAYMENT_INVOICE) || null
                ]
            ])
        );
        documentDetailMap.set(
            OrderStatus.PAYED,
            new Map<DocumentType, DocumentDetail | null>([
                [
                    DocumentType.ORIGIN_SWISS_DECODE,
                    documentTypeMap.get(DocumentType.ORIGIN_SWISS_DECODE) || null
                ],
                [
                    DocumentType.WEIGHT_CERTIFICATE,
                    documentTypeMap.get(DocumentType.WEIGHT_CERTIFICATE) || null
                ],
                [
                    DocumentType.FUMIGATION_CERTIFICATE,
                    documentTypeMap.get(DocumentType.FUMIGATION_CERTIFICATE) || null
                ],
                [
                    DocumentType.PREFERENTIAL_ENTRY_CERTIFICATE,
                    documentTypeMap.get(DocumentType.PREFERENTIAL_ENTRY_CERTIFICATE) || null
                ],
                [
                    DocumentType.PHYTOSANITARY_CERTIFICATE,
                    documentTypeMap.get(DocumentType.PHYTOSANITARY_CERTIFICATE) || null
                ],
                [
                    DocumentType.INSURANCE_CERTIFICATE,
                    documentTypeMap.get(DocumentType.INSURANCE_CERTIFICATE) || null
                ]
            ])
        );
        documentDetailMap.set(
            OrderStatus.EXPORTED,
            new Map<DocumentType, DocumentDetail | null>([
                [
                    DocumentType.BILL_OF_LADING,
                    documentTypeMap.get(DocumentType.BILL_OF_LADING) || null
                ]
            ])
        );
        documentDetailMap.set(
            OrderStatus.SHIPPED,
            new Map<DocumentType, DocumentDetail | null>([
                [
                    DocumentType.COMPARISON_SWISS_DECODE,
                    documentTypeMap.get(DocumentType.COMPARISON_SWISS_DECODE) || null
                ]
            ])
        );
        return documentDetailMap;
    };

    const validateDocument = async (
        documentId: number,
        validationStatus: DocumentStatus,
        tradeService: TradeService
    ) => {
        try {
            dispatch(addLoadingMessage(DOCUMENT_MESSAGE.VALIDATE.LOADING));
            await tradeService.validateDocument(documentId, validationStatus);
            if (validationStatus === DocumentStatus.APPROVED)
                openNotification(
                    'Document approved',
                    DOCUMENT_MESSAGE.VALIDATE.APPROVED,
                    NotificationType.SUCCESS,
                    NOTIFICATION_DURATION
                );
            else if (validationStatus === DocumentStatus.NOT_APPROVED)
                openNotification(
                    'Document rejected',
                    DOCUMENT_MESSAGE.VALIDATE.REJECTED,
                    NotificationType.SUCCESS,
                    NOTIFICATION_DURATION
                );
            // TODO: Necessary?
            window.location.reload();
        } catch (e: any) {
            openNotification(
                'Error',
                DOCUMENT_MESSAGE.VALIDATE.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(DOCUMENT_MESSAGE.VALIDATE.LOADING));
        }
    };

    const uploadDocument = async (
        documentRequest: DocumentRequest,
        externalUrl: string,
        tradeService: TradeService
    ) => {
        try {
            dispatch(addLoadingMessage(DOCUMENT_MESSAGE.UPLOAD.LOADING));
            // TODO: remove this harcoded value
            const delegatedOrganizationIds: number[] =
                parseInt(userInfo.organizationId) === 0 ? [1] : [0];
            const resourceSpec: ICPResourceSpec = {
                name: documentRequest.filename,
                type: documentRequest.content.type
            };

            await tradeService.addDocument(
                documentRequest.documentType,
                new Uint8Array(await new Response(documentRequest.content).arrayBuffer()),
                externalUrl,
                resourceSpec,
                delegatedOrganizationIds
            );
            openNotification(
                'Success',
                documentRequest.filename + ': ' + DOCUMENT_MESSAGE.UPLOAD.OK,
                NotificationType.SUCCESS,
                NOTIFICATION_DURATION
            );
        } catch (e: any) {
            openNotification(
                'Error',
                DOCUMENT_MESSAGE.UPLOAD.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(DOCUMENT_MESSAGE.UPLOAD.LOADING));
        }
    };

    const getDocumentContent = async (documentInfo: DocumentInfo) => {
        const completeDocument = await documentService.getCompleteDocument(documentInfo);
        const blob = new Blob([completeDocument!.content], {
            type: getMimeType(completeDocument.filename)
        });
        return {
            contentType: blob.type,
            content: blob,
            filename: completeDocument.filename,
            date: new Date(completeDocument.date),
            transactionLines: completeDocument.transactionLines
        };
    };

    return (
        <EthDocumentContext.Provider
            value={{
                getDocumentDetailMap,
                validateDocument,
                uploadDocument,
                getDocumentDuty
            }}>
            {props.children}
        </EthDocumentContext.Provider>
    );
}
