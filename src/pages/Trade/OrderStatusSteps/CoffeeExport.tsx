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
export const CoffeeExport = ({ orderTrade }: Props) => {
    const { getDocumentDetail, uploadOrderDocument, validateOrderDocument } = useEthOrderTrade();
    const { getDocumentDuty } = useEthDocument();
    const { signer } = useSigner();
    const navigate = useNavigate();

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
        const documentDetail = getDocumentDetail(
            orderTrade.tradeId,
            OrderStatus.PAYED,
            documentType
        );
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
        const needsValidation =
            documentDetail !== null &&
            documentDetail.status === DocumentStatus.NOT_EVALUATED &&
            documentDetail.info.uploadedBy !== signer?.address;
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
        console.log('onSubmit called');
        for (const { name, documentType } of documents) {
            const file = values[name];
            console.log(file);
            if (!file || !file.name) continue;
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
