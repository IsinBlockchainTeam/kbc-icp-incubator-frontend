import { DocumentStatus, DocumentType, OrderStatus } from '@kbc-lib/coffee-trading-management-lib';
import { NotificationType, openNotification } from '@/utils/notification';
import { useContext } from 'react';
import { EthContext } from '@/providers/EthProvider';
import { hideLoading, showLoading } from '@/redux/reducers/loadingSlice';
import { useDispatch } from 'react-redux';
import { NOTIFICATION_DURATION } from '@/constants/notification';
import { DetailedTradePresentable } from '@/api/types/TradePresentable';
import { SignerContext } from '@/providers/SignerProvider';

export default function useDocument() {
    const { ethTradeService } = useContext(EthContext);
    const { signer } = useContext(SignerContext);

    const dispatch = useDispatch();

    const validateDocument = async (
        tradeId: number,
        documentId: number,
        validationStatus: DocumentStatus
    ) => {
        try {
            dispatch(showLoading('Validating document...'));
            await ethTradeService.validateDocument(tradeId, documentId, validationStatus);
            if (validationStatus === DocumentStatus.APPROVED)
                openNotification(
                    'Document approved',
                    'The document has been successfully approved',
                    NotificationType.SUCCESS,
                    NOTIFICATION_DURATION
                );
            else if (validationStatus === DocumentStatus.NOT_APPROVED)
                openNotification(
                    'Document rejected',
                    'The document has been rejected',
                    NotificationType.SUCCESS,
                    NOTIFICATION_DURATION
                );
            // TODO: Necessary?
            window.location.reload();
        } catch (e: any) {
            openNotification(
                'Error',
                'Error while validating document',
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(hideLoading());
        }
    };

    const uploadDocuments = async () => {
        try {
            dispatch(showLoading('Uploading documents...'));
        } catch (e: any) {
            openNotification(
                'Error',
                'Error while uploading documents',
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(hideLoading());
        }
    };

    const hasAllRequiredDocuments = (
        detailedTradePresentable: DetailedTradePresentable,
        orderStatus: OrderStatus
    ) => {
        const trade = detailedTradePresentable.trade;
        const documents = detailedTradePresentable.documents;

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

    return {
        validateDocument,
        uploadDocuments,
        hasAllRequiredDocuments
    };
}
