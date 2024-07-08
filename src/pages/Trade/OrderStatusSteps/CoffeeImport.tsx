import {
    DocumentElement,
    FormElement,
    FormElementType,
    GenericForm
} from '@/components/GenericForm/GenericForm';
import React, { useContext } from 'react';
import {
    OrderStatus,
    DocumentType,
    OrderTrade,
    DocumentStatus
} from '@kbc-lib/coffee-trading-management-lib';
import TradeDutiesWaiting, {
    DutiesWaiting
} from '@/pages/Trade/OrderStatusSteps/TradeDutiesWaiting';
import { DOCUMENT_DUTY, useEthDocument } from '@/providers/entities/EthDocumentProvider';
import { useEthOrderTrade } from '@/providers/entities/EthOrderTradeProvider';
import { DocumentRequest } from '@/api/types/DocumentRequest';
import { paths } from '@/constants/paths';
import { useNavigate } from 'react-router-dom';
import { StepTip } from '@/pages/Trade/OrderStatusSteps/StepTip';
import { SignerContext } from '@/providers/SignerProvider';

type Props = {
    orderTrade: OrderTrade;
};
export const CoffeeImport = ({ orderTrade }: Props) => {
    const { getDocumentDetail, uploadOrderDocument, validateOrderDocument } = useEthOrderTrade();
    const { getDocumentDuty } = useEthDocument();
    const { signer } = useContext(SignerContext);
    const navigate = useNavigate();

    const documentDetail = getDocumentDetail(
        orderTrade.tradeId,
        OrderStatus.SHIPPED,
        DocumentType.BILL_OF_LADING
    );
    if (documentDetail === undefined) {
        return <>Document not supported</>;
    }

    const documentDuty = getDocumentDuty(
        orderTrade.commissioner,
        orderTrade.supplier,
        documentDetail
    );

    const isDocumentEditable =
        documentDuty == DOCUMENT_DUTY.UPLOAD_NEEDED ||
        documentDuty == DOCUMENT_DUTY.UPLOAD_POSSIBLE;

    const elements: FormElement[] = [
        {
            type: FormElementType.TIP,
            span: 24,
            label: (
                <StepTip
                    orderTrade={orderTrade}
                    message={
                        <p>
                            This is the final stage for this transaction where is important to prove
                            that the goods, reached by the importer, have exactly the same
                            specifications that are claimed by the exporter. <br />
                            The importer has to load the results of the Swiss Decode.
                        </p>
                    }
                    deadline={orderTrade.deliveryDeadline}
                    status={OrderStatus.SHIPPED}
                />
            ),
            marginVertical: '1rem'
        },
        {
            type: FormElementType.DOCUMENT,
            span: 12,
            name: 'comparison-swiss-decode',
            label: 'Comparison Swiss Decode',
            required: true,
            loading: false,
            uploadable: isDocumentEditable,
            content: documentDetail?.content,
            status: documentDetail?.status,
            height: '45vh',
            approvable:
                documentDetail !== null &&
                documentDetail.status === DocumentStatus.NOT_EVALUATED &&
                documentDetail.info.uploadedBy !== signer?.address,
            onApprove: () =>
                validateOrderDocument(
                    orderTrade.tradeId,
                    documentDetail!.info.id,
                    DocumentStatus.APPROVED
                ),
            onReject: () =>
                validateOrderDocument(
                    orderTrade.tradeId,
                    documentDetail!.info.id,
                    DocumentStatus.NOT_APPROVED
                )
        }
    ];
    const onSubmit = async (values: any) => {
        const file = values['comparison-swiss-decode'];
        if (!file || !file.name) return;
        const documentRequest: DocumentRequest = {
            content: file,
            filename: file.name,
            documentType: DocumentType.COMPARISON_SWISS_DECODE
        };
        await uploadOrderDocument(orderTrade.tradeId, documentRequest, orderTrade.externalUrl);
        navigate(paths.TRADES);
    };

    // If I can edit documents or at least one document is uploaded, I can see the documents
    const canSeeDocuments =
        isDocumentEditable || elements.some((element) => (element as DocumentElement)?.content);

    if (canSeeDocuments) {
        return (
            <GenericForm elements={elements} submittable={isDocumentEditable} onSubmit={onSubmit} />
        );
    }
    return (
        <TradeDutiesWaiting
            waitingType={DutiesWaiting.IMPORTER_IMPORT}
            message={
                'The importer has not uploaded the Swiss Decode results for comparison. \n You will be notified when there are new developments.'
            }
            marginVertical="1rem"
        />
    );
};
