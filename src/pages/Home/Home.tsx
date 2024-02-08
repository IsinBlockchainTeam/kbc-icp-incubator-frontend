import React from "react";

export const Home = () => {
    // const [disabled, setDisabled] = React.useState<boolean>(false);
    //
    // const elements: FormElement[] = [
    //     { type: FormElementType.TITLE, span: 24, label: 'Actors' },
    //     { type: FormElementType.INPUT, span: 12, name: 'supplier', label: 'Supplier', required: true, defaultValue: '', disabled: disabled, regex: '0x[a-fA-F0-9]{40}'},
    //     { type: FormElementType.INPUT, span: 12, name: 'customer', label: 'Customer', required: true, defaultValue: '', disabled: disabled, regex: '0x[a-fA-F0-9]{40}'},
    //     { type: FormElementType.TITLE, span: 24, label: 'Constraints' },
    //     { type: FormElementType.INPUT, span: 12, name: 'icoterms', label: 'Icoterms', required: true, defaultValue: 'FOB', disabled: disabled},
    //     { type: FormElementType.SPACE, span: 12 },
    //     { type: FormElementType.DATE, span: 12, name: 'payment-deadline', label: 'Payment Deadline', required: true, defaultValue: '', disabled: disabled},
    //     { type: FormElementType.DATE, span: 12, name: 'document-delivery-deadline', label: 'Document Delivery Deadline', required: true, defaultValue: '', disabled: disabled},
    //     { type: FormElementType.INPUT, span: 12, name: 'shipper', label: 'Shipper', required: true, defaultValue: '', disabled: disabled},
    //     { type: FormElementType.INPUT, span: 12, name: 'arbiter', label: 'Arbiter', required: true, defaultValue: '', disabled: disabled},
    //     { type: FormElementType.INPUT, span: 12, name: 'shipping-port', label: 'Shipping Port', required: true, defaultValue: '', disabled: disabled},
    //     { type: FormElementType.DATE, span: 12, name: 'shipping-deadline', label: 'Shipping Deadline', required: true, defaultValue: dayjs(), disabled: disabled},
    //     { type: FormElementType.INPUT, span: 12, name: 'delivery-port', label: 'Delivery Port', required: true, defaultValue: '', disabled: disabled},
    //     { type: FormElementType.DATE, span: 12, name: 'delivery-deadline', label: 'Delivery Deadline', required: true, defaultValue: '', disabled: disabled},
    //     { type: FormElementType.INPUT, span: 12, name: 'escrow', label: 'Escrow', required: true, defaultValue: '', disabled: disabled},
    //     { type: FormElementType.TITLE, span: 24, label: 'Line Items' },
    //     { type: FormElementType.INPUT, span: 8, name: 'material-name', label: 'Material Name', required: true, defaultValue: '', disabled: disabled},
    //     { type: FormElementType.BUTTON, span: 4, name: 'button', label: 'Show Supply Chain', disabled: false},
    //     { type: FormElementType.INPUT, span: 6, name: 'quantity', label: 'Quantity', required: true, defaultValue: '', disabled: disabled},
    //     { type: FormElementType.INPUT, span: 6, name: 'price', label: 'Price', required: true, defaultValue: '', disabled: disabled},
    //     { type: FormElementType.DOCUMENT_PREVIEW, span: 12, name: 'shipping-document', label: 'Shipping Document', required: true, content: new Blob(), disabled: false},
    //     { type: FormElementType.DOCUMENT_PREVIEW, span: 12, name: 'delivery-document', label: 'Delivery Document', required: true, content: new Blob(), disabled: false},
    // ];
    //
    // const onSubmit = (values: any) => {
    //     if(values['delivery-deadline'] <= values['shipping-deadline']) {
    //         openNotification("Invalid dates", '', NotificationType.ERROR);
    //     }
    // };
    return (
        <>
            {/*<Switch onChange={setDisabled}/>*/}
            {/*<GenericForm elements={elements} submittable={!disabled} onSubmit={onSubmit}/>*/}
        </>
    )
}

export default Home;
