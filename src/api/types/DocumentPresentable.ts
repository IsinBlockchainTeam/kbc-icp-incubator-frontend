import {TransactionLine, DocumentType, DocumentStatus} from "@kbc-lib/coffee-trading-management-lib";

export type DocumentInfoPresentable = {
    id: number;
    uploadedBy: string;
    status: DocumentStatus;
};

export type DocumentPresentable = DocumentInfoPresentable & {
    documentType: DocumentType;
    contentType: string;
    content: Blob;
    filename: string;
    date: Date;
    transactionLines?: TransactionLine[];
};
