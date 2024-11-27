import { DocumentType } from '@kbc-lib/coffee-trading-management-lib';

export const ShipmentDocumentRules: {
    [key in DocumentType]: { name: string; isExporterSuggestedUploader: boolean };
} = {
    [DocumentType.SERVICE_GUIDE]: {
        name: 'Service Guide',
        isExporterSuggestedUploader: true
    },
    [DocumentType.SENSORY_EVALUATION_ANALYSIS_REPORT]: {
        name: 'Sensory Evaluation Analysis Report',
        isExporterSuggestedUploader: true
    },
    [DocumentType.SUBJECT_TO_APPROVAL_OF_SAMPLE]: {
        name: 'Subject to Approval of Sample',
        isExporterSuggestedUploader: true
    },
    [DocumentType.PRE_SHIPMENT_SAMPLE]: {
        name: 'Pre-shipment Sample',
        isExporterSuggestedUploader: false
    },
    [DocumentType.SHIPPING_INSTRUCTIONS]: {
        name: 'Shipping Instructions',
        isExporterSuggestedUploader: true
    },
    [DocumentType.SHIPPING_NOTE]: {
        name: 'Shipping Note',
        isExporterSuggestedUploader: true
    },
    [DocumentType.BOOKING_CONFIRMATION]: {
        name: 'Booking Confirmation',
        isExporterSuggestedUploader: true
    },
    [DocumentType.CARGO_COLLECTION_ORDER]: {
        name: 'Cargo Collection Order',
        isExporterSuggestedUploader: true
    },
    [DocumentType.EXPORT_INVOICE]: {
        name: 'Export Invoice',
        isExporterSuggestedUploader: true
    },
    [DocumentType.TRANSPORT_CONTRACT]: {
        name: 'Transport Contract',
        isExporterSuggestedUploader: true
    },
    [DocumentType.TO_BE_FREED_SINGLE_EXPORT_DECLARATION]: {
        name: 'To Be Freed Single Export Declaration',
        isExporterSuggestedUploader: true
    },
    [DocumentType.EXPORT_CONFIRMATION]: {
        name: 'Export Confirmation',
        isExporterSuggestedUploader: true
    },
    [DocumentType.FREED_SINGLE_EXPORT_DECLARATION]: {
        name: 'Freed Single Export Declaration',
        isExporterSuggestedUploader: true
    },
    [DocumentType.CONTAINER_PROOF_OF_DELIVERY]: {
        name: 'Container Proof of Delivery',
        isExporterSuggestedUploader: true
    },
    [DocumentType.PHYTOSANITARY_CERTIFICATE]: {
        name: 'Phytosanitary Certificate',
        isExporterSuggestedUploader: true
    },
    [DocumentType.BILL_OF_LADING]: {
        name: 'Bill of Lading',
        isExporterSuggestedUploader: true
    },
    [DocumentType.ORIGIN_CERTIFICATE_ICO]: {
        name: 'Origin Certificate ICO',
        isExporterSuggestedUploader: true
    },
    [DocumentType.WEIGHT_CERTIFICATE]: {
        name: 'Weight Certificate',
        isExporterSuggestedUploader: true
    },
    [DocumentType.GENERIC]: {
        name: 'Generic',
        isExporterSuggestedUploader: false
    }
};
