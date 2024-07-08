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
export const CoffeeShipment = ({ orderTrade }: Props) => {
    const { getDocumentDetail, uploadOrderDocument, validateOrderDocument } = useEthOrderTrade();
    const { getDocumentDuty } = useEthDocument();
    const { signer } = useContext(SignerContext);
    const navigate = useNavigate();

    const documentDetail = getDocumentDetail(
        orderTrade.tradeId,
        OrderStatus.EXPORTED,
        DocumentType.BILL_OF_LADING
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

    const elements: FormElement[] = [
        {
            type: FormElementType.TIP,
            span: 24,
            label: (
                <StepTip
                    orderTrade={orderTrade}
                    message={
                        <p>
                            This is the last step for the exporter, in which is important to prove
                            that the goods are ready to be shipped. <br />
                            The exporter has to load the Bill of Lading to proceed with the
                            shipment.
                        </p>
                    }
                    deadline={orderTrade.shippingDeadline}
                    status={OrderStatus.EXPORTED}
                />
            ),
            marginVertical: '1rem'
        },
        {
            type: FormElementType.DOCUMENT,
            span: 12,
            name: 'bill-of-lading',
            label: 'Bill of lading',
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
        const file = values['bill-of-lading'];
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
            waitingType={DutiesWaiting.EXPORTER_SHIPPING}
            message={
                'The exporter has not uploaded the Bill of Lading. \n You will be notified when there are new developments.'
            }
            marginVertical="1rem"
        />
    );
};
