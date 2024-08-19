import { FormElement, FormElementType, GenericForm } from '@/components/GenericForm/GenericForm';
import { ShipmentDocumentType } from '@kbc-lib/coffee-trading-management-lib';

type Props = {
    documentTypes: ShipmentDocumentType[];
    onSubmit: (
        documentType: ShipmentDocumentType,
        documentReferenceId: string,
        filename: string,
        fileContent: Blob
    ) => Promise<void>;
};

export default (props: Props) => {
    const { documentTypes, onSubmit } = props;

    const elements: FormElement[] = [
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
            options: documentTypes.map((type) => ({
                value: type,
                label: ShipmentDocumentType[type]
            })),
            search: {
                showIcon: true,
                filterOption: (input, option) => {
                    return (option?.label as string).toLowerCase().includes(input.toLowerCase());
                }
            }
        },
        {
            type: FormElementType.TIP,
            span: 24
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
    ];

    return (
        <GenericForm
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
