import {
    DocumentElement,
    FormElement,
    FormElementType,
    GenericForm
} from '@/components/GenericForm/GenericForm';
import React from 'react';
import {
    OrderStatus,
    DocumentType,
    OrderTrade,
    DocumentStatus
} from '@kbc-lib/coffee-trading-management-lib';
import TradeDutiesWaiting, {
    DutiesWaiting
} from '@/pages/Trade/OrderStatusSteps/TradeDutiesWaiting';
import {
    DOCUMENT_DUTY,
    DocumentRequest,
    useEthDocument
} from '@/providers/entities/EthDocumentProvider';
import { useEthOrderTrade } from '@/providers/entities/EthOrderTradeProvider';
import { paths } from '@/constants/paths';
import { useNavigate } from 'react-router-dom';
import { StepTip } from '@/pages/Trade/OrderStatusSteps/StepTip';
import { useSigner } from '@/providers/SignerProvider';

type Props = {
    orderTrade: OrderTrade;
};
export const CoffeeProduction = ({ orderTrade }: Props) => {
    const { getDocumentDetail, uploadOrderDocument, validateOrderDocument } = useEthOrderTrade();
    const { getDocumentDuty } = useEthDocument();
    const { signer } = useSigner();
    const navigate = useNavigate();

    const documentDetail = getDocumentDetail(
        orderTrade.tradeId,
        OrderStatus.PRODUCTION,
        DocumentType.PAYMENT_INVOICE
    );
    if (documentDetail === undefined) {
        return <>Document not supported</>;
    }

    const documentDuty = getDocumentDuty(
        orderTrade.supplier,
        orderTrade.commissioner,
        documentDetail
    );

    const isDocumentEditable =
        documentDuty == DOCUMENT_DUTY.UPLOAD_NEEDED ||
        documentDuty == DOCUMENT_DUTY.UPLOAD_POSSIBLE;

    const needsValidation =
        documentDetail !== null &&
        documentDetail.status === DocumentStatus.NOT_EVALUATED &&
        documentDetail.info.uploadedBy !== signer?.address;
    const elements: FormElement[] = [
        {
            type: FormElementType.TIP,
            span: 24,
            label: (
                <StepTip
                    orderTrade={orderTrade}
                    message={
                        <p>
                            At this stage, the exporter has to load a payment invoice for the goods
                            that have been negotiated. <br />
                            This operation allows coffee production to be started and planned only
                            against a guarantee deposit from the importer
                        </p>
                    }
                    deadline={orderTrade.paymentDeadline}
                    status={OrderStatus.PRODUCTION}
                />
            ),
            marginVertical: '1rem'
        },
        {
            type: FormElementType.DOCUMENT,
            span: 12,
            name: 'payment-invoice',
            label: 'Payment Invoice',
            required: true,
            loading: false,
            uploadable: isDocumentEditable,
            content: documentDetail?.content,
            status: documentDetail?.status,
            height: '45vh',
            validationCallbacks: needsValidation
                ? {
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
                : undefined
        }
    ];
    const onSubmit = async (values: any) => {
        const file = values['payment-invoice'];
        if (!file || !file.name) return;
        const documentRequest: DocumentRequest = {
            content: file,
            filename: file.name,
            documentType: DocumentType.PAYMENT_INVOICE
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
            waitingType={DutiesWaiting.EXPORTER_PRODUCTION}
            message={
                'The exporter has not uploaded the Payment Invoice yet. \n You will be notified when there are new developments.'
            }
            marginVertical="1rem"
        />
    );
};
