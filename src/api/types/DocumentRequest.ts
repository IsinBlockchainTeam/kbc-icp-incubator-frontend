import {DocumentType} from "@kbc-lib/coffee-trading-management-lib";

export type DocumentRequest = {
    content: Blob,
    name: string,
    documentType: DocumentType,
}
