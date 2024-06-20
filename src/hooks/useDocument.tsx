import { DocumentStatus } from '@kbc-lib/coffee-trading-management-lib';
import { NotificationType, openNotification } from '@/utils/notification';
import { useContext } from 'react';
import { EthContext } from '@/providers/EthProvider';
import { hideLoading } from '@/redux/reducers/loadingSlice';
import { useDispatch } from 'react-redux';

export default function useDocument() {
    const { ethTradeService } = useContext(EthContext);

    const dispatch = useDispatch();

    const validateDocument = async (
        tradeId: number,
        documentId: number,
        validationStatus: DocumentStatus
    ) => {
        try {
            await ethTradeService.validateDocument(tradeId, documentId, validationStatus);
            if (validationStatus === DocumentStatus.APPROVED)
                openNotification(
                    'Document approved',
                    'The document has been successfully approved',
                    NotificationType.SUCCESS,
                    1
                );
            else if (validationStatus === DocumentStatus.NOT_APPROVED)
                openNotification(
                    'Document rejected',
                    'The document has been rejected',
                    NotificationType.SUCCESS,
                    1
                );
            // TODO: Necessary?
            window.location.reload();
        } catch (e: any) {
            openNotification('Error', 'Error while validating document', NotificationType.ERROR);
        } finally {
            dispatch(hideLoading());
        }
    };

    return {
        validateDocument
    };
}
