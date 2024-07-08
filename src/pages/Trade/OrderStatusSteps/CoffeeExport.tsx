import {
    DocumentElement,
    FormElement,
    FormElementType,
    GenericForm
} from '@/components/GenericForm/GenericForm';
import React from 'react';
import { OrderStatus, DocumentType, OrderTrade } from '@kbc-lib/coffee-trading-management-lib';
import TradeDutiesWaiting, {
    DutiesWaiting
} from '@/pages/Trade/OrderStatusSteps/TradeDutiesWaiting';
import { DOCUMENT_DUTY, useEthDocument } from '@/providers/entities/EthDocumentProvider';
import { useEthOrderTrade } from '@/providers/entities/EthOrderTradeProvider';
import { DocumentRequest } from '@/api/types/DocumentRequest';
import { paths } from '@/constants/paths';
import { useNavigate } from 'react-router-dom';
import { StepTip } from '@/pages/Trade/OrderStatusSteps/StepTip';

type Props = {
    orderTrade: OrderTrade;
    validationCallback: (
        orderTrade: OrderTrade | null,
        documentType: DocumentType
    ) => undefined | { approve: () => Promise<void>; reject: () => Promise<void> };
};
export const CoffeeExport = ({ orderTrade, validationCallback }: Props) => {
    const { getOrderDocumentDetailMap, uploadOrderDocument } = useEthOrderTrade();
    const { getDocumentDuty } = useEthDocument();
    const orderDocumentDetailMap = getOrderDocumentDetailMap(orderTrade.tradeId);
    const navigate = useNavigate();
    const documentsMap = orderDocumentDetailMap.get(OrderStatus.PAYED);
    if (!documentsMap) {
        return <>OrderStatus not supported</>;
    }

    const documents = [
        {
            name: 'swiss-decode',
            label: 'Swiss Decode',
            documentType: DocumentType.ORIGIN_SWISS_DECODE
        },
        {
            name: 'weight-certificate',
            label: 'Weight Certificate',
            documentType: DocumentType.WEIGHT_CERTIFICATE
        },
        {
            name: 'fumigation-certificate',
            label: 'Fumigation Certificate',
            documentType: DocumentType.FUMIGATION_CERTIFICATE
        },
        {
            name: 'preferential-entry-certificate',
            label: 'Preferential Entry Certificate',
            documentType: DocumentType.PREFERENTIAL_ENTRY_CERTIFICATE
        },
        {
            name: 'phytosanitary-certificate',
            label: 'Phytosanitary Certificate',
            documentType: DocumentType.PHYTOSANITARY_CERTIFICATE
        },
        {
            name: 'insurance-certificate',
            label: 'Insurance Certificate',
            documentType: DocumentType.INSURANCE_CERTIFICATE
        }
    ];

    const getDocumentElement = (
        name: string,
        label: string,
        documentType: DocumentType
    ): FormElement => {
        const documentDetail = documentsMap.get(documentType);
        if (documentDetail === undefined) {
            return { type: FormElementType.SPACE, span: 12 };
        }
        const documentDuty = getDocumentDuty(
            orderTrade.supplier,
            orderTrade.commissioner,
            documentDetail
        );
        const isDocumentEditable =
            documentDuty == DOCUMENT_DUTY.UPLOAD_NEEDED ||
            documentDuty == DOCUMENT_DUTY.UPLOAD_POSSIBLE;
        return {
            type: FormElementType.DOCUMENT,
            span: 12,
            name: name,
            label: label,
            required: true,
            loading: false,
            uploadable: isDocumentEditable,
            content: documentDetail?.content,
            status: documentDetail?.status,
            height: '45vh',
            validationCallback: validationCallback(orderTrade, documentType)
        };
    };
    const elements: FormElement[] = [
        {
            type: FormElementType.TIP,
            span: 24,
            label: (
                <StepTip
                    orderTrade={orderTrade}
                    message={
                        <p>
                            This is the export phase, the exporter has to load the following
                            documents to proceed with the export, in order to prove the quality of
                            the goods and the intrinsic characteristics of the coffee.
                        </p>
                    }
                    deadline={orderTrade.documentDeliveryDeadline}
                    status={OrderStatus.PAYED}
                />
            ),
            marginVertical: '1rem'
        },
        ...documents.map(({ name, label, documentType }) =>
            getDocumentElement(name, label, documentType)
        )
    ];
    const onSubmit = async (values: any) => {
        for (const { name, documentType } of documents) {
            const file = values[name];
            if (!file || !file.name) return;
            const documentRequest: DocumentRequest = {
                content: file,
                filename: file.name,
                documentType
            };
            await uploadOrderDocument(orderTrade.tradeId, documentRequest, orderTrade.externalUrl);
        }
        navigate(paths.TRADES);
    };

    // If at least one document is editable, I can submit the form
    const isDocumentsEditable = elements.some(
        (element) => (element as DocumentElement)?.uploadable
    );
    // If I can edit documents or at least one document is uploaded, I can see the documents
    const canSeeDocuments =
        isDocumentsEditable || elements.some((element) => (element as DocumentElement)?.content);

    if (canSeeDocuments) {
        return (
            <GenericForm
                elements={elements}
                submittable={isDocumentsEditable}
                onSubmit={onSubmit}
            />
        );
    }
    return (
        <TradeDutiesWaiting
            waitingType={DutiesWaiting.EXPORTER_EXPORT}
            message={
                'The exporter has not uploaded any of the documents yet. \n You will be notified when there are new developments.'
            }
            marginVertical="1rem"
        />
    );
};
