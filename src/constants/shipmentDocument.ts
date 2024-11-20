import { ShipmentDocumentType } from '@isinblockchainteam/kbc-icp-incubator-library';

export const ShipmentDocumentRules: {
    [key in ShipmentDocumentType]: { name: string; isExporterSuggestedUploader: boolean };
} = {
    [ShipmentDocumentType.SERVICE_GUIDE]: {
        name: 'Service Guide',
        isExporterSuggestedUploader: true
    },
    [ShipmentDocumentType.SENSORY_EVALUATION_ANALYSIS_REPORT]: {
        name: 'Sensory Evaluation Analysis Report',
        isExporterSuggestedUploader: true
    },
    [ShipmentDocumentType.SUBJECT_TO_APPROVAL_OF_SAMPLE]: {
        name: 'Subject to Approval of Sample',
        isExporterSuggestedUploader: true
    },
    [ShipmentDocumentType.PRE_SHIPMENT_SAMPLE]: {
        name: 'Pre-shipment Sample',
        isExporterSuggestedUploader: false
    },
    [ShipmentDocumentType.SHIPPING_INSTRUCTIONS]: {
        name: 'Shipping Instructions',
        isExporterSuggestedUploader: true
    },
    [ShipmentDocumentType.SHIPPING_NOTE]: {
        name: 'Shipping Note',
        isExporterSuggestedUploader: true
    },
    [ShipmentDocumentType.BOOKING_CONFIRMATION]: {
        name: 'Booking Confirmation',
        isExporterSuggestedUploader: true
    },
    [ShipmentDocumentType.CARGO_COLLECTION_ORDER]: {
        name: 'Cargo Collection Order',
        isExporterSuggestedUploader: true
    },
    [ShipmentDocumentType.EXPORT_INVOICE]: {
        name: 'Export Invoice',
        isExporterSuggestedUploader: true
    },
    [ShipmentDocumentType.TRANSPORT_CONTRACT]: {
        name: 'Transport Contract',
        isExporterSuggestedUploader: true
    },
    [ShipmentDocumentType.TO_BE_FREED_SINGLE_EXPORT_DECLARATION]: {
        name: 'To Be Freed Single Export Declaration',
        isExporterSuggestedUploader: true
    },
    [ShipmentDocumentType.EXPORT_CONFIRMATION]: {
        name: 'Export Confirmation',
        isExporterSuggestedUploader: true
    },
    [ShipmentDocumentType.FREED_SINGLE_EXPORT_DECLARATION]: {
        name: 'Freed Single Export Declaration',
        isExporterSuggestedUploader: true
    },
    [ShipmentDocumentType.CONTAINER_PROOF_OF_DELIVERY]: {
        name: 'Container Proof of Delivery',
        isExporterSuggestedUploader: true
    },
    [ShipmentDocumentType.PHYTOSANITARY_CERTIFICATE]: {
        name: 'Phytosanitary Certificate',
        isExporterSuggestedUploader: true
    },
    [ShipmentDocumentType.BILL_OF_LADING]: {
        name: 'Bill of Lading',
        isExporterSuggestedUploader: true
    },
    [ShipmentDocumentType.ORIGIN_CERTIFICATE_ICO]: {
        name: 'Origin Certificate ICO',
        isExporterSuggestedUploader: true
    },
    [ShipmentDocumentType.WEIGHT_CERTIFICATE]: {
        name: 'Weight Certificate',
        isExporterSuggestedUploader: true
    },
    [ShipmentDocumentType.GENERIC]: {
        name: 'Generic',
        isExporterSuggestedUploader: false
    }
};
