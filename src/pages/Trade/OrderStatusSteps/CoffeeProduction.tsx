import { FormElement, FormElementType, GenericForm } from '@/components/GenericForm/GenericForm';
import React, { ReactNode } from 'react';
import { OrderStatus, DocumentType, OrderTrade } from '@kbc-lib/coffee-trading-management-lib';
import TradeDutiesWaiting, { DutiesWaiting } from '@/pages/Trade/TradeDutiesWaiting';
import { useEthDocument } from '@/providers/entities/EthDocumentProvider';
import { useEthTrade } from '@/providers/entities/EthTradeProvider';

type Props = {
    orderTrade: OrderTrade;
    onSubmit: (values: any) => void;
    stepLabelTip: (message: ReactNode, deadline: number, status: OrderStatus) => ReactNode;
    validationCallback: (
        orderTrade: OrderTrade | null,
        documentType: DocumentType
    ) => undefined | { approve: () => Promise<void>; reject: () => Promise<void> };
    isDocumentUploadable: (
        designatedPartyAddress: string,
        orderTrade: OrderTrade,
        documentType: DocumentType
    ) => boolean;
};
export const CoffeeProduction = ({
    orderTrade,
    onSubmit,
    stepLabelTip,
    validationCallback,
    isDocumentUploadable
}: Props) => {
    const { hasAllRequiredDocuments, getRequiredDocumentsTypes } = useEthDocument();
    const { getOrderStatus } = useEthTrade();

    const hasPendingDuties = false;

    const elements: FormElement[] = [
        {
            type: FormElementType.TIP,
            span: 24,
            label: stepLabelTip(
                <p>
                    At this stage, the exporter has to load a payment invoice for the goods that
                    have been negotiated. <br />
                    This operation allows coffee production to be started and planned only against a
                    guarantee deposit from the importer
                </p>,
                orderTrade.paymentDeadline,
                OrderStatus.PRODUCTION
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
            uploadable: isDocumentUploadable(
                orderTrade.supplier,
                orderTrade,
                DocumentType.PAYMENT_INVOICE
            ),
            // TODO: fix this
            // info: orderTrade.documents.get(DocumentType.PAYMENT_INVOICE),
            height: '45vh',
            validationCallback: validationCallback(orderTrade, DocumentType.PAYMENT_INVOICE)
        }
    ];
    if (
        true
        // TODO: fix this
        // !hasAllRequiredDocuments(
        //     orderTrade,
        //     getRequiredDocumentsTypes(getOrderStatus(orderTrade.tradeId)),
        //     OrderStatus.PRODUCTION
        // )
    ) {
        return (
            <TradeDutiesWaiting
                waitingType={DutiesWaiting.EXPORTER_PRODUCTION}
                message={
                    'The exporter has not uploaded the Payment Invoice yet. \n You will be notified when there are new developments.'
                }
                marginVertical="1rem"
            />
        );
    }
    return <GenericForm elements={elements} submittable={hasPendingDuties} onSubmit={onSubmit} />;
};
