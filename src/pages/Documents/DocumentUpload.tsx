import { FormElement, FormElementType, GenericForm } from '@/components/GenericForm/GenericForm';
import {
    EvaluationStatus,
    ShipmentDocumentInfo,
    ShipmentDocumentType
} from '@isinblockchainteam/kbc-icp-incubator-library';
import React, { useMemo } from 'react';
import { Flex, Tooltip } from 'antd';
import { WarningOutlined } from '@ant-design/icons';

type Props = {
    // TODO: change ShipmentDocumentType with generic DocumentType and ShipmentDocumentInfo with DocumentInfo, so that this component can be used for every document upload
    documentTypes: ShipmentDocumentType[];
    oldDocumentsInfo: ShipmentDocumentInfo[];
    onSubmit: (
        documentType: ShipmentDocumentType,
        documentReferenceId: string,
        filename: string,
        fileContent: Blob
    ) => Promise<void>;
    selectedDocumentType?: ShipmentDocumentType;
};

export default (props: Props) => {
    const { documentTypes, onSubmit, oldDocumentsInfo, selectedDocumentType } = props;
    const mappedDocumentsInfo = documentTypes.map((type) => ({
        type,
        info: oldDocumentsInfo.find((d) => d.documentType === type)
    }));

    const elements: FormElement[] = useMemo(
        () => [
            {
                type: FormElementType.INPUT,
                span: 12,
                name: 'referenceId',
                label: 'Reference Id',
                required: true,
                defaultValue: ''
            },
            {
                type: FormElementType.SELECT,
                span: 12,
                name: 'documentType',
                label: 'Document Type',
                required: true,
                defaultValue: selectedDocumentType !== undefined ? selectedDocumentType : undefined,
                options: mappedDocumentsInfo
                    .filter(({ info }) => info?.evaluationStatus !== EvaluationStatus.APPROVED)
                    .map(({ type }) => ({
                        value: type,
                        label: ShipmentDocumentType[type]
                    })),
                optionRender: ({ data }) => (
                    <Flex justify="space-between">
                        <span>{data.label}</span>
                        {oldDocumentsInfo.findIndex((d) => d.documentType === data.value) !==
                            -1 && (
                            <Tooltip
                                placement="right"
                                title={
                                    <span>
                                        {/*TODO: this message could be generic in order to reuse this component for every document upload, but ShipmentDocumentStatus must be replace with DocumentStatus*/}
                                        Document of this type already uploaded. <br />
                                        You can upload again to replace it, until it is not approved
                                        by the counterparty.
                                    </span>
                                }>
                                <WarningOutlined style={{ fontSize: 20, color: 'darkorange' }} />
                            </Tooltip>
                        )}
                    </Flex>
                ),
                search: {
                    showIcon: true,
                    filterOption: (input, option) => {
                        return (option?.label as string)
                            .toLowerCase()
                            .includes(input.toLowerCase());
                    }
                }
            },
            {
                type: FormElementType.DOCUMENT,
                span: 24,
                name: 'document',
                label: 'Document',
                loading: false,
                uploadable: true,
                required: true,
                height: '500px'
            }
        ],
        []
    );

    return (
        <GenericForm
            formName="document-upload"
            elements={elements}
            submittable={true}
            onSubmit={(values) =>
                onSubmit(
                    values['documentType'],
                    values['referenceId'],
                    values['document'].name,
                    values['document']
                )
            }
        />
    );
};
