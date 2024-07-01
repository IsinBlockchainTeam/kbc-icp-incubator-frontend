import { FormElement, FormElementType, GenericForm } from '@/components/GenericForm/GenericForm';
import React, { ReactNode } from 'react';
import { OrderStatus, DocumentType } from '@kbc-lib/coffee-trading-management-lib';
import { DetailedTradePresentable, OrderTradePresentable } from '@/api/types/TradePresentable';
import useDocument from '@/hooks/useDocument';
import TradeDutiesWaiting, { DutiesWaiting } from '@/pages/Trade/TradeDutiesWaiting';

type Props = {
    orderInfo: OrderTradePresentable;
    onSubmit: (values: any) => void;
    stepLabelTip: (message: ReactNode, deadline: number, status: OrderStatus) => ReactNode;
    validationCallback: (
        tradeInfo: DetailedTradePresentable | undefined,
        documentType: DocumentType
    ) => undefined | { approve: () => Promise<void>; reject: () => Promise<void> };
    isDocumentUploadable: (
        designatedPartyAddress: string,
        tradeInfo: DetailedTradePresentable,
        documentType: DocumentType
    ) => boolean;
};
export const CoffeeProduction = ({
    orderInfo,
    onSubmit,
    stepLabelTip,
    validationCallback,
    isDocumentUploadable
}: Props) => {
    const { hasAllRequiredDocuments } = useDocument();

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
                orderInfo.trade.paymentDeadline,
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
                orderInfo.trade.supplier,
                orderInfo,
                DocumentType.PAYMENT_INVOICE
            ),
            info: orderInfo.documents.get(DocumentType.PAYMENT_INVOICE),
            height: '45vh',
            validationCallback: validationCallback(orderInfo, DocumentType.PAYMENT_INVOICE)
        }
    ];
    if (!hasAllRequiredDocuments(orderInfo, OrderStatus.PRODUCTION)) {
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
