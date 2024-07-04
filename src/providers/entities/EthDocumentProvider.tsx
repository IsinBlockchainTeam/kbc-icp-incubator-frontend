import { createContext, ReactNode, useContext, useMemo } from 'react';
import {
    DocumentDriver,
    DocumentInfo,
    DocumentService,
    DocumentStatus,
    DocumentType,
    OrderStatus,
    Trade,
    TradeService,
    TransactionLine
} from '@kbc-lib/coffee-trading-management-lib';
import { useSigner } from '@/providers/SignerProvider';
import { contractAddresses } from '@/constants/evm';
import { ICPContext } from '@/providers/ICPProvider';
import { addLoadingMessage, removeLoadingMessage } from '@/redux/reducers/loadingSlice';
import { NotificationType, openNotification } from '@/utils/notification';
import { NOTIFICATION_DURATION } from '@/constants/notification';
import { useDispatch } from 'react-redux';
import { DOCUMENT_MESSAGE } from '@/constants/message';
import { getMimeType } from '@/utils/file';

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
export type OrderStatusDocument = {
    [OrderStatus.CONTRACTING]: {};
    [OrderStatus.PRODUCTION]: {
        [DocumentType.PAYMENT_INVOICE]: DocumentDetail | null;
    };
    [OrderStatus.PAYED]: {
        [DocumentType.ORIGIN_SWISS_DECODE]: DocumentDetail | null;
        [DocumentType.WEIGHT_CERTIFICATE]: DocumentDetail | null;
        [DocumentType.FUMIGATION_CERTIFICATE]: DocumentDetail | null;
        [DocumentType.PREFERENTIAL_ENTRY_CERTIFICATE]: DocumentDetail | null;
        [DocumentType.PHYTOSANITARY_CERTIFICATE]: DocumentDetail | null;
        [DocumentType.INSURANCE_CERTIFICATE]: DocumentDetail | null;
    };
    [OrderStatus.EXPORTED]: {
        [DocumentType.BILL_OF_LADING]: DocumentDetail | null;
    };
    [OrderStatus.SHIPPED]: {
        [DocumentType.COMPARISON_SWISS_DECODE]: DocumentDetail | null;
    };
    [OrderStatus.COMPLETED]: {};
};
export type EthDocumentContextState = {
    getRequiredDocumentsTypes: (orderStatus: OrderStatus) => DocumentType[];
    validateDocument: (
        documentId: number,
        validationStatus: DocumentStatus,
        tradeService: TradeService
    ) => Promise<void>;
    uploadDocuments: () => Promise<void>;
    hasAllRequiredDocuments: (
        trade: Trade,
        documents: Map<DocumentType, [DocumentInfo, DocumentStatus]>,
        orderStatus: OrderStatus
    ) => boolean;
    getDocumentContent: (documentInfo: DocumentInfo) => Promise<DocumentContent>;
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
    const { fileDriver } = useContext(ICPContext);
    const dispatch = useDispatch();
    const documentDriver = useMemo(
        () => new DocumentDriver(signer, contractAddresses.DOCUMENT()),
        [signer]
    );
    const documentService = useMemo(
        () => new DocumentService(documentDriver, fileDriver),
        [documentDriver, fileDriver]
    );

    const getRequiredDocumentsTypes = (orderStatus: OrderStatus): DocumentType[] => {
        switch (orderStatus) {
            case OrderStatus.PRODUCTION:
                return [DocumentType.PAYMENT_INVOICE];
            case OrderStatus.PAYED:
                return [
                    DocumentType.ORIGIN_SWISS_DECODE,
                    DocumentType.WEIGHT_CERTIFICATE,
                    DocumentType.FUMIGATION_CERTIFICATE,
                    DocumentType.PREFERENTIAL_ENTRY_CERTIFICATE,
                    DocumentType.PHYTOSANITARY_CERTIFICATE,
                    DocumentType.INSURANCE_CERTIFICATE
                ];
            case OrderStatus.EXPORTED:
                return [DocumentType.BILL_OF_LADING];
            case OrderStatus.SHIPPED:
                return [DocumentType.COMPARISON_SWISS_DECODE];
            default:
                return [];
        }
    };

    const hasAllRequiredDocuments = (
        trade: Trade,
        documents: Map<DocumentType, [DocumentInfo, DocumentStatus] | null>,
        orderStatus: OrderStatus
    ) => {
        const hasDocuments = (
            designatedPartyAddress: string,
            documentTypes: DocumentType[]
        ): boolean =>
            documentTypes.some((docType) => documents.has(docType))
                ? true
                : signer.address === designatedPartyAddress;

        switch (orderStatus) {
            case OrderStatus.PRODUCTION:
                return hasDocuments(trade.supplier, [DocumentType.PAYMENT_INVOICE]);
            case OrderStatus.PAYED:
                return hasDocuments(trade.supplier, [
                    DocumentType.ORIGIN_SWISS_DECODE,
                    DocumentType.WEIGHT_CERTIFICATE,
                    DocumentType.FUMIGATION_CERTIFICATE,
                    DocumentType.PREFERENTIAL_ENTRY_CERTIFICATE,
                    DocumentType.PHYTOSANITARY_CERTIFICATE,
                    DocumentType.INSURANCE_CERTIFICATE
                ]);
            case OrderStatus.EXPORTED:
                return hasDocuments(trade.supplier, [DocumentType.BILL_OF_LADING]);
            case OrderStatus.SHIPPED:
                return hasDocuments(trade.commissioner, [DocumentType.COMPARISON_SWISS_DECODE]);
            default:
                return true;
        }
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

    const uploadDocuments = async () => {
        try {
            dispatch(addLoadingMessage(DOCUMENT_MESSAGE.UPLOAD.LOADING));
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
                getRequiredDocumentsTypes,
                validateDocument,
                uploadDocuments,
                hasAllRequiredDocuments,
                getDocumentContent
            }}>
            {props.children}
        </EthDocumentContext.Provider>
    );
}
